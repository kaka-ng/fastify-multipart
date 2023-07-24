import { Blob } from 'buffer'
import t from 'tap'
import { FormData } from 'undici'
import { Adapter, Storage } from '../../lib'
import { createFastify } from '../create-fastify'
import { request } from '../request'

t.test('Adapter', function (t) {
  t.plan(4)

  t.test('parsed - iterate do nothing', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      adapter: Adapter,
      storage: Storage
    }, {
      iterator: true
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    // raw adapter do nothing
    t.notOk(json.body.foo)
    t.notOk(json.body.file)
    t.notOk(json.files.file)
  })

  t.test('json - iterate do nothing', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      adapter: Adapter,
      storage: Storage
    }, {
      iterator: true
    })

    const response = await request(fastify.listeningOrigin, JSON.stringify({ hello: 'world' }) as any, { 'Content-Type': 'application/json' })
    t.equal(response.status, 200)

    const json = await response.json()

    // raw adapter do nothing
    t.notOk(json.body.hello)
    t.notOk(json.body.file)
    t.notOk(json.files.file)
  })

  t.test('json - parseMultipart do nothing', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      adapter: Adapter,
      storage: Storage
    }, {
      inline: true
    })

    const response = await request(fastify.listeningOrigin, JSON.stringify({ hello: 'world' }) as any, { 'Content-Type': 'application/json' })
    t.equal(response.status, 200)

    const json = await response.json()

    // raw adapter do nothing
    t.equal(json.body.hello, 'world')
    t.notOk(json.body.file)
    t.notOk(json.files?.file)
  })

  t.test('json - addHook do nothing', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      addHook: true,
      adapter: Adapter,
      storage: Storage
    })

    const response = await request(fastify.listeningOrigin, JSON.stringify({ hello: 'world' }) as any, { 'Content-Type': 'application/json' })
    t.equal(response.status, 200)

    const json = await response.json()

    // raw adapter do nothing
    t.equal(json.body.hello, 'world')
    t.notOk(json.body.file)
    t.notOk(json.files?.file)
  })
})
