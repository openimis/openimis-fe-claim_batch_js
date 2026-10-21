import React, { Component } from "react";
import { useTheme, styled } from "@mui/material/styles";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _ from "lodash";
import { Paper, Grid, Divider, IconButton } from "@mui/material";
import {
    GetIconComponent, formatMessage, formatMessageWithValues, FormattedMessage,
    PublishedComponent, coreConfirm, journalize
} from "@openimis/fe-core";
import { processBatch } from "../actions";
const SendIcon = GetIconComponent("Send")

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    '& .paperHeader': theme.paper?.header ?? {},
    '& .paperHeaderTitle': theme.paper?.title ?? {},
    '& .paperHeaderAction': theme.paper?.action ?? {},
    '& .form': {
        padding: 0
    },
    '& .item': {
        padding: theme.spacing(1)
    },
    '& .paperDivider': theme.paper?.divider ?? {},
}));

class BatchRunLauncher extends Component {

    state = {
        region: null,
        district: null,
        locationStr: null,
        year: null,
        month: null,
        monthStr: null,
    }

    launchBatchRun = e => {
        const values = {
            location: this.state.locationStr || formatMessage(this.props.intl, "claim_batch", "claim_batch.regions.country"),
            year: this.state.year,
            month: this.state.monthStr,
        };
        // state.core.confirmed launched a batch run on any other dialog's "Yes" (OP-3228).
        this.props.coreConfirm(
            formatMessage(this.props.intl, "claim_batch", "processBatch.confirm.title"),
            formatMessageWithValues(this.props.intl, "claim_batch", "processBatch.confirm.message", values),
            {
                onConfirm: () => this.props.processBatch(
                    this.state.district || this.state.region,
                    this.state.year,
                    this.state.month,
                    formatMessageWithValues(this.props.intl, "claim_batch", "processBatch.mutationLabel", values),
                ),
            },
        );
    }

    componentDidMount() {
        if (!!this.props.userHealthFacilityFullPath) {
            this.setState((state, props) => ({
                region: props.userHealthFacilityFullPath.location.parent,
                district: props.userHealthFacilityFullPath.location,
                locationStr: props.userHealthFacilityLocationStr,
            }))
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.userHealthFacilityFullPath, this.props.userHealthFacilityFullPath) &&
            !!this.props.userHealthFacilityFullPath
        ) {
            this.setState((state, props) => ({
                region: props.userHealthFacilityFullPath.location.parent,
                district: props.userHealthFacilityFullPath.location,
                locationStr: props.userHealthFacilityLocationStr,
            }))
        }
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
        }
    }

    canLaunch = () => !!this.state.year && !!this.state.month

    onChangeRegion = (v, s) => {
        this.setState({
            region: v,
            district: null,
            locationStr: s
        })
    }

    onChangeDistrict = (v, s) => {
        this.setState({
            region: !!v ? v.parent : null,
            district: v,
            locationStr: s
        });
    }

    render() {
        const { intl } = this.props;
        const min = new Date().getFullYear() - 7;
        const max = min + 9;
        return (
            <StyledPaper className="paper">
                <Grid container className="paperHeader">
                    <Grid size={11} className="paperHeaderTitle">
                        <FormattedMessage module="claim_batch" id="BatchRunLauncher.title" />
                    </Grid>
                    <Grid size={1}>
                        <Grid container justify="flex-end">
                            <Grid className="paperHeaderAction">
                                <IconButton disabled={!this.canLaunch()} onClick={this.launchBatchRun}>
                                    <SendIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid size={12}>
                        <Divider />
                    </Grid>
                    <Grid size={3} className="item">
                        <PublishedComponent
                            pubRef="location.RegionPicker"
                            value={this.state.region}
                            withNull={true}
                            nullLabel={formatMessage(intl, "claim_batch", "claim_batch.regions.country")}
                            onChange={this.onChangeRegion}
                        />
                    </Grid>
                    <Grid size={3} className="item">
                        <PublishedComponent
                            pubRef="location.DistrictPicker"
                            region={this.state.region}
                            value={this.state.district}
                            withNull={true}
                            onChange={this.onChangeDistrict}
                        />
                    </Grid>
                    <Grid size={3} className="item">
                        <PublishedComponent
                            pubRef="core.YearPicker"
                            module="claim_batch"
                            label="year"
                            min={min}
                            max={max}
                            withNull={false}
                            value={this.state.year}
                            required={true}
                            onChange={e => this.setState({ year: e })}
                        />
                    </Grid>
                    <Grid size={3} className="item">
                        <PublishedComponent
                            pubRef="core.MonthPicker"
                            module="claim_batch"
                            label="month"
                            value={this.state.month}
                            withNull={false}
                            required={true}
                            onChange={(v, s) => this.setState({ month: v, monthStr: s })}
                        />
                    </Grid>
                </Grid>
            </StyledPaper>
        )
    }
}

const mapStateToProps = state => ({
    userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
    userHealthFacilityLocationStr: !!state.loc ? state.loc.userHealthFacilityLocationStr : null,
    submittingMutation: state.claim_batch.submittingMutation,
    mutation: state.claim_batch.mutation,
});


const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { coreConfirm, processBatch, journalize },
        dispatch);
};

export { StyledPaper };
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(BatchRunLauncher));
