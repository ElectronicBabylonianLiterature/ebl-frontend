import Chance from 'chance'
import Folio from './Folio'

describe('Folio', () => {
  const chance = new Chance()

  describe.each([
    ['Unknown', 'Unknown', false],
    ['WGL', 'Lambert', true],
    ['FWG', 'Geers', true],
    ['EL', 'Leichty', true],
    ['AKG', 'Grayson', true],
    ['MJG', 'Geller', true],
    ['WRM', 'Mayer', true],
    ['CB', 'Bezold', true],
    ['JS', 'Strassmaier', true],
    ['USK', 'Koch', true],
    ['ILF', 'Finkel', true],
    ['RB', 'Borger', true],
    ['SP', 'Parpola', true],
    ['ARG', 'George', true],
    ['UG', 'Gabbay', true],
    ['ER', 'Reiner', true],
    ['GS', 'Smith', true],
  ] as [string, string, boolean][])(
    '%s folios',
    (name, humanized, hasImage) => {
      let number: string
      let folio: Folio

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
    }
  )
})
