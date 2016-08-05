const ExpressRes = require("../lib/express-res")
const stream = require("stream")

describe("ExpressRes", () => {

  describe("writeHead", () => {
    it("will return but not end and always converts the body to a stream", (done) => {
      const _done = (response) => {
        expect(response.status).toBe(123)
        expect(response.headers).toEqual({ a: 123 })
        expect(typeof response.body.pipe).toBe("function")

        expect(res._state.headers).toBe(true)
        expect(res._state.end).toBe(false)
        done()
      }
      const res = new ExpressRes(_done)
      res.writeHead(123, {
        a: 123
      })
    })
  })

  describe("write", () => {
    it("will convert resp body to stream if it isn't", (done) => {
      const _done = (response) => {
        expect(response.status).toBe(200)
        expect(response.headers).toEqual({})
        const _buf = []
        const st = new stream.Writable({
          write(chunk, encoding, callback) {
            if (chunk.toString() === "hi") done()
          }
        })
        response.body.pipe(st)
        done()
      }
      const res = new ExpressRes(_done)
      res.write("hi")
    })

    it("will write to resp body if it's a stream already")
  })

  describe("end", () => {
    it("ending with body but no resp body, doesn't create a resp body stream", (done) => {
      const _done = (response) => {
        expect(response.status).toBe(200)
        expect(response.headers).toEqual({ abc: 123 })
        expect(response.body).toBe("hi")
        done()
      }
      const res = new ExpressRes(_done)
      // none of these trigger the response body to be a stream
      res.status(200)
      res.setHeader("abc", 123)
      res.end("hi")
    })
  })

})
