import * as fs from 'fs/promises'
import t from 'tap'
import { FormData } from 'undici'
import { BusboyAdapter, FileStorage } from '../../../lib'
import { createFastify } from '../../create-fastify'
import { request } from '../../request'

t.test('FileStorage - multipart', function (t) {
  t.plan(3)

  t.test('single file', async function (t) {
    t.plan(6)

    const fastify = await createFastify(t, {
      adapter: BusboyAdapter,
      storage: FileStorage
    }, {
      iterator: true
    })

    const form = new FormData()
    form.append('foo', 'bar')
    form.append('file', new Blob(['hello', 'world']), 'hello_world.txt')

    const response = await request(fastify.listeningOrigin, form)
    t.equal(response.status, 200)

    const json = await response.json()

    t.equal(json.body.foo, 'bar')
    {
      t.ok(json.body.file)
      const buf = await fs.readFile(json.body.file.value)
      t.equal(buf.toString(), 'helloworld')
    }
    {
      t.ok(json.files.file)
      const buf = await fs.readFile(json.files.file.value)
      t.equal(buf.toString(), 'helloworld')
    }
  })

  t.test('multiple fields', async function (t) {
    t.plan(6)

    const fastify = await createFastify(t, {
      adapter: BusboyAdapter,
      storage: FileStorage
    }, {
      iterator: true
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
    {
      t.ok(json.body.file)
      const buf = await fs.readFile(json.body.file.value)
      t.equal(buf.toString(), 'helloworld')
    }
    {
      t.ok(json.files.file)
      const buf = await fs.readFile(json.files.file.value)
      t.equal(buf.toString(), 'helloworld')
    }
  })

  t.test('multiple files', async function (t) {
    t.plan(14)

    const fastify = await createFastify(t, {
      adapter: BusboyAdapter,
      storage: FileStorage
    }, {
      iterator: true
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
    {
      t.ok(json.body.file[0])
      const buf1 = await fs.readFile(json.body.file[0].value)
      t.equal(buf1.toString(), 'helloworld')
      t.ok(json.body.file[1])
      const buf2 = await fs.readFile(json.body.file[1].value)
      t.equal(buf2.toString(), 'helloworldhelloworld')
      t.ok(json.body.file[2])
      const buf3 = await fs.readFile(json.body.file[2].value)
      t.equal(buf3.toString(), 'helloworldhelloworldhelloworld')
    }
    {
      t.ok(json.files.file[0])
      const buf1 = await fs.readFile(json.files.file[0].value)
      t.equal(buf1.toString(), 'helloworld')
      t.ok(json.files.file[1])
      const buf2 = await fs.readFile(json.files.file[1].value)
      t.equal(buf2.toString(), 'helloworldhelloworld')
      t.ok(json.files.file[2])
      const buf3 = await fs.readFile(json.files.file[2].value)
      t.equal(buf3.toString(), 'helloworldhelloworldhelloworld')
    }
  })
})
