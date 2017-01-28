'use strict'

const _ = require('lodash')

const Utils = function () {
  
}

Utils.prototype.getDeep = function ({object, property}) {
  let elems = Array.isArray(property) ? property : property.split('.')
  let name = elems[0]
  let value = object[name]
  if (elems.length <= 1) {
    return value
  }
  // Note that typeof null === 'object'
  if (value === null || typeof value !== 'object') {
    return undefined
  }
  return this.deep(value, elems.slice(1))
}

Utils.prototype.setDeep = function (filterObj) {
  _.each(filterObj, (value, keys) => {
    let split = keys.split('.')
    if (split.length < 2) return 
    delete filterObj[keys]
    _.set(filterObj, split, {$eq: value})
  })
  console.log("OUT", filterObj)
  return filterObj
}

module.exports = new Utils()
