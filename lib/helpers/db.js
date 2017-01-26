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

  get () {
    this.start = this.start
    // Temporary
    let where = {$obj: {}}
    where['$obj'][this.key] = {$neq: null}

    let fetch = this.db
    .select()
    .first(0)

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
        let entry = {}
        // Use pluck here to remove filtered fields
        _.map(row[0], (val, key) => {
          entry[key] = val
        })
      response.results.push(entry)
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

}


module.exports = DB
