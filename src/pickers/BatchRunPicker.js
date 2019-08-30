import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchBatchRunPicker } from "../actions";
import _debounce from "lodash/debounce";

class BatchRunPicker extends Component {

    componentDidUpdate(prevProps, prevState, snapshot) {        
        if (prevProps.scope !== this.props.scope) {
            this.props.fetchBatchRunPicker(this.props.modulesManager, this.props.scope);
        }
    }

    formatSuggestion = s => `${s.runDate}`;

    _onChange = v => this.props.onChange(
        v,
        this.formatSuggestion(v)
    )

    render() {
        const { name, scope, batchRuns, value } = this.props;
        return (
            <SelectInput
                disabled={!scope}
                module="claim_batch" label="BatchRun"
                options={[
                    ...batchRuns.map(v => ({
                        value: v,
                        label: this.formatSuggestion(v)
                    }))]}
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
