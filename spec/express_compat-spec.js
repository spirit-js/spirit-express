const compat = require("../lib/express-compat")
const ExpressRes = require("../lib/express-res")

describe("express compat", () => {
  const mock_res = {
    req: () => { return {} }
  }

  const handler = () => {}

  it("passes a ExpressRes object as `res`", (done) => {
    const middleware = (req, res, next) => {
      expect(res instanceof ExpressRes).toBe(true)
      expect(typeof res.redirect).toBe("function")
      done()
    }
    compat(middleware)(handler)(mock_res)
  })

  it("errors in Exp Middleware get caught in Promise", (done) => {
    const middleware = (req, res, next) => {
      res.asdag() // doesn't exist, should throw
      next()
    }

    compat(middleware)(handler)(mock_res).catch((err) => {
      expect(err).toMatch(/TypeError/)
      done()
    })
  })

  it("next(err) in Exp Middleware get caught in Promise", (done) => {
    const middleware = (req, res, next) => {
      next("an error")
    }
    compat(middleware)(handler)(mock_res).catch((err) => {
      expect(err).toBe("an error")
      done()
    })
  })

})
