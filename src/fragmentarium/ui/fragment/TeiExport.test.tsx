import * as TeiExport from './TeiExport'
import { Fragment } from 'fragmentarium/domain/fragment'
import { XMLValidator } from 'fast-xml-parser'
import { fragmentFactory } from 'test-support/fragment-fixtures'

let fragment: Fragment
let teiExport: string

beforeEach(() => {
  fragment = fragmentFactory.build()
  teiExport = TeiExport.teiExport(fragment)
})

test('outputType', () => {
  expect(typeof teiExport).toBe('string')
})

test('outputSize', () => {
  expect(teiExport.length).toBeGreaterThan(0)
})

test('validXml', () => {
  expect(XMLValidator.validate(teiExport) === true).toBeTruthy()
})
