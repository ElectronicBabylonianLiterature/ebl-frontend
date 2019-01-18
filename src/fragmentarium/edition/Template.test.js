import Template from './Template'

test.each([
  ['', true],
  ['5', false]
])('For %s the isEmpty returns %p', (pattern, expected) => {
  const template = new Template(pattern)
  expect(template.isEmpty).toEqual(expected)
})

test.each([
  ['6,7', true],
  ['3', true],
  ['1\', 1#', true],
  ['-6,7', false],
  ['invalid', false]
])('For %s the isValid returns %p', (pattern, expected) => {
  const template = new Template(pattern)
  expect(template.isValid).toEqual(expected)
})

test.each([
  [
    '3',
    `1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`
  ],
  [
    '2, 3',
    `@obverse
1. [...]  [...]
2. [...]  [...]

@reverse
1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`
  ],
  [
    '1\', 1#',
    `@obverse
1'. [...]  [...]

@reverse
1#. [...]  [...]`
  ]
])('Pattern %s generates %s', (pattern, expected) => {
  const template = new Template(pattern)
  expect(template.generate()).toEqual(expected)
})
