import {
    parseData, pageInfo, formatServerError, formatGraphQLError,
    dispatchMutationReq, dispatchMutationResp, dispatchMutationErr
} from '@openimis/fe-core';

function reducer(
    state = {
        fetchingBatchRunPicker: false,
        fetchedBatchRunPicker: false,
        errorBatchRunPicker: null,
        batchRunPicker: [],
        fetchingBatchRunReadOnlyPicker: false,
        fetchedBatchRunReadOnlyPicker: false,
        batchRunReadOnlyPickerTotalCount: 0,
        batchRunReadOnlyPickerPageInfo: {},
        errorBatchRunReadOnlyPicker: null,
        batchRunReadOnlyPicker: [],
        fetchingBatchRunSearcher: false,
        fetchedBatchRunSearcher: false,
        batchRunSearcher: [],
        batchRunSearcherPageInfo: { totalCount: 0 },
        errorBatchRunSearcher: null,
        submittingMutation: false,
        mutation: {},
        generatingReport: false,
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
                batchRunSearcher: parseData(action.payload.data.batchRunsSummaries),
                batchRunSearcherPageInfo: pageInfo(action.payload.data.batchRunsSummaries),
                errorBatchRunSearcher: formatGraphQLError(action.payload)
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER_ERR':
            return {
                ...state,
                fetchingBatchRunSearcher: false,
                errorBatchRunSearcher: formatServerError(action.payload)
            };
        
        case 'CLAIM_BATCH_CLAIM_BATCH_PICKER_READ_ONLY_REQ':
            return {
                ...state,
                fetchingBatchRunReadOnlyPicker: true,
                fetchedBatchRunReadOnlyPicker: false,
                batchRunReadOnlyPicker: [],
                batchRunReadOnlyPickerPageInfo: {},
                batchRunReadOnlyPickerTotalCount: 0,
                errorBatchRunReadOnlyPicker: null,
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_PICKER_READ_ONLY_RESP':
            return {
                ...state,
                fetchingBatchRunReadOnlyPicker: false,
                fetchedBatchRunReadOnlyPicker: true,
                batchRunReadOnlyPicker: parseData(action.payload.data.batchRuns),
                batchRunReadOnlyPickerPageInfo: pageInfo(action.payload.data.batchRuns),
                batchRunReadOnlyPickerTotalCount: !!action.payload.data.batchRuns ? action.payload.data.batchRuns.totalCount : null,
                errorBatchRunReadOnlyPicker: formatGraphQLError(action.payload)
            };
        case 'CLAIM_BATCH_CLAIM_BATCH_PICKER_READ_ONLY_ERR':
            return {
                ...state,
                fetchingBatchRunReadOnlyPicker: false,
                errorBatchRunReadOnlyPicker: formatServerError(action.payload)
            };
        case 'CLAIM_BATCH_MUTATION_REQ':
            return dispatchMutationReq(state, action)
        case 'CLAIM_BATCH_MUTATION_ERR':
            return dispatchMutationErr(state, action);
        case 'CLAIM_BATCH_PROCESS_RESP':
            return dispatchMutationResp(state, "processBatch", action)
        case 'CLAIM_BATCH_PREVIEW':
            return {
                ...state,
                generating: true,
            };
        case 'CLAIM_BATCH_PREVIEW_DONE':
            return {
                ...state,
                generating: false
            };            
        default:
            return state;
    }
}

export default reducer;
