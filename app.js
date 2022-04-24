//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// const secret="Thisisoursecret0";
// userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});

const User = mongoose.model('User', userSchema);

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});



app.post('/register', function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err2, hash) {
        // Store hash in your password DB.
        const u = req.body.username;
        // const p = md5(req.body.password);
        const p = hash;
        const user = new User({ email: u, password: p });
        user.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.render("secrets");
            }
        });
    });

});
app.post('/login', function (req, res) {
    const u = req.body.username;
    // const p = md5(req.body.password);
    const p = req.body.password;
    User.findOne({ email: u }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                // if(foundUser.password===p){
                //     res.render('secrets');
                // }
                bcrypt.compare(p, foundUser.password, function (err2, result) {
                    // result == true
                    if (result === true)
                        res.render('secrets');
                });
            }
        }
    });

});







app.listen(3000, function () {
    console.log("Server started on port 3000");
});