import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { Paper, Grid, IconButton, Divider } from "@material-ui/core";
import PreviewIcon from "@material-ui/icons/ListAlt";
import { FormattedMessage, PublishedComponent, DatePicker, ConstantBasedPicker } from "@openimis/fe-core";

import { ACCOUNT_GROUP_BY } from "../constants";

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
        accountGroupBy: "HF"
    }

    _preview = () => console.log("PREVIEW "+ JSON.stringify(this.state));

    _onChange = (key, v) => this.setState({ [key]: v })

    render() {
        const { classes } = this.props;
        return (
            <Paper className={classes.paper}>
                <Grid container className={classes.paperHeader}>
                    <Grid item xs={11} className={classes.paperHeaderTitle}>
                        <FormattedMessage module="claim_batch" id="AccountPreviewer.title" />
                    </Grid>
                    <Grid item xs={1}>
                        <Grid container justify="flex-end">
                            <Grid item className={classes.paperHeaderAction}>
                                <IconButton onClick={this._preview}>
                                    <PreviewIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <AccountGroupBySelect
                            value={this.state.accountGroupBy}
                            onChange={(v,s) => this._onChange('accountGroupBy', v)}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <DatePicker
                            module="claim_batch"
                            label="previewer.dateFrom"
                            value={this.state.dateFrom}
                            onChange={(v, s) => this._onChange('dateFrom', v)}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <DatePicker
                            module="claim_batch"
                            label="previewer.dateTo"
                            value={this.state.dateTo}
                            onChange={(v, s) => this._onChange('dateTo', v)}
                        />
                    </Grid>
                    <Grid item xs={6} className={classes.item}></Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            id="location.RegionPicker"
                            onChange={this._onChange}
                            value={this.state.accountRegion}
                            onChange={(v, s) => this._onChange('accountRegion', v)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            id="location.DistrictPicker"
                            onChange={this._onChange}
                            value={this.state.accountDistrict}
                            onChange={(v, s) => this._onChange('accountDistrict', v)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            id="location.HealthFacilityPicker"
                            onChange={this._onChange}
                            value={this.state.accountHealthFacility}
                            onChange={(v, s) => this._onChange('accountHealthFacility', v)}                            
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            id="location.HealthFacilityLevelPicker"
                            onChange={this._onChange}
                            value={this.state.accountHealthFacilityLevel}
                            onChange={(v, s) => this._onChange('accountHealthFacilityLevel', v)}                            
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            id="product.ProductPicker"
                            onChange={this._onChange}
                            value={this.state.accountProduct}
                            onChange={(v, s) => this._onChange('accountProduct', v)}   
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            id="claim_batch.BatchRunPicker"
                            onChange={this._onChange}
                            value={this.state.batchRun}
                            onChange={(v, s) => this._onChange('batchRun', v)}   
                        />
                    </Grid>
                </Grid>
            </Paper>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(AccountPreviewer)));