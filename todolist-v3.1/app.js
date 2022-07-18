
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require("date-and-time");
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

const defaultItems = [item1]


const listSchema = {
  name: String,
  items: [itemsSchema],
  time: Date
}

const List = mongoose.model("List", listSchema)

// const options = {
//   hour: "numeric",
//   minute: "numeric",
//   month: "long",
//   day: "numeric",
//   year: "numeric"
// };

// const now = new Date()
// const value = date.format(now,'YYYY/MM/DD HH:mm:ss');
// console.log("Current date and time is " + value);

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
  const trimmedCustomListName = req.params.customListName.trim()
  const customListName = _.capitalize(trimmedCustomListName);

   List.findOne({name: customListName}, function(err, foundLists){
     if(!err){
       if(!foundLists){
         // const now = new Date()
         // const exactTime = now.toLocaleString("en-us", options).slice(0, 25)
         const now = new Date()
         // const value = date.format(now,'YYYY/MM/DD HH:mm:ss');

         const list = new List({
           //Create a new list
           name: customListName,
           time: now
         })

         list.save();
         console.log(list, "Check Here2");

         res.redirect("/" + customListName)

       } else {
         res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items})
       }
     }
   })
})

app.get("/saved-pages/all", function(req, res){

   List.find({}, function(err, docs) {
     console.log(List, "Check Here1");


     if(!err) {
        res.render("paged", {listTitle: docs})
     }
     else {
        console.log(err);
     }
      // console.log(docs, "Okay");
 });

})

app.post("/customPage", function(req, res){
  const customMade = req.body.myCustom;

res.redirect("/"+ customMade)
})


// app.post("/saved-pages/all", function(req, res){
//   const customMade = req.body.myCustom;
//   res.render("paged", {listTitle: customMade})
// })

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
