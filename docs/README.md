## Compatibility
The following Express middleware is tested and expected to work (see [../examples](../examples)):
- body-parser
- cookie-parser
- express-session
- multer
- passport

##### req
The `req` obj passed to each Express middleware is the original node.js `req` object.

It currently does not support any Express related `req` API currently.

##### res
The `res` obj passed to each Express middleware is _not_ the original node.js `res` object.

It current supports the following:

`res.redirect`
Exactly as Express supports this.

`res.end`
It is not a equivalent to node.js's version. It does not accept any arguments, it is meant to just end the response.
