const config = require('config');
const fs = require('fs');
const { MongoClient } = require('mongodb');



const name = config.get('PERSISTENCE.name');
const table = config.get('PERSISTENCE.collection');

// Connect to Persistence Layer
const connection_string = process.env.PERSISTENCE_CONNECTION || 'mongodb://127.0.0.1:27017';
const dbClient = new MongoClient(connection_string);

class Logger {
  constructor( ) {
    this.logType = config.get('Logger_Type');
  }

  getLogger() {

    if (this.logType == 'Database') {
      return new Dblog( );
    } else if (this.logType == 'File') {
      return new FileLog( );
    } else
      return null;
  }

}

class Log {

  log() {

  }
}

class FileLog extends Log {

  log( message ) {

    // file operations
    let Data = require("./info.json");
    const messages = { question: message,  Time: new Date().toString() }
    Data.push(messages);

    fs.writeFileSync("./info.json", JSON.stringify(Data), (err) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully\n");
      }
    });
  }
}

class Dblog extends Log {

  
  // logging requests to the persistence layer
  async log( message ) {

    try {
      await dbClient.connect();

      await dbClient.db(name).collection(table).insertOne({ Question: message, Time: new Date().toString() });
    }
    catch (e) {
      console.log(e);
    }
    finally {

      await dbClient.close();
    }
  }

}

function FileLogAnalytics() {

  let Data = require("./info.json");
  return Data;

}

async function dbLogAnalytics() {

  try {
    await dbClient.connect();

    let result = await dbClient.db(name).collection(table).find().toArray();
    return result;

  }
  catch (e) {
    console.log(e);
  }
  finally {

    await dbClient.close();
  }

}


module.exports = {
  FileLogAnalytics, dbLogAnalytics, Logger
};