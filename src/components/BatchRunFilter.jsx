import React, { Component } from "react";
import { useTheme, styled } from "@mui/material/styles";

import { Grid } from "@mui/material";
import { withModulesManager, PublishedComponent, decodeId, formatMessage, GRID_RESPONSIVE_STANDARD, injectIntl } from "@openimis/fe-core";

const StyledGrid = styled(Grid)(({ theme }) => ({
    '& .dialogTitle': theme.dialog?.title ?? {},
    '& .dialogContent': theme.dialog?.content ?? {},
    '& .form': {
        padding: 0
    },
    '& .item': {
        padding: theme.spacing(1)
    },
    '& .paperDivider': theme.paper?.divider ?? {},
}));

class BatchRunFilter extends Component {

    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null
    }

    render() {
        const { intl, filters, onChangeRegion, onChangeDistrict, onChangeFilters } = this.props;
        const min = new Date().getFullYear() - 7;
        const max = min + 9;
        return (
            <StyledGrid container className="form">
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="claim_batch.AccountTypePicker"
                        name="accountType"
                        value={(filters['accountType'] && filters['accountType']['value'])}
                        onChange={(v, s) => onChangeFilters([{
                            id: 'accountType',
                            value: v,
                            filter: `accountType: ${v}`
                        }])}
                    />
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="core.YearPicker"
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
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="core.MonthPicker"
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
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item" />
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="location.RegionPicker"
                        value={(!!filters['accountRegion'] ? filters['accountRegion']['value'] : null)}
                        withNull={true}
                        nullLabel={formatMessage(intl, "claim_batch", "claim_batch.regions.country")}
                        onChange={onChangeRegion}
                    />
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="location.DistrictPicker"
                        value={(filters['accountDistrict'] && filters['accountDistrict']['value'])}
                        region={filters['accountRegion'] && filters['accountRegion']['value']}
                        withNull={true}
                        onChange={onChangeDistrict}
                    />
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="product.ProductPicker"
                        value={(filters['accountProduct'] && filters['accountProduct']['value'])}
                        onChange={(v, s) => onChangeFilters([{
                            id: 'accountProduct',
                            value: v,
                            filter: !!v ? `accountProduct: ${decodeId(v.id)}` : null
                        }])}
                    />
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="medical.CareTypePicker"
                        value={(filters['accountCareType'] && filters['accountCareType']['value'])}
                        onChange={(v, s) => onChangeFilters([{
                            id: 'accountCareType',
                            value: v,
                            filter: !!v ? `accountCareType: "${v}"` : null
                        }])}
                    />
                </StyledGrid>
            </StyledGrid>
        )
    }
}

export { StyledGrid };
export default withModulesManager(injectIntl(BatchRunFilter));