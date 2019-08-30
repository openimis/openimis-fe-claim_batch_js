import { parseData, formatServerError, formatGraphQLError } from '@openimis/fe-core';

function reducer(
    state = {
        fetchingBatchRunPicker: false,
        fetchedBatchRunPicker: false,
        errorBatchRunPicker: null,
        batchRunPicker: [],
        fetchingBatchRunSearcher: false,
        fetchedBatchRunSearcher: false,
        batchRunSearcher: [],
        batchRunSearcherPageInfo: { totalCount: 0 },
        errorBatchRunSearcher: null,
        submittingMutation: false,
    },
    action,
) {
    switch (action.type) {
        case 'CLAIM_BATCH_CLAIM_BATCH_PICKER_REQ':
            return {
                ...state,
                fetchingBatchRunPicker: true,
                fetchedBatchRunPicker: false,
                batchRunPicker: [],
                errorBatchRunPicker: null,
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_PICKER_RESP':
            return {
                ...state,
                fetchingBatchRunPicker: false,
                fetchedBatchRunPicker: true,
                batchRunPicker: parseData(action.payload.data.batchRuns),
                errorBatchRunPicker: formatGraphQLError(action.payload)
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_PICKER_ERR':
            return {
                ...state,
                fetchingBatchRunPicker: false,
                errorBatchRunPicker: formatServerError(action.payload)
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER_REQ':
            return {
                ...state,
                fetchingBatchRunSearcher: true,
                fetchedBatchRunSearcher: false,
                batchRunSearcher: [],
                batchRunSearcherPageInfo: { totalCount: 0 },
                errorBatchRunSearcher: null,
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER_RESP':
            return {
                ...state,
                fetchingBatchRunSearcher: false,
                fetchedBatchRunSearcher: true,
                batchRunSearcher: action.payload.data.batchRuns,
                errorBatchRunSearcher: formatGraphQLError(action.payload)
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER_ERR':
            return {
                ...state,
                fetchingBatchRunSearcher: false,
                errorBatchRunSearcher: formatServerError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;
