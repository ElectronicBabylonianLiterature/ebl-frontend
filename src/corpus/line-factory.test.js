import { createLine, createManuscriptLine } from './text'
import { createDefaultLineFactory } from './line-factory'
import { List } from 'immutable'

describe('createDefaultLineFactory', () => {
  test('no lines', () => {
    expect(createDefaultLineFactory()()).toEqual(createLine())
  })

  describe.each([['', ''], ['13', '14'], ['2', '3'], ['6b', '']])(
    'If line number is "%s" then the next number is "%s".',
    (number, expected) => {
      test('line', () => {
        expect(
          createDefaultLineFactory(
            createLine({
              number: number
            })
          )()
        ).toEqual(
          createLine({
            number: expected
          })
        )
      })

      test('manuscript', () => {
        expect(
          createDefaultLineFactory(
            createLine({
              manuscripts: List.of(
                createManuscriptLine({
                  number: number
                })
              )
            })
          )()
        ).toEqual(
          createLine({
            manuscripts: List.of(
              createManuscriptLine({
                number: expected
              })
            )
          })
        )
      })
    }
  )

  test('Has the manuscripts without transliteration in same order.', () => {
    const manuscripts = List.of(
      createManuscriptLine({
        manuscriptId: 2,
        labels: List.of('ii')
      }),
      createManuscriptLine({
        manuscriptId: 1,
        atf: 'kur'
      })
    )
    expect(
      createDefaultLineFactory(
        createLine({
          manuscripts: manuscripts
        })
      )()
    ).toEqual(
      createLine({
        manuscripts: manuscripts.map(manuscript => manuscript.set('atf', ''))
      })
    )
  })
})
