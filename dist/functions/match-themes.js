import { getEmbedding, knex } from "../connector.js";
export const matchThemes = async (text) => {
    if (!text)
        throw new Error("Must provide input text");
    const embedding = await getEmbedding(text);
    const matches = await knex("categories")
        .select({
        id: "id",
        name: "name",
        distance: knex.raw("embedding <=> ?", [embedding]),
    })
        .whereRaw("embedding is not null")
        .whereRaw("(embedding <=> ?) < 0.8", [embedding])
        .orderBy("distance", "asc")
        .limit(5);
    console.table(matches);
};
