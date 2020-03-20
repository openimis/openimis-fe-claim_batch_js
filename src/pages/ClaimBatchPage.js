import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import BatchRunLauncher from "../components/BatchRunLauncher";
import BatchRunSearcher from "../components/BatchRunSearcher";
import AccountPreviewer from "../components/AccountPreviewer";
import { formatMessage } from "@openimis/fe-core";
import { RIGHT_PROCESS, RIGHT_FILTER, RIGHT_PREVIEW } from "../constants";

const styles = theme => ({
    section: {
        marginBottom: theme.spacing(1)
    }
});

class ClaimBatchPage extends Component {

    componentDidMount() {
        document.title = formatMessage(this.props.intl, "claim_batch", "claimBatch.page.title")
    }

    render() {
        const { rights, classes } = this.props;
        if (!rights.filter(r => r >= RIGHT_PROCESS && r <= RIGHT_PREVIEW).length) return null;
        return (
            <Fragment>
                {rights.includes(RIGHT_PROCESS) &&
                    <BatchRunLauncher className={classes.section} />
                }
                {rights.includes(RIGHT_FILTER) &&
                    <BatchRunSearcher className={classes.section} />
                }
                {rights.includes(RIGHT_PREVIEW) &&
                    <AccountPreviewer className={classes.section} />
                }
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(ClaimBatchPage))));