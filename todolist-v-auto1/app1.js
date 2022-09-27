require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js")
const moment = require("moment");
const port = process.env.PORT || 3000;
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.locals.moment = moment;


mongoose.connect("mongodb://localhost:27017/todolist-auto2", {useNewUrlParser: true, useUnifiedTopology: true});

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema ({   //format introduced as a requirement of mongoose-encryption
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const itemsSchema = ({  // Mongoose Schema
  name: String
});

const Item = mongoose.model("Item", itemsSchema);   // Mongoose Model

const item1 = new Item ({
  name: false
})

const defaultItems = [item1]


const listSchema = {
  name: String,
  items: [itemsSchema],
  time: Date
}

const List = mongoose.model("List", listSchema)


app.get("/home", function(req, res){

  if(req.isAuthenticated()) {
    Item.find({}, function(err, foundItems) {

      if (foundItems.length === false){
          Item.insertMany(defaultItems, function(err){
             if(err){
               console.log(err);
             }else if (defaultItems[0].name === false) {
               console.log("!true");
             } else {
               console.log("Successfully loaded false elements");
             }
           })
           res.redirect("/home")

      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems})
      }
    })
  } else {
    res.redirect("/")
  }


});

app.get("/home/:customListName", (req, res) => { //dynamic website routing
  const trimmedCustomListName = req.params.customListName.trim()
  const customListName = _.capitalize(trimmedCustomListName);

   List.findOne({name: customListName}, function(err, foundLists){
     if(!err){
       if(!foundLists){

         const list = new List({
           //Create a new list
           name: customListName,
           time: date.getDate()
         })

         list.save();

         res.redirect("/home/" + customListName)

       } else {
         res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items})
       }
     }
   })
})

app.get("/home/saved-pages/all", function(req, res){

   List.find({}, function(err, docs) {

     if(!err) {
        res.render("paged", {listTitle: docs})
     }
     else {
        console.log(err);
     }

 });

})

app.get("/", function(req, res){
  res.render("entry")
})

app.get("/register", function(req, res){
  res.render("register")
})

app.get("/login", function(req, res){
  res.render("login")
})

app.post("/home/customPage", function(req, res){
  const customMade = req.body.myCustom;

res.redirect("/home/"+ customMade)
})


app.post("/home", function(req, res){

  const itemName = _.capitalize(req.body.newItem);
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })


  if(listName === "Today"){
    item.save();  // displays in mongo shell
    res.redirect("/home") // displays on server page
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item)
      foundList.save();
      res.redirect("/home/" + listName)
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/home")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/home/" + listName);
      }
    })
  }
})

app.post("/clear", function(req, res){
  // const checkedCheck = req.body.newCheck
  const clickedButton = req.body.delButton

  List.deleteOne({_id: clickedButton}, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Successfully deleted selected records");
    res.redirect("/home/saved-pages/all")
  }
});
})

app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home")
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
        res.redirect("/home")
      })
    }
  })
})



app.listen(port, function(){
  console.log(`Server has started Successfully`);
})
