# dropbox-refresh-token

[![NPM](https://nodei.co/npm/dropbox-refresh-token.png?compact=true)](https://npmjs.org/package/dropbox-refresh-token)

## Quickstart

HowTo get Dropbox refresh-token and/or access-token (console interactive mode)

````bash
npm i -g dropbox-refresh-token@latest
get_refresh_token
# follow instructions
````
NB: `get_refresh_token` binary has some alias : `drt` and `dropbox_get_refresh_token`.

NB2: if you have cloned this project you could instead invoke this with `./bin/get_refresh_token.js`

## Context : about Dropbox tokens

Short context about Dropbox long-lived tokens (and offline mode access).

Dropbox didn't provide anymore (since On September 30th, 2021) long-live access token from dropbox portal ([src](https://dropbox.tech/developers/migrating-app-permissions-and-access-tokens#retiring-legacy-tokens)). This was the way to use token for offline applications.

Now, in order to access offline to dropbox services without having to login, 
you will need an offline **refresh-token**. 
And with this token you application is able to request a short-lived access token to call Dropbox API. 

Here are the steps:
1) to ask an **access-code for an "offline" token-access-type** 
   - this step require to login to allow application access.
2) get a (long-lived) **refresh-token** with this access-code.

Having this **refresh-token** in "offline" mode (without login requirement) you could then each time needed:

3) (day) ask (short-lived) access-token.
4) (day+1) ask (short-lived) access-token.
5) (day+2) ask (short-lived) access-token.
6) (...)

### About token time to live
- "short-lived" that apply to `access-code` and `access-token` means 14400 sec (4 hours) - this ttl is provided in dropbox response when asking for this code/token.
- "long-lived" that apply to `refresh-token` (seems to) means valid until revoked ([src](https://www.dropboxforum.com/t5/Dropbox-API-Support-Feedback/Refresh-token-expiration/m-p/455036/highlight/true#M23478)).


### references
- [developers dropbox oauth guide](https://developers.dropbox.com/fr-fr/oauth-guide)
- [dropbox tech / developers / migrating app permissions and access tokens](https://dropbox.tech/developers/migrating-app-permissions-and-access-tokens#retiring-legacy-tokens) - cf § `Implement refresh tokens`

## Project features
Feature for a given DropBox app (appKey, appSecret).
- (step 1) build login url to allow application access and then retrieve short-lived access code for an "offline" token-access-type (appKey only)
`getShortLivedAccessCodeUrlViaLoginUrl(appKey)`
- (step 2) provide method to call Dropbox API that ask (long-lived) refresh-token from this short-lived access code (accessCode, appKey, appSecret).
`getRefreshToken(shortLivedAccessCode, appKey, appSecret, logToken = false)`
- (step 3++) provide method to call Dropbox API that ask a fresh (short-lived) access token from a valid refresh-token (refreshToke, appKey, appSecret).
`refreshAccessToken(refresh_token, appKey, appSecret, logToken = false)`

## HowTo use "dropbox-refresh-token" library

- Setup this project as dependency
````bash
npm i dropbox-refresh-token
````

- Integration examples
````javascript
import {
    isSet, getShortLivedAccessCodeUrlViaLoginUrl, 
    getRefreshToken, refreshAccessToken
} from "dropbox-refresh-token";

import {
    isSet, getCurrentAccount, isAccessTokenValid
} from "dropbox-refresh-token";

````

### Another example - step-by-step to retrieve Dropbox RefreshToken

<!> original idea is [FranklinThaker/Dropbox-API-Uninterrupted-Access](https://github.com/FranklinThaker/Dropbox-API-Uninterrupted-Access) which provide (webApplication mode)

This workflow rely on environment variables and require project install
(cf. § quickstart for more modern workflow)

````bash
git clone https://github.com/boly38/dropbox-refresh-token.git
cd dropbox-refresh-token
npm install
# launch step by step to get refreshToken
node src/dropbox_refresh_token.js
# follow steps
#
# or to check if a token is valid
node src/dropbox_is_token_valid.js

````


### Contributions

![Repobeats](https://repobeats.axiom.co/api/embed/381c29252a790e5069c7a80418665d22f4dbfaab.svg "Repobeats analytics image")

<small>provided by [Repobeats](https://repobeats.axiom.co/)</small>


