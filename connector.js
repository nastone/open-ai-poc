import OpenAI from "openai";
import dotenv from "dotenv";
import Knex from "knex";

dotenv.config();

export const knex = Knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

export const openai = new OpenAI(process.env.OPENAI_API_KEY);
