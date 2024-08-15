import { openai } from "../connector.js";

export async function getResponseMetadata(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
        You are an expert text analyst specialized in extracting key information from survey responses. Your task is to analyze each given text and provide the following:
        1. The original text
        2. Key words: Extract the most relevant keywords or key phrases that capture the main topics or themes of the text. Prioritize nouns and noun phrases that represent the core concepts discussed, and avoid common words unless they are central to the text's theme
        3. Determine the overall sentiment of the text, categorizing it as one of the following:
            - positive: The text expresses predominantly favorable or optimistic views.
            - negative: The text expresses predominantly unfavorable or pessimistic views.
            - neutral: The text is balanced or doesn't express strong emotions either way.
            - mixed: The text contains a significant mix of both positive and negative sentiments.  
        4. Sentiment Intensity: Rate the intensity of the sentiment on a scale from 1 to 5, where:
            1 = Very weak sentiment
            2 = Weak sentiment
            3 = Moderate sentiment
            4 = Strong sentiment
            5 = Very strong sentiment
        `,
      },
      {
        role: "user",
        content: [{ text, type: "text" }],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "response_metadata",
        strict: true,
        schema: {
          additionalProperties: false,
          type: "object",
          properties: {
            original_text: { type: "string" },
            key_words: { type: "array", items: { type: "string" } },
            sentiment: {
              type: "string",
              enum: ["positive", "negative", "neutral", "mixed"],
            },
            sentiment_intensity: { type: "integer" },
          },
          required: [
            "original_text",
            "key_words",
            "sentiment",
            "sentiment_intensity",
          ],
        },
      },
    },
  });

  for (const choice of response.choices) {
    const content = JSON.parse(
      choice.message.content || "{}"
    ) as unknown as Record<string, unknown>;

    console.log("Key words:", content["key_words"]);
    console.log("Sentiment:", content["sentiment"]);
    console.log("Sentiment Intensity:", content["sentiment_intensity"]);
  }
}
