
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const jsdom = require("jsdom");
const dom = new jsdom.JSDOM("");
const jquery = $ = require('jquery')(dom.window);
const port = process.env.PORT || 3000;


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB-3", {useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema = ({  // Mongoose Schema
  name: String
});

const Item = mongoose.model("Item", itemsSchema);   // Mongoose Model

const item1 = new Item ({
  name: false
})

// const item2 = new Item ({
//   name: "Hit the + to add a new item"
// })
//
// const item3 = new Item ({
//   name: " <-- Hit this to delete an item"
// })

const defaultItems = [item1]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems) {
    //console.log(foundItems);
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
       // $('.myCheck').hide();
         res.redirect("/")

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems})
    }
  })
});

app.get("/:customListName", (req, res) => { //dynamic website routing
   const customListName = _.capitalize(req.params.customListName);


   List.findOne({name: customListName}, function(err, foundLists){
     if(!err){
       if(!foundLists){
         const list = new List({
           //Create a new list
           name: customListName,
         })

         list.save();
         res.redirect("/" + customListName)

       } else {
         res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items})
       }
     }
   })
})

app.post("/customPage", function(req, res){
  const customMade = req.body.myCustom;
  res.redirect("/"+ customMade + "")
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
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
