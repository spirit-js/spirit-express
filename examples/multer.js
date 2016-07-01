/*
 * Example for using Express middleware "multer"
 *
 */
const http = require("http")
const spirit = require("spirit")
const {route, response} = require("spirit-router")
// normally this would be require("spirit-express")
const express = require("../index")

const multer = require("multer")

const upload =  multer({ dest: 'uploads/' })

const up = (file) => {
  return response(JSON.stringify(file)).type("json")
}

// return a simple form to try out multer instead of using
// something like curl to see that it works
const home = () => {
  return "<form action='/upload' method='post' enctype='multipart/form-data'><input type='file' name='file'><input type='submit'></form>"
}

const upload_middleware = [express(upload.single("file"))]

const app = route.define([
  route.get("/", [], home),
  route.wrap(route.post("/upload", ["file"], up), upload_middleware)
])

const site = spirit.node.adapter(app, [])

const server = http.createServer(site)
server.listen(3009)
