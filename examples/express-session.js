/*
 * Example for using Express middleware "express-session"
 *
 */
const {response, adapter} = require("spirit").node
const route = require("spirit-router")
// normally this would be require("spirit-express")
const express = require("../index")

const http = require("http")
const session = require("express-session")

const example = (session) => {
  if (!session.counter) session.counter = 0
  session.counter += 1
  return response(JSON.stringify(session)).type("json")
}

const app = route.define([
  route.get("/", ["session"], example)
])

const middleware = [
  express(session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: true
  }))
]

const site = adapter(app, middleware)

const server = http.createServer(site)
server.listen(3009)
