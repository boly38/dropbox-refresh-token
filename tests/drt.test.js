import console from "node:console";
import {getRefreshToken, getShortLivedAccessCodeUrlViaLoginUrl, refreshAccessToken} from "../src/lib/index.js";
import {getCurrentAccount} from "../src/lib/dropboxApi.js";
import {describe, it} from "mocha";
import {expect} from "chai";


describe("DropboxRefreshToken", () => {
    it("should getShortLivedAccessCodeUrlViaLoginUrl", () => {
        const appKey = "fake123fake";
        const result = getShortLivedAccessCodeUrlViaLoginUrl(appKey);
        expect(result).to.be.eql(`https://www.dropbox.com/oauth2/authorize?client_id=${appKey}&response_type=code&token_access_type=offline`,
            `unexpected result: ${result}`);
    });

    it("should not get refresh token with bad accessCode/key/secret", done => {
        const shortLivedAccessCode = "fake";
        const appKey = "fake";
        const appSecret = "fake";
        const logToken = true;
        getRefreshToken(shortLivedAccessCode, appKey, appSecret, logToken)
            .then(result => {
                expect.fail(result)
            })
            .catch(error => expectInvalidClientOrTimeoutErrorCase(error, done));
    });

    it("should not refresh access token with bad refreshToken/key/secret", done => {
        const refresh_token = "fake";
        const appKey = "fake";
        const appSecret = "fake";
        const logToken = true;
        refreshAccessToken(refresh_token, appKey, appSecret, logToken)
            .then(result => {
                expect.fail(result)
            })
            .catch(error => expectInvalidClientOrTimeoutErrorCase(error, done));
    });

    it("should not get current account with bad access_token", done => {
        const access_token = "fake";
        getCurrentAccount(access_token)
            .then(result => {
                expect.fail(result)
            })
            .catch(error => expectInvalidAccessTokenOrTimeoutErrorCase(error, done));
    });

})

//~ private
function isDropboxTimeoutCase(error) {
    return error.message.includes("connect ETIMEDOUT");
}

function isDropboxInvalidClientCase(error) {
    return error.message.includes("invalid_client");
}

function isDropboxInvalidAccessTokenCase(error) {
    return error.message.includes("invalid_access_token");
}

function expectInvalidClientOrTimeoutErrorCase(error, done) {
    let wasTimeout = isDropboxTimeoutCase(error);
    let wasInvalidClient = isDropboxInvalidClientCase(error);
    let wasExpected = wasInvalidClient || wasTimeout;
    wasTimeout && console.log("ℹ️ timeout case"); // one log to understand test unexpected duration
    expect(wasExpected, `unexpected error message content: ${error.message}`).to.be.true;
    done();
}

function expectInvalidAccessTokenOrTimeoutErrorCase(error, done) {
    let wasTimeout = isDropboxTimeoutCase(error);
    let wasInvalidClient = isDropboxInvalidAccessTokenCase(error);
    let wasExpected = wasInvalidClient || wasTimeout;
    wasTimeout && console.log("ℹ️ timeout case"); // one log to understand test unexpected duration
    expect(wasExpected, `unexpected error message content: ${error.message}`).to.be.true;
    done();
}
