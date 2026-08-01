import { GMItem } from '../items/types'

/**
 * Searches a list of GMItems for an item matching a target path.
 *
 * Supports metadata directives (e.g. `@run-at`, `run-at`), localized directives
 * (e.g. `@name:de`), and nested GM objects (`GM.cookie.list`).
 *
 * @param items - The list of GMItems or subItems to search.
 * @param path - An array of path tokens representing the target item.
 * @returns The matching GMItem if found, or undefined.
 */
const findGMItem = (items: GMItem[], path: string[]): GMItem | undefined => {
  if (path.length === 0) {
    return
  }

  // Clean target word: remove leading '@' and optional locale suffix like ':es' or ':zh-CN'
  let target = path[0]
  if (target.startsWith('@')) {
    target = target.substring(1)
  }
  const localeIndex = target.indexOf(':')
  if (localeIndex !== -1) {
    target = target.substring(0, localeIndex)
  }

  for (const item of items) {
    if (item.label === target) {
      if (path.length === 1) {
        return item
      }
      if (item.subItems) {
        return findGMItem(item.subItems, path.slice(1))
      }
    }

    // Check nested subItems if item is an unlabeled group or metadata container (e.g., commitCharacter: '@')
    if (item.subItems && !item.label) {
      const subResult = findGMItem(item.subItems, path)
      if (subResult) {
        return subResult
      }
    }
  }
}

export default findGMItem
