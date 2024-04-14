// WARN: please read README.md
import {isSet, getShortLivedAccessCodeUrlViaLoginUrl, getRefreshToken, refreshAccessToken} from "../lib/index.js";
import {getCurrentAccount} from "../lib/dropboxApi.js";
export const pleaseSetupEnvWithAppVariables = () => {
    console.log(
        "Go to your dropbox app : https://www.dropbox.com/developers/apps/\n\n" +
        "then set as environment following variables : DROPBOX_APP_KEY, DROPBOX_APP_SECRET\n\n" +
        "Exemple:\n" +
        "\texport DROPBOX_APP_KEY=xxxyyyzzz\n" +
        "\texport DROPBOX_APP_SECRET=xxxyyyzzz"
    );
}
export const retrieveShortLiveAccessCode = appKey => {
    const urlLoginToUse = getShortLivedAccessCodeUrlViaLoginUrl(appKey);
    console.log(`In order to get a short-lived access code, go to ${urlLoginToUse}`);
    console.log(" - login and keep this code:\n");
    console.log("\texport DROPBOX_SHORT_LIVED_ACCESS_CODE=just_received_code\n");
    console.log(" - this code is used to request a long-lived refresh token\n");
}

export const getLongLivedRefreshTokenFromShortLivedAccessToken = async (shortLivedAccessCode, appKey, appSecret) => {
    console.log(" * get long lived refresh token from short lived access code");
    return await getRefreshToken(shortLivedAccessCode, appKey, appSecret, true)
        .catch(err => {
            if (err.message.includes("invalid_grant")) {
                console.log("please unset DROPBOX_SHORT_LIVED_ACCESS_CODE (or set DROPBOX_REFRESH_TOKEN you got in the past) and retry");
            }
        });
}

export const getFreshSLAccessTokenFromRefreshToken = async (refreshToken, appKey, appSecret) => {
    return new Promise(async (resolve, reject) => {
        if (!isSet(refreshToken)) {
            console.log("please unset DROPBOX_SHORT_LIVED_ACCESS_CODE to retry");
            resolve(null);
        }
        console.log(" - now we have DROPBOX_REFRESH_TOKEN (long lived), we could (offline) request a short-lived access token each time we need");
        await refreshAccessToken(refreshToken, appKey, appSecret, true)
            .then(resolve)
            .catch(error => {
                const {message} = error;
                console.log("getFreshSLAccessTokenFromRefreshToken error;", error.message)
                if (message.includes("refresh token is invalid or revoked")) {
                    console.log("please unset DROPBOX_REFRESH_TOKEN to retry");
                }
                resolve(null);
            });
    });
}

export const dropbox_get_offline_long_term_access_token = async () => {
    try {
        const {
            DROPBOX_APP_KEY,
            DROPBOX_APP_SECRET,
            DROPBOX_SHORT_LIVED_ACCESS_CODE,
        } = process.env;
        let {DROPBOX_REFRESH_TOKEN} = process.env;
        let refreshTokenWasSet = isSet(DROPBOX_REFRESH_TOKEN);
        if (!isSet(DROPBOX_APP_KEY) || !isSet(DROPBOX_APP_SECRET)) {
            pleaseSetupEnvWithAppVariables();
            return;
        }
        if (!isSet(DROPBOX_SHORT_LIVED_ACCESS_CODE) && !isSet(DROPBOX_REFRESH_TOKEN)) {
            retrieveShortLiveAccessCode(DROPBOX_APP_KEY);
            return;
        }
        if (!refreshTokenWasSet) {
            DROPBOX_REFRESH_TOKEN = await getLongLivedRefreshTokenFromShortLivedAccessToken(DROPBOX_SHORT_LIVED_ACCESS_CODE, DROPBOX_APP_KEY, DROPBOX_APP_SECRET);
        }
        if (isSet(DROPBOX_REFRESH_TOKEN)) {
            await getFreshSLAccessTokenFromRefreshToken(DROPBOX_REFRESH_TOKEN, DROPBOX_APP_KEY, DROPBOX_APP_SECRET);
            if (!refreshTokenWasSet) {
                console.log(
                    " - keep this REFRESH_TOKEN -- This to avoid re-ask refresh token with same shortLivedAccessCode that gives error 'code has already been used'\n" +
                    "\texport DROPBOX_REFRESH_TOKEN=value\n"
                );
            }
        }
    } catch (e) {
        console.error(e);
    }
}

export const dropbox_get_access_token_and_show_current_account = async () => {
    return new Promise(async (resolve, reject) => {
        const {
            DROPBOX_APP_KEY,
            DROPBOX_APP_SECRET,
            DROPBOX_REFRESH_TOKEN,
        } = process.env;
        if (!isSet(DROPBOX_APP_KEY) || !isSet(DROPBOX_APP_SECRET)) {
            pleaseSetupEnvWithAppVariables();
            return resolve({});
        }

        if (isSet(DROPBOX_REFRESH_TOKEN)) {
            const accessToken = await getFreshSLAccessTokenFromRefreshToken(DROPBOX_REFRESH_TOKEN, DROPBOX_APP_KEY, DROPBOX_APP_SECRET);
            if (isSet(accessToken)) {
                await getCurrentAccount(accessToken)
                    .then(info => {
                        console.log(`Info about access token:\n${JSON.stringify(info, null,2)}`)
                        return resolve({accessToken, info});
                    })
                    .catch(reject);
            }
        }
    });
}