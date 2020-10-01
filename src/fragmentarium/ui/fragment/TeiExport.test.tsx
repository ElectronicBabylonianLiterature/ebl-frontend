import { act } from '@testing-library/react'
import factory from 'factory-girl'
import * as TeiExport from './TeiExport'
import { Fragment } from 'fragmentarium/domain/fragment'
import * as parser from 'fast-xml-parser'

let fragment: Fragment
let teiExport: string

beforeEach(async () => {
  fragment = await factory.build('fragment')
  await act(async () => {
    teiExport = TeiExport.teiExport(fragment)
  })
})

test('outputType', () => {
  expect(typeof teiExport).toBe('string')
})

test('outputSize', () => {
  expect(teiExport.length).toBeGreaterThan(0)
})

test('validXml', () => {
  expect(parser.validate('teiExport') === true).toBeTruthy()
})
