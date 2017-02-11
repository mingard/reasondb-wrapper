'use strict'

const Connection = require('./helpers/connection')

const Core = function (opts) {
  return new Connection(opts)
}

module.exports = function (opts) {
  return new Core(opts)
}

module.exports.Core = Core