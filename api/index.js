const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./modals/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const imageDownloader = require('image-downloader');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs');
const Places = require('./modals/Places');
const Bookings = require('./modals/Booking');
const multer = require('multer');
const bucket = 'kartikeya-booking-app'
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'cnjkdncjdsncjdsncdsn';
const mime= require('mime-types')
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));


async function uploadToS3(path, orignalFilename, mimetype) {
    const client = new S3Client({
        region: 'ap-southeast-2',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        }

    })
    const parts = orignalFilename.split('.');
    const ext = parts[parts.length - 1]
    const newfilename = Date.now() + '.' + ext;
    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newfilename,
        ContentType: mimetype,
        ACL: 'public-read'
    }))
    return `https://${bucket}.s3.amazonaws.com/${newfilename}`

}
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData);
        });
    });
}

app.get('/api/test', (req, res) => {
    res.json("test ok baba ji dheere chlo");
});

mongoose.connect(process.env.MONGO_URL)

app.post('/register', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt)
        });
        res.json(userDoc);
    } catch (error) {
        res.status(422).json(error);
    }
});

app.post('/api/login', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ email: userDoc.email, id: userDoc._id, name: userDoc.name }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
            });
        } else {
            res.status(422).json('Password is incorrect');
        }
    } else {
        res.status(404).json('User not found');
    }
});

app.get('/api/profile', (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id);
            res.json({ name, email, _id });
        });
    } else {
        res.json(null);
    }
});

app.post('/api/logout', (req, res) => {

    res.cookie('token', '').json(true);
});

app.post('/api/upload-by-link', async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: '/tmp/' +newName,
    });
    const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
    res.json(url);
  });

const photosMiddleware = multer({ dest: '/tmp' });
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
            const { path, originalname, mimetype } = req.files[i];
            const url = await uploadToS3(path, originalname, mimetype)
            uploadedFiles.push(url)
            // if (originalname) {
            //     const parts = originalname.split('.');
            //     const ext = parts[parts.length - 1];
            //     const newPath = path + '.' + ext;
            //     try {
            //         fs.renameSync(path, newPath);
            //         uploadedFiles.push(newPath.replace('uploads/', ''));
            //     } catch (error) {
            //         console.error(`Error renaming file ${path} to ${newPath}:`, error);
            //         res.status(500).json({ error: 'Error processing file upload' });
            //         return;
            //     }
            // } else {
            //     console.error('originalname is undefined for file', req.files[i]);
            // }
        }
    } else {
        console.error('No files uploaded or req.files is undefined');
        res.status(400).json({ error: 'No files uploaded' });
        return;
    }
    res.json(uploadedFiles);
});


app.post('/api/places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const { token } = req.cookies;
    const { title, address, addedPhotos, description, extraInfo, perks, checkIn, checkOut, maxGuests } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Places.create({
            owner: userData.id,
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests
        });
        res.json(placeDoc);
    });
});

app.get('/api/user-places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const { id } = userData;
        res.json(await Places.find({ owner: id }));
    });
});

app.get('/api/places/:id', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const { id } = req.params;
    res.json(await Places.findById(id));
});

app.put('/api/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const { token } = req.cookies;
    const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Places.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title,
                address,
                photos: addedPhotos,
                description,
                perks,
                extraInfo,
                checkIn,
                checkOut,
                maxGuests,
                price,
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
});
app.get('/api/places', async (req, res) => {

    mongoose.connect(process.env.MONGO_URL);
    res.json(await Places.find());
});
app.post('/api/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    try {
        await mongoose.connect(process.env.MONGO_URL); // Ensure MongoDB connection is awaited
        const userData = await getUserDataFromReq(req);
        const {
            checkin, checkout, maxnoofguest, name, phone,
            place,
            price,
        } = req.body;

        // Validate required fields
        if (!place || !checkin || !checkout || !name || !phone) {
            return res.status(400).json({ error: 'Missing required fields: place, checkIn, checkOut, name, and phone are required.' });
        }

        const booking = await Bookings.create({
            place, checkin, checkout, maxnoofguest, name, phone, price,
            user: userData.id,
        });

        res.json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    res.json(await Bookings.find({ user: userData.id }).populate('place'));
});

app.listen(4001, () => {
    console.log('Server is running on port 4001');
});
