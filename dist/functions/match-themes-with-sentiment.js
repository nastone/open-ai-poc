import { getEmbedding, knex } from "../connector.js";
const findEmbedding = async (textOrEmbedding) => {
    if (Array.isArray(textOrEmbedding)) {
        return JSON.stringify(textOrEmbedding);
    }
    const text = textOrEmbedding;
    if (/^\d+$/.test(text)) {
        const result = await knex('responses').select('text', 'embedding').where({ id: text });
        const embedding = result[0]?.embedding;
        if (!embedding)
            throw new Error('Response not found');
        console.log(`Response ${text}: ${result[0]?.text}`);
        return embedding;
    }
    else {
        return await getEmbedding(text);
    }
};
export const matchThemesWithSentiment = async (textOrEmbedding) => {
    if (!textOrEmbedding)
        throw new Error('Must provide input text');
    const embedding = await findEmbedding(textOrEmbedding);
    const half = JSON.stringify(new Array(3072).fill(0.5));
    const results = await knex.with('distances', knex.select({
        category: 'categories.name',
        sentiment: 'sentiments.name',
        distance: knex.raw('(categories.embedding + sentiments.embedding) <=> ?::vector', [embedding])
    })
        .from('categories')
        .crossJoin(knex.raw('sentiments'))
        .orderBy('distance', 'asc'))
        .with('min_distances', knex.select({
        category: 'category',
        distance: knex.raw('MIN(distance)'),
    })
        .from('distances')
        .groupBy('category'))
        .select({
        category: 'min_distances.category',
        sentiment: 'distances.sentiment',
        distance: 'min_distances.distance',
    })
        .from('min_distances')
        .join('distances', 'min_distances.distance', 'distances.distance')
        .orderBy('distance', 'asc')
        .limit(5);
    console.table(results);
};
