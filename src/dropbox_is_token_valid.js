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
    .then(async result=> {
        if (isSet(result)) {
            const {accessToken, info} = result
            console.log(`just received access token for ${info.email} account ${info.account_id}`);
            console.log(" * now re-use isAccessTokenValid with a valid token")
            await isAccessTokenValid(accessToken)
                .then(console.log).catch(console.error)
        }

    })
    .catch(console.error);