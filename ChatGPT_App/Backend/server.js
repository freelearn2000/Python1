const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
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

// app.post("/chat", async (req, res) => {
  
//   const apiKey = process.env.api_key;
//   const { prompt } = req.body;

//   const client = axios.create({
//     headers: {
//       Authorization: "Bearer " + apiKey,
//     },
//   });

//   const params = {
//     prompt: prompt,
//     model: "text-davinci-003"
//   };

//   client
//     .post("https://api.openai.com/v1/completions", params)
//     .then((result) => {
//       res.send(result.data.choices[0].text);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   })

// const port = process.env.PORT || 8080;
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
