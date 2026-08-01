import * as vscode from 'vscode'
import allItems from '../items'
import checkIfShouldRun from '../utils/checkIfShouldRun'
import buildMarkdownString from '../utils/buildMarkdownString'
import { GMItem } from '../items/types'
import getWord from '../utils/getWord'

const completionProviders: vscode.Disposable[] = []

/* eslint-disable @typescript-eslint/naming-convention */
/** Map of directive names to allowed completion values */
const DIRECTIVE_VALUES_MAP: Record<string, string[]> = {
  'run-at': ['document-start', 'document-body', 'document-end', 'document-idle', 'context-menu'],
  'run-in': ['main-thread', 'sub-frame', 'all-frames'],
  sandbox: ['raw', 'JavaScript', 'DOM', 'MAIN_WORLD', 'ISOLATED_WORLD', 'USERSCRIPT_WORLD'],
  antifeature: ['ads', 'tracking', 'miner'],
  license: [
    'AGPL-3.0-only',
    'AGPL-3.0-or-later',
    'GPL-2.0-only',
    'GPL-2.0-or-later',
    'GPL-3.0-only',
    'GPL-3.0-or-later',
    'LGPL-2.0-only',
    'LGPL-2.0-or-later',
    'LGPL-2.1-only',
    'LGPL-2.1-or-later',
    'LGPL-3.0-only',
    'LGPL-3.0-or-later',
    'MIT',
    'Unlicense'
  ],
  compatible: ['firefox', 'chrome', 'opera', 'safari', 'edge'],
  incompatible: ['firefox', 'chrome', 'opera', 'safari', 'edge'],
  grant: [
    'none',
    'unsafeWindow',
    'window.onurlchange',
    'window.close',
    'window.focus',
    'GM_addElement',
    'GM.addElement',
    'GM_addStyle',
    'GM.addStyle',
    'GM_download',
    'GM.download',
    'GM_getResourceText',
    'GM.getResourceText',
    'GM_getResourceURL',
    'GM.getResourceURL',
    'GM_info',
    'GM.info',
    'GM_log',
    'GM.log',
    'GM_notification',
    'GM.notification',
    'GM_openInTab',
    'GM.openInTab',
    'GM_registerMenuCommand',
    'GM.registerMenuCommand',
    'GM_unregisterMenuCommand',
    'GM.unregisterMenuCommand',
    'GM_setClipboard',
    'GM.setClipboard',
    'GM_getTab',
    'GM.getTab',
    'GM_saveTab',
    'GM.saveTab',
    'GM_getTabs',
    'GM.getTabs',
    'GM_setValue',
    'GM.setValue',
    'GM_getValue',
    'GM.getValue',
    'GM_deleteValue',
    'GM.deleteValue',
    'GM_listValues',
    'GM.listValues',
    'GM_setValues',
    'GM.setValues',
    'GM_getValues',
    'GM.getValues',
    'GM_deleteValues',
    'GM.deleteValues',
    'GM_addValueChangeListener',
    'GM.addValueChangeListener',
    'GM_removeValueChangeListener',
    'GM.removeValueChangeListener',
    'GM_xmlhttpRequest',
    'GM.xmlHttpRequest',
    'GM_webRequest',
    'GM.webRequest',
    'GM_cookie',
    'GM.cookie',
    'GM_audio',
    'GM.audio'
  ]
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Creates a completion item for a GM item.
 *
 * @param item - The GM item definition.
 * @param prefix - Prefix string (e.g., `@` or `GM.`).
 * @param isGM_ - Flag indicating if this is a legacy `GM_` function.
 * @param position - The current cursor position.
 * @returns A configured vscode.CompletionItem.
 */
function makeCompletionItem(
  item: GMItem,
  prefix: string | undefined,
  isGM_: boolean,
  position: vscode.Position
): vscode.CompletionItem {
  let label = item.label!

  if (prefix === '@') {
    // GM metadata
    label = `@${label}`
  } else if (isGM_) {
    // If it's a GM_ function, make the completion item from GM.xxx
    if (label === 'xmlHttpRequest') {
      // Compatible for GM.xmlHttpRequest and GM_xmlhttpRequest
      label = 'xmlhttpRequest'
    }
    label = `GM_${label}`
  }

  const completionItem = new vscode.CompletionItem(label, item.kind)

  if (item.detail) {
    completionItem.detail = item.detail
  }

  if (prefix === '@') {
    // For GM metadata, we need to adjust the range to include the prefix `@` since it's commitCharacter
    const startPosition = position.with(undefined, position.character - 1)
    const endPosition = position.with(undefined, position.character + item.label!.length - 1)
    completionItem.range = new vscode.Range(startPosition, endPosition)
  }

  if (prefix?.endsWith('.')) {
    // For GM.xxx functions, we need to adjust the range to include the prefix `.` since it's commitCharacter
    const startPosition = position.with(undefined, position.character - 1)
    const endPosition = position.with(undefined, position.character + item.label!.length)
    completionItem.range = new vscode.Range(startPosition, endPosition)
    // By setting `range` and `filterText`, ensuring the item appears at the top of the completion results
    completionItem.filterText = `.${label}`
  }

  // Set sortText to space (ASCII code 32) to ensure the item appears at the top of the completion results
  completionItem.sortText = ' '

  if (item.insertText) {
    completionItem.insertText = new vscode.SnippetString(item.insertText)
    if (prefix === '@') {
      completionItem.insertText.value = `@${completionItem.insertText.value}`
    } else if (prefix?.endsWith('.')) {
      completionItem.insertText.value = `.${completionItem.insertText.value}`
    }
  } else {
    if (prefix?.endsWith('.')) {
      completionItem.insertText = `.${label}`
    }
  }

  if (item.documentation) {
    completionItem.documentation = buildMarkdownString(item)
  }

  if (item.commitCharacter) {
    completionItem.commitCharacters = [item.commitCharacter]
  }

  return completionItem
}

/**
 * Creates and registers completion providers for GM items and metadata keys.
 *
 * @param items - List of GMItems.
 * @param prefix - Accumulated prefix.
 * @param commitCharacter - Optional trigger/commit character.
 */
function createCompletionItemProvider(
  items: GMItem[],
  prefix?: string,
  commitCharacter?: string
): void {
  const provider = vscode.languages.registerCompletionItemProvider(
    'javascript',
    {
      /**
       * Provides completion items for GM APIs and metadata keys.
       *
       * @param document - Text document.
       * @param position - Current position.
       * @param token - Cancellation token.
       * @param context - Completion context.
       * @returns Array of completion items or undefined.
       */
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        if (!checkIfShouldRun(document)) {
          return
        }

        let matched_prefix = false
        let prefix_words = ''
        let prefix_word_position = position

        if (prefix?.endsWith('.')) {
          for (let i = 0; i < Number(process.env.GM_ITEMS_DEPTH) - 1; i++) {
            const wordAndPosition = getWord(document, prefix_word_position, false)
            if (wordAndPosition) {
              let [word, pos] = wordAndPosition

              if (word.startsWith('GM_')) {
                word = `GM.${word.substring(3)}`
                i++
              }

              prefix_words = `${word}.` + prefix_words

              if (prefix_words === prefix) {
                matched_prefix = true
                break
              } else {
                prefix_word_position = pos
              }
            }
          }

          if (!matched_prefix) {
            return
          }
        }

        const list = []

        for (const item of items) {
          if (item.label && item.kind) {
            list.push(makeCompletionItem(item, prefix, false, position))

            if (item.label === 'GM') {
              // For GM_xxx functions, make the completion items from GM.xxx
              for (const i of item.subItems!) {
                list.push(makeCompletionItem(i, prefix, true, position))
              }
            }
          }
        }

        return list
      }
    },
    commitCharacter!
  )

  completionProviders.push(provider)

  // Recursively make sub completion items
  for (const item of items) {
    if (item.subItems) {
      createCompletionItemProvider(
        item.subItems,
        `${prefix ?? ''}${item.label ?? ''}${item.commitCharacter ?? ''}`,
        item.commitCharacter
      )
    }
  }
}

