import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _debounce from "lodash/debounce";

import { Grid } from "@material-ui/core";
import { withModulesManager, PublishedComponent, YearPicker, MonthPicker } from "@openimis/fe-core";

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
    debouncedOnChangeFilter = _debounce(
        this.props.onChangeFilter,
        this.props.modulesManager.getConf("fe-claim_batch", "debounceTime", 800)
    )

    render() {
        const { intl, classes, filters, onChangeFilter, fixFilter } = this.props;
        const min = new Date().getFullYear() - 7;
        const max = min + 9;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        id="claim_batch.AccountTypePicker"
                        name="accountType"
                        value={(filters['accountType'] && filters['accountType']['value'])}
                        onChange={(v, s) => onChangeFilter(
                            'accountType', v,
                            `accountType: ${v}`
                        )}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <YearPicker
                        module="claim_batch"
                        label="year"
                        nullLabel="year.select"
                        min={min}
                        max={max}
                        value={(filters['accountYear'] && filters['accountYear']['value'])}
                        onChange={v => onChangeFilter(
                            'accountYear', v,
                            `accountYear: ${v}`
                        )}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <MonthPicker
                        module="claim_batch"
                        label="month"
                        nullLabel="month.select"
                        value={(filters['accountMonth'] && filters['accountMonth']['value'])}
                        onChange={v => onChangeFilter(
                            'accountMonth', v,
                            `accountMonth: ${v}`
                        )}
                    />
                </Grid>
                <Grid item xs={3} />
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        id="location.RegionPicker"
                        value={(filters['accountRegion'] && filters['accountRegion']['value'])}
                        onChange={(v, s) => onChangeFilter(
                            'accountRegion', v,
                            `accountRegion: ${v}`
                        )}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        id="location.DistrictPicker"
                        value={(filters['accountDistrict'] && filters['accountDistrict']['value'])}
                        onChange={(v, s) => onChangeFilter(
                            'accountDistrict', v,
                            `accountDistrict: ${v}`
                        )}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        id="product.ProductPicker"
                        value={(filters['accountProduct'] && filters['accountProduct']['value'])}
                        onChange={(v, s) => onChangeFilter(
                            'accountProduct', v,
                            `accountProduct: ${v}`
                        )}
                    />
                </Grid>    
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        id="location.HealthFacilityLevelPicker"
                        value={(filters['accountHealthFacilityLevel'] && filters['accountHealthFacilityLevel']['value'])}
                        onChange={(v, s) => onChangeFilter(
                            'accountHealthFacility', v,
                            `accountHealthFacility: ${v}`
                        )}
                    />
                </Grid>                              
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(BatchRunFilter))));