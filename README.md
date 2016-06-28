# spirit-express
Wrap around Express API / middleware making them compatible for use with spirit.

Express and spirit middleware can be used in conjunction with each other, it's not one or the other.


[![Build Status](https://travis-ci.org/spirit-js/spirit-express.svg?branch=master)](https://travis-ci.org/spirit-js/spirit-express)
[![Coverage Status](https://coveralls.io/repos/github/spirit-js/spirit-express/badge.svg?branch=master)](https://coveralls.io/github/spirit-js/spirit-express?branch=master)

## Install
`npm install spirit-express`

## Usage


##### Notes
- The following `req` properties and methods are not support: `req.app`, `req.baseUrl`

If your Express middleware needs these, you can of course write a (spirit) middleware for specific implementations to get your Express middleware to run.

- Express error handling middleware `(err, req, res, next)` are not supported. Instead handle errors the conventional way by using `catch`.

- "originalUrl", "req", "_res" are special properties for the request or req, if a Express middleware overwrites these it may cause problems.

- It changes the original request map in spirit to be a `req` object with all the request map data moved over. Should have no functional impact.

