import React from "react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// The fe-core barrel cannot be loaded whole in a module test (UserPicker import
// cycle). The year and month pickers become buttons that pick a fixed value.
vi.mock("@openimis/fe-core", () => ({
  GetIconComponent: (name) => function Icon() { return <span>{name}</span>; },
  FormattedMessage: () => null,
  formatMessage: (intl, module, id) => id,
  formatMessageWithValues: (intl, module, id) => id,
  PublishedComponent: ({ pubRef, onChange }) => {
    if (pubRef === "core.YearPicker") return <button onClick={() => onChange(2026)}>pick-year</button>;
    if (pubRef === "core.MonthPicker") return <button onClick={() => onChange(5, "May")}>pick-month</button>;
    return null;
  },
  coreConfirm: vi.fn(() => ({ type: "CORE_CONFIRM" })),
  journalize: vi.fn(() => ({ type: "JOURNALIZE" })),
}));

vi.mock("../actions", () => ({
  processBatch: vi.fn(() => ({ type: "PROCESS_BATCH" })),
}));

const { coreConfirm } = await import("@openimis/fe-core");
const { processBatch } = await import("../actions");
const { default: BatchRunLauncher } = await import("./BatchRunLauncher");

// `SET_CONFIRMED` stands in for any other dialog in the app being answered.
const coreReducer = (state = { confirmed: null }, action) =>
  action.type === "SET_CONFIRMED" ? { ...state, confirmed: action.payload } : state;

const renderLauncher = () => {
  const store = createStore(
    combineReducers({
      core: coreReducer,
      loc: (state = {}) => state,
      claim_batch: (state = { submittingMutation: false }) => state,
    }),
  );
  render(
    <IntlProvider locale="en">
      <Provider store={store}>
        <BatchRunLauncher />
      </Provider>
    </IntlProvider>,
  );
  fireEvent.click(screen.getByText("pick-year"));
  fireEvent.click(screen.getByText("pick-month"));
  return store;
};

const clickLaunch = () => fireEvent.click(screen.getByText("Send").closest("button"));

describe("BatchRunLauncher", () => {
  it("launches the batch run once when its own dialog is confirmed", () => {
    renderLauncher();

    clickLaunch();
    expect(processBatch).not.toHaveBeenCalled();
    act(() => coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(processBatch).toHaveBeenCalledTimes(1);
    expect(processBatch.mock.calls[0].slice(0, 3)).toEqual([null, 2026, 5]);
  });

  it('does not launch when another dialog in the app is answered "Yes"', () => {
    const store = renderLauncher();

    act(() => {
      store.dispatch({ type: "SET_CONFIRMED", payload: true });
    });

    expect(processBatch).not.toHaveBeenCalled();
  });
});
