import { type Readable } from 'stream'
import { finished } from 'stream/promises'
import { Storage } from '../lib'

export class DiscardStorage extends Storage {
  async save (name: string, value: Readable, info: { filename: string }): Promise<any> {
    value.resume()
    await finished(value)
    return { name, value: info.filename }
  }
}
