import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { fetchBatchRunReadOnlyPicker } from "../actions";
import { formatMessage, AutoSuggestion, withModulesManager, decodeId } from "@openimis/fe-core";
import { batchRunLabel } from "../utils";
import _ from "lodash";

const styles = (theme) => ({
  textField: {
    width: "100%",
  },
});

class BatchRunReadOnlyPicker extends Component {
  state = {
    batchRuns: [],
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.value) {
        this.setState({ batchRuns: this.props.batchRuns});
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!_.isEqual(prevProps.batchRuns, this.props.batchRuns)) {
      this.setState({ batchRuns: this.props.batchRuns });
    } else if(prevProps.value.id != this.props.value.id ){ 
        this.props.fetchBatchRunReadOnlyPicker();
    }
  }

  getSuggestions = (str) =>
    !!str && this.props.fetchBatchRunReadOnlyPicker();

  debouncedGetSuggestion = _.debounce(
    this.getSuggestions,
    this.props.modulesManager.getConf("fe-claim_batch", "debounceTime", 400),
  );

  onSuggestionSelected = (v) => this.props.onChange(v, batchRunLabel(v));

  onClear = () => {
    this.setState({ batchRuns: [] }, (e) => this.onSuggestionSelected(null));
  };

  render() {
    const {
      intl,
      classes,
      value,
      reset,
      withLabel = true,
      label,
      readOnly = false,
      required = false,
      withNull = true,
      nullLabel = null,
    } = this.props;
    const { batchRuns } = this.state;

    return (
      <AutoSuggestion
        module="claim_batch"
        items={batchRuns}
        label={!!withLabel && (label || formatMessage(intl, "claim_batch", "BatchRunReadOnlyPicker"))}
        lookup={batchRunLabel}
        onClear={this.onClear}
        getSuggestions={this.debouncedGetSuggestion}
        renderSuggestion={(a) => <span>{batchRunLabel(a)}</span>}
        getSuggestionValue={batchRunLabel}
        onSuggestionSelected={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        selectThreshold={this.selectThreshold}
        withNull={withNull}
        nullLabel={nullLabel || formatMessage(intl, "claim_batch", "BatchRunReadOnlyPicker.emptyLabel")}
      />
    );
  }
}

const mapStateToProps = (state) => ({
    batchRuns: state.claim_batch.batchRunReadOnlyPicker.map(({ id: encodedId, runDate: runDate, ...other }) => ({
        id: parseInt(decodeId(encodedId)),
        runDate: runDate.slice(0,-3),  
        ...other,
    })) ,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchBatchRunReadOnlyPicker }, dispatch);
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(BatchRunReadOnlyPicker)))),
);
