const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();
const twilio = require('twilio');
const adminRoute = require("./routes/adminAuth")
const appoitmentRoute = require("./routes/appoitment");
const userRoute = require("./routes/userAuth");
const session = require("express-session")
// const RedisStore = require('connect-redis')(session)
const blogRoute = require("./routes/blog");
const adminAuth = require("./middlewire/auth");
const meetingRoute = require("./routes/meeting");
const commentRoute = require("./routes/comment")
const blogAuth = require("./middlewire/blogAuth");
const Post = require("./models/post");
const authenticate = require("./middlewire/authenticate.js");
const compression = require("compression");
const cors = require('cors');
const https = require('https');
// Step 1:
dotenv.config();
// Step 2:
app.use(express.json());
app.use(compression())
// add cors middleware to your app
app.use(cors());
// Step 3:
app.use(express.static("public"));

// Step 4:
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);


// Session 
app.use(session({
  cookie:{
    secure: true,
    maxAge:60000
  },
  // store: new RedisStore(),
  secret:process.env.sessionSecret,
  resave:false,
  saveUninitialized:true
},
))

// Middle cors 
const adminCorsOptions = {
  origin: ['https://example.com', 'https://www.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}

app.get("/hello",(req,res)=>{
  res.send("Hello");
})



const PORT = process.env.PORT || 5500;
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid,authToken);

app.post('/send-sms',(req,res)=>{
  const {to,body} = req.body;
  client.messages.create({
    // body:"The meeting link for scgeduled appointment is:"+link,
    // to:"+91"+phone,
    body:body,
    to:to,
    from:'+14406643564'
  }).then(function(result){
    res.status(200).json({result});
    console.log("Done")
  }).catch((error)=>{
    console.log(error)
    res.status(500).send("Error");
  })
})


app.use("/api/appoitment",cors(adminCorsOptions),appoitmentRoute),
app.use("/api/blog",cors(adminCorsOptions),blogRoute);
// app.use("/api/user/auth",limitter.registerLimitter,userRoute);
app.use("/api/user/auth",cors(adminCorsOptions),userRoute);
app.use("/api/admin/auth",cors(adminCorsOptions),cors(adminCorsOptions),adminRoute);
app.use("/api/appoitment/meeting",cors(adminCorsOptions),meetingRoute),
app.use("/api",cors(adminCorsOptions),commentRoute);


app.get("/autocomplete",cors(adminCorsOptions),(req,res,next)=>{
  var regex = new RegExp(req.query["term"],'i')

  var postFilter = Post.find({username:regex},{'username':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
  postFilter.exec((err,data)=>{
   
    var result = [];
    if(!err){
      if(data && data.length && data.length>0){
        data.forEach(posts=>{
          let obj = {
            id:posts._id,
            label:posts.username
          };
          req.session.searchQuery = obj;
          result.push(obj)
        });
      }
      // console.log(result); 
      res.status(200).jsonp(result);
    }
  })
})
// Index
app.get("/", cors(adminCorsOptions),function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
// Blog sidebar
app.get("/blog-sidebar",cors(adminCorsOptions), function (req, res) {
  res.sendFile(__dirname + "/public/blog-sidebar.html");
});
// Single-Blog
app.get("/blog-single",cors(adminCorsOptions), function (req, res) {
  res.sendFile(__dirname + "/public/blog-single.html");
});
// Department
app.get("/department",cors(adminCorsOptions),function (req, res) {
  res.sendFile(__dirname + "/public/department.html");
});
// About
app.get("/about",cors(adminCorsOptions), function (req, res) {
  res.sendFile(__dirname + "/public/about.html");
});
// Contact
app.get("/contact",cors(adminCorsOptions), function (req, res) {
  res.sendFile(__dirname + "/public/contact.html");
});
//Create Blog Form
app.get("/create/post",cors(adminCorsOptions),authenticate.isAuthenticated,(req,res)=>{
  res.sendFile(__dirname + "/public/create.html")
});
//Register Page
app.get("/posts/account",cors(adminCorsOptions),(req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});
// Login Page
app.get("/posts/login",cors(adminCorsOptions), (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});
// User Login
app.get("/log",cors(adminCorsOptions),adminAuth.isLogout,(req,res)=>{
  res.sendFile(__dirname + '/public/userLogin.html')
})
// User Register
app.get("/reg",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/userRegister.html')
})
// Admin page
app.get("/admin",cors(adminCorsOptions),adminAuth.isLogin,(req,res)=>{
  res.sendFile(__dirname + '/public/admin.html')
})
// Patient Appoitment
app.get("/appoinment",cors(adminCorsOptions),(req, res) => {
  res.sendFile(__dirname + "/public/appoinment.html");
});
// UserPanel 
app.get("/userpanel",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/userPanel.html')
})
app.get("/register/blog",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/register.html')
})
app.get("/login/blog",cors(adminCorsOptions),blogAuth.isLogout,(req,res)=>{
  res.sendFile(__dirname + '/public/login.html')
})
app.get("/406/error",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/406.html')
})
app.get("/500/error",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/500.html')
})
app.get("/402/error",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/402.html')
})
app.get("/forgot-password",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/forgot.html')
})
app.get("/resetPassword",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/reset-password.html');
})
app.get("/contact",cors(adminCorsOptions),(req,res)=>{
  res.sendFile(__dirname + '/public/contact.html');
})


// Setting the Port...
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
// app.listen(PORT, function () {
//   console.log(`Server listening to the port:${PORT}`);
// });
