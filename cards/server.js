const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
client.connect();

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

app.listen(5000); // start Node + Express server on port 5000

app.post('/api/addcard', async (req, res, next) =>
    {
    // incoming: userId, color
    // outgoing: error

    const { userId, card } = req.body;

    const newCard = {Card:card,UserId:userId};
    var error = '';

    try
    {
        const db = client.db('Test');
        const result = db.collection('Cards').insertOne(newCard);
    }
    catch(e)
    {
        error = e.toString();
    }

    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/login', async (req, res, next) =>
    {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error

    var error = '';

    const { login, password } = req.body;
    const db = client.db('Test');
    const results = await db.collection('Users').find({Login:login,Password:password}).toArray();

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
    res.status(200).json(ret);
});

app.post('/api/searchcards', async (req, res, next) =>
{
    // incoming: userId, search
    // outgoing: results[], error

    var error = '';

    const { userId, search } = req.body;

    var _search = search.trim();

    const db = client.db('Test');
    const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}}).toArray();

    var _ret = [];
    for( var i=0; i<results.length; i++ )
    {
    _ret.push( results[i].Card );
    }

    var ret = {results:_ret, error:error};
    res.status(200).json(ret);
});

app.post('/api/register', async (req, res) => {
    // incoming: firstName, lastName, login, password
    // outgoing: id, error
  
    const { firstName, lastName, login, password } = req.body;
  
    // Validate input
    if (!firstName || !lastName || !login || !password) {
      const error = 'All fields are required';
      return res.status(400).json({ id: -1, error });
    }
  
    try {
      // Check if user already exists
      const db = client.db('Test');
      const userExists = await db.collection('Users').findOne({ Login: login });
  
      if (userExists) {
        console.log("User already exists");
        return res.status(409).json({ id: -1, error: 'User already exists' });
      }
  
      const userId = Math.floor(Math.random() * 10000000); // Better user ID generation
  
      const newUser = {
        FirstName: firstName,
        LastName: lastName,
        UserId: userId,
        Login: login,
        Password: password, // You should hash this password in production
      };
  
      const result = await db.collection('Users').insertOne(newUser);
      console.log('User saved to database with ID:', userId);
  
      res.status(200).json({ id: userId, error: '' });
    } catch (e) {
      console.error('Registration error:', e);
      res.status(500).json({ id: -1, error: e.toString() });
    }
  });
