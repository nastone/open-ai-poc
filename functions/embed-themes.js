import { knex, openai } from "../connector.js";

export const embedThemes = async () => {
    let embedCount = 0;
    for await (const batch of walkThemes()) {
        console.log(`Embedding theme batch of size: ${batch.length}`);
        const embedded = await batchEmbedThemes(batch);
        await knex.transaction(async (trx) => {
            for (const { id, embedding } of embedded) {
                await trx("categories")
                    .update({ embedding: JSON.stringify(embedding) })
                    .where({ id });
            }
        });
        embedCount += embedded.length;
    }
    console.log(`Successfully saved embeddings for ${embedCount} themes`);
}

async function *walkThemes(batchSize = 10) {
    let lastId = 0;
    while (true) {
        const batch = await knex("categories")
            .select("*")
            .where('id', '>', lastId)
            .orderBy('id', 'asc')
            .limit(batchSize);
        if (batch.length === 0) break;
        yield batch;
        lastId = batch[batch.length-1].id;
    }
}

async function batchEmbedThemes(batch) {
    const embedded = [];
    for (const theme of batch) {
        const id = theme.id;
        const response = await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: `${theme.name}: ${theme.description}`,
        });
        const embedding = response.data[0].embedding;
        embedded.push({ id, embedding });
    }
    return embedded;
}
