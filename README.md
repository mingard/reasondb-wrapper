#### Overview

This basic wrapper is designed to:
- Leverage the power of [reasondb](https://github.com/anywhichway/reasondb)
- Handle and simplify complex cursor operations, including field filtering and metadata generation
- Simplify query building
- Add a little Syntactic sugar into the mix 

### Example use

- [Setup](#setup)
 - [With Redis](#setup-with-redis)
 - [Without Redis](#setup-without-redis)
- [Inserting Records](#inserting-a-record)

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

db.use(Person).put(person).then((response) => {
  console.log(resonse)
})

  ```