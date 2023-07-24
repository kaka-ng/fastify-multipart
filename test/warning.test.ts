import { Blob } from 'buffer'
import Fastify from 'fastify'
import t from 'tap'
import { FormData } from 'undici'
import FastifyMultipart, { BusboyAdapter, Storage } from '../lib'
import { fastifyOptions } from './create-fastify'
import { request } from './request'

t.test('multipart already parsed', async function (t) {
  t.plan(3)

  t.test('addHook', async function (t) {
    t.plan(5)

    const fastify = Fastify(fastifyOptions)

    t.teardown(fastify.close)

    fastify.addHook('preValidation', async function (request) {
      await request.parseMultipart()
    })

    await fastify.register(FastifyMultipart, {
      addHook: true,
      adapter: BusboyAdapter,
      storage: Storage
    })

    fastify.post<{ Body: { foo: string, file: string } }>('/', {
      onRequest (request, _, done) {
        request.log = {
          warn (msg: string) {
            t.equal(msg, 'multipart already parsed, you probably need to check your code why it is parsed twice.')
          }
        } as any
        done()
      }
    }, async function (request, reply) {
      return await reply.code(200).send({
        body: request.body,
        files: request.files
      })
    })

    await fastify.listen({ port: 0 })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.same(json.body.file, { name: 'hello_world.txt', value: 'hello_world.txt' })
    t.same(json.files.file, { name: 'hello_world.txt', value: 'hello_world.txt' })
  })

  t.test('parseMultipart', async function (t) {
    t.plan(5)

    const fastify = Fastify(fastifyOptions)

    t.teardown(fastify.close)

    await fastify.register(FastifyMultipart, {
      addContentTypeParser: true,
      adapter: BusboyAdapter,
      storage: Storage
    })

    fastify.post<{ Body: { foo: string, file: string } }>('/', {
      onRequest (request, _, done) {
        request.log = {
          warn (msg: string) {
            t.equal(msg, 'multipart already parsed, you probably need to check your code why it is parsed twice.')
          }
        } as any
        done()
      }
    }, async function (request, reply) {
      await request.parseMultipart()
      return await reply.code(200).send({
        body: request.body,
        files: request.files
      })
    })

    await fastify.listen({ port: 0 })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.same(json.body.file, { name: 'hello_world.txt', value: 'hello_world.txt' })
    t.same(json.files.file, { name: 'hello_world.txt', value: 'hello_world.txt' })
  })

  t.test('multipart', async function (t) {
    t.plan(5)

    const fastify = Fastify(fastifyOptions)

    t.teardown(fastify.close)

    await fastify.register(FastifyMultipart, {
      addContentTypeParser: true,
      adapter: BusboyAdapter,
      storage: Storage
    })

    fastify.post<{ Body: { foo: string, file: string } }>('/', {
      onRequest (request, _, done) {
        request.log = {
          warn (msg: string) {
            t.equal(msg, 'multipart already parsed, you probably need to check your code why it is parsed twice.')
          }
        } as any
        done()
      }
    }, async function (request, reply) {
      for await (const notExist of request.multipart()) {
        t.notOk(notExist, 'alreadyed parsed should not be iteratable')
      }

      return await reply.code(200).send({
        body: request.body,
        files: request.files
      })
    })

    await fastify.listen({ port: 0 })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    t.same(json.body.file, { name: 'hello_world.txt', value: 'hello_world.txt' })
    t.same(json.files.file, { name: 'hello_world.txt', value: 'hello_world.txt' })
  })
})
