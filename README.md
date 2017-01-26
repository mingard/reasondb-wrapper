#### Overview

This basic wrapper is designed to:
- Leverage the power of [reasondb](https://github.com/anywhichway/reasondb)
- Handle and simplify complex cursor operations, including field filtering and metadata generation
- Simplify query building
- Add a little Syntactic sugar into the mix 

- [Setup](#setup)
 - [With Redis](#setup-with-redis)
 - [Without Redis](#setup-without-redis)
- [Inserting Records](#inserting-a-record)
- [Getting Records](#getting-records)
- [Roadmap](#roadmap)

### Setup

#### Setup with Redis

```javascript

'use strict'

const RDBWrapper = require('./reasondb-wrapper')

const db = new RDBWrapper({
  root:  './db',
  key: '@key',
  clear: false,
  active: true,
  redis: {enabled: true, port: 6379, host: '127.0.0.1', detect_buffers: true},
  async: true
})
```

#### Setup without Redis

```javascript

'use strict'

const RDBWrapper = require('./reasondb-wrapper')

const db = new RDBWrapper({
  root:  './db',
  key: '@key',
  clear: false,
  active: true,
  async: true
  // store: RDBWrapper.JSONBlockStore // Should pull list from reasondb
})
```

### Inserting a record

```javascript

class Person {
  constructor (name, birthday) {
    this.name = name
    this.birthday = birthday
  }
}

let person = new Person("Joe", new Date("1960-01-16"))

db.use(Person).post(person).then((response) => {
  console.log(response)
})

```

### Getting records

```javascript

class Person {
  constructor (name, birthday) {
    this.name = name
    this.birthday = birthday
  }
}


db.use(Person).get().then((response) => {
  console.log(response) //JSON results with metadata
})

```

### Roadmap
- ~~Connection configuration~~
- ~~Create DB directory and missing Primative directories~~
- ~~Cleans data~~
- ~~Ability to specify type of fallback~~
- ~~Ability to POST data~~
- ~~GET data~~
- DELETE data
- Paginate results
- Metadata in results (part complete)
- Specify fields to return
- Optional document schema for nested Reference documents
- Query builder
