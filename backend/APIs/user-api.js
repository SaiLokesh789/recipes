//create user-api app
const exp = require("express")
const userApp = exp.Router();
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken")
// const commonApp = require("./common-api");

//get userscollection 
let userscollection;
userApp.use((req, res, next) => {
  userscollection = req.app.get("userscollection");
  next();
})

//get recipescollection
let recipescollection;
userApp.use((req, res, next) => {
  recipescollection = req.app.get("recipescollection");
  next();
})

//user registration route
userApp.post('/user', expressAsyncHandler(async (req, res) => {
  //get user resource from client
  const newUser = req.body;
  //check for duplicate username
  const dbUser = await userscollection.findOne({ username: newUser.username });
  //duplicate found
  if (dbUser !== null) {
    res.send({ message: "username already exist" });
  } else {
    //hash password
    let hashedPassword = await bcryptjs.hash(newUser.password, 5);
    //replace plain password with hashed password
    newUser.password = hashedPassword;
    //save in the db
    await userscollection.insertOne(newUser);
    res.send({ message: "User Created" });
  }
}))

//user login route
userApp.post("/login", expressAsyncHandler(async (req, res) => {
  //get user credential details from body
  let userCredential = req.body;
  //find username
  let dbUser = await userscollection.findOne({ username: userCredential.username });
  //user not exist
  if (dbUser === null) {
    res.send({ message: "Invalid Username" });
  }
  //check password
  const status = await bcryptjs.compare(userCredential.password, dbUser.password);
  //password wrong
  if (status === false) {
    res.send({ message: "Invalid Password" });
  }
  //create jwt token
  let signedToken = jwt.sign({ username: dbUser.username }, "DevDynamos", { expiresIn: "1d" });
  //send jwt
  res.send({ message: "Login Sucess", token: signedToken, user: dbUser });
}))

// adding new recipe by author
userApp.post('/recipe', expressAsyncHandler(async (req, res) => {
  // get new article by author
  const newRecipe = req.body;
  // post to articles collection
  await recipescollection.insertOne(newRecipe);
  // send res
  res.send({ message: "New Recipe created" })
}))

// get recipes of all users
userApp.get('/recipe', expressAsyncHandler(async (req, res) => {
  // get recipescollection form express app
  const recipescollection = req.app.get('recipescollection')
  // get all recipes
  let recipeList = await recipescollection.find({ status: true }).toArray()
  // send res
  res.send({ message: "articles", payload: recipeList })
}))

//modify recipe by user
userApp.put('/recipe', expressAsyncHandler(async (req, res) => {
  //get modified recipe from client
  const modifiedRecipe = req.body;

  //update by recipe id
  let result = await recipescollection.updateOne({ recipeid: modifiedRecipe.recipeid }, { $set: { ...modifiedRecipe } })
  let latestRecipe = await recipescollection.findOne({ recipeid: modifiedRecipe.recipeid })
  res.send({ message: "Recipe modified", article: latestRecipe })
}))

// delete an recipe by recipeid 
userApp.put('/recipe/:recipeid',expressAsyncHandler(async(req,res)=>{
  // get recipeid from url
  const recipeIdFromUrl = req.params.recipeid
  // get recipe from user
  const recipeToDelete=req.body
  // update status of recipe to false
  await recipescollection.updateOne({recipeid:recipeIdFromUrl},{$set:{...recipeToDelete,status:false}})
  res.send({message:'recipe removed'})
}))

// read recipes of user
userApp.get('/recipes/:username',expressAsyncHandler(async(req,res)=>{
  // get user's username from url
  const userName=req.params.username
  // get recipes whose status is true
  const recipesList=await recipescollection.find({status:true,username:userName}).toArray()
  res.send({message:"List of recipes",payload:recipesList})
}))

// restore an recipe by recipe id
userApp.put('/restorerecipe/:recipeId',expressAsyncHandler(async(req,res)=>{
  // get recipeId from url
  const recipeIdFromUrl = req.params.recipeId;
  // console.log(recipeIdFromUrl)
  // get article
  const recipeToRestore=req.body
  // update status of recipe to true
  await recipescollection.updateOne({recipeid:recipeIdFromUrl},{$set:{...recipeToRestore,status:true}})
  res.send({message:'recipe restored'})
}))

// read deleted recipes by user
userApp.get('/deletedRecipes/:username',expressAsyncHandler(async(req,res)=>{
  // get user's username from url
  const userName=req.params.username
  // get recipeList whose status is false
  const recipeList=await recipescollection.find({status:false,username:userName}).toArray()
  res.send({message:"List of recipes",payload:recipeList})
}))

// post reviews for an recipe by recipe id
userApp.post('/review/:recipeId',expressAsyncHandler(async(req,res)=>{
  // get user review obj
  const userReview=req.body
  // get reviewId by url parameter
  const recipeIdFromUrl = (req.params.recipeId);
  // insert userComment object to comments array of article by id
  const result=await recipescollection.updateOne({recipeid:recipeIdFromUrl},{$addToSet:{reviews:userReview}})
  console.log(result)
  res.send({message:"review posted"})
}))

// get recipe by recipeid
userApp.get('/recipe/:recipeId',expressAsyncHandler(async(req,res)=>{
  // get reviewId by url parameter
  const recipeIdFromUrl = (req.params.recipeId);
  // find the recipe by its id
  const result = await recipescollection.findOne({recipeid:recipeIdFromUrl})
  // console.log(result)
  res.send({message:"recipe",payload:result})
}))

//export user App
module.exports = userApp;