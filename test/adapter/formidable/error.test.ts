import { Blob } from 'buffer'
import t from 'tap'
import { FormData } from 'undici'
import { FormidableAdapter } from '../../../lib/adapter/formidable'
import { Storage } from '../../../lib/storage/storage'
import { createFastify } from '../../create-fastify'
import { request } from '../../request'

t.test('FormidableAdapter - error', function (t) {
  t.plan(10)

  t.test('fields', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        fields: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FIELDS_LIMIT')
  })

  t.test('fieldSize', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        fieldSize: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FIELD_SIZE_LIMIT')
  })

  t.test('files', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        files: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FILES_LIMIT')
  })

  t.test('fileSize', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        fileSize: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FILE_SIZE_LIMIT')
  })

  t.test('fileSize - with files', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        files: 1,
        fileSize: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FILE_SIZE_LIMIT')
  })

  t.test('fileSize - with parts', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        parts: 1,
        fileSize: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FILE_SIZE_LIMIT')
  })

  t.test('fileSize - non-block stream', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        fileSize: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')
    // we test if any more file would block the stream
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FILE_SIZE_LIMIT')
  })

  t.test('parts - without fields and files', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        parts: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FIELDS_LIMIT')
  })

  t.test('parts - with fields', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        fields: 1,
        parts: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FILES_LIMIT')
  })

  t.test('parts - with files', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: FormidableAdapter,
      storage: Storage,
      limits: {
        files: 1,
        parts: 0
      }
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 413)

    const json = await response.json()
    t.equal(json.code, 'FST_MP_FIELDS_LIMIT')
  })
})
