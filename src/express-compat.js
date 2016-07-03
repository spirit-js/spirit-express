const Promise = require("bluebird")
//Promise.onPossiblyUnhandledRejection(function(e, promise) {
//  throw "Uncaught error: " + e;
//});
const spirit = require("spirit")
const ExpressRes = require("./express-res")
//const express_req = require("./express-req")

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
 * attach Express req properties and methods
 *
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

  if (request.url) r.originalUrl = request.url

  //return express_req(r)
  return r
}

const partial_response = (res, response) => {
  if (res.status !== 0) response.status = res.status
  if (res.body) response.body = res.body

  Object.keys(res.headers).forEach((hdr) => {
    response.headers[hdr] = res.headers[hdr]
  })
  return response
}

const express_next = (resolve, reject, req, handler) => {
  return (err) => {
    if (err) {
      return reject(err)
    }

    // always keep url correct incase a Express middleware overwrites it
    if (req.originalUrl) req.url = req.originalUrl

    resolve(spirit.utils.callp(handler, [req])
            .then((response) => {
              // some Express middleware modify the `res` obj
              // but do not call `res.end`
              // or they do a hack and wrap `res.end`
              // or `res.writeHead` expecting it to always be
              // called eventually
              //
              // both instances are considered partial responses
              // so we apply the changes now as part of
              // spirit middleware flowing back
              //
              // this doesn't guarantee the changes are the last
              // that depends entirely on where this middleware
              // is placed to determine the order
              //
              // this partial response being applied __only__
              // happens once (first middleware hit on
              // flow back), all other Express middleware
              // will simply just return
              if (req._res._end || !spirit.node.response.is_response(response)) {
                return response
              }

              const p = new Promise((resolve, reject) => {
                req._res._done = (resp) => {
                  if (spirit.node.response.is_response(resp)) {
                    response = partial_response(resp, response)
                  }
                  resolve(response)
                }
                // calling writeHead with 0 is a 'hack'
                // to not actually create a response, if there
                // wasn't already one, simply want to trigger
                // any Express middleware wrappers
                req._res.writeHead(0)
                req._res.end()
              })
              return p
            }))
  }
}

const express_compat = (exp_middleware) => {
  return (handler) => {
    return (request) => {
      return new Promise((resolve, reject) => {
        if (request && typeof request.req !== "function") {
          throw new Error("Unable to use Express middleware. Expected request to have the raw node.js http req available")
        }
        const req = init_req(request)
        const res = init_resp(req, resolve)
        exp_middleware(req, res, express_next(resolve, reject, req, handler))
      })
    }
  }
}

module.exports = express_compat
