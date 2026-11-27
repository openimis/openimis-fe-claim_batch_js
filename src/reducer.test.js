import {
  describe, expect, it, vi,
} from 'vitest';

vi.mock('@openimis/fe-core', async () => vi.importActual('@openimis/fe-core/helpers/api'));

const { default: reducer } = await import('./reducer');
const { graphqlErrors, relayPage, serverError } = await import('@openimis/fe-core/testing');

const initial = () => reducer(undefined, { type: '@@INIT' });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, prefix, data, extra = {}) => dispatch(state, `${prefix}_RESP`, { payload: { data, ...extra } });
const fail = (state, prefix, payload = serverError(500, 'Internal Server Error', 'boom')) => dispatch(
  state,
  `${prefix}_ERR`,
  { payload },
);

const SERVER_ERROR = { code: 500, message: 'Internal Server Error', detail: 'boom' };
const capitalised = (field) => `${field.charAt(0).toUpperCase()}${field.slice(1)}`;

describe('claim batch reducer', () => {
  it('starts with nothing loaded and nothing in flight', () => {
    expect(initial()).toMatchObject({
      batchRunPicker: [],
      batchRunWithLocationPicker: [],
      batchRunSearcher: [],
      batchRunSearcherPageInfo: { totalCount: 0 },
      submittingMutation: false,
    });
  });

  it('returns the same state object for an unrelated action', () => {
    const state = initial();

    expect(reducer(state, { type: 'SOMETHING_ELSE' })).toBe(state);
  });

  describe('lists', () => {
    const LISTS = [
      ['batch run picker', 'CLAIM_BATCH_CLAIM_BATCH_PICKER', 'batchRuns', 'batchRunPicker'],
      ['batch run searcher', 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER', 'batchRunsSummaries', 'batchRunSearcher'],
      ['batch run with location picker', 'CLAIM_BATCH_CLAIM_BATCH_PICKER_WITH_LOCATION', 'batchRuns',
        'batchRunWithLocationPicker'],
    ];

    it.each(LISTS)('empties the %s and clears the error when a fetch starts', (_label, prefix, _entity, field) => {
      const stale = { ...initial(), [field]: [{ id: '1' }], [`error${capitalised(field)}`]: SERVER_ERROR };
      const state = dispatch(stale, `${prefix}_REQ`);

      expect(state[`fetching${capitalised(field)}`]).toBe(true);
      expect(state[`fetched${capitalised(field)}`]).toBe(false);
      expect(state[field]).toEqual([]);
      expect(state[`error${capitalised(field)}`]).toBeNull();
    });

    it.each(LISTS)('keeps the rows of the %s', (_label, prefix, entity, field) => {
      const state = respond(initial(), prefix, { [entity]: relayPage([{ id: 'a' }, { id: 'b' }]) });

      expect(state[`fetching${capitalised(field)}`]).toBe(false);
      expect(state[`fetched${capitalised(field)}`]).toBe(true);
      expect(state[field]).toEqual([{ id: 'a' }, { id: 'b' }]);
      expect(state[`error${capitalised(field)}`]).toBeNull();
    });

    it.each(LISTS)('surfaces a data error from the %s', (_label, prefix, entity, field) => {
      const state = respond(initial(), prefix, { [entity]: relayPage([]) }, graphqlErrors('bad filter'));

      expect(state[`error${capitalised(field)}`]).toMatchObject({ detail: 'bad filter' });
    });

    it.each(LISTS)('formats a transport failure of the %s', (_label, prefix, _entity, field) => {
      const state = fail(initial(), prefix);

      expect(state[`fetching${capitalised(field)}`]).toBe(false);
      expect(state[`error${capitalised(field)}`]).toEqual(SERVER_ERROR);
    });

    it.each([
      ['batch run searcher', 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER', 'batchRunsSummaries', 'batchRunSearcherPageInfo'],
      ['batch run with location picker', 'CLAIM_BATCH_CLAIM_BATCH_PICKER_WITH_LOCATION', 'batchRuns',
        'batchRunWithLocationPickerPageInfo'],
    ])('keeps the page info of the %s', (_label, prefix, entity, field) => {
      const state = respond(initial(), prefix, {
        [entity]: relayPage([{ id: 'a' }], { totalCount: 30, pageInfo: { hasNextPage: true } }),
      });

      expect(state[field]).toMatchObject({ totalCount: 30, hasNextPage: true });
    });

    it('resets the searcher count when a search starts', () => {
      const stale = { ...initial(), batchRunSearcherPageInfo: { totalCount: 30, hasNextPage: true } };

      expect(dispatch(stale, 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER_REQ').batchRunSearcherPageInfo)
        .toEqual({ totalCount: 0 });
    });
  });

  describe('batch processing', () => {
    const submitting = () => dispatch(initial(), 'CLAIM_BATCH_MUTATION_REQ', {
      meta: { clientMutationId: 'cmid-1', clientMutationLabel: 'Process batch' },
    });

    it('records the request metadata while processing is in flight', () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: 'cmid-1', clientMutationLabel: 'Process batch' },
      });
    });

    it('clears the in-flight flag and keeps the internal id of processBatch', () => {
      const state = respond(submitting(), 'CLAIM_BATCH_PROCESS', { processBatch: { internalId: 'internal-1' } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation.id).toBe('internal-1');
    });

    it('raises an alert when processing fails', () => {
      const state = fail(submitting(), 'CLAIM_BATCH_MUTATION', { status: 500, statusText: 'Internal Server Error' });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: 'Internal Server Error' });
    });

    // Currently fails: dispatchMutationErr in fe-core only stores the alert, so the
    // module is left believing the mutation is still being submitted.
    it.fails('stops submitting once a mutation has failed', () => {
      expect(fail(submitting(), 'CLAIM_BATCH_MUTATION', { status: 500 }).submittingMutation).toBe(false);
    });
  });

  describe('report preview', () => {
    it('marks a report as generating when a preview is asked for', () => {
      expect(dispatch(initial(), 'CLAIM_BATCH_PREVIEW').generating).toBe(true);
    });

    it.each(['CLAIM_BATCH_PREVIEW_DONE', 'CLAIM_BATCH_PREVIEW_ERROR'])('stops generating on %s', (type) => {
      const generating = dispatch(initial(), 'CLAIM_BATCH_PREVIEW');

      expect(dispatch(generating, type).generating).toBe(false);
    });
  });
});
