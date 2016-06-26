const {response} = require("spirit-router")

class ExpressRes {
  constructor(done) {
    this._done = done
    this._end = false
    this._response = response("")
  }

  // a decorator function to check if
  // the response is meant to have ended and sent (this._end)

  // or if a response was generated but not sent
  // that is `this.response` has data
  // but `this._end` is false
  _check() {
    if (this._end) {
      throw new Error("Express middleware response considered sent, but the response is still being modified")
    }
    if (typeof this._response === "undefined") {
      this._response = response("")
    }
  }

  // Express 4.11.0+
  // append modifies headers, set resets header
  append(field, ...v) {
    this._check()
  }

  attachment() {
    
  }

  cookie() {
    
  }

  status(n) {
    this._check()
    this._response.status = n
    return this
  }

  sendFile() {
    this._check()
  }

  redirect() {
    this._check()
  }

  end() {
    this._check()
    this._end = true
    this._done(this._response)
  }
}

module.exports = ExpressRes
