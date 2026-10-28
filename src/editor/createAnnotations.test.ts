import createAnnotations from 'editor/createAnnotations'

test('creates an annotation on the reported line', () => {
  expect(
    createAnnotations({
      data: {
        errors: [{ description: 'Invalid line', lineNumber: 2 }],
      },
    }),
  ).toEqual([
    {
      row: 1,
      column: 0,
      type: 'error',
      text: 'Invalid line',
    },
  ])
})

test.each([null, 'invalid', { transliteration: ['Invalid transliteration'] }])(
  'ignores non-array error data %p',
  (errors) => {
    expect(createAnnotations({ data: { errors } })).toEqual([])
  },
)

test.each([
  ['null error', null],
  ['string error', 'invalid'],
  ['missing line', { description: 'Invalid transliteration' }],
  ['non-string description', { description: 7, lineNumber: 2 }],
  ['infinite line', { description: 'Invalid line', lineNumber: Infinity }],
  ['fractional line', { description: 'Invalid line', lineNumber: 1.5 }],
  ['zero line', { description: 'Invalid line', lineNumber: 0 }],
  ['negative line', { description: 'Invalid line', lineNumber: -1 }],
  ['string line', { description: 'Invalid line', lineNumber: '2' }],
])('ignores production-shaped errors with %s', (_label, error) => {
  expect(createAnnotations({ data: { errors: [error] } })).toEqual([])
})
