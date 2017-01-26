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

  get db () {
    return this._db
  }
  set db (value) {
    this._db = value
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

}


module.exports = DB