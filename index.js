import express from "express";
import session from "express-session";

var app = express();
const port = 3000;

app.use(session({
  secret : "fsa",
  saveUninitialized : false,
  resave : false,
}))

app.get("/", (req,res)=>{
  req.session.ban = true;
  req.session.idd = 78;
  res.send("okay")
})
app.get("/get" , (req,res)=>{
  console.log(req.session)
  res.send("done")
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });