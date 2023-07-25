import { Blob } from 'buffer'
import t from 'tap'
import { FormData } from 'undici'
import { BusboyAdapter } from '../../../lib/adapter/busboy'
import { Storage } from '../../../lib/storage/storage'
import { createFastify } from '../../create-fastify'
import { request } from '../../request'

t.test('BusboyAdapter - error', function (t) {
  t.plan(6)

  t.test('fields', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: BusboyAdapter,
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
      adapter: BusboyAdapter,
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
      adapter: BusboyAdapter,
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
      adapter: BusboyAdapter,
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

  t.test('parts', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: BusboyAdapter,
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
    t.equal(json.code, 'FST_MP_PARTS_LIMIT')
  })

  t.test('fileSize - non-block stream', async function (t) {
    t.plan(2)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      adapter: BusboyAdapter,
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
})
