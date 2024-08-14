import OpenAI from "openai";
import dotenv from "dotenv";
import Knex from "knex";

dotenv.config();

const knex = Knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

const client = new OpenAI(process.env.OPENAI_API_KEY);

const main = async () => {
    const responses = await knex('responses').select('*');
    console.log(responses);
};

const cleanup = async () => {
    await knex.destroy();
};

main().then(cleanup);
