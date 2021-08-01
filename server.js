require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const dns = require('dns');
const { response } = require('express');
const { request } = require('http');
const DB_URI = process.env.MONGO_URI;


mongoose
    .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
    .then(() => {
        console.log('Connection to MongoDB established!')
    });


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});




/* Create userName Model */
let exerciceSessionSchema = new mongoose.Schema({
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: String
});

let Session = mongoose.model('Session', exerciceSessionSchema);

/* Create userName Model */
let userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    log: [exerciceSessionSchema]
});

let User = mongoose.model('User', userSchema);


//Create new users
app.post('/api/users', function(req, res) {
    let newUser = new User({ username: req.body.username });
    newUser.save((error, savedUser) => {
        if (!error) {
            let responseObject = {};
            responseObject['username'] = savedUser.username;
            responseObject['_id'] = savedUser.id;
            res.json(responseObject);
        }
    })

});

//Get -> List of Users
app.get('/api/users', function(req, res) {

    User.find({}, (error, arrayOfUsers) => {
        if (!error) {
            res.json(arrayOfUsers)
        } else {
            console.log(error);
        }
    })
});

//Add an exercice for a particular ID
app.post('/api/users/:_id/exercises', (req, res) => {
    let id = req.params._id;
    console.log('the id:' + id)
    let newSession = new Session({
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: req.body.date
    });
    if (newSession.date === '') {
        newSession.date = new Date().toISOString().substring(0, 10);
    }
    console.log(newSession)
    User.findByIdAndUpdate(
        req.params._id, {
            $push: { log: newSession }
        }, { new: true }, (error, updatedUser) => {
            if (!error) {
                console.log('user: ' + updatedUser)
                let responseObject = {};
                responseObject['_id'] = updatedUser._id;
                responseObject['username'] = updatedUser.username;
                responseObject['date'] = new Date(newSession.date).toDateString();
                responseObject['description'] = newSession.description;
                responseObject['duration'] = newSession.duration;
                res.json(responseObject);
            } else { console.log('HERE' + error) }
        }

    );
});

//List of logs for a user
app.get('/api/users/:_id/logs', (req, res) => {
    let id = req.params._id;
    User.findById(id, (error, foundUser) => {
        if (!error) {
            res.json(foundUser);
        } else { console.log(error) }
    })
});




const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})