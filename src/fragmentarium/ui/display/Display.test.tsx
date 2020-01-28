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
            language: 'AKKADIAN',
            normalized: false,
            uniqueLemma: [],
            lemmatizable: true,
            erasure: 'NONE',
            parts: [
              {
                type: 'Reading',
                value: 'kur@v#!',
                name: 'kur',
                subIndex: 1,
                flags: ['#!'],
                modifiers: ['@v']
              },
              { type: 'Joiner', value: '.' },
              {
                type: 'Reading',
                value: 'kurₓ(KUR)',
                name: 'kur',
                subIndex: null,
                flags: [],
                modifiers: [],
                sign: {
                  type: 'Grapheme',
                  value: 'KUR',
                  name: 'KUR',
                  flags: [],
                  modifiers: []
                }
              },
              { type: 'Joiner', value: '-' },
              {
                type: 'Logogram',
                value: 'KUR₂@v#!',
                name: 'KUR',
                subIndex: 2,
                flags: ['#!'],
                modifiers: ['@v']
              }
            ]
          },
          {
            type: 'Word',
            value: '|KUR.KUR|',
            language: 'AKKADIAN',
            normalized: false,
            uniqueLemma: [],
            lemmatizable: true,
            erasure: 'NONE',
            parts: [{ type: 'CompoundGrapheme', value: '|KUR.KUR|' }]
          },
          { type: 'UnknownNumberOfSigns', value: '...' },
          { type: 'UnidentifiedSign', value: 'X', flags: [] },
          { type: 'UnclearSign', value: 'x', flags: [] },
          {
            type: 'Variant',
            value: 'kur/KUR',
            tokens: [
              {
                type: 'Reading',
                value: 'kur',
                name: 'kur',
                subIndex: 1,
                flags: [],
                modifiers: []
              },
              {
                type: 'Logogram',
                value: 'KUR',
                name: 'KUR',
                subIndex: 1,
                flags: [],
                modifiers: [],
                surrogate: [
                  {
                    type: 'Reading',
                    value: 'kur',
                    name: 'kur',
                    subIndex: 1,
                    flags: [],
                    modifiers: []
                  }
                ]
              }
            ]
          },
          {
            type: 'Word',
            lemmatizable: true,
            normalized: false,
            language: 'AKKADIAN',
            erasure: 'NONE',
            uniqueLemma: [],
            value: '{d-kur₂?}{d!}kur{{kur}}',
            parts: [
              {
                type: 'Determinative',
                parts: [
                  {
                    type: 'Reading',
                    value: 'd',
                    modifiers: [],
                    name: 'd',
                    flags: [],
                    subIndex: 1
                  },
                  {
                    type: 'Joiner',
                    value: '-'
                  },
                  {
                    type: 'Reading',
                    value: 'kur₂?',
                    modifiers: [],
                    name: 'kur',
                    flags: ['?'],
                    subIndex: 2
                  }
                ],
                value: '{d-kur₂?}'
              },
              {
                type: 'Determinative',
                parts: [
                  {
                    type: 'Reading',
                    value: 'd!',
                    modifiers: [],
                    name: 'd',
                    sign: null,
                    flags: ['!'],
                    subIndex: 1
                  }
                ],
                value: '{d!}'
              },
              {
                type: 'Reading',
                value: 'kur',
                modifiers: [],
                name: 'kur',
                sign: null,
                flags: [],
                subIndex: 1
              },
              {
                type: 'LinguisticGloss',
                parts: [
                  {
                    type: 'Reading',
                    value: 'kur',
                    modifiers: [],
                    name: 'kur',
                    sign: null,
                    flags: [],
                    subIndex: 1
                  }
                ],
                value: '{{kur}}'
              }
            ]
          },
          {
            type: 'Word',
            lemmatizable: true,
            normalized: false,
            language: 'AKKADIAN',
            erasure: 'NONE',
            uniqueLemma: [],
            value: 'kur-{{kur-kur}}kur',
            parts: [
              {
                type: 'Reading',
                value: 'kur',
                modifiers: [],
                name: 'kur',
                flags: [],
                subIndex: 1
              },
              {
                type: 'Joiner',
                value: '-'
              },
              {
                type: 'LinguisticGloss',
                parts: [
                  {
                    type: 'Reading',
                    value: 'kur',
                    modifiers: [],
                    name: 'kur',
                    flags: [],
                    subIndex: 1
                  },
                  {
                    type: 'Joiner',
                    value: '-'
                  },
                  {
                    type: 'Reading',
                    value: 'kur',
                    modifiers: [],
                    name: 'kur',
                    flags: [],
                    subIndex: 1
                  }
                ],
                value: '{{kur-kur}}'
              },
              {
                type: 'Reading',
                value: 'kur',
                modifiers: [],
                name: 'kur',
                flags: [],
                subIndex: 1
              }
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
