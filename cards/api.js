require('express');
require('mongodb');
token = require('./createJWT.js');

exports.setApp = function ( app, client )
{
    app.post('/api/addcard', async (req, res, next) =>
        {
        // incoming: userId, color
        // outgoing: error
    
        const { userId, card, jwtToken } = req.body;
        // should include jwtToken

        try
        {
            if( token.isExpired(jwtToken) )
            {
                var r  = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(200).json(r)
                return;
            }
        }
        catch(e)
        {
            console.log(e.message);
            var r = {error:e.message, jwtToken: ''};
            res.status(200).json(r);
            return;
        }

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

        var refreshedToken = null;
        try
        {
            refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
            console.log(e.message);
        }
    
        var ret = { error:error, jwtToken:refreshedToken };

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

        var ret;
    
        if( results.length > 0 )
        {
            id = results[0].UserId;
            fn = results[0].FirstName;
            ln = results[0].LastName;

            try
            {
                const token = require('./createJWT.js');
                ret = token.createToken( fn, ln, id );
            }
            catch(e)
            {
                ret = {error:e.message}
            }
        }
        else
        {
            ret = {error:"Login/Password incorrect"};
        }

        res.status(200).json(ret);
        // We only return the JSON Web Token now, since all the stuff is already in there
            // you can put whatever you want into a JWT
    });
    
    app.post('/api/searchcards', async (req, res, next) =>
    {
        // incoming: userId, search
        // outgoing: results[], error
    
        var error = '';
    
        const { userId, search, jwtToken } = req.body;
        // should include jwtToken        

        // try
        // {
        //     if( token.isExpired(jwtToken) )
        //     {
        //         var r  = {error:'The JWT is no longer valid', jwtToken: ''};
        //         res.status(200).json(r)
        //         return;
        //     }
        // }
        // catch(e)
        // {
        //     console.log(e.message);
        //     var r = {error:e.message, jwtToken: ''};
        //     res.status(200).json(r);
        //     return;
        // }
    
        var _search = search.trim();
    
        const db = client.db('Test');
        const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}}).toArray();
    
        // Check if results is defined before using length
        var _ret = [];
        if (results && Array.isArray(results)) {
            for(var i=0; i<results.length; i++) {
                if (results[i] && results[i].Card) {
                    _ret.push(results[i].Card);
                }
            }
        }

        var refreshedToken = null;
        try
        {
            refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
            console.log(e.message);
        }
    
        var ret = {results:_ret, error:error, jwtToken:refreshedToken};
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
}