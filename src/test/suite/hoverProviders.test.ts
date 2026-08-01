import * as assert from 'assert'
import { hoverProviders } from '../../providers/HoverProviders'

suite('HoverProviders Test Suite', () => {
  test('Exports registered hover provider disposables', () => {
    assert.ok(Array.isArray(hoverProviders))
    assert.ok(hoverProviders.length > 0)
  })
})
