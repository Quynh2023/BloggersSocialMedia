//-------------------------Setup---------------------------------------------------

//import express, body-parser, database
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const User = require('./models/user');
const bodyParser = require('body-parser');

//using express
const app = express();
const port = 3000;

//use the static public file
app.use(express.static("public"));

//set view ejs
app.set('view engine', 'ejs');

//middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

//-------------------------Main App----------------------------------------------
app.get("/", (req, res)=>{
  res.render("LoginPage", {errorMessage: false});
});

app.get("/login", (req, res)=>{
  res.render("LoginPage", {errorMessage: false});
});

app.get("/register", (req, res)=>{
  res.render("RegisterPage", {errorMessage: false});
});

app.post("/register", async(req, res)=>{
  try {
    const { name, email, password } = req.body;
    await User.createUser(name, email, password);
    res.redirect('/login');
  } catch (err) {
    res.render('RegisterPage', { errorMessage: 'The email is already used to register.' });
  }
});

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.render('LoginPage', {errorMessage: info.errorMessage});
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.render('Homepage', {userName: capitalizeFirstLetter(user.name)});
    });
  })(req, res, next);
});

app.get('/homepage', (req, res) => {
  res.render('Homepage', {userName: capitalizeFirstLetter(req.user.name)});
});

app.get('/myBlog', (req, res)=>{
  res.render('MyBlogPage', {userName: capitalizeFirstLetter(req.user.name)})
});

app.get('/favorites', (req, res)=>{
  res.render('FavoritePage', {userName: capitalizeFirstLetter(req.user.name)})
});


//---------------------check app running------------------------------------------
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});