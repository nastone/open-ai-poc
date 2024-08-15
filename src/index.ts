import { embedResponses } from "./functions/embed-responses.js";
import { embedThemes } from "./functions/embed-themes.js";
import { matchThemes } from "./functions/match-themes.js";
import { matchThemesWithSentiment } from "./functions/match-themes-with-sentiment.js";
import { knex } from "./connector.js";
import { getResponseMetadata } from "./functions/get-response-metadata.js";

const main = async () => {
  const cmd = process.argv[2];
  switch (cmd) {
    case "embedResponses":
      return await embedResponses();
    case "embedThemes":
      return await embedThemes();
    case "matchThemes":
      return await matchThemes(process.argv[3]);
    case "matchThemesWithSentiment":
      return await matchThemesWithSentiment(process.argv[3]);
    case "getResponseMetadata":
      return await getResponseMetadata(process.argv[3]);
    default:
      process.exitCode = 1;
      console.log("Unknown command:", cmd);
  }
};

const cleanup = async () => {
  await knex.destroy();
};

main().then(cleanup);
