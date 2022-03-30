import {
  defaultLabels,
  Label,
  labelAbbreviation,
  Labels,
  labelsAbbreviation,
  Status,
  statusAbbreviation,
} from './labels'

test.each<[Status, string]>([
  ['UNCERTAIN', '?'],
  ['CORRECTION', '!'],
  ['COLLATION', '*'],
  ['PRIME', "'"],
])('statusAbbreviation of %s is %s', (status, expected) => {
  expect(statusAbbreviation(status)).toEqual(expected)
})

test.each<[Label, string]>([
  [
    {
      status: [],
      abbreviation: 'prism',
    },
    'prism',
  ],
  [
    {
      status: ['CORRECTION'],
      abbreviation: 'r',
    },
    'r!',
  ],
  [
    {
      status: ['CORRECTION', 'UNCERTAIN'],
      abbreviation: 'v',
    },
    'v!?',
  ],
])('labelAbbreviation %p', (label, expected) => {
  expect(labelAbbreviation(label)).toEqual(expected)
})

test.each<[Labels, string]>([
  [defaultLabels, ''],
  [
    {
      object: {
        object: 'PRISM',
        text: '',
        status: [],
        abbreviation: 'prism',
      },
      surface: null,
      column: null,
    },
    'prism',
  ],
  [
    {
      object: null,
      surface: {
        status: ['CORRECTION'],
        surface: 'REVERSE',
        text: '',
        abbreviation: 'r',
      },
      column: null,
    },
    'r!',
  ],
  [
    {
      object: null,
      surface: null,
      column: {
        column: 5,
        status: [],
        abbreviation: 'v',
      },
    },
    'v',
  ],
  [
    {
      object: {
        object: 'TABLET',
        text: '',
        status: ['UNCERTAIN'],
        abbreviation: 'tablet',
      },
      surface: {
        status: [],
        surface: 'OBVERSE',
        text: '',
        abbreviation: 'o',
      },
      column: {
        column: 2,
        status: [],
        abbreviation: 'ii',
      },
    },
    'tablet? o ii',
  ],
])('labelsAbbreviation %p', (labels, expected) => {
  expect(labelsAbbreviation(labels)).toEqual(expected)
})
