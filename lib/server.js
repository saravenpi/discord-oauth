var ejs = require("ejs");
var express = require("express");
var app = express();
const session = require("express-session");
require('dotenv').config()
var fetch = require("node-fetch");
var url = require("url");
var DiscordOauth2 = require("discord-oauth2");
var oauth = new DiscordOauth2();
var { get, post } = require('snekfetch');




app.use(express.static("public"));
app.use(
  session({
    secret: process.env.secretSession
  })
);
app.set("view engine", "ejs");




var redirect = encodeURIComponent(process.env.redirectURL+"/callback");


var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;

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
    `https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`
  );
});




app.get("/callback", (req, res) => {
  let code = req.query.code;

  if (!code) throw new Error("NoCodeProvided");

  const creds = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");

  post(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}`)
      .set('Authorization', `Basic ${creds}`).then(response => {

      req.session.access_token = response.access_token;



      get('https://discordapp.com/api/v6/users/@me/guilds')
      .set('Authorization', `Bearer ${response.access_token}`).then(resuu => {
          console.log(resuu)
                  req.session.username = `${resuu.username}#${resuu.discriminator}`;
                  req.session.id_user = resuu.id;
                  console.log(resuu.id)
                  req.session.avatar = resuu.avatar;

                console.log("j'y suis");

                console.log(req.session.username);


                res.redirect("home", {
                  data: {
                    username: req.session.username,
                    avatar: req.session.avatar,
                    userid: req.session.id_user
                  }
                });

      })

    })





});








const listener = app.listen(process.env.PORT || 3000, function() {
  console.log("App is listening on port " + listener.address().port);
});