/**
 * Creates and registers a completion provider for UserScript directive values after whitespace.
 */
function createDirectiveValueCompletionProvider(): void {
  const provider = vscode.languages.registerCompletionItemProvider(
    'javascript',
    {
      /**
       * Provides completion items for directive values when positioned after whitespace on a directive line.
       *
       * @param document - Text document.
       * @param position - Current position.
       * @returns Array of completion items or undefined.
       */
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        if (!checkIfShouldRun(document)) {
          return
        }

        const lineText = document.lineAt(position.line).text
        const textBeforeCursor = lineText.substring(0, position.character)

        // Match line like: // @run-at       or // @grant
        const match = textBeforeCursor.match(/^\s*\/\/\s*@([a-zA-Z0-9_-]+)(?::[a-zA-Z0-9_-]+)?\s+(.*)$/)
        if (!match) {
          return
        }

        const directiveName = match[1]
        const allowedValues = DIRECTIVE_VALUES_MAP[directiveName]
        if (!allowedValues) {
          return
        }

        return allowedValues.map((val) => {
          const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.Value)
          item.detail = 'UserScript directive value'
          item.sortText = ' '
          return item
        })
      }
    },
    ' '
  )

  completionProviders.push(provider)
}

createCompletionItemProvider(allItems)
createDirectiveValueCompletionProvider()

export { completionProviders }
