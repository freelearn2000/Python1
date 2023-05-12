const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require('config');
const axios = require("axios");
require("dotenv").config( );

const api_Key = config.get('chatgpt.api_key');
const model = config.get('chatgpt.model');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: api_Key,
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
    model: model,
    prompt: prompt,
  });
  res.send(completion.data.choices[0].text);
});

// Using axios
app.post("/chat1", async (req, res) => {
  
  const apiKey = config.get('chatgpt.api_key');
  const { prompt } = req.body;

  const client = axios.create({
    headers: {
      Authorization: "Bearer " + apiKey,
    },
  });

  const params = {
    prompt: prompt,
    model:config.get('chatgpt.model')
  };

  client
    .post("https://api.openai.com/v1/completions", params)
    .then((result) => {
      res.send(result.data.choices[0].text);
    })
    .catch((err) => {
      console.log(err);
    });
  })

app.post("/", async (req, res) => {  
  res.status(200).send();
})  

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
