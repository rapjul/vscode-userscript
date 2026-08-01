import * as assert from 'assert'
import findGMItem from '../../utils/findGMItem'
import allItems from '../../items'

suite('findGMItem Test Suite', () => {
  test('Resolves standard directives with leading @ prefix', () => {
    const runAtItem = findGMItem(allItems, ['@run-at'])
    assert.ok(runAtItem)
    assert.strictEqual(runAtItem?.label, 'run-at')

    const grantItem = findGMItem(allItems, ['@grant'])
    assert.ok(grantItem)
    assert.strictEqual(grantItem?.label, 'grant')

    const runInItem = findGMItem(allItems, ['@run-in'])
    assert.ok(runInItem)
    assert.strictEqual(runInItem?.label, 'run-in')
  })

  test('Resolves directives without leading @ prefix', () => {
    const runAtItem = findGMItem(allItems, ['run-at'])
    assert.ok(runAtItem)
    assert.strictEqual(runAtItem?.label, 'run-at')
  })

  test('Resolves localized header directives (@name:zh-CN, @name:zh-TW, @description:zh-CN, @description:es, @name:de)', () => {
    const nameZhCN = findGMItem(allItems, ['@name:zh-CN'])
    assert.ok(nameZhCN)
    assert.strictEqual(nameZhCN?.label, 'name')

    const nameZhTW = findGMItem(allItems, ['@name:zh-TW'])
    assert.ok(nameZhTW)
    assert.strictEqual(nameZhTW?.label, 'name')

    const descZhCN = findGMItem(allItems, ['@description:zh-CN'])
    assert.ok(descZhCN)
    assert.strictEqual(descZhCN?.label, 'description')

    const descEs = findGMItem(allItems, ['@description:es'])
    assert.ok(descEs)
    assert.strictEqual(descEs?.label, 'description')

    const nameDe = findGMItem(allItems, ['@name:de'])
    assert.ok(nameDe)
    assert.strictEqual(nameDe?.label, 'name')
  })

  test('Resolves nested GM object methods (GM.cookie.list, GM.setValue, GM.xmlHttpRequest)', () => {
    const cookieList = findGMItem(allItems, ['GM', 'cookie', 'list'])
    assert.ok(cookieList)
    assert.strictEqual(cookieList?.label, 'list')

    const setValue = findGMItem(allItems, ['GM', 'setValue'])
    assert.ok(setValue)
    assert.strictEqual(setValue?.label, 'setValue')

    const xmlReq = findGMItem(allItems, ['GM', 'xmlHttpRequest'])
    assert.ok(xmlReq)
    assert.strictEqual(xmlReq?.label, 'xmlHttpRequest')
  })

  test('Returns undefined for empty path arrays', () => {
    const result = findGMItem(allItems, [])
    assert.strictEqual(result, undefined)
  })

  test('Returns undefined for non-existent root directives or methods', () => {
    const invalidRoot = findGMItem(allItems, ['@nonExistentDirective'])
    assert.strictEqual(invalidRoot, undefined)

    const invalidNested = findGMItem(allItems, ['GM', 'nonExistentMethod'])
    assert.strictEqual(invalidNested, undefined)

    const invalidDeep = findGMItem(allItems, ['GM', 'cookie', 'nonExistentSubMethod'])
    assert.strictEqual(invalidDeep, undefined)
  })
})
