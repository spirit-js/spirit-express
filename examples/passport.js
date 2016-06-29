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
    console.log("here")
    done(null, { id: 123 })
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  done(null, { id: 123 })
})

const example = () => {
  return "hello"
}

const login = () => {
  return "Login"
}

const auth_middleware = [
  passport.authenticate('local', { failureRedirect: '/login' })
]

const app = route.define([
  route.get("/", [], example),
  route.get("/login", [], login),
  route.wrap(route.post("/login", [], "auth"), auth_middleware)
])

const middleware = [
  express(passport.initialize())
]

const site = spirit.node.adapter(app, middleware)
http.createServer(site).listen(3009)
