import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { useTheme, styled } from "@mui/material/styles";
import BatchRunLauncher from "../components/BatchRunLauncher";
import BatchRunSearcher from "../components/BatchRunSearcher";
import AccountPreviewer from "../components/AccountPreviewer";
import { formatMessage, Helmet, injectIntl } from "@openimis/fe-core";
import { RIGHT_PROCESS, RIGHT_FILTER, RIGHT_PREVIEW } from "../constants";

const StyledDiv = styled('div')(({ theme }) => ({
    '& .section': {
        marginBottom: theme.spacing(1)
    }
}));

class ClaimBatchPage extends Component {

    render() {
        const { rights } = this.props;
        if (!rights.filter(r => r >= RIGHT_PROCESS && r <= RIGHT_PREVIEW).length) return null;
        return (
            <StyledDiv>
                <Helmet title={formatMessage(this.props.intl, "claim_batch", "claimBatch.page.title")} />
                {rights.includes(RIGHT_PROCESS) &&
                    <BatchRunLauncher className="section" />
                }
                {rights.includes(RIGHT_FILTER) &&
                    <BatchRunSearcher className="section" />
                }
                {rights.includes(RIGHT_PREVIEW) &&
                    <AccountPreviewer className="section" />
                }
            </StyledDiv>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export { StyledDiv };
export default injectIntl(connect(mapStateToProps)(ClaimBatchPage));