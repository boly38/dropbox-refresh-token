// WARN: please read README.md
import dotenv from "dotenv";

import {dropbox_get_access_token_and_show_current_account} from "./steps/dropboxStepsHelper.js";
import {isSet, isAccessTokenValid} from "./lib/index.js";
// load .env
dotenv.config();

console.log(" * negative example isAccessTokenValid")
await isAccessTokenValid("nimportk-NAWAK")
    .then(console.log).catch(console.error)

console.log(" * get AccessToken via refresh token");
await dropbox_get_access_token_and_show_current_account()
    .then(result => {
        const {accessToken, info} = result
        if (isSet(accessToken)) {
            console.log(`just received access token for ${info.email} account ${info.account_id}`);
            console.log(" * now re-use isAccessTokenValid with a valid token")
            isAccessTokenValid(accessToken)
                .then(console.log)
                .catch(err=>console.error(err.message))
        }

    })
    .catch(err=>console.error(err.message));