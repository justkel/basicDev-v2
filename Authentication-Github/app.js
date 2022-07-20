
require('dotenv').config();   //environment variable
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GitHubStrategy = require('passport-github').Strategy;
const findOrCreate = require('mongoose-findorcreate')


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/githubDB", {useNewUrlParser: true, useUnifiedTopology: true});

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema ({   //format introduced as a requirement of mongoose-encryption
  email: String,
  password: String,
  githubId: String,
  secret: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)  //  https://www.npmjs.com/package/mongoose-findorcreate

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(function(user, done){
  done(null, user.id)
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback/"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
  User.findOrCreate({ githubId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.get("/", function(req, res){
  res.render("home")
})

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to secrets page
    res.redirect('/secrets');
  });

app.get("/login", function(req, res){
  res.render("login")
})

app.get("/register", function(req, res){
  res.render("register")
})

app.get("/secrets", function(req, res){
  User.find({"secret": {$ne: null}}, function(err, foundUsers){
    if(err){
      console.log(err);
    } else {
      if(foundUsers){
        res.render("secrets", {usersWithSecrets: foundUsers})
      }
    }
  })
});

app.get("/submit", function(req, res){
  if(req.isAuthenticated()){
    res.render("submit")
  } else {
    res.redirect("/login")
  }
});

app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret

  console.log(req.user.id);

  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        foundUser.secret = submittedSecret
        foundUser.save(function(){
          res.redirect("/secrets")
        })
      }
    }
  })
})

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })

})

app.post("/login", function(req, res){
  const user = new User ({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
