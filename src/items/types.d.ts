import * as vscode from 'vscode'

/**
 * Represents a UserScript metadata item or Greasemonkey/Tampermonkey API function.
 */
interface GMItem {
  /** Label text for completion item and matching */
  label?: string
  /** Completion item kind (e.g. Function, Property, Constant, Keyword) */
  kind?: vscode.CompletionItemKind
  /** Documentation content sections */
  documentation?: MarkDownItem[]
  /** Type definition content sections */
  typeDefinition?: MarkDownItem[]
  /** Custom snippet text to insert upon completion */
  insertText?: string
  /** Short detail text describing the item */
  detail?: string
  /** Trigger or commit character (e.g., '.' or '@') */
  commitCharacter?: string
  /** Sub-items nested under this GMItem (e.g., GM.cookie APIs) */
  subItems?: GMItem[]
}

/**
 * Represents a snippet of content to append to a Markdown documentation string.
 */
interface MarkDownItem {
  /** Format type of the content ('markdown', 'code', or 'text') */
  add: 'markdown' | 'code' | 'text'
  /** String content value */
  value: string
}

/**
 * Default metadata values retrieved from VS Code configuration for snippet insertion.
 */
interface MetaDataDefault {
  /** Default author name used in the @author snippet placeholder */
  author?: string
  /** Default namespace URL used in the @namespace snippet placeholder */
  namespace?: string
  /** Default icon base64 data string or URL used in the @icon snippet placeholder */
  icon?: string
}

export { GMItem, MarkDownItem, MetaDataDefault }
