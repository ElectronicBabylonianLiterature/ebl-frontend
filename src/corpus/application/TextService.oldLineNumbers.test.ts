import { createOldLineNumbers } from 'corpus/application/TextService.testSupport'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'

test('Old line numbers without entries map to an empty list', () => {
  expect(createOldLineNumbers([])).toEqual([])
})

test('An old line number keeps its number and gains a full reference', () => {
  const referenceDto = referenceDtoFactory.build()

  const [oldLineNumber] = createOldLineNumbers([
    { number: 'old 1', reference: referenceDto },
  ])

  expect(oldLineNumber.number).toEqual('old 1')
  expect(oldLineNumber.reference.type).toEqual(referenceDto.type)
  expect(oldLineNumber.reference.pages).toEqual(referenceDto.pages)
})
