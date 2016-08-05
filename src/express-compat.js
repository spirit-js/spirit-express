const Promise = require("bluebird")
const spirit = require("spirit")
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
const init_res = (request, resolve) => {
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
 * If this has already happened, then it'll just return
 *
 * @param {request} $param - multiple types / type union
 * @return {request-map} A request map with everything in `req` part of `request`
 */
const init_req = (request) => {
  // if this is set, there was a previous Express middleware
  // so there is no need to combine nodejs `req` into request
  if (request._res) {
    return request
  }

  const r = request.req()
  Object.keys(request).forEach((k) => {
    r[k] = request[k]
  })

  if (request.url) r.originalUrl = request.url

  return r
}

const partial_response = (res, response) => {
  if (res.status !== 0) response.status = res.status
  if (res.body !== undefined) response.body = res.body

  Object.keys(res.headers).forEach((hdr) => {
    response.headers[hdr] = res.headers[hdr]
  })
  return response
}

const next = (resolve, reject) => {
  return (err) => {
    if (err) {
      return reject(err)
    }
    return resolve()
  }
}

const compat = (exp_middleware) => {
  return (handler) => {
    return (request) => {
      if (request && typeof request.req !== "function") {
        throw new Error("Unable to use Express middleware. Expected request to have the raw node.js http req available")
      }
      const req = init_req(request)

      return new Promise((resolve, reject) => {
        const res = init_res(req, resolve)
        exp_middleware(req, res, next(resolve, reject))
      }).then((resp) => {
        // resp is the resolved value of the Exp. middleware
        // and will only be populated if next() was NOT called
        // or res.end, res.writeHead was called
        // therefore we should exit early now
        if (spirit.node.is_response(resp)) {
          return resp
        }

        // always keep url correct incase a Express middleware overwrites it
        if (req.originalUrl) req.url = req.originalUrl

        // NOTE should really be handler(req).then
        // handler should always return a promise anyway
        // only our tests do not return a promise always
        return spirit.callp(handler, [req]).then((response) => {
          const res = req._res

          // partially apply whatever was written to res
          // (if any) this is only done once, and at the
          // first Express middleware that gets flow back on
          if (res._state.headers === true || res._state.end === true) return response

          // following deals with Express middlewares hack wrap:
          // some Express middlewares will wrap writeHead, end
          // since Express has no way to flow back middleware
          // thus it queues final changes over all other changes
          // due to unknown if sync/async, use Promise
          return new Promise((resolve, reject) => {
            res._return = () => {
              res._state.end = true
              res._state.headers = true
              resolve(partial_response(res._response, response))
            }
            res.writeHead(0)
            res.end()
          })

        })
      })
    }
  }
}

module.exports = {
  compat,
  next,
  init_req,
  init_res,
  partial_response
}
