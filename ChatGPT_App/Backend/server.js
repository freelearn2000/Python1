const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config( );


const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.api_key,
});
const openai = new OpenAIApi(configuration);

// Set up the server
const app = express();
app.use(bodyParser.json());
app.use(cors())

// Set up the ChatGPT endpoint
app.post("/chat", async (req, res) => {
  // Get the prompt from the request
  const { prompt } = req.body;

  // Generate a response with ChatGPT
  const completion = await openai.createCompletion({
    model: process.env.model,
    prompt: prompt,
  });
  res.send(completion.data.choices[0].text);
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// fetch("https://api.openai.com/v1/completions", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "Authorization": `Bearer ${apiKey}`
//   },
//   body: JSON.stringify({
//     prompt,
//     temperature,
//     max_tokens: maxTokens
//   })
// })
// .then(response => response.json())
// .then(data => {
//   console.log(data.choices[0].text);
// })
// .catch(error => console.error(error));