import {
  graphql, formatPageQuery, formatPageQueryWithCount, formatMutation, decodeId,
  baseApiUrl, openBlob, toISODate
} from "@openimis/fe-core";
import _ from "lodash-uuid";

export function fetchBatchRunPicker(mm, scope) {
  const payload = formatPageQuery("batchRuns",
    [`location_Id: "${scope.id}"`],
    mm.getRef("claim_batch.AccountPicker.projection")
  );
  return graphql(payload, 'CLAIM_BATCH_CLAIM_BATCH_PICKER');
}

export function fetchBatchRunSummaries(mm, filters) {
  const payload = formatPageQueryWithCount("batchRunsSummaries",
    filters,
    ["runYear", "runMonth", "productLabel",
      "careType", "calcDate", "index"]
  );
  return graphql(payload, 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER');
}

export function processBatch(location, year, month, clientMutationLabel) {
  let input = `
    locationId: ${decodeId(location.id)}
    month: ${month}
    year: ${year}

  `
  let mutation = formatMutation("processBatch", input, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CLAIM_BATCH_MUTATION_REQ', 'CLAIM_BATCH_PROCESS_RESP', 'CLAIM_BATCH_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function preview(prms) {
  return dispatch => {
    dispatch({ type: 'CLAIM_BATCH_PREVIEW', payload: prms })
  }  
}

export function generateReport(prms) {
  var qParams = {
    locationId: !prms.region ? 0 : decodeId(prms.region.id),
    prodId: !prms.product ? 0 : decodeId(prms.product.id),
    runId: !prms.batchRun ? 0 : decodeId(prms.batchRun.id),
    hfId: !prms.healthFacility ? 0 : decodeId(prms.healthFacility.id),
    hfLevel: !prms.healthFacilityLevel ? '' : decodeId(prms.healthFacilityLevel),
    dateFrom: !prms.dateFrom ? '' : toISODate(prms.dateFrom),
    dateTo: !prms.dateTo ? '' : toISODate(prms.dateTo),
    group: prms.group,
    showClaims: prms.showClaims,
  }
  var url = new URL(`${window.location.origin}${baseApiUrl}/claim_batch/report/`);
  url.search = new URLSearchParams(qParams);
  return (dispatch) => {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => openBlob(blob, `${_.uuid()}.pdf`, "pdf"))
      .then(e => dispatch({ type: 'CLAIM_BATCH_PREVIEW_DONE', payload: prms }))
  }
}