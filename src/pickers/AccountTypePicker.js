import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { ACCOUNT_TYPES } from "../constants";

class AccountTypePicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="claim_batch"
            label="accountType"
            constants={ACCOUNT_TYPES}
            {...this.props}
        />
    }
}

export default AccountTypePicker;