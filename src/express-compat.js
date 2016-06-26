const Promise = require("bluebird")
const ExpressRes = require("./express-res")
const express_req = require("./express-req")

const express_compat = (exp_middleware) => {
  return (handler) => {
    return (request) => {
      return new Promise((resolve, reject) => {
        const res = new ExpressRes((response) => {
          resolve(response)
        })

        const next = (err) => {
          if (err) {
            reject(err)
          }
          // TODO is res modified? (partial response)
          resolve(handler(request))
        }

        exp_middleware(express_req(request), res, next)
      })
    }
  }
}

module.exports = express_compat
