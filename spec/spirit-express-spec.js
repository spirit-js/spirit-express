const spirit_express = require("../index")
const spirit = require("spirit")

describe("spirit-express", () => {
  const compat = spirit_express

  let mock_req

  beforeEach(() => {
    mock_req = {
      req: function() {
        return {}
      }
    }
  })

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

    const result = h(mock_req)
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

    const result = h(mock_req)
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

  it("changes the request-map to be a node `req` with the original request map properties added to it (with the exception of request.req)", (done) => {
    const exp = (req, res, next) => {
      next()
    }

    const mw = compat(exp)

    mock_req = {
      a: 123,
      blah: "hi",
      req: function() {
        return { req1: true, req: "doesn't copy over" }
      }
    }

    const handler = mw((request) => {
      expect(request).toEqual(jasmine.objectContaining({
        a: 123,
        blah: "hi",
        req1: true,
        req: mock_req.req
      }))
    })

    handler(mock_req).then(done)
  })

  it("maintains request url if a Express middleware overwrites it", (done) => {
    const exp = (req, res, next) => {
      req.url = "overwrite"
      next()
    }

    const mw = compat(exp)

    mock_req.url = "hi"

    const handler = mw((request) => {
      expect(request.url).toBe("hi")
    })

    handler(mock_req).then(done)
  })

  it("Express middleware and spirit middleware can be used together", (done) => {
    const handler = (request) => {
      expect(request.called).toBe(".1234")
      expect(request.url).toBe("/hi")
      return "ok"
    }

    const mw = [
      (handler) => {
        return (request) => {
          request.called += "4"
          return handler(request)
        }
      },
      compat((req, res, next) => {
        req.called += "3"
        next()
      }),
      (handler) => {
        return (request) => {
          request.called += "2"
          return handler(request)
        }
      },
      compat((req, res, next) => {
        req.called += "1"
        req.url = "/oops"
        next()
      })
    ]

    const reducer = spirit.compose(handler, mw)
    mock_req.called = "."
    mock_req.url = "/hi"
    reducer(mock_req).then((response) => {
      expect(response).toBe("ok")
      done()
    })
  })

  it("it makes Express middleware support spirit middlewares flow back, if a Express middleware tries to set properties on the `res` object, but does not actually try to 'send' it; it will apply these settings to a response map that flows back")
})
