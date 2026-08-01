// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { completionProviders } from './providers/CompletionProviders'
import { hoverProviders } from './providers/HoverProviders'
import { GMItem } from './items/types'
import allItems from './items'

/**
 * Activates the Scriptmonkey extension.
 * Calculates maximum item nesting depth and registers completion & hover providers.
 *
 * @param context - The VS Code extension context.
 */
export function activate(context: vscode.ExtensionContext): void {
  process.env['GM_ITEMS_DEPTH'] = (function search(items: GMItem[]): number {
    const list = items.map((item) => {
      if (item.subItems) {
        return 1 + search(item.subItems)
      } else {
        return 1
      }
    })

    return Math.max(...list)
  })(allItems).toString()

  context.subscriptions.push(...completionProviders, ...hoverProviders)
}

/**
 * Deactivates the Scriptmonkey extension.
 *
 * Cleanup is handled automatically by VS Code disposing of all items registered
 * in `context.subscriptions`, so no explicit teardown logic is required here.
 */
export function deactivate(): void {}
