# @kakang/fastify-multipart

[![Continuous Integration](https://github.com/kaka-repo/fastify-multipart/actions/workflows/ci.yml/badge.svg)](https://github.com/kaka-repo/fastify-multipart/actions/workflows/ci.yml)
[![Package Manager CI](https://github.com/kaka-repo/fastify-multipart/actions/workflows/package-manager-ci.yml/badge.svg)](https://github.com/kaka-repo/fastify-multipart/actions/workflows/package-manager-ci.yml)
[![NPM version](https://img.shields.io/npm/v/@kakang/fastify-multipart.svg?style=flat)](https://www.npmjs.com/package/@kakang/fastify-multipart)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/kaka-repo/fastify-multipart)](https://github.com/kaka-repo/fastify-multipart)
[![GitHub](https://img.shields.io/github/license/kaka-repo/fastify-multipart)](https://github.com/kaka-repo/fastify-multipart)

This plugin is used to replace `fastify-formidable` and `fastify-busboy`.
It provides a generic API which allows users to not only using `formidable`
or `busboy` for parsing `multipart/form-data`, but provide custom adapter
for parsing and custom storage engine to handle file stream. You may
also try the async iterator same as `@fastify/multipart` for advanced usage.

You can checkout `@fastify/multipart` if you prefer offcial plugin.

## Install

```bash
npm install @kakang/fastify-multipart --save

yarn add @kakang/fastify-multipart

// For BusboyAdapter
npm install busboy --save

yarn add busboy

// For FormidableAdapter
npm install busboy --save

yarn add busboy
```

## Usage

```ts
import FastifyMultipart, { BusboyAdapter, FileStorage, MemoryStorage } from '@kakang/fastify-multipart'

fastify.register(FastifyMultipart, {
  adapter: BusboyAdapter,
  storage: FileStorage,
  storageOption: {
    uploadDir: '/'
  }
})

fastify.post('/', async function(request, reply) {
  // you need to call the parser if you do not pass any option through plugin registration
  await request.parseMultipart()

  // you can use async iterator for file handling
  for await (const { type, name, value, info } of request.multipart()) {
    switch(type) {
      case 'field': {
        console.log(name, value)
        break
      }
      case 'file': {
        console.log(name, value, info.filename)
        // value is Readable
        value.resume()
        break
      }
    }
  }

  // access files
  request.files

  // access body
  // note that file fields will exist in body and it will becomes the file path saved on disk
  request.body

  // check if it is multipart
  if(request[kIsMultipart] === true) {}

  // check if it is already parsed
  if (request[kIsMultipartParsed] === true) {}
})


// add content type parser which will automatic parse all `multipart/form-data` found
fastify.register(FastifyBusboy, {
  addContentTypeParser: true,
  adapter: BusboyAdapter,
  storage: MemoryStorage
})

// add `preValidation` hook which will automatic parse all `multipart/form-data` found
fastify.register(FastifyBusboy, {
  addHooks: true,
  adapter: BusboyAdapter,
  storage: MemoryStorage
})

```

### Options

#### options.adapter

The option for content type parser adapter.
By default, we provide `BusboyAdapter` and `FormidableAdapter`.
You may also extends `Adapter` and built your own one.

```ts
import FastifyMultipart, { 
  BusboyAdapter, 
  FormidableAdapter, 
  Adapter, 
  MemoryStorage
} from '@kakang/fastify-multipart'

fastify.register(FastifyBusboy, {
  adapter: BusboyAdapter,
  storage: MemoryStorage,
})
```

#### options.storage

The option for storage engine.
By default, we provide `FileStorage` and `MemoryStorage`.
You may also extends `Storage` and built your own one.

```ts
import FastifyMultipart, { 
  BusboyAdapter, 
  FileStorage, 
  MemoryStorage, 
  Storage
} from '@kakang/fastify-multipart'

fastify.register(FastifyBusboy, {
  adapter: BusboyAdapter,
  storage: MemoryStorage,
})
```

#### options.removeFilesFromBody

This options will not add any files fields to body when enabled.

```ts
import FastifyMultipart, { 
  BusboyAdapter,
  MemoryStorage
} from '@kakang/fastify-multipart'

fastify.register(FastifyBusboy, {
  adapter: BusboyAdapter,
  storage: MemoryStorage,
  removeFilesFromBody: true
})
```
