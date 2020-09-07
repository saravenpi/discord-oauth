var ejs = require("ejs");
var express = require("express");
var app = express();
const session = require("express-session");
require('dotenv').config()
var fetch = require("node-fetch");
var url = require("url");
var DiscordOauth2 = require("discord-oauth2");
var oauth = new DiscordOauth2();





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

  const creds = new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");

  fetch(
    `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}&scope=identify`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`
      }
    }
  )
    .then(restt => restt.json())
    .then(response => {

      req.session.access_token = response.access_token;
      oauth.getUser(response.access_token).then(ress => ress.json()).then(resuu => {

                  req.session.username = `${resuu.username}#${resuu.discriminator}`;
                  req.session.id_user = resuu.id;
                  console.log(resuu.id)
                  req.session.avatar = resuu.avatar;

                console.log("j'y suis");

                console.log(req.session.username);


                res.render("home", {
                  data: {
                    username: req.session.username,
                    avatar: req.session.avatar,
                    userid: req.session.id_user
                  }
                });

      })

    })





});
/*
  fetch(
    `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}&scope=identify`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`
      }
    }
  )
    .then(res => res.json())
    .then(response => {

      req.session.access_token = response.access_token;
      fetch("https://discordapp.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${response.access_token}`
        }


      })
        .then(res => res.json())
        .then(resuu => {

          req.session.username = `${resuu.username}#${resuu.discriminator}`;
          req.session.id_user = resuu.id;
          console.log(resuu.id)
          req.session.avatar = resuu.avatar;

        console.log("j'y suis")

        console.log(req.session.username);


        res.render("home", {
          data: {
            username: req.session.username,
            avatar: req.session.avatar,
            userid: req.session.id_user
          }
        });
        });
    })
    .catch(console.error);
});
*/







const listener = app.listen(process.env.PORT || 3000, function() {
  console.log("App is listening on port " + listener.address().port);
});
