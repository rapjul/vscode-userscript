import * as assert from 'assert'
import { completionProviders } from '../../providers/CompletionProviders'

suite('CompletionProviders Test Suite', () => {
  test('Exports registered completion provider disposables', () => {
    assert.ok(Array.isArray(completionProviders))
    assert.ok(completionProviders.length > 0)
  })
})
