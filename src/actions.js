import {
  graphql, formatPageQuery, formatPageQueryWithCount, formatMutation, decodeId,
  baseApiUrl, openBlob, toISODate
} from "@openimis/fe-core";
import _ from "lodash-uuid";

export const BATCH_RUN_PICKER_PROJECTION = ["id", "runDate"];

export const BATCH_RUN_WITH_LOCATION_PICKER_PROJECTION = [
  "id",
  "runDate",
  "runMonth",
  "runYear",
  "location{code name}", 
];

export function fetchBatchRunPicker(mm, scopeRegion, scopeDistrict) {
  var filters = ['orderBy: "-runDate"']
  var payload = null;
  if (!!scopeDistrict) {
    filters.push([`location_Uuid: "${scopeDistrict.uuid}"`])
  } else if (!!scopeRegion) {
    filters.push(`location_Uuid: "${scopeRegion.uuid}"`)
  } else { //!!scopeNational
    filters.push(`location_Isnull: true`)
  }
  payload = formatPageQuery("batchRuns",
    filters,
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

export function fetchBatchRunWithLocationPicker(params) {
  const payload = formatPageQueryWithCount("batchRuns", params, BATCH_RUN_WITH_LOCATION_PICKER_PROJECTION);
  return graphql(payload, 'CLAIM_BATCH_CLAIM_BATCH_PICKER_WITH_LOCATION')
}

export function processBatch(location, year, month, clientMutationLabel, clientMutationDetails = null) {
  let input = `
    ${!!location ? `locationId: ${decodeId(location.id)}` : ''}
    month: ${month}
    year: ${year}
  `
  let mutation = formatMutation("processBatch", input, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CLAIM_BATCH_MUTATION_REQ', 'CLAIM_BATCH_PROCESS_RESP', 'CLAIM_BATCH_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function preview() {
  return dispatch => {
    dispatch({ type: 'CLAIM_BATCH_PREVIEW' })
  }
}

function prmsLocationId(prms) {
  if (!!prms.district) return decodeId(prms.district.id)
  if (!!prms.region) return decodeId(prms.region.id)
  return 0
}

export function generateReport(prms) {
  var qParams = {
    locationId: prmsLocationId(prms),
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