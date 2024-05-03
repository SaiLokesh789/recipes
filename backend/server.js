//create express modules
const exp = require("express");
const app = exp()
const path = require("path")

// deploy react build in this server
app.use(exp.static(path.join(__dirname, "../frontend/build")))

//import mongoclient
const mongoClient = require("mongodb").MongoClient;

//body parser middleware
app.use(exp.json());

//connect to database
mongoClient.connect("mongodb://localhost:27017")
  .then(client => {
    //get db obj
    const recipedb = client.db('recipedb');
    //get collection obj
    const userscollection = recipedb.collection("userscollection")
    const recipescollection=recipedb.collection("recipescollection");
      //share collection obj with exp app
      app.set("userscollection",userscollection);
      app.set("recipescollection",recipescollection);
      //confirm connection status
      console.log("DB is connected");
  })
  .catch(err => {
    console.log("Error in connection", err);
  })


//import api routes
const userApp = require("./APIs/user-api")

//if patr starts with user-api,send request to userApi
app.use("", userApp);






app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
})

//exp err handler
app.use((err, req, res, next) => {
  res.send({ message: "Error", payload: err });
})

app.listen(4000, () => console.log(`Server is running on port 4000...`))