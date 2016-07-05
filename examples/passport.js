/*
 * Example for using Express middleware "passport"
 *
 *
 */
const http = require("http")
const spirit = require("spirit")
const {route} = require("spirit-router")

// normally this would be require("spirit-express")
const express = require("../index")

const passport = require("passport")
const Strategy = require('passport-local').Strategy

/*
 * Since it's just an example, every authentication passes
 */
passport.use(new Strategy(
  (username, password, done) => {
    done(null, { id: username })
  }
))
passport.serializeUser((user, done) => {
  done(null, user.id)
})
passport.deserializeUser((id, done) => {
  done(null, { id: id })
})

const example = (user, sessionid) => {
  if (user) {
    return "Hello " + user.id + ", you are Logged in!"
  }
  return "You are not logged in, <a href='/login'>Login</a>"
}

// just show a simple login form to get the idea
const login = () => {
  return "<form method='post' action='/login'><input name='username' type='text'><input name='password' type='password'><input type='submit'></form>"
}

const auth_middleware = [
  express(passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  }))
]

const app = route.define([
  route.get("/", ["user", "sessionID"], example),
  route.get("/login", [], login),
  route.wrap(route.post("/login"), auth_middleware)
])

const middleware = [
  express(require("body-parser").urlencoded({extended: true})),
  express(require("express-session")({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: true
  })),
  express(passport.initialize()),
  express(passport.session())
]

const site = spirit.node.adapter(app, middleware)

const server = http.createServer(site)
server.listen(3009)
