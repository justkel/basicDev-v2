
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js")
const moment = require("moment");
const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.locals.moment = moment;


mongoose.connect("mongodb+srv://kelnotes2:12345qwerty@cluster0.kkgdl.mongodb.net/todolistDB-auto", {useNewUrlParser: true, useUnifiedTopology: true});
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


app.get("/", function(req, res){

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
         res.redirect("/")

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems})
    }
  })
});

app.get("/:customListName", (req, res) => { //dynamic website routing
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

         res.redirect("/" + customListName)

       } else {
         res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items})
       }
     }
   })
})

app.get("/saved-pages/all", function(req, res){

   List.find({}, function(err, docs) {

     if(!err) {
        res.render("paged", {listTitle: docs})
     }
     else {
        console.log(err);
     }

 });

})

app.post("/customPage", function(req, res){
  const customMade = req.body.myCustom;

res.redirect("/"+ customMade)
})


app.post("/", function(req, res){

  const itemName = _.capitalize(req.body.newItem);
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })


  if(listName === "Today"){
    item.save();  // displays in mongo shell
    res.redirect("/") // displays on server page
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item)
      foundList.save();
      res.redirect("/" + listName)
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
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
})


app.listen(port, function(){
  console.log(`Server has started Successfully`);
})
