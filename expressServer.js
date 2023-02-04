const express = require('express');
const mongodb = require('mongodb');
const cors = require("cors");
const propertiesReader = require("properties-reader");
const path = require('path');

let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);

let dbPprefix = properties.get("db.prefix");
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

const app = express();
app.use(cors());
const MongoClient = mongodb.MongoClient;

MongoClient.connect(uri, { useNewUrlParser: true, serverApi: mongodb.ServerApiVersion.v1  }, (err, client) => {
  if (err) throw err;
  const db = client.db(dbName);

  app.use(express.json());

  app.param('collectionName'
    , function(req, res, next, collectionName) {
      console.log("Got collectionName: " + collectionName + "");
      req.collection = db.collection(collectionName);
      return next();
  });







  app.get('/lessons', (req, res, next) => {
    console.log("Got lessons ");
    db.collection('products').find({}).toArray((err, result) => {
      if (err) return next(err);
      console.log("Got lessons results " + result)
      res.json(result);
    });
  });




  app.get('/users', (req, res) => {
    db.collection('users').find({}).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
        console.log(4);
    });
  });
});





app.listen(3000, () => {
  console.log('Server listening on port 3000');
});