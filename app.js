//-------------------------Setup---------------------------------------------------

//import express, body-parser, database
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const bodyParser = require('body-parser');
const User = require('./models/user');
const Blog = require('./models/blog');
const multer = require('multer');

//using express
const app = express();
const port = 3000;

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

//use the static public file
app.use(express.static("public"));

//set view ejs
app.set('view engine', 'ejs');

//middleware
app.use(express.json());
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

app.get('/homepage', async (req, res) => {
  try {
    res.render('Homepage', { userName: capitalizeFirstLetter(req.user.name)});
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/myBlog/:id', async(req, res)=>{
  const userId = req.user.id;
  const blogs = await Blog.getAllBlogs(userId);
  res.render('MyBlogPage', {userName: capitalizeFirstLetter(req.user.name), userId, blogs});
});

app.get('/favorites', (req, res)=>{
  res.render('FavoritePage', {userName: capitalizeFirstLetter(req.user.name)})
});

app.get('/createBlog/:id', (req, res) => {
  const userId = req.user.id;
  res.render('CreateBlogPage', {userName: capitalizeFirstLetter(req.user.name), userId});
});

app.post('/createBlog/:id', upload.single('image'), async(req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const type = req.body.type;
  const image = req.file;
  const userID = req.params.id;

  if (!image) {
    // Handle the case when no image is uploaded
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  await Blog.uploadBlog(title, content, type, image, userID);

  res.redirect(`/myBlog/${userID}`);
});

app.get('/myBlog_displayDetail/:id', async(req, res)=>{
  const blogId = req.params.id;
  const blog = await Blog.getBlogById(blogId);
  const userId = req.user.id;
  res.render('MyBlog_DisplayDetailPage', {userName: capitalizeFirstLetter(req.user.name), userId, blog})
});

app.get('/delete/:id', async (req, res) => {
  // Extract the blog ID from the URL parameters
  const blogId = req.params.id;
  const userId = req.user.id;

  try {
    await Blog.deleteBlog(blogId);
    
    res.redirect(`/myblog/${userId}`);
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/edit/:id', async(req, res) => {
  // Extract the blog ID from the URL parameters
  const blogId = req.params.id;
  const blog = await Blog.getBlogById(blogId);
  const userId = req.user.id;

  res.render('EditBlogPage', { userName: capitalizeFirstLetter(req.user.name), blog, blogId, userId});
});

app.post('/update/:id', upload.single('image'), async(req, res) => {
  try {
    // Extract the blog ID from the URL parameters
    const blogId = req.params.id;

    // Extract the updated title and content from the request body
    const blog = await Blog.getBlogById(blogId);

    if (!blog) {
      // No blog found with the given ID
      return res.status(404).send('Blog not found');
    }

    // Update the blog in the database with the new data
    if (req.body.title !== undefined) blog.title = req.body.title;
    if (req.body.content !== undefined) blog.content = req.body.content;
    if (req.file !== undefined) blog.image = req.file.buffer;
    if (req.file !== undefined) blog.type = req.body.type;

    await Blog.updateBlog(blog);

    // Redirect to the updated blog's page or any other appropriate route
    res.redirect(`/myBlog_displayDetail/${blogId}`);
  } catch (error) {
    console.error('Error updating blog:', error);
    // Handle the error appropriately, e.g., render an error page or redirect to an error route
    res.status(500).send('Internal Server Error');
  }
});

//---------------------check app running------------------------------------------
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});