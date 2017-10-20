const request = require("superagent")
const rewire = require("rewire")
const ex = rewire("../../examples/multer")

const server = ex.__get__("server")
server.close()

describe("Middleware: multer", () => {

  beforeAll(() => {
    server.listen(3009)
  })

  afterAll((done) => {
    server.close(done)
  })

  it("ok", (done) => {
    request.post("http://localhost:3009/upload")
      .attach("file", "./README.md")
      .end((err, res) => {
        expect(res.status).toBe(200)

        const f = res.body
        expect(f.originalname).toBe("README.md")
        expect(f.mimetype).toBe("text/markdown")
        expect(f.destination).toBe("uploads/")
        expect(f.path).toMatch(/uploads\//)
        done()
      })
  })

})
