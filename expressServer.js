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

  // Logging Middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    next();
  });

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

  app.get('/orders', (req, res, next) => {
    console.log("Got orders ");
    db.collection('orders').find({}).toArray((err, result) => {
      if (err) return next(err);
      console.log("Got orders results " + result)
      res.json(result);
    });
  });
/* PUT method to remove availability from the item received on the URL; removing the availability received in the "body" */
/*app.put('/lessons/:id', (req, res, next) => {
  console.log("Got lessons ");
  db.collection('products').updateOne(
    { _id: mongodb.ObjectId(req.params.id) },
    { $inc: { availability: -req.body.availability } },
    (err, result) => {
      if (err) return next(err);
      console.log("Got lessons results " + result)
      res.json(result);
    }
  );
});*/
  app.put('/lessons/:id', (req, res) => {
    const id = req.params.id;
    const updatedAvailability = req.body.availability;
    db.collection('products').updateOne(
      {_id: new mongodb.ObjectID(id) },
      { $inc: { availability: -updatedAvailability } },
      (err, result) => {
        if (err) throw err;
        res.status(200).json({ message: "Lesson availability updated successfully" });
      }
    );
  });


/* POST listener to create an order on MongoDB - Needs to update each item's availability */
  app.post('/orders', (req, res) => {
    const order = req.body;
    db.collection('orders').insertOne(order, (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: "Order created successfully" });
    });
  });


  app.get('/lessons/search/:query/:limit', (req, res) => {
    const query = req.params.query;
    const limit = parseInt(req.params.limit);
    db.collection('lessons').find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .toArray((err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log('Server listening on port: ' + port)
  })
})
