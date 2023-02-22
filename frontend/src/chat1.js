
//Functional Components
const Chat = ( ) =>{

    
    return (
        <div style={{ height: '5%', marginBottom: '30px' }}>
            <h1>Chat Component</h1>
        <form >
          <input
            type="text"
            placeholder="Enter your message..."
          />
         <input  type="submit" value="Send"></input>
        </form>
      </div>
    );
}

// const page = (
//     <> 
//    <Chat/> 
//     </>

// )

ReactDOM.render(<Chat/>, document.getElementById("root") );

// const root = ReactDOM.createRoot(
//     document.getElementById("root")
//   );
  
//   root.render(<Chat/>); 

