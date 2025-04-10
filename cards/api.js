require('dotenv');
require('express');
require('mongodb');
token = require('./createJWT.js');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');

const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Info for AWS S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const bucketName = process.env.S3_BUCKET_NAME;

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
            id = results[0].UserID;
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
      
        const { firstName, lastName, login, password, email } = req.body;
      
        // Validate input
        if (!firstName || !lastName || !login || !password || !email) {
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
            UserID: userId,
            Login: login,
            Password: password, // You should hash this password in production
            Email: email,
            Verified: false,
          };
      
          const result = await db.collection('Users').insertOne(newUser);
          console.log('User saved to database with ID:', userId);
      
          res.status(200).json({ id: userId, error: '' });
        } catch (e) {
          console.error('Registration error:', e);
          res.status(500).json({ id: -1, error: e.toString() });
        }
    });



    // Security middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
    }));
    app.use(bodyParser.json());

    // Rate limiting for email endpoints
    const emailLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: 'Too many requests from this IP, please try again later'
    });



    // Database connection with your MongoDB URI
    // const url = process.env.MONGODB_URI;
    // const client = new mongoose.MongoClient(url, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   connectTimeoutMS: 5000,
    //   serverSelectionTimeoutMS: 5000
    // });

    // let db;
    // client.connect()
    //   .then(() => {
    //     console.log("MongoDB connected successfully");
    //     db = client.db("Test"); // Using your test database
    //   })
    //   .catch(err => {
    //     console.error("MongoDB connection error:", err);
    //     process.exit(1);
    //   });

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Token generation with expiration
    function makeToken(length, expiresInMinutes = 30) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const token = Array.from({length}, () => 
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');

      return {
        token,
        expiresAt: new Date(Date.now() + expiresInMinutes * 60000)
      };
    }



    // Enhanced email sender
    async function sendEmail(user, subject, message) {
      const mailOptions = {
        from: `”FishNet” <${process.env.EMAIL_USER}>`,
        to: user.Email,
        subject: subject,
        text: `Hi ${user.FirstName} ${user.LastName},\n${message}\n\nThank you,\nFishNet`,
        html: `<p>Hi ${user.FirstName} ${user.LastName},</p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <p>Thank you,<br>FishNet</p>`
      };

      return transporter.sendMail(mailOptions);
    }



    // Email verification endpoint
    app.post('/email/sendverification', emailLimiter, async (req, res) => {
      const { userId } = req.body;

      const db = client.db('Test');

      try {
        if (!userId) {
          return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const user = await getUserInfo(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.Verified) {
          return res.status(400).json({ success: false, error: 'Email already verified' });
        }

        const { token, expiresAt } = makeToken(20);

        await db.collection('Users').updateOne(
          { "UserID": userId },
          { $set: { 
            "VerKey": token,
            "VerKeyExpires": expiresAt 
          }}
        );

        const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5001'}/email/verify/${user.UserID}/${token}`;
        const message = `Please click the following link to verify your email address:\n${verificationUrl}\n\nThis link will expire in 30 minutes.`;

        await sendEmail(user, "Email Verification", message);

        res.json({ success: true });
      } catch (e) {
        console.error('Verification email error:', e);
        res.status(500).json({ success: false, error: 'Failed to send verification email' });
      }
    });



    getUserInfo = async function ( userId ) {
      var error = '';
  
      try {
          const db = client.db("Test");
          const results = await db.collection('Users').find({"UserID":userId}).toArray();
  
          var _ret = [];
          for( var i=0; i<results.length; i++ )
          {
              _ret.push( results[i]);
          }
  
          if (results.length != 1) {
              throw new Error('UserId Invalid');
          }
          return _ret[0];
      } catch(e) {
          console.log("Error: '" + e + "' in getUserInfo()");
          return null;
      }
  }



    // Password reset endpoint
    app.post('/email/passwordreset', emailLimiter, async (req, res) => {
      const { Email } = req.body;

      const db = client.db('Test');

      try {
        if (!Email) {
          return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const user = await db.collection('Users').findOne({ Email });

        if (!user) {
          return res.status(404).json({ success: false, error: 'Email not found' });
        }

        if (!user.Verified) {
          return res.status(403).json({ success: false, error: 'Email not verified' });
        }

        const { token, expiresAt } = makeToken(6, 15); // 15 minute expiration

        await db.collection('Users').updateOne(
          { "_id": user._id },
          { $set: { 
            "ResetToken": token,
            "ResetTokenExpires": expiresAt 
          }}
        );

        const message = `Your password reset code is:\n\n${token}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`;

        await sendEmail(user, "Password Reset Request", message);

        res.json({ success: true });
      } catch (e) {
        console.error('Password reset error:', e);
        res.status(500).json({ success: false, error: 'Failed to process password reset' });
      }
    });



    // Email verification handler
    app.get('/email/verify/:userId/:token', async (req, res) => {
      const { userId, token } = req.params;

      console.log(userId);
      console.log(token);

      const db = client.db('Test');

      try {

        // First check if user exists by ID
        const userById = await db.collection('Users').findOne({ "_id": userId });
        console.log('User by ID:', userById);

        // Then check if user exists by token
        const userByToken = await db.collection('Users').findOne({ "VerKey": token });
        console.log('User by token:', userByToken);

        const user = await db.collection('Users').findOne({
          "UserID": Number(userId),
          "VerKey": token,
          // "VerKeyExpires": { $gt: new Date() }
        });

        if (!user) {
          return res.status(400).send(`
            <h1>Email Verification Failed</h1>
            <p>The verification link is invalid or has expired.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/resend-verification">Click here to request a new verification email</a>
          `);
        }

        await db.collection('Users').updateOne(
          { "_id": user._id },
          { 
            $set: { "Verified": true },
            $unset: { "VerKey": "", "VerKeyExpires": "" }
          }
        );

        res.send(`
          <h1>Email Verified Successfully</h1>
          <p>Thank you for verifying your email address!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/">Click here to login</a>
        `);
      } catch (e) {
        console.error('Verification error:', e);
        res.status(500).send(`
          <h1>Verification Error</h1>
          <p>An error occurred during verification. Please try again.</p>
        `);
      }
    });


    // Find user by email endpoint
    app.post('/api/findUserByEmail', async (req, res) => {
      const { email } = req.body;

      const db = client.db('Test');
      
      try {
        if (!email) {
          return res.status(400).json({ success: false, error: 'Email is required' });
        }
        
        const user = await db.collection('Users').findOne({ Email: email });
        
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, userId: user.UserID });
      } catch (e) {
        console.error('Find user by email error:', e);
        res.status(500).json({ success: false, error: 'Failed to find user' });
      }
    });



    // Password reset completion endpoint
    app.post('/email/resetpassword', async (req, res) => {
      const { Email, ResetToken, NewPassword } = req.body;

      const db = client.db('Test');
      
      try {
        if (!Email || !ResetToken || !NewPassword) {
          return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        
        const user = await db.collection('Users').findOne({
          Email,
          ResetToken,
          ResetTokenExpires: { $gt: new Date() }
        });
        
        if (!user) {
          return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
        }
        
        // Hash the new password
        // const hashedPassword = await bcrypt.hash(NewPassword, 10);
        
        await db.collection('Users').updateOne(
          { _id: user._id },
          { 
            $set: { Password: NewPassword },
            $unset: { ResetToken: "", ResetTokenExpires: "" }
          }
        );
        
        res.json({ success: true });
      } catch (e) {
        console.error('Password reset error:', e);
        res.status(500).json({ success: false, error: 'Failed to reset password' });
      }
    });



    // Verify an image was uploaded
    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed!'), false);
            }
        }
    });

    
    
    // Upload Card
    app.post('/api/cards', upload.single('image'), async (req, res) => {
        const { userId, tags, date, location } = req.body;
        const imageFile = req.file;
        const db = client.db('Test');
        
        if (!userId || !date || !location) {
            return res.status(400).json({ cardId: -1, error: 'Missing required fields' });
        }
        
        try {
            const userExists = await db.collection('Users').findOne({ UserID: parseInt(userId) });
        
            if (!userExists) {
                return res.status(404).json({ cardId: -1, error: 'User not found' });
            }
        
            let imageUrl = null;
            if (imageFile) {
                const params = {
                    Bucket: bucketName,
                    Key: `images/${Date.now()}_${imageFile.originalname}`,
                    Body: imageFile.buffer,
                    ContentType: imageFile.mimetype,
                    ACL: 'public-read'
                };
            
                const uploadResult = await s3.upload(params).promise();
                imageUrl = uploadResult.Location;
            }
        
            const cardId = Math.floor(Math.random() * 10000000);
        
            const newCard = {
                CardID: cardId,
                UserID: parseInt(userId),
                Tags: tags ? tags.split(',').map(t => t.trim()) : [],
                Location: location,
                Date: date,
                ImageUrl: imageUrl,
                CreatedAt: new Date(),
                UpdatedAt: new Date(),
                Likes: 0,
                Comments: []
            };
        
            await db.collection('Cards').insertOne(newCard);
        
            res.status(200).json({ 
                cardId, 
                error: '',
                imageUrl: imageUrl
            });
        } catch (e) {
            console.error('Error:', e);
            res.status(500).json({ cardId: -1, error: 'Internal server error' });
        }
      
    });

    // Get Image
    app.get('/api/images/:id', async (req, res) => {
        const db = client.db('Test');
        try {
          const card = await db.collection('Cards').findOne({ CardID: parseInt(req.params.id) });
      
          if (!card || !card.ImageUrl) {
            return res.status(404).send('Image not found');
          }
      
          res.status(200).json({ imageUrl: card.ImageUrl });
        } catch (e) {
          console.error('Error:', e);
          res.status(500).send('Error retrieving image');
        }
    });



    // Search Card
    app.get('/api/cards/search', async (req, res) => {
      try {
        const { location, tags, firstName, lastName, userId } = req.query;
        const db = client.db('Test');
    
        // Step 1: Build the card query
        const cardQuery = {};
        
        // If userId is provided, exclude cards from that user
        if (userId) {
          cardQuery.UserID = { $ne: Number(userId) };
        }
    
        // Add other search filters if provided
        if (location) {
          cardQuery.Location = { $regex: location, $options: 'i' };
        }
    
        if (tags) {
          const tagArray = tags.split(',').map(tag => tag.trim());
          cardQuery.Tags = { $in: tagArray };
        }
    
        // Step 2: If searching by user names, handle that filter
        if (firstName || lastName) {
          const userQuery = {};
          if (firstName) userQuery.FirstName = { $regex: firstName, $options: 'i' };
          if (lastName) userQuery.LastName = { $regex: lastName, $options: 'i' };
    
          const matchingUsers = await db.collection('Users')
            .find(userQuery)
            .project({ UserID: 1 })
            .toArray();
    
          const userIds = matchingUsers.map(user => user.UserID);
    
          // If no users found and we were specifically searching by name
          if (userIds.length === 0) {
            return res.status(200).json({ 
              message: 'No cards found matching the user name criteria',
              cards: []
            });
          }
          
          // Combine the username filter with the existing userId exclusion if needed
          if (userId) {
            // We need both conditions: UserID must be in userIds AND must not be the excluded userId
            cardQuery.$and = [
              { UserID: { $in: userIds } },
              { UserID: { $ne: userId } }
            ];
            delete cardQuery.UserID; // Remove the original condition as it's now in $and
          } else {
            // Just filter by the matching userIds
            cardQuery.UserID = { $in: userIds };
          }
        }
    
        // Step 3: Find matching cards and include user information
        const cards = await db.collection('Cards')
          .find(cardQuery)
          .toArray();
    
        // If we found cards, include user information
        if (cards.length > 0) {
          const cardUserIds = [...new Set(cards.map(card => card.UserID))];
          const users = await db.collection('Users')
            .find({ UserID: { $in: cardUserIds } })
            .project({ UserID: 1, FirstName: 1, LastName: 1 })
            .toArray();
    
          const userMap = users.reduce((map, user) => {
            map[user.UserID] = user;
            return map;
          }, {});
    
          const cardsWithUserInfo = cards.map(card => ({
            ...card,
            user: {
              firstName: userMap[card.UserID]?.FirstName || '',
              lastName: userMap[card.UserID]?.LastName || ''
            }
          }));
    
          return res.status(200).json(cardsWithUserInfo);
        }
    
        res.status(200).json({ 
          message: 'No cards found matching your criteria',
          cards: []
        });
      } catch (e) {
        console.error('Search error:', e);
        res.status(500).json({ error: 'Internal server error' });
      }  
    });


    
    // Edit Card
    app.put('/api/cards/:cardId', upload.single('image'), async (req, res) => {
        const { cardId } = req.params;
        const { userId, tags, date, location } = req.body;
        const newImageFile = req.file;
        const db = client.db('Test');
        
        // Validate cardId
        if (!cardId || isNaN(cardId)) {
            return res.status(400).json({ 
            success: false,
            error: 'Invalid card ID' 
            });
        }
        
        try {
            // 1. Find the existing card
            const existingCard = await db.collection('Cards').findOne({ 
            CardID: parseInt(cardId) 
            });
        
            if (!existingCard) {
            return res.status(404).json({ 
                success: false,
                error: 'Card not found' 
            });
            }
        
            // 2. Verify user owns the card (optional security check)
            if (existingCard.UserID !== parseInt(userId)) {
            return res.status(403).json({ 
                success: false,
                error: 'Unauthorized to edit this card' 
            });
            }
        
            let imageUrl = existingCard.ImageUrl;
            let oldImageKey = null;
        
            // 3. Handle image update if new image was uploaded
            if (newImageFile) {
            // Prepare to delete old image later
            if (existingCard.ImageUrl) {
                oldImageKey = existingCard.ImageUrl.split('/').pop();
            }
        
            // Upload new image to S3
            const params = {
                Bucket: bucketName,
                Key: `images/${Date.now()}_${newImageFile.originalname}`,
                Body: newImageFile.buffer,
                ContentType: newImageFile.mimetype
            };
        
            const uploadResult = await s3.upload(params).promise();
            imageUrl = uploadResult.Location;
            }
        
            // 4. Update card in database
            const updateData = {
            ...existingCard,
            Tags: tags ? tags.split(',').map(t => t.trim()) : existingCard.Tags,
            Location: location || existingCard.Location,
            Date: date || existingCard.Date,
            ImageUrl: imageUrl,
            UpdatedAt: new Date()
            };
        
            await db.collection('Cards').updateOne(
            { CardID: parseInt(cardId) },
            { $set: updateData }
            );
        
            // 5. Delete old image from S3 if it was replaced
            if (oldImageKey) {
            try {
                await s3.deleteObject({
                Bucket: bucketName,
                Key: `images/${oldImageKey}`
                }).promise();
            } catch (err) {
                console.error('Failed to delete old image from S3:', err);
                // Not critical - can be cleaned up later
            }
            }
        
            res.status(200).json({ 
            success: true,
            cardId: parseInt(cardId),
            imageUrl: imageUrl
            });
        
        } catch (err) {
            console.error('Edit card error:', err);
            res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
            });
        }  
    });



    // Delete Card
    app.delete('/api/cards/:cardId', async (req, res) => {
        const { cardId } = req.params;
        const db = client.db('Test');
      
        if (!cardId || isNaN(cardId)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid card ID' 
            });
        }
      
        try {
            const card = await db.collection('Cards').findOne({ 
                CardID: parseInt(cardId) 
            });
      
            if (!card) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Card not found' 
                });
            }
      
            // Delete associated image from S3 if exists
            if (card.ImageUrl) {
                try {
                    const key = card.ImageUrl.split('/').pop();
                    await s3.deleteObject({
                        Bucket: bucketName,
                        Key: `images/${key}`
                    }).promise();
                } catch (err) {
                    console.error('Failed to delete image from S3:', err);
                    // Continue even if image deletion fails
                }
            }
      
            // Delete the card document
            await db.collection('Cards').deleteOne({ 
                CardID: parseInt(cardId) 
            });
      
            res.json({ 
                success: true,
                message: 'Card deleted successfully'
             });
      
        } catch (err) {
            console.error('Delete error:', err);
            res.status(500).json({ 
                success: false,
                error: 'Server error during deletion' 
            });
        }  
    });
}