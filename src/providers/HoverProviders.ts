import * as vscode from 'vscode'
import allItems from '../items'
import checkIfShouldRun from '../utils/checkIfShouldRun'
import buildMarkdownString from '../utils/buildMarkdownString'
import { GMItem } from '../items/types'
import getWord from '../utils/getWord'
import findGMItem from '../utils/findGMItem'

/** List of registered VS Code hover provider disposables */
const hoverProviders: vscode.Disposable[] = []

/**
 * Attempts to resolve a hover object for GM items or API tokens at a position.
 *
 * @param document - The VS Code TextDocument.
 * @param position - The current cursor position.
 * @param word_list - Accumulator list for path tokens.
 * @param items - The GMItem list to search.
 * @param isInWord - Whether the position is currently inside a word.
 * @returns A vscode.Hover object if matched, a next search Position, or undefined.
 */
function makeHoverObject(
  document: vscode.TextDocument,
  position: vscode.Position,
  word_list: string[],
  items: GMItem[],
  isInWord: boolean
): vscode.Hover | vscode.Position | undefined {
  const wordAndPosition = getWord(document, position, isInWord)
  if (wordAndPosition) {
    let [word, next_position] = wordAndPosition
    if (word.startsWith('GM_')) {
      word = word.substring(3)
      // Compatible for GM.xmlHttpRequest and GM_xmlhttpRequest
      if (word === 'xmlhttpRequest') {
        word = 'xmlHttpRequest'
      } else if (word === 'xmlHttpRequest') {
        return
      }
      word_list.unshift(word)
      // If it's a GM_ function, make the hover object from GM.xxx
      word_list.unshift('GM')
    } else {
      word_list.unshift(word)
    }
    const item = findGMItem(items, word_list)
    if (item) {
      // If item is found, return a hover object
      return new vscode.Hover(buildMarkdownString(item))
    }
    // Else return a position for next search
    return next_position
  }
}

/**
 * Creates and registers a hover provider for UserScript metadata directives and GM APIs.
 *
 * @param items - List of GMItems containing API definitions and metadata items.
 */
function createHoverProvider(items: GMItem[]): void {
  const provider = vscode.languages.registerHoverProvider('javascript', {
    /**
     * Provides hover documentation for UserScript metadata directives and GM functions.
     *
     * @param document - The active text document.
     * @param position - The hover position.
     * @param token - Cancellation token.
     * @returns A Hover object or undefined.
     */
    provideHover(
      document: vscode.TextDocument,
      position: vscode.Position,
      _token: vscode.CancellationToken
    ) {
      if (!checkIfShouldRun(document)) {
        return
      }

      // Check if current line is a metadata comment directive line (e.g. // @run-at       document-start)
      const lineText = document.lineAt(position.line).text
      const metaMatch = lineText.match(/^\s*\/\/\s*@([a-zA-Z0-9_-]+)(?::[a-zA-Z0-9_-]+)?/)
      if (metaMatch) {
        const directiveName = metaMatch[1]
        const item = findGMItem(items, [directiveName])
        if (item) {
          return new vscode.Hover(buildMarkdownString(item))
        }
      }

      const word_list: string[] = []
      let pos = position

      for (let i = 0; i < Number(process.env.GM_ITEMS_DEPTH); i++) {
        const result = makeHoverObject(document, pos, word_list, items, i === 0)
        if (result instanceof vscode.Hover) {
          return result
        } else if (result instanceof vscode.Position) {
          pos = result
        } else {
          break
        }
      }
    }
  })

  hoverProviders.push(provider)
}

createHoverProvider(allItems)

export { hoverProviders }
