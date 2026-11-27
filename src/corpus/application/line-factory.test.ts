import {
  createLine,
  createVariant,
  createManuscriptLine,
  EditStatus,
} from 'corpus/domain/line'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import { produce } from 'immer'

const defaultReconstruction = '%n '

describe('createDefaultLineFactory', () => {
  test('no lines', () => {
    expect(createDefaultLineFactory()()).toEqual(
      createLine({
        variants: [createVariant({ reconstruction: defaultReconstruction })],
        status: EditStatus.NEW,
      }),
    )
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
            createLine(
              createLine({
                number: number,
                variants: [
                  createVariant({
                    reconstruction: defaultReconstruction,
                  }),
                ],
              }),
            ),
          )(),
        ).toEqual(
          createLine({
            number: expected,
            variants: [
              createVariant({
                reconstruction: defaultReconstruction,
              }),
            ],
            status: EditStatus.NEW,
          }),
        )
      })

      test('manuscript', () => {
        expect(
          createDefaultLineFactory(
            createLine({
              variants: [
                createVariant({
                  manuscripts: [
                    createManuscriptLine({
                      number: number,
                    }),
                  ],
                }),
              ],
            }),
          )(),
        ).toEqual(
          createLine({
            variants: [
              createVariant({
                reconstruction: defaultReconstruction,
                manuscripts: [
                  createManuscriptLine({
                    number: expected,
                  }),
                ],
              }),
            ],
            status: EditStatus.NEW,
          }),
        )
      })
    },
  )

  test.each<[string, string[], string]>([
    ['5', ['6'], '7'],
    ['5', ['7', '4', '5'], '6'],
    ['1', ['2', '3', '4', '5', '1'], '6'],
    ["5'", ["6'", '7'], "7'"],
    ['5', ["6'"], '6'],
    ['6b', ['', '7'], ''],
    ['', ['', '1'], ''],
  ])(
    'If line number is "%s" and %j are taken then the next number is "%s".',
    (number, takenNumbers, expected) => {
      const lastLine = createLine({
        number,
        variants: [
          createVariant({ manuscripts: [createManuscriptLine({ number })] }),
        ],
      })

      expect(createDefaultLineFactory(lastLine, takenNumbers)()).toEqual({
        ...createDefaultLineFactory(lastLine)(),
        number: expected,
      })
    },
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
          variants: [
            createVariant({
              manuscripts: manuscripts,
            }),
          ],
        }),
      )(),
    ).toEqual(
      createLine({
        variants: [
          createVariant({
            reconstruction: defaultReconstruction,
            manuscripts: produce(manuscripts, (draft) => {
              draft.forEach((manuscript) => {
                manuscript.atf = ''
              })
            }),
          }),
        ],
        status: EditStatus.NEW,
      }),
    )
  })
})
