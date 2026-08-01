import * as assert from 'assert'
import * as vscode from 'vscode'
import checkIfShouldRun from '../../utils/checkIfShouldRun'

/**
 * Creates a mock vscode.TextDocument for testing checkIfShouldRun.
 *
 * @param fileName - The filename (including extension).
 * @param content - The complete document text.
 * @returns A mocked vscode.TextDocument instance.
 */
function createMockDocument(fileName: string, content: string): vscode.TextDocument {
  const lines = content.split('\n')
  return {
    fileName,
    getText: (): string => content,
    lineAt: (line: number): vscode.TextLine => {
      const lineText = lines[line] ?? ''
      return {
        lineNumber: line,
        text: lineText,
        isEmptyOrWhitespace: lineText.trim().length === 0,
        firstNonWhitespaceCharacterIndex: lineText.search(/\S|$/),
        range: new vscode.Range(line, 0, line, lineText.length),
        rangeIncludingLineBreak: new vscode.Range(line, 0, line, lineText.length + 1)
      }
    }
  } as unknown as vscode.TextDocument
}

suite('checkIfShouldRun Test Suite', () => {
  test('Returns true for .user.js files by default (without header comment)', () => {
    const doc = createMockDocument('test.user.js', 'console.log("hello");')
    assert.strictEqual(checkIfShouldRun(doc), true)
  })

  test('Returns true for multi-dot .user.js files (e.g., my-script.test.user.js)', () => {
    const doc = createMockDocument('my-script.test.user.js', 'console.log("multi-dot");')
    assert.strictEqual(checkIfShouldRun(doc), true)
  })

  test('Returns true for generic .js files containing UserScript header block', () => {
    const doc = createMockDocument(
      'script.js',
      '// ==UserScript==\n// @name Test\n// ==/UserScript==\nconsole.log("runs");'
    )
    assert.strictEqual(checkIfShouldRun(doc), true)
  })

  test('Returns false for generic .js files without UserScript header block', () => {
    const doc = createMockDocument('regular.js', 'console.log("regular js file");')
    assert.strictEqual(checkIfShouldRun(doc), false)
  })

  test('Returns false for unsupported file extensions (.ts, .py, .json, .css)', () => {
    const tsDoc = createMockDocument('script.ts', '// ==UserScript==\nconst a = 1;')
    const pyDoc = createMockDocument('script.py', 'print("hello")')
    const jsonDoc = createMockDocument('data.json', '{"key": "value"}')
    const cssDoc = createMockDocument('styles.css', 'body { color: red; }')

    assert.strictEqual(checkIfShouldRun(tsDoc), false)
    assert.strictEqual(checkIfShouldRun(pyDoc), false)
    assert.strictEqual(checkIfShouldRun(jsonDoc), false)
    assert.strictEqual(checkIfShouldRun(cssDoc), false)
  })
})
