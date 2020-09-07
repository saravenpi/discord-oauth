const btoa = require("btoa");
const fetch = require("node-fetch");
const url = require("url")
const redirect = encodeURIComponent(process.env.redirectURL+"/callback");
const express = require("express"),
router = express.Router();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://root:eM5tuXPF8wBgnY9i@cluster0-a1qeu.mongodb.net/pomme',{
  useNewUrlParser: true
});

// create a schema
var userSchema = new mongoose.Schema({
  name: String,
  id: String,
  bio: String
});

var user = mongoose.model('User', userSchema);


const CLIENT_ID = process.env.CLIENT_ID,
 CLIENT_SECRET = process.env.CLIENT_SECRET;

router.get("/", function(req, res) {
  res.render("index");
});

router.get("/home", (req, res) => {
  if(!req.session.username) return res.redirect("./");
  res.render("home", {
    username: req.session.username,
    avatar: req.session.avatar,
    userid:  req.session.id_user
  });
});

router.get("/login", (req, res) => {
  res.redirect(
    `https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`
  );
});

router.get("/callback", (req, res) => {
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
    .then(res => res.json())
    .then(response => {
      req.session.access_token = response.access_token;
      fetch("https://discordapp.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${response.access_token}`
        }
      })
        .then(res => res.json())
        .then(response => {
          req.session.username = `${response.username}#${response.discriminator}`;
          req.session.id_user = response.id;
          console.log(response.id)
          req.session.avatar = response.avatar;
        
        console.log("j'y suis")
        
        console.log(req.session.username);
       const kitty = new user({ name: req.session.username, id: req.session.id_user, bio: "coucouuuu" });
       kitty.save()
        console.log('meow')

      


        
        
          res.redirect("./home");
        });
    })
    .catch(console.error);
});

module.exports = router;