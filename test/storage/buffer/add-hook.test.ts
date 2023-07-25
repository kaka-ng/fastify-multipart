import { Blob } from 'buffer'
import t from 'tap'
import { FormData } from 'undici'
import { BufferStorage, BusboyAdapter } from '../../../lib'
import { createFastify } from '../../create-fastify'
import { request } from '../../request'

t.test('BufferStorage - addHook', function (t) {
  t.plan(3)

  t.test('single file', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      addHook: true,
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
    t.same(json.body.file, { type: 'Buffer', data: Buffer.from('helloworld').map(Number) })
    t.same(json.files.file, { name: 'hello_world.txt', value: { type: 'Buffer', data: Buffer.from('helloworld').map(Number) } })
  })

  t.test('multiple fields', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      addHook: true,
      adapter: BusboyAdapter,
      storage: BufferStorage
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('foo', 'baz')
    form.append('foo', 'hello')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.same(json.body.foo, ['bar', 'baz', 'hello'])
    t.same(json.body.file, { type: 'Buffer', data: Buffer.from('helloworld').map(Number) })
    t.same(json.files.file, { name: 'hello_world.txt', value: { type: 'Buffer', data: Buffer.from('helloworld').map(Number) } })
  })

  t.test('multiple files', async function (t) {
    t.plan(4)

    const fastify = await createFastify(t, {
      addHook: true,
      adapter: BusboyAdapter,
      storage: BufferStorage
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world1.txt')
    form.append('file', new Blob(['hello', 'world', 'hello', 'world']), 'hello_world2.txt')
    form.append('file', new Blob(['hello', 'world', 'hello', 'world', 'hello', 'world']), 'hello_world3.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.same(json.body.file, [
      { type: 'Buffer', data: Buffer.from('helloworld').map(Number) },
      { type: 'Buffer', data: Buffer.from('helloworldhelloworld').map(Number) },
      { type: 'Buffer', data: Buffer.from('helloworldhelloworldhelloworld').map(Number) }
    ])
    t.same(json.files.file, [
      { name: 'hello_world1.txt', value: { type: 'Buffer', data: Buffer.from('helloworld').map(Number) } },
      { name: 'hello_world2.txt', value: { type: 'Buffer', data: Buffer.from('helloworldhelloworld').map(Number) } },
      { name: 'hello_world3.txt', value: { type: 'Buffer', data: Buffer.from('helloworldhelloworldhelloworld').map(Number) } }
    ])
  })
})
