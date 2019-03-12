import Chance from 'chance'
import Folio from './createFolio'

const chance = new Chance()

describe.each([
  ['Unknown', 'Unknown', false],
  ['WGL', 'Lambert', true],
  ['FWG', 'Geers', false],
  ['EL', 'Leichty', true],
  ['AKG', 'Grayson', true],
  ['MJG', 'Geller', true]
])('%s folios', (name, humanized, hasImage) => {
  let number
  let folio

  beforeEach(() => {
    number = chance.string()
    folio = new Folio({ name, number })
  })

  test('Name', () => {
    expect(folio.name).toEqual(name)
  })

  test('Number', () => {
    expect(folio.number).toEqual(number)
  })

  test('Humanized name', () => {
    expect(folio.humanizedName).toEqual(humanized)
  })

  test('File name', () => {
    expect(folio.fileName).toEqual(`${name}_${number}.jpg`)
  })

  test('Has image', () => {
    expect(folio.hasImage).toEqual(hasImage)
  })
})
