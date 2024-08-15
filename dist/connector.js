import OpenAI from "openai";
import dotenv from "dotenv";
import Knex from "knex";
dotenv.config();
export const knex = Knex({
    client: "pg",
    connection: process.env.DATABASE_URL,
});
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function getEmbedding(text) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
    });
    return JSON.stringify(response.data[0].embedding);
}
