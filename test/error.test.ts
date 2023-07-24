import t from 'tap'
import { Adapter, Storage } from '../lib'
import { createFastify } from './create-fastify'

t.test('missing Adapter', async function (t) {
  t.plan(2)

  try {
    await createFastify(t)
    t.fail('should not success')
  } catch (err: any) {
    t.ok(err)
    t.equal(err.code, 'FST_MP_INVALID_OPTION')
  }
})

t.test('missing Storage', async function (t) {
  t.plan(2)

  try {
    // @ts-expect-error check for error
    await createFastify(t, { adapter: Adapter })
    t.fail('should not success')
  } catch (err: any) {
    t.ok(err)
    t.equal(err.code, 'FST_MP_INVALID_OPTION')
  }
})

t.test('conflict config', async function (t) {
  t.plan(2)

  try {
    await createFastify(t, { adapter: Adapter, storage: Storage, addContentTypeParser: true, addHook: true })
    t.fail('should not success')
  } catch (err: any) {
    t.ok(err)
    t.equal(err.code, 'FST_MP_CONFLICT_CONFIG')
  }
})
