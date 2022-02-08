import React from "react";
import { Subscriptions } from "@material-ui/icons";
import { FormattedMessage } from "@openimis/fe-core";
import messages_en from "./translations/en.json";
import reducer from "./reducer";
import ClaimBatchPage from "./pages/ClaimBatchPage";
import BatchRunPicker from "./pickers/BatchRunPicker";
import AccountTypePicker from "./pickers/AccountTypePicker";
import { RIGHT_PROCESS, RIGHT_PREVIEW } from "./constants";
import { BATCH_RUN_PICKER_PROJECTION } from "./actions";

const ROUTE_CLAIM_BATCH = "claim_batch";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'claim_batch', reducer }],
  "refs": [
    { key: "claim_batch.route.claim_batch", ref: ROUTE_CLAIM_BATCH },
    { key: "claim_batch.BatchRunPicker", ref: BatchRunPicker },
    { key: "claim_batch.BatchRunPicker.projection", ref: BATCH_RUN_PICKER_PROJECTION },
    { key: "claim_batch.AccountTypePicker", ref: AccountTypePicker },
    { key: "claim_batch.AccountTypePicker.projection", ref: null },
  ],
  "core.Router": [
    { path: ROUTE_CLAIM_BATCH, component: ClaimBatchPage }
  ],
  "claim.MainMenu": [
    {
      text: <FormattedMessage module="claim_batch" id="menu.claim_batch" />,
      icon: <Subscriptions />,
      route: `/${ROUTE_CLAIM_BATCH}`,
      filter: rights => !!rights.filter(r => r >= RIGHT_PROCESS && r <= RIGHT_PREVIEW).length
    },
  ],
  "invoice.SubjectAndThirdpartyPicker": [
    {
      type: "batch run",
      picker: BatchRunPicker,
      pickerProjection: BATCH_RUN_PICKER_PROJECTION,
    },
  ],
}

export const ClaimBatchModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
