import Fastify, { type FastifyInstance } from 'fastify'
import FastifyMultipart, { type FastifyMultipartOption } from '../lib'
import { type Files } from '../lib/adapter/adapter'
import { kAdapter, kStorage } from '../lib/symbols'

// reduce keep alive to prevent `undici` keep the socket open
export const fastifyOptions = { keepAliveTimeout: 100 }

export async function createFastify (t: Tap.Test, options?: FastifyMultipartOption, parseMode?: { inline?: boolean | any, iterator?: boolean | any }): Promise<FastifyInstance> {
  parseMode ??= {}
  const inline = parseMode.inline ?? false
  const iterator = parseMode.iterator ?? false
  const fastify = Fastify(fastifyOptions)

  await fastify.register(FastifyMultipart, options)

  fastify.post<{ Body: { foo: string, file: string } }>('/', async function (request, reply) {
    if (inline === true || typeof inline === 'object') {
      await request.parseMultipart()
    }
    if (iterator === true || typeof iterator === 'object') {
      const body = Object.create(null)
      const files = Object.create(null)
      for await (const { type, name, value, info } of request.multipart()) {
        switch (type) {
          case 'field': {
            request[kAdapter]._update(body, name, value)
            break
          }
          case 'file': {
            const file = await request[kStorage].save(name, value, info)
            request[kAdapter]._update(files as Files, file.name, file.value)
            break
          }
        }
      }

      if (options?.removeFilesFromBody !== true) {
        Object.assign(body, files)
      }

      request.body = body
      request.files = files
    }
    return await reply.code(200).send({
      body: request.body,
      files: request.files
    })
  })

  await fastify.listen({ port: 0, host: '127.0.0.1' })

  t.teardown(fastify.close)

  return await fastify
}
