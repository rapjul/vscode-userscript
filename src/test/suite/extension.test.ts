import * as assert from 'assert'
import * as vscode from 'vscode'
import { activate, deactivate } from '../../extension'

suite('Extension Lifecycle Test Suite', () => {
  vscode.window.showInformationMessage('Start extension lifecycle tests.')

  test('activate() initializes process.env.GM_ITEMS_DEPTH and pushes subscriptions', () => {
    const subscriptions: vscode.Disposable[] = []
    const mockContext = {
      subscriptions
    } as unknown as vscode.ExtensionContext

    activate(mockContext)

    assert.ok(process.env['GM_ITEMS_DEPTH'])
    assert.strictEqual(Number(process.env['GM_ITEMS_DEPTH']) > 0, true)
    assert.strictEqual(subscriptions.length > 0, true)
  })

  test('deactivate() executes cleanly without error', () => {
    assert.doesNotThrow(() => {
      deactivate()
    })
  })
})
