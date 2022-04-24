//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


app.use(session({
    secret: "Oursecret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// const secret="Thisisoursecret0";
// userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
// Serialize: make a cookie and hide authenticate msg in it
// DeSerialize: crumble the cookie and discover authenticate msg in it which is who is this user is
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});
app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});



app.post('/register', function (req, res) {
    // bcrypt.hash(req.body.password, saltRounds, function (err2, hash) {
    //     // Store hash in your password DB.
    //     const u = req.body.username;
    //     // const p = md5(req.body.password);
    //     const p = hash;
    //     const user = new User({ email: u, password: p });
    //     user.save(function (err) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.render("secrets");
    //         }
    //     });
    // });

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
      });

});
app.post('/login', function (req, res) {
    const u = req.body.username;
    // const p = md5(req.body.password);
    const p = req.body.password;
    // User.findOne({ email: u }, function (err, foundUser) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         if (foundUser) {
    //             // if(foundUser.password===p){
    //             //     res.render('secrets');
    //             // }
    //             bcrypt.compare(p, foundUser.password, function (err2, result) {
    //                 // result == true
    //                 if (result === true)
    //                     res.render('secrets');
    //             });
    //         }
    //     }
    // });
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    // from passport
    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });

});







app.listen(3000, function () {
    console.log("Server started on port 3000");
});