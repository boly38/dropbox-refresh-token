// WARN: please read README.md
import dotenv from "dotenv";
import {dropbox_get_offline_long_term_access_token} from "./steps/dropboxStepsHelper.js";
// load .env
dotenv.config();

dropbox_get_offline_long_term_access_token().then((r) => {
});