'use strict'

const _ = require('underscore')
const mkdirp = require('mkdirp')
const path = require('path')
const redis = require('redis')
const ReasonDB = require('reasondb')
const DB = require('./db')

class Connection extends DB {
  constructor ({root, key, clear, active, redis, async, store}) {
    super()
    this.root = root
    this.key = key
    this.clear = clear
    this.active = active
    this.async = async
    this.store = store
    this.redis = redis
    this.db = this.connection()
  }

  get root () {
    return this._root
  }
  set root (value) {
    this._root = path.resolve(value || './db')
    mkdirp.sync(this._root)
    this.createDBDirs()
  }

  get key () {
    return this._key
  }
  set key (value) {
    this._key = value || '@key'
  }

  get clear () {
    return this._clear
  }
  set clear (value) {
    this._clear = value || false
  }

  get active () {
    return this._active
  }
  set active (value) {
    this._active = value || true
  }

  get redis () {
    return this._redis
  }
  set redis (value) {
    this._redis = (value && value.enabled) ? {
      enabled: true,
      port: value.port || 6379,
      host: value.host || '127.0.0.1',
      detect_buffers: value.detect_buffers || false
    } : false
  }

  get async () {
    return this._async
  }
  set async (value) {
    this._async = value || true
  }
  get store () {
    return this._store
  }
  set store (value) {
    this._store = value || ReasonDB.JSONBlockStore
  }

  get target () {
    return this._target
  }

  set target (value) {
    // TO-DO:Check valid class
    this._target = value || null
  }


  initialiseRedisClient () {
    return redis.createClient(this.redis.port, this.redis.host, {detect_buffers: true})
  }

  connection () {
    if (this.redis) {
      let redisClient = this.initialiseRedisClient()
      return new ReasonDB(this.root, "_id",ReasonDB.RedisStore,this.clear,this.active,{saveIndexAsync: this.async, redisClient: redisClient})
    } else {
      return new ReasonDB(this.root, this.key,this.store,this.clear,this.active,{saveIndexAsync: this.async})
    }
  }
}

module.exports = Connection