import { Blob } from 'buffer'
import * as fs from 'fs/promises'
import * as path from 'path'
import t from 'tap'
import { FormData } from 'undici'
import { BusboyAdapter, FileStorage } from '../../../lib'
import { createFastify } from '../../create-fastify'
import { request } from '../../request'

const uploadDir = path.join(__dirname, 'tmp')

t.test('FileStorage - addContentTypeParser', function (t) {
  t.plan(3)

  t.test('single file', async function (t) {
    t.plan(8)

    t.teardown(async function () {
      await fs.rm(uploadDir, { recursive: true, force: true })
    })

    const fastify = await createFastify(t, {
      storageOption: { uploadDir },
      addContentTypeParser: true,
      adapter: BusboyAdapter,
      storage: FileStorage
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
      t.equal(json.body.file.startsWith(uploadDir), true)
      const buf = await fs.readFile(json.body.file)
      t.equal(buf.toString(), 'helloworld')
    }
    {
      t.ok(json.files.file)
      t.equal(json.files.file.value.startsWith(uploadDir), true)
      const buf = await fs.readFile(json.files.file.value)
      t.equal(buf.toString(), 'helloworld')
    }
  })

  t.test('multiple fields', async function (t) {
    t.plan(8)

    t.teardown(async function () {
      await fs.rm(uploadDir, { recursive: true, force: true })
    })

    const fastify = await createFastify(t, {
      storageOption: { uploadDir },
      addContentTypeParser: true,
      adapter: BusboyAdapter,
      storage: FileStorage
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
      t.equal(json.body.file.startsWith(uploadDir), true)
      const buf = await fs.readFile(json.body.file)
      t.equal(buf.toString(), 'helloworld')
    }
    {
      t.ok(json.files.file)
      t.equal(json.files.file.value.startsWith(uploadDir), true)
      const buf = await fs.readFile(json.files.file.value)
      t.equal(buf.toString(), 'helloworld')
    }
  })

  t.test('multiple files', async function (t) {
    t.plan(20)

    t.teardown(async function () {
      await fs.rm(uploadDir, { recursive: true, force: true })
    })

    const fastify = await createFastify(t, {
      storageOption: { uploadDir },
      addContentTypeParser: true,
      adapter: BusboyAdapter,
      storage: FileStorage
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
      t.equal(json.body.file[0].startsWith(uploadDir), true)
      const buf1 = await fs.readFile(json.body.file[0])
      t.equal(buf1.toString(), 'helloworld')
      t.ok(json.body.file[1])
      t.equal(json.body.file[1].startsWith(uploadDir), true)
      const buf2 = await fs.readFile(json.body.file[1])
      t.equal(buf2.toString(), 'helloworldhelloworld')
      t.ok(json.body.file[2])
      t.equal(json.body.file[2].startsWith(uploadDir), true)
      const buf3 = await fs.readFile(json.body.file[2])
      t.equal(buf3.toString(), 'helloworldhelloworldhelloworld')
    }
    {
      t.ok(json.files.file[0])
      t.equal(json.files.file[0].value.startsWith(uploadDir), true)
      const buf1 = await fs.readFile(json.files.file[0].value)
      t.equal(buf1.toString(), 'helloworld')
      t.ok(json.files.file[1])
      t.equal(json.files.file[1].value.startsWith(uploadDir), true)
      const buf2 = await fs.readFile(json.files.file[1].value)
      t.equal(buf2.toString(), 'helloworldhelloworld')
      t.ok(json.files.file[2])
      t.equal(json.files.file[2].value.startsWith(uploadDir), true)
      const buf3 = await fs.readFile(json.files.file[2].value)
      t.equal(buf3.toString(), 'helloworldhelloworldhelloworld')
    }
  })
})
