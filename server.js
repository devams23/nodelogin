import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import bcrypt from "bcrypt";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import  initialized  from "./passportconfig.js";
import cookieParser from "cookie-parser";

const port = process.env.PORT ||  3000;
const app = express();






app.use(passport.initialize());

initialized(passport);

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.set("view engine" , "ejs");
app.use(session({
    secret : "secret",
    resave : false,
    saveUninitialized : false,
}));

app.use(cookieParser())
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());

app.use(flash()); // to send flash messages 


const db = new pg.Client({
  user: "postgres",
    host: "localhost",
    database: "nodelogin",
    password: "devam",
    port: 5432,
  });
  db.connect();

app.get("/" , (req,res)=>{
  
    res.render("index.ejs" , {
      name : req.cookies.name,
    });
});
app.get("/register" ,checkauth, (req,res)=>{ // this is when a user tries to directly logout or escape from the dashboard
    res.render("register.ejs"); 
    console.log(req.session)
});


app.get("/login" ,checkauth , (req,res)=>{
    
    res.render("login.ejs");
});


app.get("/dashboard",checknotauth , (req,res)=>{

    console.log(req.isAuthenticated());
    console.log(req.session);
    res.cookie("value" ,432);
    res.render("dashboard.ejs" , {user : req.user.name});
});

app.get("/random" , (req,res)=>{
  res.cookie("name" , "yourandomname");
  res.redirect("/");
  
});
app.get("/read" , (req,res)=>{
  console.log(req.session)
  res.send("check console");
});
app.get("/logout", (req, res) => {
  req.logOut(function(err) {
      if (err) {
          // Handle error, if any
          console.error(err);
          return next(err); // Pass the error to the next middleware
      }
      req.flash("success_msg", "Logged Out Successfully");
      res.redirect("/login" );
  });
});

// Import necessary modules and set up the app...

// Your existing code...

app.post("/register", async (req, res) => {
    try {
      let { name, registerUsername, registerPassword, confirmPassword } = req.body;
  
      let error = [];
  
      if (registerPassword.length < 6 || confirmPassword.length < 6) {
        error.push("Password must be at least 6 characters long");
      }
  
      if (registerPassword !== confirmPassword) {
        error.push("Passwords do not match");
      }
  
      if (error.length > 0) {
        res.render("register.ejs", { error });
      } 
      //// passed the validation now checking in the database
      else {
        let hashedpass = await bcrypt.hash(registerPassword, 8);
  
        const resp = await db.query("SELECT * FROM users WHERE username = $1", [registerUsername]);
  
        if (resp.rows.length > 0) {
          error.push("Username already registered");
          res.render("register.ejs", { error });
        } else {
          const resp = await db.query("INSERT INTO users(name, username, password) VALUES ($1, $2, $3) RETURNING id, password;", [name, registerUsername, hashedpass]);
          console.log(resp.rows);
          console.log(req.flash("success_msg"));
          req.flash("success_msg", "You are now registered. Please log in");
          res.redirect("/login");
        }
      }
    } catch (error) {
      console.error(error.message);
      req.flash("error_msg", "Registration failed. Please try again.");
      res.redirect("/register");
    }
  });
  
  app.post("/login", passport.authenticate("local", {successRedirect: "/dashboard",failureRedirect: "/login",failureFlash: true } , ));
  
 
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
  
  // Middleware functions...
  function checkauth(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    } else {
      next();
    }
  }
  
  function checknotauth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/login");
    }
  }
  