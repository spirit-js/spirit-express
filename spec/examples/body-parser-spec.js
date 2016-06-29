const request = require("superagent")
const rewire = require("rewire")
const ex = rewire("../../examples/body-parser")


describe("Middleware: body-parser", () => {
  let server = ex.__get__("server")

  afterAll(() => {
    server.close()
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
