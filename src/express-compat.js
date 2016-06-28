const Promise = require("bluebird")
const {utils} = require("spirit")
const ExpressRes = require("./express-res")

/**
 * Create a Express `res` like object to pass
 * to Express middleware
 * If it's already been created, re-assign it's done callback
 * as the previous (Express middleware) never used it
 *
 * @param {request-map} request - spirit request map
 * @param {function} resolve - Promise resolve
 * @return {ExpressRes}
 */
const init_resp = (request, resolve) => {
  if (!request._res) {
    request._res = new ExpressRes(resolve)
  } else {
    request._res._done = resolve
  }
  return request._res
}

/**
 * transform `request` to be `request` and `req` combined together
 * If it's already done then do nothing
 *
 * @param {request} $param - multiple types / type union
 * @return {request-map} A request map with everything in `req` part of `request`
 */
const init_req = (request) => {
  // if this is set, there was a previous Express middleware
  // so there is no need to combine req into request
  if (request._res) {
    return request
  }

  const r = request.req()
  Object.keys(request).forEach((k) => {
    r[k] = request[k]
  })

  r.originalUrl = request.url
  return r
}

const express_compat = (exp_middleware) => {
  return (handler) => {
    return (request) => {
      return new Promise((resolve, reject) => {
        if (request && typeof request.req !== "function") {
          throw new Error("Unable to use Express middleware. Expected request to have the raw node.js http req available")
        }

        const req = init_req(request)
        const res = init_resp(request, resolve)

        const next = function(err) {
          if (err) {
            return reject(err)
          }

          // always keep url correct incase a Express middleware overwrites it
          req.url = req.originalUrl

          resolve(utils.callp(handler, [req])
                  .then((response) => {
                    if (request._res._response) {
                      // a partial response was made so combine
                      // it with `response` TODO
                    }
                    return response
                  }))
        }

        exp_middleware(req, res, next)
      })
    }
  }
}

module.exports = express_compat
