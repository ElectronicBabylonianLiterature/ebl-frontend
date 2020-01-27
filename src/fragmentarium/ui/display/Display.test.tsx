import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Fragment } from 'fragmentarium/domain/fragment'

import Display from './Display'
import { Text } from 'fragmentarium/domain/text'

let fragment: Fragment
let element: RenderResult
let container: HTMLElement

beforeEach(async () => {
  const text = new Text({
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur-KUR',
            parts: [
              { type: 'Reading', value: 'kur' },
              { type: 'Joiner', value: '-' },
              { type: 'Logogram', value: 'KUR' }
            ]
          },
          {
            type: 'Word',
            value: '|KUR.KUR|',
            parts: [{ type: 'CompoundGrapheme', value: 'kur' }]
          },
          { type: 'UnknownNumberOfSigns', value: '...' },
          { type: 'UnidentifiedSign', value: 'X' },
          { type: 'UnclearSign', value: 'x' },
          {
            type: 'Variant',
            value: 'kur/KUR',
            tokens: [
              { type: 'Reading', value: 'kur' },
              { type: 'Logogram', value: 'KUR' }
            ]
          }
        ]
      }
    ]
  })
  fragment = await factory.build('fragment', {
    publication: 'Guod cigipli epibif odepuwu.',
    text: text,
    description:
      'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.'
  })
  element = render(<Display fragment={fragment} />)
  container = element.container
})

test(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

test('Snapshot', () => {
  expect(container).toMatchSnapshot()
})
