const spirit_express = require("../index")

describe("spirit-express", () => {
  const compat = spirit_express.compat

  // express middleware next(), passes the response of other
  // middlewares through
  it("Returns a compatible spirit middleware", (done) => {
    const exp = (req, res, next) => {
      next()
    }
    const mw = compat(exp)

    const h = mw((request) => {
      return "ok"
    })

    const result = h()
    result.then((response) => {
      expect(response).toBe("ok")
      done()
    })
  })

  // express middleware full response, doesn't call middlewares
  // that come after as it already knows what to write back
  it("when the `res` obj returns early, it stops other middleware after from being called, and returns a response map", (done) => {
    const exp = (req, res, next) => {
      // return early with a result without calling middleware or handlers after
      res.status(123).end()
    }
    const mw = compat(exp)

    const h = mw((request) => {
      // this never runs since the Express middleware `exp`
      // returns early with a result already
      throw new Error("should never get called")
    })

    const result = h()
    result.then((response) => {
      // the result of a Express middleware always gets converted
      // to a spirit response map
      expect(response).toEqual(jasmine.objectContaining({
        status: 123,
        headers: {},
        body: ""
      }))
      done()
    })
  })

  // express middleware partial response, passes response
  // through, but modifies the response that comes back through
  it("calls Express middleware with a compatible `res`")

  it("calls Express middleware with a compatible `req`")

})
