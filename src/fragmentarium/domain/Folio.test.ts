import Chance from 'chance'
import Folio from './Folio'

describe('Folio', () => {
  const chance = new Chance()

  describe.each([
    ['Unknown', 'Unknown', false],
    ['AKG', 'Grayson', true],
    ['ARG', 'George', true],
    ['CB', 'Bezold', true],
    ['EL', 'Leichty', true],
    ['ER', 'Reiner', true],
    ['FWG', 'Geers', true],
    ['GS', 'Smith', true],
    ['HHF', 'Figulla', true],
    ['ILF', 'Finkel', true],
    ['JA', 'Aro', true],
    ['JS', 'Strassmaier', true],
    ['LV', 'Vacín', true],
    ['MJG', 'Geller', true],
    ['RB', 'Borger', true],
    ['SJL', 'Lieberman', true],
    ['SP', 'Parpola', true],
    ['UG', 'Gabbay', true],
    ['USK', 'Koch', true],
    ['WGL', 'Lambert', true],
    ['WRM', 'Mayer', true],
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
        expect(folio.fileName).toEqual(`${name}_${number}`)
      })

      test('Has image', () => {
        expect(folio.hasImage).toEqual(hasImage)
      })
    }
  )
})
