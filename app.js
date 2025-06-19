if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// MongoDB Connection
const dburl = process.env.MONGODB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

// View Engine & Middlewares
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session Store with Mongo
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in Mongo Session Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,  // ✅ typo fixed here
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));  // ✅ using correct session config
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & User Setup
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  console.log("IP Address:", req.ip);
  console.log("User-Agent:", req.get('User-Agent'));
  next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.render("home"); // ✅ Make sure views/home.ejs exists
});

// Page Not Found
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, async () => {
  console.log("server is listening to port 8080");

  // ✅ dynamic import of open
  const open = (await import('open')).default;
  open("http://localhost:8080");
});


// app.listen(8080, () => {
//   console.log("server is listening to port 8080");
// });

// if(process.env.NODE_ENV  != "production"){
//     require('dotenv').config();
// }

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
// const session = require("express-session");
// const MongoStore = require('connect-mongo');
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local")
// const User = require("./models/user.js");
// // const requestIp = require("request-ip");

// const listingRouter = require("./routes/listing.js");
// const reviewsRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");

// const dburl = process.env.MONGODB_URL;

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   // await mongoose.connect(MONGO_URL);
//   await mongoose.connect(dburl);
// }
// app.set("view engine", "ejs");
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.urlencoded({extended: true}));
// app.use(methodOverride("_method"));
// app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname, "/public")));


// const store = MongoStore.create({
//     mongoUrl: dburl,
//     crypto: {
//       secret: process.env.SECRET,
//     },
//     touchAfter: 24 * 3600,
//   });
  
//   store.on("error",()=>{
//     console.log("ERROR in Mongo Session Stor", err);
// });

// const sessionOptions = {
//     store,
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitalized: true,
//     cookie: {
//       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: true,
//     },
// };

// // app.get("/", (req, res) => {
// //   res.send("Hi, I am root");
// // });


// // app.use(session(sessionOptions));
// const session = require('express-session');

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'yourSecret',
//   resave: false,
//   saveUninitialized: false
// }));

// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
// // app.use(requestIp.mw());
// app.use((req,res,next)=>{
//   const clientIP = req.clientIp;
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currUser = req.user;
//   // console.log(req);
//     console.log("ip address",req.ip);
//     console.log(req.get('User-Agent'));
//   console.log(clientIP);
//   next();
// });


// // app.get("/demouser",async(req,res)=>{
// //   let fakeUser = new User({
// //     email: "student@gmail.com",
// //     username: "test-student"
// //   });
// //   let registeredUser = await User.register(fakeUser,"helloworld");
// //   res.send(registeredUser);
// // });

// //--------------------------------------------------//

// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewsRouter);
// app.use("/",userRouter);


// //Exception Route
// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
// });

//   // Server Side Error Handling 
// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something Went Wrong!" } = err;
//     res.status(statusCode).render("error.ejs", { message });
//     // res.status(statusCode).send(message);
// });

// app.listen(8080, () => {
//     console.log("server is listening to port 8080");
// });
