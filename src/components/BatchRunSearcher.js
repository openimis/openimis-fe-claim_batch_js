import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { FormattedMessage, withModulesManager, Table, PublishedComponent, ProgressOrError } from "@openimis/fe-core";
import BatchRunFilter from "./BatchRunFilter";
import { Grid, Paper, IconButton } from "@material-ui/core";
import { fetchBatchRunSummaries } from "../actions";
import _ from "lodash";
import SearchIcon from "@material-ui/icons/Search";

const styles = theme => ({
    paper: {
        marginTop: theme.spacing(1)
    },
    paperHeader: theme.paper.header,
    paperHeaderTitle: theme.paper.title,
    paperHeaderAction: theme.paper.action,
    paperDivider: theme.paper.divider, form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    },
    paperDivider: theme.paper.divider,
});

class BatchRunSearcher extends Component {
    state = {
        filters: {},
        page: 0,
        pageSize: 0,
        afterCursor: null,
        beforeCursor: null,
    }

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-claim_batch", "claim_batchFilter.rowsPerPageOptions", [10, 20, 50, 100]);
        this.defaultPageSize = props.modulesManager.getConf("fe-claim_batch", "claim_batchFilter.defaultPageSize", 10);
    }

    componentDidMount() {
        this.setState({
            pageSize: this.defaultPageSize,
        },
            e => this.props.fetchBatchRunSummaries(
                this.props.modulesManager,
                this.filtersToQueryParams()
            )
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.forcedFilters, this.props.forcedFilters)) {
            this.applyFilters();
        }
    }

    filtersToQueryParams = () => {
        let prms = Object.keys(this.state.filters).map(f => this.state.filters[f]['filter']);
        prms = prms.concat(`first: ${this.state.pageSize}`);
        if (!!this.state.afterCursor) {
            prms.push(`after: "${this.state.afterCursor}"`)
        }
        if (!!this.state.beforeCursor) {
            prms.push(`before: "${this.state.beforeCursor}"`)
        }
        if (!!this.props.forcedFilters) {
            prms.push(...this.props.forcedFilters);
        }
        return prms;
    }

    onChangeFilters = fltrs => {
        let filters = { ...this.state.filters };
        fltrs.forEach(filter => {
            if (filter.value === null) {
                delete (filters[filter.id]);
            } else {
                filters[filter.id] = { value: filter.value, filter: filter.filter };
            }
        });
        this.setState(
            { filters },
            e => this.applyFilters()
        )
    }

    applyFilters = () => {
        this.setState({
            page: 0,
            afterCursor: null,
            beforeCursor: null,
        },
            e => this.props.fetchBatchRunSummaries(
                this.props.modulesManager,
                this.filtersToQueryParams()
            )
        )
    }

    rowIdentifier = r => r

    onChangeRowsPerPage = (cnt) => {
        this.setState(
            {
                pageSize: cnt,
                page: 0,
                afterCursor: null,
                beforeCursor: null,
            },
            e => this.props.fetchBatchRunSummaries(
                this.props.modulesManager,
                this.filtersToQueryParams()
            )
        )
    }

    onChangePage = (page, nbr) => {
        if (nbr > this.state.page) {
            this.setState(
                {
                    page: this.state.page + 1,
                    beforeCursor: null,
                    afterCursor: this.props.batchRunSearcherPageInfo.endCursor,
                },
                e => this.props.fetchBatchRunSummaries(
                    this.props.modulesManager,
                    this.filtersToQueryParams()
                )
            )
        } else if (nbr < this.state.page) {
            this.setState(
                {
                    page: this.state.page - 1,
                    beforeCursor: this.props.batchRunSearcherPageInfo.startCursor,
                    afterCursor: null,
                },
                e => this.props.fetchBatchRunSummaries(
                    this.props.modulesManager,
                    this.filtersToQueryParams()
                )
            )
        }
    }
    render() {
        const { classes, batchRunSearcher, batchRunSearcherPageInfo,
            fetchingBatchRunSearcher, errorBatchRunSearcher, fetchedBatchRunSearcher
        } = this.props;
        return (
            <Paper>
                <Grid container className={classes.paperHeader}>
                    <Grid item xs={8} className={classes.paperHeaderTitle}>
                        <FormattedMessage module="claim_batch"
                            id="BatchRunSearcher.title"
                            values={{ totalCount: batchRunSearcherPageInfo.totalCount }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container justify="flex-end">
                            <Grid item className={classes.paperHeaderAction}>
                                <IconButton onClick={this.applyFilters}>
                                    <SearchIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <BatchRunFilter
                            filters={this.state.filters}
                            apply={this.applyFilters}
                            onChangeFilters={this.onChangeFilters}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ProgressOrError progress={fetchingBatchRunSearcher} error={errorBatchRunSearcher} />
                        {!!fetchedBatchRunSearcher && (
                            <Table
                                module="claim_batch"
                                headers={[
                                    "batchRunSummaries.year",
                                    "batchRunSummaries.month",
                                    "batchRunSummaries.product",
                                    "batchRunSummaries.careType",
                                    "batchRunSummaries.calculatedDate",
                                    "batchRunSummaries.index",
                                ]}
                                itemFormatters={[
                                    b => b.runYear,
                                    b => <PublishedComponent
                                        id="core.MonthPicker"
                                        readOnly={true}
                                        withLabel={false}
                                        value={b.runMonth}
                                    />,
                                    b => b.productLabel,
                                    b => <PublishedComponent
                                        id="medical.CareTypePicker"
                                        readOnly={true}
                                        withLabel={false}
                                        value={b.careType}
                                    />,
                                    b => <PublishedComponent
                                        id="core.DatePicker"
                                        readOnly={true}
                                        withLabel={false}
                                        value={b.calcDate}
                                    />,
                                    b => b.index
                                ]}
                                items={batchRunSearcher}
                                withPagination={true}
                                itemIdentifier={this.rowIdentifier}
                                page={this.state.page}
                                pageSize={this.state.pageSize}
                                count={batchRunSearcherPageInfo.totalCount}
                                onChangePage={this.onChangePage}
                                rowsPerPageOptions={this.rowsPerPageOptions}
                                onChangeRowsPerPage={this.onChangeRowsPerPage}
                            />
                        )}
                    </Grid>
                </Grid>
            </Paper>
        )
    }
}

const mapStateToProps = state => ({
    batchRunSearcher: state.claim_batch.batchRunSearcher,
    batchRunSearcherPageInfo: state.claim_batch.batchRunSearcherPageInfo,
    fetchingBatchRunSearcher: state.claim_batch.fetchingBatchRunSearcher,
    fetchedBatchRunSearcher: state.claim_batch.fetchedBatchRunSearcher,
    errorBatchRunSearcher: state.claim_batch.errorBatchRunSearcher,
});


const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { fetchBatchRunSummaries },
        dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(BatchRunSearcher)))
));
