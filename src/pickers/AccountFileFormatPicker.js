import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import {ACCOUNT_FILE_FORMATS} from "../constants";

class AccountFileFormatPicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="claim_batch"
            label="accountFileFormat"
            constants={ACCOUNT_FILE_FORMATS}
            {...this.props}
        />
    }
}

export default AccountFileFormatPicker;
