import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { fetchBatchRunWithLocationPicker } from "../actions";
import { formatMessage, AutoSuggestion, withModulesManager, decodeId } from "@openimis/fe-core";
import { getBatchRunLabel } from "../utils";
import _ from "lodash";


class BatchRunWithLocationPicker extends Component {
  
  state = {
    batchRuns: [],
  };

  componentDidMount() {
    this.setState({ batchRuns: this.props.batchRuns});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!_.isEqual(prevProps.batchRuns, this.props.batchRuns)) {
      this.setState({ batchRuns: this.props.batchRuns });
    }
    else if (prevProps.value.id !== this.props.value.id){ 
        this.props.fetchBatchRunWithLocationPicker();
    }
  }

  getSuggestions = (str) =>
    !!str && this.props.fetchBatchRunWithLocationPicker();

  debouncedGetSuggestion = _.debounce(
    this.getSuggestions,
    this.props.modulesManager.getConf("fe-claim_batch", "debounceTime", 400),
  );

  onSuggestionSelected = (v) => this.props.onChange(v, getBatchRunLabel(v));

  onClear = () => {
    this.setState({ batchRuns: [] }, () => this.onSuggestionSelected(null));
  };

  render() {
    const {
      intl,
      value,
      reset,
      withLabel = true,
      label,
      readOnly = true,
      required = false,
      withNull = true,
      nullLabel = null,
    } = this.props;
    const { batchRuns } = this.state;

    return (
      <AutoSuggestion
        module="claim_batch"
        items={batchRuns}
        label={withLabel && (label || formatMessage(intl, "claim_batch", "BatchRunWithLocationPicker"))}
        lookup={getBatchRunLabel}
        onClear={this.onClear}
        getSuggestions={this.debouncedGetSuggestion}
        renderSuggestion={(a) => <span>{getBatchRunLabel(a)}</span>}
        getSuggestionValue={getBatchRunLabel}
        onSuggestionSelected={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        selectThreshold={this.selectThreshold}
        withNull={withNull}
        nullLabel={nullLabel || formatMessage(intl, "claim_batch", "BatchRunWithLocationPicker.emptyLabel")}
      />
    );
  }
}

const FIRST_CHARACTER_INDEX = 1;
const THIRD_FROM_THE_END_CHARACTER_INDEX = -3;

const mapStateToProps = (state) => ({
    batchRuns: state.claim_batch.batchRunWithLocationPicker.map(({ id: encodedId, runDate: runDate, ...other }) => ({
        id: parseInt(decodeId(encodedId)),
        runDate: runDate.slice(FIRST_CHARACTER_INDEX, THIRD_FROM_THE_END_CHARACTER_INDEX),  
        ...other,
    })),
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchBatchRunWithLocationPicker }, dispatch);
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl((BatchRunWithLocationPicker))),
);
