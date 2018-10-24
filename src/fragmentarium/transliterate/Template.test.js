import Template from './Template'

it('The string is empty', () => {
  const template = new Template('')
  expect(template.isEmpty).toEqual(true)
})

it('The string is not empty', () => {
  const template = new Template('5')
  expect(template.isEmpty).toEqual(false)
})

describe.each([
  ['-6,7'],
  ['invalid']
])('%s the input is not valid', (rowNumbers) => {
  it('the input is not valid', () => {
    const template = new Template(rowNumbers)
    expect(template.isValid).toEqual(false)
  })
})

describe.each([
  ['6,7'],
  ['3'],
  ['1\', 1#']
])('%s the input is valid', (rowNumbers) => {
  it('the input is valid', () => {
    const template = new Template(rowNumbers)
    expect(template.isValid).toEqual(true)
  })
})

it('Creates specified number of rows on observe', () => {
  const template = new Template('3')
  expect(template.generate()).toEqual(`1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`)
})

it('Creates specified number of rows obverse and reverse', () => {
  const template = new Template('2, 3')
  expect(template.generate()).toEqual(`@obverse
1. [...]  [...]
2. [...]  [...]

@reverse
1. [...]  [...]
2. [...]  [...]
3. [...]  [...]`)
})

it('Adds suffix after row number', () => {
  const template = new Template('1\', 1#')
  expect(template.generate()).toEqual(`@obverse
1'. [...]  [...]

@reverse
1#. [...]  [...]`)
})
