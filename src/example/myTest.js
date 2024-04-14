import {getCurrentAccount, isAccessTokenValid, isSet} from "../lib/index.js";

let {MY_TOKEN} = process.env;

if (!isSet(MY_TOKEN)) {
    console.log("please set MY_TOKEN env");
    process.exit(1);
}

console.log("\n\n * example isAccessTokenValid")
await isAccessTokenValid(MY_TOKEN)
    .then(console.log).catch(console.error)

console.log("\n\n * example getCurrentAccount")
await getCurrentAccount(MY_TOKEN)
    .then(info => {
        console.log(`Info about access token:\n${JSON.stringify(info, null,2)}`)
    })
    .catch(err => console.error(err.message))