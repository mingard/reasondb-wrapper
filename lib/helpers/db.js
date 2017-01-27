'use strict'

const _ = require('underscore')
const path = require('path')
const mkdirp = require('mkdirp')

class Product {
  
}

class DB {
  constructor () {
  }

  use (target) {
    this.target = target
    this.createDir(this.target.name)
    return this
  }

  filter (filter) {
    // console.log("FILTER", JSON.parse(filter))
    // this.filter = JSON.parse(filter)
    this.filter = {}
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

  fields (fields) {
    this._fields = JSON.parse(fields) || null
    return this
  }

  get () {
    this.start = this.start
    // Temporary
    let where = {$obj: this.filter}
    where['$obj'][this.key] = {$neq: null}

    let fetch = this.db
    .select()
    .limit(this.pagesize)
    .page(this.offset)

    if (this.target) {
      fetch = fetch.from({$obj: this.target})
    }
     fetch = fetch.where(where)
     this.results = fetch.exec()
     return this.results
  }

  post (data) {
    this.data = data
    let insert = this.db.insert(...this.data)
    if (this.target) {
      this.results = insert.into(this.target).exec()
    } else {
      this.results = insert.exec()
    }

    return this.results
  }

  createDBDirs () {
    let primatives = ['Array', 'Date', 'String', 'Object', 'Number', 'Boolean', 'Pattern']
    _.each(primatives, (primative) => {
      this.createDir(primative)
    })
  }

  createDir (dir) {
    // Currently it seems to be a requirement to create the folders within the DB directory. Failure to do so throws errors
    mkdirp.sync(path.join(this.root, dir))
  }
  
  out (query) {
    return query.then((docs, err) => {
      if (docs.constructor.name === 'Cursor') {
        return this.format(docs)
      }
      return docs
    })
  }

  cleanse (data) {
    return _.map(data, (entry) => {
      return _.pick(entry, (value, key, object) => {
        return !_.isEmpty(value) && !_.isNull(value)
      })
    })
  }

  format (cursor) {
    let response = {
      results: [],
      metadata: this.metadata(cursor)
    }
    return cursor.forEach((row) => {
        if (this._fields) {
          response.results.push(_.pick(row[0], (value, key, object) => {
            return this._fields[key] || this.requiredFields[key]
          }))
          return
        } else {
          response.results.push(_.pick(row[0], (value, key, object) => {
            return true
          }))
        }
    }).then(() => {
      if (this.resultsOnly) {
        return response.results
      }
      return response
    }).catch((e) => {
      console.log(e)
    })
  }

  metadata (cursor) {
    return {
        totalCount: cursor.maxCount,
        duration: this.duration
      }
  }

  get db () {
    return this._db
  }
  set db (value) {
    this._db = value
  }

  get pagesize () {
    return this._pagesize || 20
  }

  set pagesize (value) {
    this._pagesize = value
  }

  get offset () {
    return this._offset || 20
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


module.exports = DB
