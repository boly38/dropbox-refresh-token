import {isSet} from "./dropboxRefreshToken.js";

const DROPBOX_API_BASE_URL = 'https://api.dropboxapi.com';

const debugShowResponse = process.env.DROPBOX_API_SHOW_RESPONSE === "true";
const bearerAccessToken = accessToken => {
    return `Bearer ${accessToken}`;
};
/**
 * dropbox api `/2/users/get_current_account` wrapper
 * get access token information (when valid)
 * @param access_token
 * @returns {Promise<unknown>}
 */
export const getCurrentAccount = async access_token => {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(`${DROPBOX_API_BASE_URL}/2/users/get_current_account`, {
            method: 'POST',
            headers: {
                "Authorization": bearerAccessToken(access_token)
            },
        }).catch(error => {
            debugShowResponse && console.error('Error getting current account:', error);
            reject(error);
        });
        if (!isSet(response)) {
            return;
        }
        let jsonResponse = await response.json();
        debugShowResponse && console.log('get current account Response:', jsonResponse);
        const {
            account_id, name, email, email_verified, disabled, country, locale, referral_link, account_type,
            error, error_summary // negative case
        } = jsonResponse;
        if (isSet(error)) {
            reject(new Error(`${error_summary}`));
            return;
        }
        resolve({
            account_id, name, email, email_verified, disabled, country, locale,
            referral_link, account_type
        });
    });
}

/**
 * wrapper to check if a given access token is valid and get info, or else get error.
 * @param accessToken
 * @returns {Promise<unknown>}
 */
export const isAccessTokenValid = accessToken => {
    return new Promise(async (resolve, reject) => {
        let isValid = false;
        const tokenInfo = await getCurrentAccount(accessToken)
            .catch(error => reject({isValid, "error": error.message}));
        if (isSet(tokenInfo)) {
            isValid = true;
            resolve({isValid, tokenInfo});
        }
    });
}