import * as assert from 'assert'
import * as vscode from 'vscode'
import getWord from '../../utils/getWord'

/**
 * Helper to build a mock TextDocument for testing getWord token extraction.
 *
 * @param content - Document text.
 * @returns A mocked vscode.TextDocument instance with getWordRangeAtPosition support.
 */
function createMockDocForGetWord(content: string): vscode.TextDocument {
  const lines = content.split('\n')
  return {
    fileName: 'test.user.js',
    getText: (range?: vscode.Range): string => {
      if (!range) {
        return content
      }
      if (range.start.line === range.end.line) {
        return lines[range.start.line].substring(range.start.character, range.end.character)
      }
      let text = lines[range.start.line].substring(range.start.character) + '\n'
      for (let i = range.start.line + 1; i < range.end.line; i++) {
        text += lines[i] + '\n'
      }
      text += lines[range.end.line].substring(0, range.end.character)
      return text
    },
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
    },
    getWordRangeAtPosition: (position: vscode.Position): vscode.Range | undefined => {
      const lineText = lines[position.line] ?? ''
      const wordRegex = /[a-zA-Z0-9_$]+/g
      let match: RegExpExecArray | null
      while ((match = wordRegex.exec(lineText)) !== null) {
        const start = match.index
        const end = match.index + match[0].length
        if (position.character >= start && position.character <= end) {
          return new vscode.Range(position.line, start, position.line, end)
        }
      }
      return undefined
    }
  } as unknown as vscode.TextDocument
}

suite('getWord Test Suite', () => {
  test('Extracts current word when cursor is inside a word (isInWord = true)', () => {
    const doc = createMockDocForGetWord('GM.cookie.list')
    const pos = new vscode.Position(0, 11) // inside 'list'
    const result = getWord(doc, pos, true)
    assert.ok(result)
    assert.strictEqual(result?.[0], 'list')
    assert.strictEqual(result?.[1].character, 10)
  })

  test('Extracts preceding word across dot operator (isInWord = false)', () => {
    const doc = createMockDocForGetWord('GM.cookie.list')
    const pos = new vscode.Position(0, 10) // before 'list'
    const result = getWord(doc, pos, false)
    assert.ok(result)
    assert.strictEqual(result?.[0], 'cookie')
  })

  test('Extracts word across newline before dot (e.g. GM\\n  .cookie)', () => {
    const doc = createMockDocForGetWord('GM\n  .cookie')
    const pos = new vscode.Position(1, 3) // before 'cookie' on line 1
    const result = getWord(doc, pos, false)
    assert.ok(result)
    assert.strictEqual(result?.[0], 'GM')
  })

  test('Returns undefined when position is at start of document (line 0, char 0)', () => {
    const doc = createMockDocForGetWord('GM.cookie')
    const pos = new vscode.Position(0, 0)
    const result = getWord(doc, pos, false)
    assert.strictEqual(result, undefined)
  })
})
