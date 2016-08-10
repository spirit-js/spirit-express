const response = require("spirit").node.response
const stream = require("stream")

class ExpressRes {
  constructor(done) {
    this._done = done
    this._state = {
      headers: false, // headers considered sent
      end: false      // socket considered closed
    }
    this._response = response().status_(0)
  }

/**
 * Equivalent to headers being flushed to the socket
 *
 * `done` is called and a response is 'returned'
 *
 * @param {boolean} stream_body - whether to convert the response body to a stream
 */
  _return(stream_body) {
    if (stream_body === true) {
      this._response.body = new stream.Transform({
        transform(data, encoding, callback) {
          this.push(data)
          callback()
        }
      })
    }

    // assume 200 if no status was ever specified
    if (this._response.status === 0) this._response.status = 200

    this._state.headers = true
    this._done(this._response)
  }

  _has_returned() {
    if (this._state.headers === true) {
      throw new Error("A Express middleware is attempting to write to headers even though they are sent")
    }
    this._has_ended()
  }

/**
 * Checks if `this._state.end` is true
 *
 */
  _has_ended() {
    if (this._state.end === true) {
      throw new Error("A Express middleware is attempting to write to `res` even though it's considered closed")
    }
  }

  status(n) {
    this._has_returned()
    this._response.status = n
    return this
  }

  // status_msg is unimportant, ignore
  writeHead(status, status_msg, headers) {
    // writeHead(0) is used to touch this function
    // to trigger any wrappers around it (some middlewares wrap)
    if (status === 0) return

    this._has_returned()

    if (!headers) headers = status_msg
    this.status(status)
    Object.keys(headers).forEach((hdr) => {
      this._response.set(hdr, headers[hdr])
    })

    this._return(true)
  }

  getHeader(header) {
    return this._response.get(header)
  }

  setHeader(header, value) {
    this._has_returned()
    this._response.set(header, value)
  }

  redirect(status, url) {
    this._has_returned()

    if (typeof url === "undefined") {
      url = status
      status = 302
    }

    this._response.status_(parseInt(status)).location(url)
    this.end()
  }

  // express API
  send(body) {
    if (this._response.status === 0) {
      this.status(200)
    }
    this.end(body)
  }

  write(chunk, encoding, callback) {
    this._has_ended()
    // if headers are not sent, then they need to be sent now
    if (this._state.headers === false) this._return(true)

    return this._response.body.write(chunk, encoding, callback)
  }

  end(body, encoding, callback) {
    this._has_ended()

    if (body) {
      if (this._state.headers === false) {
        this._response.body = body
      } else {
        // if headers are already sent then the response body
        // is a stream (which needs to be closed)
        this._response.body.end(body, encoding, callback)
      }
    }

    this._state.end = true
    if (this._state.headers === false) this._return()
  }
}

module.exports = ExpressRes
