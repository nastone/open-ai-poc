import { getEmbedding, knex } from "../connector.js";
export const matchThemesWithSentiment = async (text) => {
    if (!text)
        throw new Error('Must provide input text');
    const embedding = await getEmbedding(text);
    const results = await knex.with('distances', knex.select({
        category: 'categories.name',
        sentiment: 'sentiments.name',
        distance: knex.raw('(categories.embedding + sentiments.embedding) <=> ?', [embedding])
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
