const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require('config');
require("dotenv").config();
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const {LogAnalytics,loggerClient} = require("./mongodb");

// Retreive all Config data
const openai_api_Key = config.get('OPENAI.api_key');
const openai_model = config.get('OPENAI.model');
const openai_max_tokens = config.get('OPENAI.max_tokens');
const openai_temperature = config.get('OPENAI.temperature');

// Creating OpenAIApi Object
const configuration = new Configuration({
  apiKey: openai_api_Key,
});
const openai = new OpenAIApi(configuration);

// Set up the server
const app = express();

// Adding Middilewares
app.use(bodyParser.json());
app.use(cors())


// Set up the ChatGPT endpoint

/* 
Body
  {
    "prompt": "< enter prompt value >"
  }
*/
app.post("/chat", async (req, res) => {

  // Get the prompt from the request
  const { prompt } = req.body;

  if ( prompt === "")
  {
    console.log("prompt is empty");
    res.status(400).send("Enter valid prompt value");
  }
  else 
  {
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
       console.log(e.message);
       console.log(e.response.data.error);
       res.status(400).send("Error");
    }

  }

  loggerClient.log(prompt);
  
});

// Using axios
app.post("/chat1", async (req, res) => {

  const { prompt } = req.body;

  if ( prompt === "")
  {
    console.log("prompt is empty");
    res.status(400).send("Enter valid prompt value");
  }
  else 
  {
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
       console.log(err.message);
       console.log(err.response.data.error);
       res.status(400).send("Error");
      });

  }

    loggerClient.log(prompt);
})


app.get("/logs", async (req, res) => {

  let info = await LogAnalytics();
  res.status(200).send(info);

})

app.get("/", async (req, res) => {
  res.status(200).send("SUCCESS");
})



// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
