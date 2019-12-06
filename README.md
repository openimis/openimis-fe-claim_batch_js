# openIMIS Frontend Claim Batch reference module
This repository holds the files of the openIMIS Frontend Claim Batch reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Main Menu Contributions
None

## Other Contributions
* `claim.MainMenu` : **Batch Runs** (claim_batch.menu.claim_batch translation key))
* `core.Router`: registering the `claim_batch` route in openIMIS client-side router
## Available Contribution Points
None

## Published Components
* `claim_batch.BatchRunPicker`, drop down bound to `batchRuns` GraphQL query (no cache, requires district id as scope)
* `claim_batch.AccountTypePicker`, constant-based picker, translation keys: `claim_batch.accountType.null`, `claim_batch.accountType.1`,...
## Dispatched Redux Actions
* `CLAIM_BATCH_CLAIM_BATCH_PICKER_{REQ|CLEAR|RESP|ERR}`: fetching (clearing) batch runs for a selected district
* `CLAIM_BATCH_CLAIM_BATCH_SEARCHER_{REQ|RESP|ERR}`: fetching batch processes
* `CLAIM_BATCH_MUTATION_{REQ|ERR}`: sending (processBatch) mutation
* `CLAIM_BATCH_PROCESS_RESP`: recieving the result of process batch mutation
* `CLAIM_BATCH_PREVIEW`: emit print preview request
* `CLAIM_BATCH_PREVIEW_DONE`: recieved print preview response (pdf)


## Other Modules Listened Redux Actions 
None

## Other Modules Redux State Bindings
* `state.core.user`, to access user info (rights,...)
* `state.core.confirmed`, launch batch confirmation dialog results

## Configurations Options
* `claim_batchFilter.rowsPerPageOptions`, pagination page size options in Batch Searcher component (Default: `[10, 20, 50, 100]`)
* `claim_batchFilter.defaultPageSize`, pagination pre-selected page size options in Batch Searcher component (Default: `10`)
