import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';

import { Grid } from "@material-ui/core";
import { withModulesManager, PublishedComponent, decodeId, formatMessage } from "@openimis/fe-core";

const styles = theme => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    },
    paperDivider: theme.paper.divider,
});

class BatchRunFilter extends Component {

    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null
    }

    render() {
        const { intl, classes, filters, onChangeRegion, onChangeDistrict, onChangeFilters } = this.props;
        const min = new Date().getFullYear() - 7;
        const max = min + 9;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubId="claim_batch.AccountTypePicker"
                        name="accountType"
                        value={(filters['accountType'] && filters['accountType']['value'])}
                        onChange={(v, s) => onChangeFilters([{
                            id: 'accountType',
                            value: v,
                            filter: `accountType: ${v}`
                        }])}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubId="core.YearPicker"
                        module="claim_batch"
                        label="year"
                        nullLabel="year.null"
                        min={min}
                        max={max}
                        value={(filters['accountYear'] && filters['accountYear']['value'])}
                        onChange={v => onChangeFilters([{
                            id: 'accountYear',
                            value: v,
                            filter: `accountYear: ${v}`
                        }])}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubId="core.MonthPicker"
                        module="claim_batch"
                        label="month"
                        nullLabel="month.null"
                        value={(filters['accountMonth'] && filters['accountMonth']['value'])}
                        onChange={v => onChangeFilters([{
                            id: 'accountMonth',
                            value: v,
                            filter: `accountMonth: ${v}`
                        }])}
                    />
                </Grid>
                <Grid item xs={3} />
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubId="location.RegionPicker"
                        value={(!!filters['accountRegion'] ? filters['accountRegion']['value'] : null)}
                        withNull={true}
                        nullLabel={formatMessage(intl, "claim_batch", "claim_batch.regions.country")}
                        onChange={onChangeRegion}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubId="location.DistrictPicker"
                        value={(filters['accountDistrict'] && filters['accountDistrict']['value'])}
                        region={filters['accountRegion'] && filters['accountRegion']['value']}
                        withNull={true}
                        onChange={onChangeDistrict}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubId="product.ProductPicker"
                        value={(filters['accountProduct'] && filters['accountProduct']['value'])}
                        onChange={(v, s) => onChangeFilters([{
                            id: 'accountProduct',
                            value: v,
                            filter: !!v ? `accountProduct: ${decodeId(v.id)}` : null
                        }])}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubId="medical.CareTypePicker"
                        value={(filters['accountCareType'] && filters['accountCareType']['value'])}
                        onChange={(v, s) => onChangeFilters([{
                            id: 'accountCareType',
                            value: v,
                            filter: !!v ? `accountCareType: "${v}"` : null
                        }])}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(BatchRunFilter))));