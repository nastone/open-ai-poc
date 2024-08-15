import { getEmbedding, knex } from "../connector.js";

export const matchThemesWithSentiment = async (text: string) => {
  if (!text) throw new Error("Must provide input text");
  const embedding = await getEmbedding(text);
  const results = await knex
    .select({
      category: "categories.name",
      sentiment: "sentiments.name",
      distance: knex.raw(
        "(categories.embedding + sentiments.embedding) <=> ?",
        [embedding]
      ),
    })
    .from("categories")
    .crossJoin(knex.raw("sentiments"))
    .orderBy("distance", "asc")
    .limit(5);

  console.table(results);
};
