/*
 * Example for using Express middleware "body-parser"
 *
 * To test, send a POST request with some body data
 * For example using 'curl':
 * curl --data "a=123&b=hello" http://localhost:3009/
 *
 */
const http = require("http")
const spirit = require("spirit")
const {route} = require("spirit-router")

// normally this would be require("spirit-express")
const express = require("../index")

const body_parser = require("body-parser")

const example = (body) => {
  return "body is: " + JSON.stringify(body)
}

const app = route.define([
  route.post("/", ["body"], example)
])

const middleware = [
  express(body_parser.json()),
  express(body_parser.urlencoded({ extended: true }))
]

const site = spirit.node.adapter(app, middleware)

const server = http.createServer(site)
server.listen(3009)
