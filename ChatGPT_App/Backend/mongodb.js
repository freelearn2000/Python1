const config = require('config');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const { Client } = require('pg');



// Create a new PostgreSQL client instance
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'xxxxxx',
  password: 'yyyyyy',
  port: 5432, // Default PostgreSQL port
});

const name = config.get('PERSISTENCE.name');
const table = config.get('PERSISTENCE.collection');

// Connect to Persistence Layer
const connection_string = process.env.PERSISTENCE_CONNECTION || 'mongodb://127.0.0.1:27017';
const dbClient = new MongoClient(connection_string);

class Logger {

  constructor() {
    this.logType = config.get('Logger_Type');
  }

  getLogger() {

    if (this.logType == 'Database') {
      return new Dblog();
    } else if (this.logType == 'File') {
      return new FileLog();
    } else if (this.logType == 'Postgres') {
      return new PostgresLog();
    } else
      return null;
  }

}

class Log {

  log() {

  }
}

class FileLog extends Log {

  log(message) {

    // file operations
    let Data = require("./info.json");
    const messages = { question: message, Time: new Date().toString() }
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
  async log(message) {

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


class PostgresLog extends Log {


  // logging requests to the persistence layer
  async log(message) {

    try {

      // Connect to the PostgreSQL database
      await client.connect();
      // Insert values into the table
      const insertQuery = 'INSERT INTO messages (questions, time) VALUES ($1, $2) RETURNING * ';
      const values = [ message, new Date()];

      const result = await client.query(insertQuery, values);
      console.log('Values inserted into the table');
      console.log(result.rows);
    }
    catch (e) {
      console.log("error\t" + e);
    }
    finally {

      // Close the connection
      await client.end();
      
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


async function PostgresLogAnalytics() {

  try {

    await client.connect();

    let result = await client.query('SELECT * FROM messages');
    
    return result.rows;

  }
  catch (e) {

    console.log(e);
  }
  finally {

    await client.end();
  }

}

module.exports = {
  FileLogAnalytics, dbLogAnalytics,PostgresLogAnalytics, Logger
};