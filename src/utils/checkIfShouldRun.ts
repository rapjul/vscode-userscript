import * as vscode from 'vscode'

/**
 * Array of active file suffixes (e.g. ['.user.js']) configured to trigger
 * the extension functionality.
 */
let activeFileSuffixes = vscode.workspace
  .getConfiguration('scriptmonkey.activation condition')
  .get<string[]>('file suffix')!

/**
 * Boolean flag indicating whether the extension should check if the file
 * starts with a UserScript header comment block.
 */
let checkUserscriptHeader = vscode.workspace
  .getConfiguration('scriptmonkey.activation condition')
  .get<boolean>('userscript header')!

vscode.workspace.onDidChangeConfiguration((event) => {
  if (event.affectsConfiguration('scriptmonkey.activation condition.file suffix')) {
    activeFileSuffixes = vscode.workspace
      .getConfiguration('scriptmonkey.activation condition')
      .get<string[]>('file suffix')!
  } else if (event.affectsConfiguration('scriptmonkey.activation condition.userscript header')) {
    checkUserscriptHeader = vscode.workspace
      .getConfiguration('scriptmonkey.activation condition')
      .get<boolean>('userscript header')!
  }
})

/**
 * Checks whether the given text document should trigger Scriptmonkey's features.
 * Scriptmonkey will run if:
 * 1. The document's file suffix is in the configured active suffixes list.
 *    - If 'userscript header' configuration is enabled, it must also start with a UserScript header.
 * 2. Or, the document has a generic '.js' suffix and contains the UserScript header comment block anywhere in its content.
 *
 * @param document - The VS Code TextDocument to inspect.
 * @returns A boolean indicating whether the extension should activate/run for this document.
 */
const checkIfShouldRun = (document: vscode.TextDocument): boolean => {
  const fileName = document.fileName
  const matchExt = fileName.match('\\..+$') ?? ''
  const suffix = matchExt[0]

  // If the file suffix matches the configured suffixes (e.g., '.user.js')
  if (activeFileSuffixes.includes(suffix)) {
    if (checkUserscriptHeader) {
      // Must start with // ==UserScript== (ignoring leading whitespace)
      return /\/\/[ ]+==UserScript==/.test(document.lineAt(0).text.trim())
    }
    return true
  }

  // If the file is a generic '.js' file and not in activeFileSuffixes,
  // we check if it contains the UserScript header anywhere in the file.
  if (suffix === '.js') {
    return /\/\/[ ]+==UserScript==/.test(document.getText())
  }

  return false
}

export default checkIfShouldRun
