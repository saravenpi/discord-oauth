var ejs = require("ejs");
var express = require("express");
var app = express();
const session = require("express-session");
require('dotenv').config()
var fetch = require("node-fetch");
var DiscordOauth2 = require("discord-oauth2");
var oauth = new DiscordOauth2();
var cors = require('cors');
var url = require("url")
var bodyParser = require('body-parser');
var { catchAsync } = require('./yay');
var btoa = require("btoa")
app.use(cors());
 app.use(bodyParser.json());
 app.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
 res.header(
   "Access-Control-Allow-Headers",
   "Origin, X-Requested-With, Content-Type, Accept"
 );
 next();
});


app.use(express.static("public"));
app.use(
  session({
    secret: process.env.secretSession
  })
);
app.set("view engine", "ejs");

function _encode(obj) {
  let string = "";

  for (const [key, value] of Object.entries(obj)) {
    if (!value) continue;
    string += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  return string.substring(1);
}


const redirect =process.env.redirectURL


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.get("/", function(req, res) {
  res.render("index");
});



app.get("/home", (req, res) => {
  if(!req.session.username) return res.redirect("./");
  res.render("home", {
    username: req.session.username,
    avatar: req.session.avatar,
    userid:  req.session.id_user
  });
});




app.get("/login", (req, res) => {
  res.redirect(
    `https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`
  );
});



app.get("/callback", catchAsync(async (req, res) => {

  if (!req.query.code) throw new Error('NoCodeProvided');
  var code = req.query.code;
console.log(redirect)
  let data = {
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': redirect,
    'scope': 'identify'
  }

  params = _encode(data)

  var response = await fetch(`https://discordapp.com/api/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

  var json = await response.json();
console.log(json)


      req.session.access_token = json.access_token

      fetch("https://discordapp.com/api/users/@me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${json.access_token}`
        }
      }).then(res2 => res2.json()).then(respp => {

          console.log(respp)
                  req.session.username = `${respp.username}#${respp.discriminator}`;
                  req.session.id_user = respp.id;
                  req.session.avatar = respp.avatar;

                console.log("wooow");

                res.redirect("home");

      })



}));








const listener = app.listen(process.env.PORT || 3000, function() {
  console.log("App is listening on port " + listener.address().port);
});
