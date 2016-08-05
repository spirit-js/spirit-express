const request = require("superagent")
const rewire = require("rewire")
const ex = rewire("../../examples/passport")

const server = ex.__get__("server")
server.close()

describe("Middleware: passport", () => {

  beforeAll(() => {
    server.listen(3009)
  })

  afterAll((done) => {
    server.close(done)
  })

  it("ok", (done) => {
    // get initial cookie, init session
    request.get("http://localhost:3009/")
      .end((err, res) => {
        const cookie = res.header["set-cookie"]

        if (!cookie) {
          return done.fail("passport example did not get a cookie back on first GET request")
        }

        request.post("http://localhost:3009/login")
          .set("Cookie", cookie)
          .send("username=testuser")
          .send("password=123")
          .end((err, res) => {
            expect(res.status).toBe(200)
            expect(res.text).toMatch(/testuser/)

            request.get("http://localhost:3009/")
              .set("Cookie", cookie)
              .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.text).toMatch(/testuser/)
                done()
              })
          })
      })
  })

})
