import { knex, openai } from "../connector.js";
import { encoding_for_model } from "tiktoken";

function createEmbeddingBatches(objects, maxTokens = 8191 * 0.8) {
  const encoder = encoding_for_model("text-embedding-ada-002");

  const batches = [];
  let currentBatch = [];
  let currentBatchTokens = 0;

  for (const obj of objects) {
    const tokenCount = encoder.encode(obj.text).length;

    if (currentBatchTokens + tokenCount > maxTokens) {
      console.log(
        `Batch ${batches.length} created with an estimated token count of ${currentBatchTokens} `
      );
      // Start a new batch
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchTokens = 0;
    }

    currentBatch.push(obj);
    currentBatchTokens += tokenCount;
  }

  // Add the last batch if it's not empty
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  encoder.free();

  return batches;
}

export const embedResponses = async () => {
  const responses = await knex("responses").select("*");
  const batches = createEmbeddingBatches(responses);

  let processedBatchCount = 0;

  console.log(`Processing ${batches.length} batches.`);

  for (const batch of batches) {
    console.log(`Processing batch ${processedBatchCount + 1}.`);
    const input = batch.map((obj) => obj.text);
    const { usage, data: embeddings } = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input,
    });

    console.log(
      `Embeddings created for batch ${processedBatchCount + 1}, used ${
        usage.total_tokens
      } tokens.`
    );
    await Promise.all(
      batch.map((response, i) => {
        const { embedding } = embeddings[i];
        return knex("responses")
          .where({ id: response.id })
          .update({ embedding: JSON.stringify(embedding) });
      })
    );

    processedBatchCount++;

    console.log(`Batch ${processedBatchCount} complete`);
  }
};
