import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _ from "lodash";
import { Paper, Grid, IconButton, Divider, FormControlLabel, Checkbox, CircularProgress } from "@material-ui/core";
import PreviewIcon from "@material-ui/icons/ListAlt";
import { FormattedMessage, PublishedComponent, ConstantBasedPicker, formatMessage } from "@openimis/fe-core";
import { preview, generateReport } from "../actions"

import { ACCOUNT_GROUP_BY } from "../constants";

const styles = theme => ({
    paper: {
        marginTop: theme.spacing(1)
    },
    paperHeader: theme.paper.header,
    paperHeaderTitle: theme.paper.title,
    paperHeaderAction: theme.paper.action,
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    },
    paperDivider: theme.paper.divider,
    generating: {
        margin: theme.spacing(1)
    }
});

class AccountGroupBySelect extends Component {
    render() {
        return <ConstantBasedPicker
            module="claim_batch"
            label="groupBy"
            constants={ACCOUNT_GROUP_BY}
            withNull={false}
            {...this.props}
        />
    }
}

class AccountPreviewer extends Component {

    state = {
        group: ACCOUNT_GROUP_BY[0],
        showClaims: false,
    }

    componentDidMount() {
        if (!!this.props.userHealthFacilityFullPath) {
            this.setState((state, props) => ({
                region: props.userHealthFacilityFullPath.location.parent,
                district: props.userHealthFacilityFullPath.location,
                healthFacility: props.userHealthFacilityFullPath,
                batchRun: null,
            }));
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.generating && !!this.props.generating) {
            this.props.generateReport({ ...this.state })
        } else if (!_.isEqual(prevProps.userHealthFacilityFullPath, this.props.userHealthFacilityFullPath)) {
            if (!!this.props.userHealthFacilityFullPath) {
                this.setState((state, props) =>({
                    region: props.userHealthFacilityFullPath.location.parent,
                    district: props.userHealthFacilityFullPath.location,
                    healthFacility: props.userHealthFacilityFullPath,
                    batchRun: null,
                }));
            }
        }
    }

    _onChange = (key, v) => this.setState({ [key]: v })

    _onChangeRegion = (v, s) => {
        this.setState({
            region: v,
            district: null,
            healthFacility: null,
            batchRun: null,
        });
    }

    _onChangeDistrict = (v, s) => {
        this.setState((state) => ({
            region: v !== null ? v.parent : state.region,
            district: v,
            healthFacility: null,
            batchRun: null,
        }));
    }

    _onChangeHealthFacility = (v, s) => {
        this.setState((state) => ({
            region: v !== null ? v.location.parent : state.region,
            district: v !== null ? v.location : state.district,
            healthFacility: v,
            batchRun: null,
        }));
    }

    render() {
        const { intl, classes, generating } = this.props;
        return (
            <Paper className={classes.paper}>
                <Grid container className={classes.paperHeader}>
                    <Grid item xs={11} className={classes.paperHeaderTitle}>
                        <FormattedMessage module="claim_batch" id="AccountPreviewer.title" />
                    </Grid>
                    <Grid item xs={1}>
                        <Grid container justify="flex-end">
                            <Grid item className={classes.paperHeaderAction}>
                                {!generating &&
                                    <IconButton onClick={e => this.props.preview()}>
                                        <PreviewIcon />
                                    </IconButton>
                                }
                                {!!generating && <CircularProgress className={classes.generating} size={24} />}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <AccountGroupBySelect
                            value={this.state.group}
                            onChange={(v, s) => this._onChange('group', v)}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent pubId="core.DatePicker"
                            module="claim_batch"
                            label="previewer.dateFrom"
                            value={this.state.dateFrom}
                            onChange={(v, s) => this._onChange('dateFrom', v)}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent pubId="core.DatePicker"
                            module="claim_batch"
                            label="previewer.dateTo"
                            value={this.state.dateTo}
                            onChange={(v, s) => this._onChange('dateTo', v)}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="primary"
                                    checked={this.state.showClaims}
                                    onChange={e => this._onChange('showClaims', !this.state.showClaims)}
                                />
                            }
                            label={formatMessage(intl, "claim_batch", "previewer.showClaims")}
                        />
                    </Grid>
                    <Grid item xs={6} className={classes.item}></Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubId="location.RegionPicker"
                            value={this.state.region}
                            onChange={this._onChangeRegion}
                            withNull={true}
                            nullLabel={formatMessage(intl, "claim_batch", "claim_batch.regions.country")}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubId="location.DistrictPicker"
                            region={this.state.region}
                            value={this.state.district}
                            onChange={this._onChangeDistrict}
                            withNull={true}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubId="location.HealthFacilityPicker"
                            region={this.state.region}
                            district={this.state.district}
                            value={this.state.healthFacility}
                            onChange={this._onChangeHealthFacility}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubId="location.HealthFacilityLevelPicker"
                            value={this.state.healthFacilityLevel}
                            onChange={(v, s) => this._onChange('healthFacilityLevel', v)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubId="product.ProductPicker"
                            value={this.state.product}
                            onChange={(v, s) => this._onChange('product', v)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubId="claim_batch.BatchRunPicker"
                            scopeRegion={this.state.region}
                            scopeDistrict={this.state.district}
                            value={this.state.batchRun}
                            withNull={true}
                            onChange={(v, s) => this._onChange('batchRun', v)}
                        />
                    </Grid>
                </Grid>
            </Paper>
        )
    }
}

const mapStateToProps = state => ({
    userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
    generating: state.claim_batch.generating,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { preview, generateReport },
        dispatch);
};

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AccountPreviewer))));