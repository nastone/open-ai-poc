import { add } from "lodash";
import { getEmbedding, knex, openai } from "../connector.js";

const findEmbedding = async (textOrEmbedding: string | Array<number>) => {
    if (Array.isArray(textOrEmbedding)) {
        return JSON.stringify(textOrEmbedding);
    }
    const text = textOrEmbedding;
    if (/^\d+$/.test(text)) {
        const result = await knex('responses').select('text', 'embedding').where({ id: text });
        const embedding = result[0]?.embedding;
        if (!embedding) throw new Error('Response not found');
        console.log(`Response ${text}: ${result[0]?.text}`);
        return embedding;
    } else {
        return await getEmbedding(text);
    }
};

export const matchThemesWithSentimentHybrid = async (text: string) => {
    if (!text) throw new Error('missing input text');
    const embedding = await findEmbedding(text);

    const matches = await knex("categories")
        .select({
            id: "id",
            name: "name",
            distance: knex.raw("embedding <=> ?", [embedding]),
        })
        .whereRaw("embedding is not null")
        .whereRaw("(embedding <=> ?::vector) < 0.8", [embedding])
        .orderBy("distance", "asc")
        .limit(5);

    const themes = matches.map(m => m.name);

    const results = await labelThemesWithSentiment(text, themes);

    for (const span of results) {
        console.log(span);
    }
};

const labelThemesWithSentiment = async (text: string, themes: string[]) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        messages: [
            {
                role: 'system',
                content: `
                    Your job is to annotate the provided input from the user with spans that
                    label each of the following themes in order of priority: ${themes.join(', ')}.
                    For each span, provide the start and end character indices in the source text, the relevant theme,
                    and the sentiment of the text as it relates to the theme.
                    Respond only in JSON, and provide at least two labelled text spans.
                    Sentiment intensity should be a value between 0 and 1.
                    Label spans as broadly as possible while remaining relevant to the theme, and avoid overlap.
                `
            },
            { role: 'user', content: text }
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "theme_spans_with_sentiment",
                strict: true,
                schema: {
                    type: "object",
                    additionalProperties: false,
                    required: ['spans'],
                    properties: {
                        spans: {
                            type: "array",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    span_start: { type: "integer" },
                                    span_end: { type: "integer" },
                                    theme: { type: "string", enum: themes },
                                    sentiment: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] },
                                    sentiment_intensity: { type: "number" }
                                },
                                required: [
                                    'span_start',
                                    'span_end',
                                    'theme',
                                    'sentiment',
                                    'sentiment_intensity',
                                ]
                            }
                        },
                    }
                }
            }
        }
    });
    return response.choices.map(c => JSON.parse(c.message.content ?? '{}'));
};
