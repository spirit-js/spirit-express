const request = require("superagent")
const rewire = require("rewire")
const ex = rewire("../../examples/body-parser")

const server = ex.__get__("server")
server.close()

describe("Middleware: body-parser", () => {

  beforeAll(() => {
    server.listen(3009)
  })

  afterAll((done) => {
    server.close(done)
  })

  it("json ok", (done) => {
    request.post("http://localhost:3009/")
      .send({ test: "hi", data: 123 })
      .end((err, res) => {
        expect(res.status).toBe(200)
        expect(res.text).toBe('body is: {"test":"hi","data":123}')
        done()
      })
  })

  it("url encoded ok", (done) => {
    request.post("http://localhost:3009/")
      .send("test=hi&data=123")
      .end((err, res) => {
        expect(res.status).toBe(200)
        expect(res.text).toBe('body is: {"test":"hi","data":"123"}')
        done()
      })
  })

})
