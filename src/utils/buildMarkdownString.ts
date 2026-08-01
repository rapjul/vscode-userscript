import * as vscode from 'vscode'
import { GMItem, MarkDownItem } from '../items/types'

/**
 * Appends a section of content (code block, markdown text, or plain text) to a vscode.MarkdownString instance.
 *
 * @param markdownString - The MarkdownString instance to append to.
 * @param content - The MarkDownItem specifying the content type and string value.
 */
function appendContentToMarkdownString(
  markdownString: vscode.MarkdownString,
  content: MarkDownItem
): void {
  switch (content.add) {
    case 'code':
      markdownString.appendCodeblock(content.value, 'typescript')
      break
    case 'markdown':
      markdownString.appendMarkdown(content.value)
      break
    default:
      markdownString.appendText(content.value)
      break
  }
}

/**
 * Constructs a vscode.MarkdownString representing the full documentation and type definition of a GMItem.
 *
 * @param item - The GMItem to generate Markdown documentation for.
 * @returns A vscode.MarkdownString populated with type definition and documentation sections.
 */
function buildMarkdownString(item: GMItem): vscode.MarkdownString {
  const markdownString = new vscode.MarkdownString()

  if (item.typeDefinition) {
    for (const content of item.typeDefinition) {
      appendContentToMarkdownString(markdownString, content)
    }
  }

  if (item.documentation) {
    for (const content of item.documentation) {
      appendContentToMarkdownString(markdownString, content)
    }
  }

  return markdownString
}

export default buildMarkdownString
