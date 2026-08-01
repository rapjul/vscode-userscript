import * as assert from 'assert'
import buildMarkdownString from '../../utils/buildMarkdownString'
import { GMItem } from '../../items/types'

suite('buildMarkdownString Test Suite', () => {
  test('Formats add: "code" items as TypeScript codeblocks', () => {
    const item: GMItem = {
      label: 'testCode',
      typeDefinition: [
        {
          add: 'code',
          value: 'function testCode(): void'
        }
      ]
    }

    const markdown = buildMarkdownString(item)
    assert.ok(markdown.value.includes('```typescript'))
    assert.ok(markdown.value.includes('function testCode(): void'))
  })

  test('Formats add: "markdown" items as markdown strings', () => {
    const item: GMItem = {
      label: 'testMarkdown',
      documentation: [
        {
          add: 'markdown',
          value: 'This is **bold** documentation for `testMarkdown`.'
        }
      ]
    }

    const markdown = buildMarkdownString(item)
    assert.ok(markdown.value.includes('This is **bold** documentation for `testMarkdown`.'))
  })

  test('Formats add: "text" items as plain text', () => {
    const item: GMItem = {
      label: 'testText',
      documentation: [
        {
          add: 'text',
          value: 'Plain text description without formatting.'
        }
      ]
    }

    const markdown = buildMarkdownString(item)
    assert.strictEqual(markdown.value, 'Plain text description without formatting.')
  })

  test('Combines typeDefinition and documentation sections sequentially', () => {
    const item: GMItem = {
      label: 'combined',
      typeDefinition: [
        {
          add: 'code',
          value: 'var combined: string'
        }
      ],
      documentation: [
        {
          add: 'markdown',
          value: 'Combined item docs.'
        }
      ]
    }

    const markdown = buildMarkdownString(item)
    assert.ok(markdown.value.includes('```typescript'))
    assert.ok(markdown.value.includes('var combined: string'))
    assert.ok(markdown.value.includes('Combined item docs.'))
  })

  test('Returns an empty MarkdownString when item has no typeDefinition or documentation', () => {
    const item: GMItem = {
      label: 'emptyItem'
    }

    const markdown = buildMarkdownString(item)
    assert.strictEqual(markdown.value, '')
  })
})
