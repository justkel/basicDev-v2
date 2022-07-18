
const express = require("express")
const https = require("https");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html")
});

app.post("/", function(req, res){
  const query = req.body.cityName
  const apiKey = "4d3b26991fcee8987c53f2c07ff7a384"
  const unit = "metric"
  const url = "https://api.openweathermap.org/data/2.5/weather?q="+ query +"&appid="+ apiKey +"&units="+ unit +""

  https.get(url, function(response){
    console.log(response.statusCode);

    response.on("data", (data) => {
      const weatherData = JSON.parse(data);
      // console.log(weatherData);
      const temp = weatherData.main.temp
      const weatherDescription = weatherData.weather[0].description
      const icon = weatherData.weather[0].icon
      const imageURL = "https://openweathermap.org/img/wn/"+ icon +"@2x.png"
      res.write("<p>The weather description is currently "+ weatherDescription + "<p>");
      res.write("<h1>The temperature in "+ query +" is "+ temp + " degrees celsius</h1>") // local host
      res.write("<img src="+ imageURL +">")
      res.send();
    })
  })

})



app.listen(port, function(){
  console.log(`Server is listening at port ${port}`); // displays on console
})
