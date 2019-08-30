import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import BatchRunLauncher from "../components/BatchRunLauncher";
import BatchRunSearcher from "../components/BatchRunSearcher";
import AccountPreviewer from "../components/AccountPreviewer";

const styles = theme => ({
    section: {
        marginBottom: theme.spacing(1)
    }
});

class ClaimBatchPage extends Component {
    render() {
        const { classes } = this.props;
        return (
            <Fragment>
                <BatchRunLauncher className={classes.section}/>
                <BatchRunSearcher className={classes.section}/>
                <AccountPreviewer className={classes.section}/>
            </Fragment>
        )
    }
}

export default withTheme(withStyles(styles)(ClaimBatchPage));