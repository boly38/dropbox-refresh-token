/**
 * interactive get refresh token
 */
import {getShortLivedAccessCodeUrlViaLoginUrl} from "./lib/index.js";
import {
    getFreshSLAccessTokenFromRefreshToken,
    getLongLivedRefreshTokenFromShortLivedAccessToken
} from "./steps/dropboxStepsHelper.js";
import inquirer from "inquirer";


const askValueFromPrompt = (name, message) => {
    return new Promise(resolve => {
        const questions = [{type: 'input', name, message}];
        inquirer.prompt(questions).then(answers => {
            resolve(answers[name]);
        });
    });
}

export const interactiveGetRefreshToken = async () => {
    console.log("\n ♥‿♥ Welcome to interactive get Dropbox refresh-token !");
    console.log("\n  ℹ️ you could leave at any time using CTRL+C. Source is on GitHub.\n");
    console.log("\n  ℹ️ Go to https://www.dropbox.com/developers/apps (CTRL+Clic+switch on your browser), and select your application.\n");
    const appKey = await askValueFromPrompt("dropboxAppKey", "Dropbox application key (appKey)");
    const appSecret = await askValueFromPrompt("dropboxAppSecret", "Dropbox application secret (appSecret - clic on 'show')");
    const urlLoginToUse = getShortLivedAccessCodeUrlViaLoginUrl(appKey);
    console.log(`ℹ️ Go to ${urlLoginToUse} to get a dropbox access code.`);
    const accessCode = await askValueFromPrompt("accessCode", `Dropbox access code`);
    getLongLivedRefreshTokenFromShortLivedAccessToken(accessCode, appKey, appSecret)
        .then(refreshToken => {
            console.log("\n  ℹ️ now you have refresh token, this value may be used by application to query access token to play with API. keep this secret safely.\n");
            console.log("\n  with this refresh token, we could continue to get short-lived access token.\n");
            askValueFromPrompt("continue",
                `Continue ? answer 'yes' to continue.`)
                .then(continueWithAccessToken => {
                    if ('yes' === continueWithAccessToken) {
                        getFreshSLAccessTokenFromRefreshToken(refreshToken, appKey, appSecret)
                            .then(() => {
                                console.log("\n  ℹ️ with this short-lived access token you could query dropbox API until expiration. Then re-use refresh token to get a new one");
                            })
                            .catch(err => {
                                console.error(err.message)
                            });
                    }
                })
        })
        .catch(err => {
            console.error(err.message)
        });
}
