const request = require("superagent")
const rewire = require("rewire")
const ex = rewire("../../examples/cookie-parser")

const server = ex.__get__("server")
server.close()

describe("Middleware: cookie-parser", () => {

  beforeAll(() => {
    server.listen(3009)
  })

  afterAll((done) => {
    server.close(done)
  })

  it("parses cookies ok", (done) => {
    request.get("http://localhost:3009/")
      .set("Cookie", "Cho=Kim;Greet=Hello")
      .end((err, res) => {
        expect(res.status).toBe(200)
        expect(res.text).toBe('Cookie: {"Cho":"Kim","Greet":"Hello"}; Secret: {"secret":"keyboardcat"}')
        done()
      })
  })

})
