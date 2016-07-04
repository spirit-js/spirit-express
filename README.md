# spirit-express
Wrap around Express API / middleware making them compatible for use with spirit.

It is _not_ meant to bring full Express API compatibility for every possible Express middleware. To keep things light and small, it currently will only support enough API to get popular Express middleware working.

Supported Express middleware and spirit middleware can be used in conjunction with each other, it's not one or the other.


[![Build Status](https://travis-ci.org/spirit-js/spirit-express.svg?branch=master)](https://travis-ci.org/spirit-js/spirit-express)
[![Coverage Status](https://coveralls.io/repos/github/spirit-js/spirit-express/badge.svg?branch=master)](https://coveralls.io/github/spirit-js/spirit-express?branch=master)

## Install
`npm install spirit-express`

## Usage


##### Notes
If your Express middleware needs something unsupported, you can of course write a (spirit) middleware for specific implementations to get your Express middleware to run.

Express error handling middleware `(err, req, res, next)` are not supported. Instead handle errors the conventional way by using `catch`.

For a full list of compatible API and middleware see [Docs](docs).
