import axios from "axios";
import {useState} from 'react'
import React from "react";

const App = () => {

  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  

  const handleSubmit = (e) => {
    e.preventDefault()

  
    // Send a request to the server with the prompt
     axios
    .post("http://localhost:8080/chat", {prompt})
    .then((res) => {
      // Update the response state with the server's response
      setResponse(res.data)
    })
    .catch((err) => {
      console.error(err)
    })
  }

 
  return(
    <>
     <div>
      <h1>ChatGPT</h1>
      <form className="ui form" onSubmit={handleSubmit}>
        <input type='text' placeholder="Send a message..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className="ui button" type="submit">Send</button>
        <p>{response}</p>
      </form>
    </div>
    </>
   
  )
}

export default App