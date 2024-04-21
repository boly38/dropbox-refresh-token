import fetch from 'cross-fetch'
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
export const getCurrentAccount = access_token => {
    return new Promise((resolve, reject) => {
        fetch(`${DROPBOX_API_BASE_URL}/2/users/get_current_account`, {
            method: 'POST',
            headers: {
                "Authorization": bearerAccessToken(access_token)
            },
        })
            .then(response => {
                response.json()
                    .then(jsonResponse => {
                        debugShowResponse && console.log('get current account Response:', jsonResponse);
                        const {
                            account_id,
                            name,
                            email,
                            email_verified,
                            disabled,
                            country,
                            locale,
                            referral_link,
                            account_type,
                            error,
                            error_summary // negative case
                        } = jsonResponse;
                        if (isSet(error)) {
                            reject(new Error(`${error_summary}`));
                            return;
                        }
                        resolve({
                            account_id, name, email, email_verified, disabled, country, locale,
                            referral_link, account_type
                        });
                    })
                    .catch(error => {
                        const {message} = error;
                        debugShowResponse && console.error(`Error getting current account  message:${message}`);
                        reject(new Error(`Dropbox getting current account returns invalid json: ${message}`));
                    });

            })
            .catch(error => {
                debugShowResponse && console.error('Error getting current account:', error);
                reject(error);
            });

    });
}

/**
 * wrapper to check if a given access token is valid and get info, or else get error.
 * @param accessToken
 * @returns {Promise<unknown>}
 */
export const isAccessTokenValid = accessToken => {
    return new Promise((resolve, reject) => {
        getCurrentAccount(accessToken)
            .then(tokenInfo => {
                resolve({"isValid": true, tokenInfo});
            })
            .catch(error => reject({"isValid": false, "error": error.message}));
    });
}