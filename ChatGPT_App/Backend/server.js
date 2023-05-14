const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require('config');
require("dotenv").config();
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const { MongoClient } = require('mongodb');


const dbConStr = process.env.MONGODB_CONNECTION;
const dbClient = new MongoClient(dbConStr);

const openai_api_Key = config.get('OPENAI_api_key');
const openai_model = config.get('OPENAI_model');
const openai_max_tokens = config.get('OPENAI_max_tokens');
const openai_temperature = config.get('OPENAI_temperature');

const configuration = new Configuration({
  apiKey: openai_api_Key,
});
const openai = new OpenAIApi(configuration);

// Set up the server
const app = express();
app.use(bodyParser.json());
app.use(cors())


app.get("/", async (req, res) => {
  res.status(200).send("SUCCESS");
})

// Set up the ChatGPT endpoint
app.post("/chat", async (req, res) => {

  // Get the prompt from the request
  const { prompt } = req.body;

  try {
    // Generate a response with ChatGPT
    const completion = await openai.createCompletion({
      model: openai_model,
      prompt: prompt,
      max_tokens: openai_max_tokens,
      temperature: openai_temperature,
      
    });
    res.send(completion.data.choices[0].text);
  }
  catch (e) {
    console.log(e);
  }
  LogToDatabase(prompt, res, dbClient);
});

// Using axios
app.post("/chat1", async (req, res) => {

  const { prompt } = req.body;

  const client = axios.create({
    headers: {
      Authorization: "Bearer " + openai_api_Key,
    },
  });

  const params = {
    prompt: prompt,
    model: openai_model,
    max_tokens: openai_max_tokens,
    temperature: openai_temperature,
  };

  client
    .post("https://api.openai.com/v1/completions", params)
    .then((result) => {
      res.send(result.data.choices[0].text);
    })
    .catch((err) => {
      console.log(err);
    });

  LogToDatabase(prompt, res, dbClient);
})


app.get("/logs", async (req, res) => {

  try {
    await dbClient.connect();
    console.log("successfully connected to NodeTraining Database...");
    let result = await dbClient.db("Project1").collection('ChatGPT').find().toArray();
    res.send(JSON.stringify(result));

  }
  catch (e) {
    console.log(e);
  }
  finally {
    console.log("Closing Db connection...");
    await dbClient.close();
  }
})

async function LogToDatabase(prompt, res, dbClient) {

  try {
    await dbClient.connect();
    console.log("successfully connected to NodeTraining Database...");
    await dbClient.db("Project1").collection('ChatGPT').insertOne({ Question: prompt, Time: new Date().toString() });
  }
  catch (e) {
    console.log(e);
  }
  finally {
    console.log("Closing Db connection...");
    await dbClient.close();
  }
}


// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
