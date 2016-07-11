const {response} = require("spirit").node

class ExpressRes {
  constructor(done) {
    this._done = done
    this._end = false
  }

  // a decorator function to check if
  // the response is meant to have ended and sent (this._end)

  // or if a response was generated but not sent
  // that is `this.response` has data
  // but `this._end` is false
  _check(ensure_resp) {
    if (this._end) {
      throw new Error("Express middleware response considered sent, but the response is still being modified")
    }
    if (ensure_resp && typeof this._response === "undefined") {
      this._response = response().status_(0)
    }
  }

  status(n) {
    this._check(true)
    this._response.status = n
    return this
  }

  // status_msg is unimportant, ignore
  writeHead(status, status_msg, headers) {
    // work around to call writeHead but not actually
    // create a response
    if (status === 0) return

    this._check(true)
    if (!headers) {
      headers = status_msg
    }

    this.status(status)

    if (!headers) {
      return
    }

    Object.keys(headers).forEach((hdr) => {
      this._response.set(hdr, headers[hdr])
    })
  }

  getHeader(header) {
    if (!this._response) {
      return undefined
    }
    return this._response.get(header)
  }

  setHeader(header, value) {
    this._check(true)
    this._response.set(header, value)
  }

  redirect(status, url) {
    if (typeof url === "undefined") {
      url = status
      status = 302
    }
    this._check(true)
    this._response.status = parseInt(status)
    this._response.location(url)
    this.end()
  }

  end() {
    this._check(false)
    this._end = true
    this._done(this._response)
  }
}

module.exports = ExpressRes
