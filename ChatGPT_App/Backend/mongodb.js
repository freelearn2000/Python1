const config = require('config');
const { MongoClient } = require('mongodb');


const psname = config.get('PERSISTENCE.dbname');
const pstable = config.get('PERSISTENCE.collection');

// Connect to Persistence Layer
const connection_string = process.env.PERSISTENCE_CONNECTION|| 'mongodb://127.0.0.1:27017';
const psClient = new MongoClient(connection_string);


class Logger {

    constructor ( persistenceClient ) {
        this.persClient = persistenceClient;
    }

    // logging requests to the persistence layer
    async log( prompt ) {

        try {
            await psClient.connect();
            
            await psClient.db(psname).collection(pstable).insertOne({ Question: prompt, Time: new Date().toString() });
            }
        catch (e) {
            console.log(e);
            }
        finally {
            
            await psClient.close();
            }
      }
      
}

const loggerClient = new Logger (psClient);


async function LogAnalytics() {

    try {
        await psClient.connect();
        
        let result = await psClient.db(psname).collection(pstable).find().toArray();
        return result;
    
      }
      catch (e) {
        console.log(e);
      }
      finally {
        
        await psClient.close();
      }

}


module.exports = {
    LogAnalytics,loggerClient,
 };







  
  