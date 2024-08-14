import { batchResponses } from "./functions/batch-responses.js";
import { uploadThemes } from "./functions/upload-themes.js";
import { knex } from "./connector.js";

const main = async () => {
    const cmd = process.argv[2];
    switch (cmd) {
        case "batchResponses":
            return await batchResponses();
        case "uploadThemes":
            return await uploadThemes();
        default:
            process.exitCode = 1;
            console.log("Unknown command:", cmd);
    }
};

const cleanup = async () => {
    await knex.destroy();
};

main().then(cleanup);
