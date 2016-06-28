const spirit_express = require("../index")

describe("express req compatibility", () => {

  /*
  req.accepts()
  req.acceptsCharsets()
  req.acceptsEncodings()
  req.acceptsLanguages()
  req.get()
  req.is()
  req.param()
  req.range()
   */
  it("methods", (done) => {
    pending()
    const mw = (req, res, next) => {
      expect(req.accepts("html")).toBe("html")
      expect(req.acceptsCharsets(""))
      expect(req.get("content-type")).toBe("text/html")
      next()
    }

    const handler = (request) => {
      return "ok"
    }

    const r = spirit_express(mw)(handler)

    const mock_req = { req: function() {
      return {
        headers: {"content-type": "text/html"},
        connection: {}
      }
    }}

    r(mock_req).then(() => {
      done()
    })
  })
})

