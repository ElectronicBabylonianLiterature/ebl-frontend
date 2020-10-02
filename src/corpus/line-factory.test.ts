import { createLine, createManuscriptLine } from './text'
import { createDefaultLineFactory } from './line-factory'
import { produce } from 'immer'

const defaultReconstruction = '%n '

describe('createDefaultLineFactory', () => {
  test('no lines', () => {
    expect(createDefaultLineFactory()()).toEqual(createLine({}))
  })

  describe.each([
    ['', ''],
    ['13', '14'],
    ['2', '3'],
    ['6b', ''],
  ])(
    'If line number is "%s" then the next number is "%s".',
    (number, expected) => {
      test('line', () => {
        expect(
          createDefaultLineFactory(
            createLine({
              number: number,
            })
          )()
        ).toEqual(
          createLine({
            number: expected,
            reconstruction: defaultReconstruction,
          })
        )
      })

      test('manuscript', () => {
        expect(
          createDefaultLineFactory(
            createLine({
              manuscripts: [
                createManuscriptLine({
                  number: number,
                }),
              ],
            })
          )()
        ).toEqual(
          createLine({
            reconstruction: defaultReconstruction,
            manuscripts: [
              createManuscriptLine({
                number: expected,
              }),
            ],
          })
        )
      })
    }
  )

  test('Has the manuscripts without transliteration in same order.', () => {
    const manuscripts = [
      createManuscriptLine({
        manuscriptId: 2,
        labels: ['ii'],
      }),
      createManuscriptLine({
        manuscriptId: 1,
        atf: 'kur',
      }),
    ]
    expect(
      createDefaultLineFactory(
        createLine({
          manuscripts: manuscripts,
        })
      )()
    ).toEqual(
      createLine({
        reconstruction: defaultReconstruction,
        manuscripts: produce(manuscripts, (draft) => {
          draft.forEach((manuscript) => {
            manuscript.atf = ''
          })
        }),
      })
    )
  })
})
