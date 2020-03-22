import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { SelectInput, withModulesManager, formatMessage } from "@openimis/fe-core";
import { fetchBatchRunPicker } from "../actions";
import { formatMessageWithValues } from "@openimis/fe-core/src/helpers/i18n";

class BatchRunPicker extends Component {

    constructor(props) {
        super(props)
        props.fetchBatchRunPicker(props.modulesManager, props.scopeRegion, props.scopeDistrict)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.scopeRegion !== this.props.scopeRegion ||
            prevProps.scopeDistrict !== this.props.scopeDistrict) {
            this.props.fetchBatchRunPicker(this.props.modulesManager, this.props.scopeRegion, this.props.scopeDistrict);
        }
    }

    formatSuggestion = s => `${!s ? this.props.noneLabel : s.runDate}`;

    _onChange = v => this.props.onChange(
        v,
        this.formatSuggestion(v)
    )

    locationStr = () => {
        if (!!this.props.scopeDistrict) return this.props.scopeDistrict.code;
        if (!!this.props.scopeRegion) return this.props.scopeRegion.code;
        return formatMessage(this.props.intl, "claim_batch", "regions.country")
    }

    render() {
        const { name, scopeRegion, scopeDistrict, batchRuns, value, withNull = false, nullLabel = null } = this.props;
        let options = [
            ...batchRuns.map(v => ({
                value: v,
                label: this.formatSuggestion(v)
            }))]
        if (withNull) {
            options.unshift({
                value: null,
                label: nullLabel || formatMessage(this.props.intl, "claim_batch", "BatchRunPicker.null")
            })
        }
        return (
            <SelectInput
                module="claim_batch"
                strLabel={formatMessageWithValues(this.props.intl, "claim_batch", "BatchRun", { location: this.locationStr() })}
                options={options}
                name={name}
                value={value}
                onChange={this._onChange}
            />
        );
    }
}

const mapStateToProps = state => ({
    batchRuns: state.claim_batch.batchRunPicker,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchBatchRunPicker }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    BatchRunPicker)));
