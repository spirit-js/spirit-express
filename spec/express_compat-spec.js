const compat = require("../lib/express-compat").compat
const ExpressRes = require("../lib/express-res")
const stream = require("stream")

describe("express compat", () => {
  const mock_req = {
    req: () => { return {} }
  }

  const handler = () => {}

  it("passes a ExpressRes object as `res`", (done) => {
    const middleware = (req, res, next) => {
      expect(res instanceof ExpressRes).toBe(true)
      expect(typeof res.redirect).toBe("function")
      done()
    }
    compat(middleware)(handler)(mock_req)
  })

  it("errors in Exp Middleware get caught in Promise", (done) => {
    const middleware = (req, res, next) => {
      res.asdag() // doesn't exist, should throw
      next()
    }

    compat(middleware)(handler)(mock_req).catch((err) => {
      expect(err).toMatch(/TypeError/)
      done()
    })
  })

  it("next(err) in Exp Middleware get caught in Promise", (done) => {
    const middleware = (req, res, next) => {
      next("an error")
    }
    compat(middleware)(handler)(mock_req).catch((err) => {
      expect(err).toBe("an error")
      done()
    })
  })

  // Though technically not a middleware but a Express handler
  it("example: Exp 'middleware' that streams", (done) => {
    const middleware = (req, res, next) => {
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform"
      })

      res.write("1")
      res.write("2")
      setTimeout(() => {
        res.write("3")
      }, 10)
    }

    compat(middleware)(handler)(mock_req).then((resp) => {
      expect(resp.status).toBe(200)
      expect(resp.headers).toEqual({
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform"
      })

      const _buf = []
      const st = new stream.Writable({
        write(chunk, encoding, callback) {
          _buf.push(chunk.toString())
          callback()
          if (_buf.join("") === "1243") done()
        }
      })

      resp.body.pipe(st)
      resp.body.write("4")
    })
  })

})
