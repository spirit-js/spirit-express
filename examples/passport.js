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

passport.use(new Strategy(
  function(username, password, done) {
    done(null, { id: 123 })
  }
))

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  done(null, { id: 123 })
})

const example = (user) => {
  if (user) {
    return "Hello " + user + ", you are Logged in!"
  }
  return "You are not logged in"
}

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
  route.get("/", ["user"], example),
  route.get("/login", [], login),
  route.wrap(route.post("/login"), auth_middleware)
])

const middleware = [
  express(require("body-parser").urlencoded({extended: true})),
  express(require("cookie-parser")),
  express(require("session")({ secret: "keyboardcat" })),
  express(passport.initialize()),
  express(passport.session())
]

const site = spirit.node.adapter(app, middleware)
http.createServer(site).listen(3009)
