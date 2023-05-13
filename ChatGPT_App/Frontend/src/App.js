import axios from "axios";
import {useState} from 'react'
import React from "react";
// import AppLogo from './app_logo.png'
// import CGLogo from './chat1_logo.png'
import './App.css'


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
      setPrompt('')
    })
    .catch((err) => {
      console.error(err)
    })
  }

 
  // return(
  //   <>
  //    <h6>ChatGPT</h6> 
  //     <div className="wrapper">
  //     <img src={AppLogo} alt="" className="app-logo"/>
  //     <form className="ui form" onSubmit={handleSubmit}>
  //       <img src={CGLogo} alt="" className="cg-logo"/>
  //       <input type='text' placeholder="Send a message..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
  //       <button className="ui button" type="submit">Send</button>
  //     </form>
  //     <p className="response-area">{response}</p>
  //   </div>
  //   </>
   
  // )


  return (
    <>   
      <div  >
          <h1>Enter your Query</h1> 
          <div className="ui icon input">    
              <input type="text" placeholder="Send a message..." style={{borderRadius: '100px'}} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <i className="paper plane link icon" onClick={handleSubmit}></i>
          </div>  
      </div>
      <p>{response}</p>
    </>    
  );
}

export default App