require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const dns = require('dns');
const { response } = require('express');
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


/* Create URL Model */
let userNameSchema = new mongoose.Schema({
    userName: { type: String, required: true }
});

let Username = mongoose.model('Username', userNameSchema);

app.post('/api/users', function(req, res) {
    let userName = req.body.username;
    if (userName == undefined || userName.length == 0) {
        return res.send('Path `username` is required.')
    }
    console.log('username:' + userName)
    res.send({ 'username': userName });
});






const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})