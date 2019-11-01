import {
  graphql, formatPageQuery, formatPageQueryWithCount, formatMutation, decodeId,
  baseApiUrl, openBlob, toISODate
} from "@openimis/fe-core";
import _ from "lodash-uuid";

export function fetchBatchRunPicker(mm, scope) {
  if (!scope) {
    return dispatch => {
      dispatch({ type: 'CLAIM_BATCH_CLAIM_BATCH_PICKER_CLEAR' })
    }
  }
  const payload = formatPageQuery("batchRuns",
    [`location_Uuid: "${scope.uuid}"`],
    mm.getRef("claim_batch.BatchRunPicker.projection")
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

export function preview() {
  return dispatch => {
    dispatch({ type: 'CLAIM_BATCH_PREVIEW' })
  }
}

export function generateReport(prms) {
  var qParams = {
    locationId: !prms.region ? 0 : decodeId(prms.region.id),
    regionCode: !prms.region ? '' : prms.region.code,
    regionName: !prms.region ? '' : prms.region.name,
    prodId: !prms.product ? 0 : decodeId(prms.product.id),
    productCode: !prms.product ? '' : prms.product.code,
    productName: !prms.product ? '' : prms.product.name,
    runId: !prms.batchRun ? 0 : decodeId(prms.batchRun.id),
    runDate: !prms.batchRun ? '' : toISODate(prms.batchRun.runDate),
    hfId: !prms.healthFacility ? 0 : decodeId(prms.healthFacility.id),
    hfCode: !prms.healthFacility ? '' : prms.healthFacility.code,
    hfName: !prms.healthFacility ? '' : prms.healthFacility.name,
    hfLevel: !prms.healthFacilityLevel ? '' : prms.healthFacilityLevel,
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