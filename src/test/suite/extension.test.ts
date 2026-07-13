import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import checkIfShouldRun from '../../utils/checkIfShouldRun'
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5))
    assert.strictEqual(-1, [1, 2, 3].indexOf(0))
  })

  test('checkIfShouldRun with .js files containing UserScript header', () => {
    /**
     * Mock text document that mimics a .js file containing a UserScript header.
     */
    const mockDocWithHeader = {
      fileName: 'script.js',
      getText: (): string => '// ==UserScript==\nconsole.log("test");',
      lineAt: (line: number): vscode.TextLine => ({
        lineNumber: line,
        text: '// ==UserScript==',
        isEmptyOrWhitespace: false,
        firstNonWhitespaceCharacterIndex: 0,
        range: new vscode.Range(0, 0, 0, 17),
        rangeIncludingLineBreak: new vscode.Range(0, 0, 0, 18)
      })
    } as unknown as vscode.TextDocument

    assert.strictEqual(checkIfShouldRun(mockDocWithHeader), true)
  })

  test('checkIfShouldRun with .js files NOT containing UserScript header', () => {
    /**
     * Mock text document that mimics a .js file without a UserScript header.
     */
    const mockDocWithoutHeader = {
      fileName: 'regular.js',
      getText: (): string => 'console.log("hello");',
      lineAt: (line: number): vscode.TextLine => ({
        lineNumber: line,
        text: 'console.log("hello");',
        isEmptyOrWhitespace: false,
        firstNonWhitespaceCharacterIndex: 0,
        range: new vscode.Range(0, 0, 0, 21),
        rangeIncludingLineBreak: new vscode.Range(0, 0, 0, 22)
      })
    } as unknown as vscode.TextDocument

    assert.strictEqual(checkIfShouldRun(mockDocWithoutHeader), false)
  })
})
