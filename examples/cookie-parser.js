/*
 * Example for using Express middleware "cookie-parser"
 *
 * Which parses incoming cookie information
 *
 * To test, send a request like so:
 * curl http://localhost:3009 --cookie "Cho=Kim;Greet=Hello"
 *
 * Normally you want to keep the secret a secret,
 * but it's outputted, just to visually show it's populated
 */
const spirit = require("spirit")
const route = require("spirit-router")
// normally this would be require("spirit-express")
const express = require("../index")

const http = require("http")
const cookie_parser = require("cookie-parser")

const example = (cookie, secret) => {
  return "Cookie: " + JSON.stringify(cookie) + "; Secret: " + JSON.stringify(secret)
}

const app = route.define([
  route.get("/", ["cookies", "secret"], example)
])

const middleware = [
  express(cookie_parser({ secret: "keyboardcat" }))
]

const site = spirit.node.adapter(app, middleware)

const server = http.createServer(site)
server.listen(3009)
