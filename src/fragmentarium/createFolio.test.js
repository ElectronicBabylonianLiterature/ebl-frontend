import Chance from 'chance'
import createFolio from './createFolio'

const chance = new Chance()

describe.each([
  ['Unknown', 'Unknown', false],
  ['WGL', 'Lambert', true],
  ['FWG', 'Geers', false],
  ['EL', 'Leichty', false],
  ['AKG', 'Grayson', true],
  ['MJG', 'Geller', true]
])('%s folios', (name, humanized, hasImage) => {
  it('Creates a correct folio', () => {
    const number = chance.string()
    const folio = createFolio(name, number)

    expect(folio).toEqual({
      name: name,
      number: number,
      humanizedName: humanized,
      fileName: `${name}_${number}.jpg`,
      hasImage: hasImage
    })
  })
})
