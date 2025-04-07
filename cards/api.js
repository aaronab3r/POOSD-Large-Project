require('express');
require('mongodb');
token = require('./createJWT.js');

exports.setApp = function ( app, client )
{   
    // Login user
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
    
    // Register new user
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

    // variables used in the next api endpoints
    const multer = require('multer');
    const { GridFsStorage } = require('multer-gridfs-storage');
    const { MongoClient } = require('mongodb');
    const GridFSBucket = require('mongodb').GridFSBucket;

    // Configure GridFS storage
    const storage = new GridFsStorage({
    url: 'your_mongodb_connection_string',

    file: (req, file) => {

        return {
        bucketName: 'images', // Collection name for images

        filename: `${Date.now()}-${file.originalname}` // Unique filename

        };
    }
    });

    const upload = multer({ storage });

    // Upload new card
    app.post('/api/cards', upload.single('image'), async (req, res) => {
        // incoming: userId, tags, date, location, plus file in 'image' field
        // outgoing: cardId, error

        const { userId, tags, date, location } = req.body;
        const imageFile = req.file; // This contains the GridFS file info

        // Validate required input
        if (!userId || !tags || !date || !location) {
            // If a file was uploaded but other fields are invalid, clean it up
            if (imageFile) {
            const bucket = new GridFSBucket(db, { bucketName: 'images' });
            await bucket.delete(imageFile.id);
            }
            return res.status(400).json({ cardId: -1, error: 'userId is required' });
        }

        try {
            // Check if user exists
            const userExists = await db.collection('Users').findOne({ UserID: parseInt(userId) });

            if (!userExists) {
            // Clean up uploaded file if user doesn't exist
            if (imageFile) {
                const bucket = new GridFSBucket(db, { bucketName: 'images' });
                await bucket.delete(imageFile.id);
            }
            return res.status(404).json({ cardId: -1, error: 'User not found' });
            }

            const cardId = Math.floor(Math.random() * 10000000);

            const newCard = {
            CardID: cardId,
            UserID: parseInt(userId),
            Tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Assuming tags come as comma-separated string
            // ^ this line was giving errors
            Location: location,
            Date: date,
            ImageId: imageFile ? imageFile.id : null, // Store GridFS file ID
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
            Likes: 0,
            Comments: []
            };

            await db.collection('Cards').insertOne(newCard);
            console.log('Card saved with ID:', cardId);

            res.status(200).json({ 
            cardId, 
            error: '',
            imageId: imageFile ? imageFile.id : null
            });
        } catch (e) {
            console.error('Card creation error:', e);
            // Clean up any uploaded file if error occurs
            if (req.file) {
            const bucket = new GridFSBucket(db, { bucketName: 'images' });
            await bucket.delete(req.file.id).catch(cleanupError => {
                console.error('Failed to cleanup image:', cleanupError);
            });
            }
            res.status(500).json({ cardId: -1, error: e.toString() });
        }
    });

    // Get Card
    app.get('/api/images/:id', async (req, res) => {
        try {
          const bucket = new GridFSBucket(db, { bucketName: 'images' });
          const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));
          
          downloadStream.on('error', () => {
            return res.status(404).send('Image not found');
          });
      
          // Set appropriate content type
          downloadStream.on('file', (file) => {
            res.set('Content-Type', file.contentType);
          });
      
          downloadStream.pipe(res);
        } catch (e) {
          console.error('Image retrieval error:', e);
          res.status(500).send('Error retrieving image');
        }
    });

    // Search card
    app.get('/api/cards/search', async (req, res) => {
        try {
            const { location, tags } = req.query;
      
            if (!location && !tags) {
                return res.status(400).json({ error: 'At least one search parameter (location or tags) is required' });
            }
        
            const query = {};
        
            if (location) {
                query.Location = { $regex: location, $options: 'i' };
            }
        
            if (tags) {
                const tagArray = tags.split(',').map(tag => tag.trim());
                query.Tags = { $in: tagArray };
            }
        
            const cards = await db.collection('Cards')
                .find(query)
                .toArray();
        
            if (cards.length === 0) {
                let message = 'No cards found';
                if (location && tags) {
                message = 'No cards found matching both the location and tags';
                } else if (location) {
                message = 'No cards found matching the location';
                } else {
                message = 'No cards found with the specified tags';
                }
                return res.status(200).json({ message });
            }
        
            res.status(200).json(cards);
        } catch (e) {
          console.error('Combined search error:', e);
          res.status(500).json({ error: e.toString() });
        }
    });
}