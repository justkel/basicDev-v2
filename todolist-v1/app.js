
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const port = 3000;

const app = express();

const items = ["Buy Food", "Eat Food"]
const workItems = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function(req, res){

  const day = date.getDate();
  res.render("list", {listTitle: day, newListItems: items})

});

app.post("/", function(req, res){
  console.log(req.body);
  let item = req.body.newItem;

  if (req.body.list === "Work1") {
    workItems.push(item);
    res.redirect;
  } else {
    items.push(item);
    res.redirect;
  }

});

app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work1", newListItems: workItems});
})

// app.post("/work", function(req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//
//   res.redirect("/")
// })

app.listen(port, function(){
  console.log(`Server is running on port ${port}`);
})
