import {
  graphql, formatQuery, formatPageQuery
} from "@openimis/fe-core";

export function fetchBatchRunPicker(mm, scope) {
  const payload = formatPageQuery("batchRuns",
    [`location_Id: "${scope.id}"`],
    mm.getRef("claim_batch.AccountPicker.projection")
  );
  return graphql(payload, 'CLAIM_BATCH_CLAIM_BATCH_PICKER');
}

export function fetchBatchRunSummaries(mm, filters) {
  const payload = formatQuery("batchRunsSummaries",
    [],
    ["runYear", "runMonth", "productLabel",
      "careType", "calcDate", "index"]
  );
  return graphql(payload, 'CLAIM_BATCH_CLAIM_BATCH_SEARCHER');
}
