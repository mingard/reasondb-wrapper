'use strict'

const _ = require('underscore')
const path = require('path')
const utils = require('../utils')

class Query {
  constructor (root, db, key) {
    this.db = db
    this.root = root
    this.key = key
  }

  use (target) {
    this.target = target
    utils.createDir(path.join(this.root, this.target.name))
    return this
  }

  filter (filters) {
    this.filters = filters
    return this
  }

  page (offset) {
    this.offset = offset
    return this
  }

  limit (pagesize) {
    this.pagesize = pagesize
    return this
  }

  fields (pluck) {
    // Fix this
    this.pluck = pluck
    return this
  }

  get () {
    this.output = 'GET'
    console.log("IS", this.start)
    this.start = this.start
    console.log("IS", this.start)
    // Temporary
    let where = {$obj: this.filters}
    if (!where['$obj'][this.key]) {
      where['$obj'][this.key] = {$neq: null}
    }

    let fetch = this.db
    .select()

    if (this.target) {
      fetch = fetch.from({$obj: this.target})
    }
    fetch = fetch.where(where)

     if (this.pagesize) {
      fetch.limit(this.pagesize).page(this.offset)
    }
     this.results = fetch.exec()
     return this.results
  }

  post (data) {
    this.output = 'POST'
    this.data = data
    let insert = this.db.insert(...this.data)

    if (this.target) {
      this.results = insert.into(this.target).exec()
    } else {
      this.results = insert.exec()
    }
    return this.results
  }

  update (id, data) {
    this.output = 'PUT'
    this.start = this.start
    this.data = data
    let fetch = this.db
    .update({$obj: this.target})

    fetch = fetch.set({$obj: this.data[0]})

    fetch = fetch.where({$obj: this.formatDocQuery(id)})

    this.results = fetch.exec()
    return this.results
  }

  delete (id) {
    this.output = 'DELETE'
    this.start = this.start

    let fetch = this.db
    .delete()

    if (this.target) {
      fetch = fetch.from({$obj: this.target})
    }

    fetch = fetch.where({$obj: this.formatDocQuery(id)})

    this.results = fetch.exec()
    return this.results
  }
  
  out (query) {
    return query.then((docs, err) => {
      return this.output(docs, err)
    })
  }
  // This can be removed when working with reasondb version ^0.2.10
  cleanse (data) {
    return _.map(data, (entry) => {
      return _.pick(entry, (value, key, object) => {
        return !_.isEmpty(value) && !_.isNull(value)
      })
    })
  }

  formatRow (row) {
    if (this.pluck && Object.keys(this.pluck).length > 0) {
      return _.pick(row[0], (value, key, object) => {
        return this.pluck[key] || this.requiredFields[key]
      })
      return
    } else {
      return _.pick(row[0], (value, key, object) => {
        return true
      })
    }
  }

  format (resp) {
    let response = {
      results: []
    }
    if (resp.constructor.name !== 'Cursor') {
      response.results = resp
      return response
    }

    response.metadata = this.metadata(resp)

    return resp.forEach((row) => {
      response.results.push(this.formatRow(row))
    }).then(() => {
      if (this.resultsOnly) {
        return response.results
      }
      return response
    }).catch((e) => {
      console.log(e)
    })
  }

  metadata (resp) {
    return {
        totalCount: resp.maxCount,
        duration: this.duration
      }
  }

  onlyResults (value) {
    this.resultsOnly = _.isUndefined(value) ? true : value
    return this
  }

  defaultOutput (docs, err) {
    return docs
  }

  getOutput (docs, err) {
    return this.format(docs)
  }

  putOutput (docs, err) {
    return this.format(this.data)
  }

  postOutput (docs, err) {
    return this.format(docs)
  }

  deleteOutput (docs, cursor) {
    return { success: (docs.length && docs[0] === true) ? true : false }
  }

  formatDocQuery (id) {
    return {[`${this.key}`]: {$eq: id}}
  }

  get output () {
    return this._output
  }

  set output (method) {
    let outputMethods = {
      GET: this.getOutput,
      POST: this.postOutput,
      PUT: this.putOutput,
      DELETE: this.deleteOutput,
      undefined: this.defaultOutput
    }
    this._output = outputMethods[method]
  }

  get db () {
    return this._db
  }
  set db (value) {
    this._db = value
  }

  // Move following getters to Query class
  
  get filters () {
    return this._filters
  }

  set filters (filters) {
    let filterObj = _.isObject(filters) ? filters : JSON.parse(filters)
    this._filters = utils.setDeep(filterObj)
  }

  get pagesize () {
    return this._pagesize || null
  }

  set pagesize (value) {
    this._pagesize = !_.isUndefined(value) && value > 0 ? value : null
  }

  get offset () {
    return this._offset || 0
  }

  set offset (value) {
    this._offset = value
  }

  get resultsOnly () {
    return this._resultsOnly || false
  }

  set resultsOnly (value) {
    this._resultsOnly = value || false
  }

  get results () {
    return this.out(this._results)
    // return this.out()
  }

  set results (value) {
    this._results = value
  }

  get pluck () {
    return this._pluck
  }

  set pluck (pluck) {
    this._pluck = !_.isUndefined(pluck) ? (_.isObject(pluck) ? pluck : JSON.parse(pluck)) : null
  }

  // Data
  get data () {
    return this._data
  }

  set data (value) {
    this._data = this.cleanse(_.isArray(value) ? value : [value])
  }

  get duration () {
    return (Date.now() - this.start)/1000
  }

  get start () {
    return this._start
  }

  set start (value) {
    this._start = value || Date.now()
  }

  get requiredFields () {
    // Always include key
    return {[`${this.key}`]: 1}
  }

}

module.exports = Query
