export const isSet = value => value !== undefined && value !== null && value !== "";

const DROPBOX_OAUTH2_TOKEN_API = 'https://api.dropbox.com/oauth2/token';

const debugShowToken = process.env.DROPBOX_TOKEN_SHOW_TOKEN === "true" || true;
const debugShowResponse = process.env.DROPBOX_TOKEN_SHOW_RESPONSE === "true";

/**
 * build "Basic (base64 user:password)" Authorization header value
 * @param appKey as username
 * @param appSecret as password
 * @returns {`Basic ${string}`} string
 */
const authorizationBasicAuth = (appKey, appSecret) => {
    const base64authorization = btoa(`${appKey}:${appSecret}`);
    return `Basic ${base64authorization}`;
}
/**
 * build oauth2 headers
 * @param appKey
 * @param appSecret
 * @returns {{Authorization: `Basic ${string}`, "Content-Type": string}}
 */
const oauth2Headers = (appKey, appSecret) => {
    return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authorizationBasicAuth(appKey, appSecret)
    }
};

/**
 * build login url to allow access of a given application : retrieving offline token access type
 * @param appKey
 * @returns {`https://www.dropbox.com/oauth2/authorize?client_id=${string}&response_type=code&token_access_type=offline`}
 */
export const getShortLivedAccessCodeUrlViaLoginUrl = appKey => {
    return `https://www.dropbox.com/oauth2/authorize?client_id=${appKey}&response_type=code&token_access_type=offline`;
}

/**
 * get long-lived refresh-token from offline access code
 * @param shortLivedAccessCode
 * @param appKey
 * @param appSecret
 * @returns {Promise<unknown>}
 */
export const getRefreshToken = async (shortLivedAccessCode, appKey, appSecret) => {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(DROPBOX_OAUTH2_TOKEN_API, {
            method: 'POST',
            headers: oauth2Headers(appKey, appSecret),
            body: new URLSearchParams({
                code: shortLivedAccessCode,
                grant_type: 'authorization_code',
            }).toString(),
        }).catch(error => {
            console.error('Error getting refresh token:', error);
            reject(error);
        });
        if (!isSet(response)) {
            return;
        }
        let jsonResponse = await response.json();
        debugShowResponse && console.log('Refresh Token Response:', jsonResponse);
        const {error, error_description, refresh_token} = jsonResponse;
        if (isSet(error)) {
            /*
             Example: 'invalid_client: Invalid client_id or client_secret'
             */
            debugShowResponse && console.error("error", error, error_description);
            reject(new Error(`${error} - ${error_description}`));
            return;
        }
        debugShowToken && console.log('🚀 ~ getRefreshToken ~ REFRESH_TOKEN (longLived):', refresh_token);
        resolve(refresh_token);
    });
}
/**
 * get a fresh short-lived access token from a refresh-token
 * @param refresh_token
 * @param appKey
 * @param appSecret
 * @returns {Promise<unknown>}
 */
export const refreshAccessToken = async (refresh_token, appKey, appSecret) => {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(DROPBOX_OAUTH2_TOKEN_API, {
            method: 'POST',
            headers: oauth2Headers(appKey, appSecret),
            body: new URLSearchParams({
                refresh_token,
                grant_type: 'refresh_token',
            }).toString(),
        }).catch(error => {
            debugShowResponse && console.error('Error getting refresh token:', error);
            reject(error);
        });
        if (!isSet(response)) {
            return;
        }
        let jsonResponse = await response.json();
        debugShowResponse && console.log('Refresh Access Token Response:', jsonResponse);
        const {error, error_description, access_token} = jsonResponse;
        if (isSet(error)) {
            reject(new Error(`${error} : ${error_description}`));
            return;
        }
        debugShowToken && console.log('🚀 ~ refreshAccessToken ~ AccessToken (shortLived):', access_token);
        resolve(access_token);
    });
}