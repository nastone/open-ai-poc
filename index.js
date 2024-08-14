import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI(process.env.OPENAI_API_KEY);
