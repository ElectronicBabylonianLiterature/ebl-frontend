import Template from './Template'

it('The string is empty', () => {
  const template = new Template('')
  expect(template.isEmpty).toEqual(true)
})

it('The string is not empty', () => {
  const template = new Template('5')
  expect(template.isEmpty).toEqual(false)
})

it('The input is not valid', () => {
  const template = new Template('-6,7')
  expect(template.isValid).toEqual(false)
})

it('The input is not valid', () => {
  const template = new Template('invalid')
  expect(template.isValid).toEqual(false)
})

it('The input is valid', () => {
  const template = new Template('6,7')
  expect(template.isValid).toEqual(true)
})

it('The input is valid', () => {
  const template = new Template('3')
  expect(template.isValid).toEqual(true)
})

it('The input is valid', () => {
  const template = new Template('1\', 1#')
  expect(template.isValid).toEqual(true)
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
