import { knex } from "../connector.js";

export const uploadThemes = async () => {
    console.log("uploading themes...");
    const results = await knex("categories").select("*");
    console.log(results);
}
