const express_req = (request) => {
  // unsupported Express API:
  // req.app
  // req.baseUrl

  if (request && !request.express) {
    request.express = {

    }
  }
  return request
}

module.exports = express_req
