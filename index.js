import { batchResponses } from "./functions/batch-responses.js";
import { embedThemes } from "./functions/embed-themes.js";
import { knex } from "./connector.js";

const main = async () => {
    const cmd = process.argv[2];
    switch (cmd) {
        case "batchResponses":
            return await batchResponses();
        case "embedThemes":
            return await embedThemes();
        default:
            process.exitCode = 1;
            console.log("Unknown command:", cmd);
    }
};

const cleanup = async () => {
    await knex.destroy();
};

main().then(cleanup);
