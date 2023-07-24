import { Blob } from 'buffer'
import t from 'tap'
import { FormData } from 'undici'
import { BufferStorage, BusboyAdapter } from '../../../lib'
import { createFastify } from '../../create-fastify'
import { request } from '../../request'

t.test('BufferStorage - removeFilesFromBody', function (t) {
  t.plan(4)

  t.test('with addContentTypeParser', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      removeFilesFromBody: true,
      adapter: BusboyAdapter,
      storage: BufferStorage
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.notOk(json.body.file)
    t.same(json.files.file, { name: 'hello_world.txt', value: { type: 'Buffer', data: Buffer.from('helloworld').map(Number) } })
  })

  t.test('with addHook', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      addHook: true,
      removeFilesFromBody: true,
      adapter: BusboyAdapter,
      storage: BufferStorage
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.notOk(json.body.file)
    t.same(json.files.file, { name: 'hello_world.txt', value: { type: 'Buffer', data: Buffer.from('helloworld').map(Number) } })
  })

  t.test('with multipart', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      removeFilesFromBody: true,
      adapter: BusboyAdapter,
      storage: BufferStorage
    }, {
      inline: true
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.notOk(json.body.file)
    t.same(json.files.file, { name: 'hello_world.txt', value: { type: 'Buffer', data: Buffer.from('helloworld').map(Number) } })
  })

  t.test('with no file provided', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      addContentTypeParser: true,
      removeFilesFromBody: true,
      adapter: BusboyAdapter,
      storage: BufferStorage
    })

    const form = new FormData()
    form.append('foo', 'bar')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.notOk(json.body.file)
    t.notOk(json.files.file)
  })
})
