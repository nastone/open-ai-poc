import { knex } from "../connector.js";
import { matchThemesWithSentiment } from "./match-themes-with-sentiment.js";

export const matchAllResponses = async () => {
    for await (const { id, text, embedding } of walkResponses()) {
        console.log(`Response ${id}: ${text}`);
        await matchThemesWithSentiment(JSON.parse(embedding));
    }
};

async function* walkResponses() {
    const responses = await knex('responses').select('id', 'text', 'embedding');
    for (const response of responses) {
        yield response;
    }
}
