import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const summariseAndSuggestResponse = async (req, res) => {
  const { input } = req.body;
  if (!input || typeof input !== 'string') {
    return res.status(400).send({ error: 'Input is required and must be a string' });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { "role": 'user', "content": `Summarise this message: "${input}"` }
      ],
      max_tokens: 50,
    });
    const summary = completion.choices[0].message.content.trim();
    const responseCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { "role": 'user', "content": `Generate a helpful response to this message: "${input}"` }
      ],
      max_tokens: 100,
    });
    const suggestedResponse = responseCompletion.choices[0].message.content.trim();
    res.send({ summary, suggestedResponse });
  } catch (error) {
    console.log("Error with OpenAI API:", error);
    res.status(500).send({ error: 'Failed to generate summary or response using OpenAI'});
  }
};
app.post('/functions/summariseAndSuggestResponse', summariseAndSuggestResponse);

app.get('/functions/summariseAndSuggestResponse', (req, res) => {
  res.json({
    name: "summariseAndSuggestResponse",
    description: "Summarises a customer's message and suggests an appropriate response using OpenAI.",
    input: {
      type: "string",
      description: "The incoming message from a customer.",
      example: "I need help with my appointment on Friday."
    },
    output: {
      type: "object",
      description: "An object containing the summarised message and a suggested response.",
      example: {
        summary: "I need help with my appointment...",
        suggestedResponse: "It looks like you're asking about an appointment. Can I help you schedule or confirm one?"
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});

