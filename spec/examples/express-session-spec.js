const request = require("superagent")
const rewire = require("rewire")
const ex = rewire("../../examples/express-session")

const server = ex.__get__("server")
server.close()

describe("Middleware: express-session", () => {

  beforeAll(() => {
    server.listen(3009)
  })

  afterAll((done) => {
    server.close(done)
  })

  it("ok", (done) => {
    request.get("http://localhost:3009/")
      .end((err, res) => {
        const cookie = res.header["set-cookie"]
        expect(res.status).toBe(200)
        expect(res.body.counter).toBe(1)
        request.get("http://localhost:3009/")
          .set("Cookie", cookie)
          .end((err, res) => {
            expect(res.status).toBe(200)
            expect(res.body.counter).toBe(2)
            done()
          })
      })
  })

})

