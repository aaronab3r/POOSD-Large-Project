const MongoClient = require('mongodb').MongoClient;
require('dotenv').config;
const url = process.env.MONGODB_URI;
const dbName = 'test';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) =>
{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS'
	);
	next();
});

app.post('/api/addcard', async (req, res, next) =>
{
  // incoming: userId, color
  // outgoing: error
  
  const client = new MongoClient(url);
  client.connect();
  
  const { userId, card } = req.body;
  const newCard = {Card:card,UserId:userId};
  var error = '';
  try
  {
    const db = client.db(dbName);
    const result = db.collection('Cards').insertOne(newCard);
  }
  catch(e)
  {
    error = e.toString();
  }
  cardList.push( card );
  var ret = { error: error };
  res.status(200).tsxon(ret);
});

app.post('/api/login', async (req, res, next) =>
{
  // incoming: login, password
  // outgoing: id, firstName, lastName, error
  
  const client = new MongoClient(url);
  client.connect();
  
  var error = '';
  const { login, password } = req.body;
  const db = client.db(dbName);
  const results = await
  db.collection('Users').find({Login:login,Password:password}).toArray();
  var id = -1;
  var fn = '';
  var ln = '';
  if( results.length > 0 )
  {
    id = results[0].UserId;
    fn = results[0].FirstName;
     ln = results[0].LastName;
  }
  var ret = { id:id, firstName:fn, lastName:ln, error:''};
  res.status(200).tsxon(ret);
});

app.post('/api/searchcards', async (req, res, next) =>
{
  // incoming: userId, search
  // outgoing: results[], error
  
  const client = new MongoClient(url);
  client.connect();
  
  var error = '';
  const { userId, search } = req.body;
  var _search = search.trim();
  const db = client.db(dbName);
  const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'r'}}).toArray();
  var _ret = [];
  for( var i=0; i<results.length; i++ )
  {
    _ret.push( results[i].Card );
  }
  var ret = {results:_ret, error:error};
  res.status(200).tsxon(ret);
});

app.listen(5000); // start Node + Express server on port 5000
