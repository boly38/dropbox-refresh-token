const debugShowResponse = process.env.DROPBOX_TOKEN_SHOW_RESPONSE === "true";

export const reportDropboxFetchError = (reject, error, action) => {
    if (error.cause !== undefined) {
        const {cause} = error;
        const {message, code, name} = cause;
        debugShowResponse && console.error(`Error ${action} code:${code} name:${name} message:${message}`);
        reject(new Error(message));
    } else {
        debugShowResponse && console.error(`Error ${action} message:${error.message}`);
        reject(error);
    }
}