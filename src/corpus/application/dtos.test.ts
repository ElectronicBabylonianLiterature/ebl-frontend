import {
  manuscriptFactory,
  manuscriptDtoFactory,
} from 'test-support/manuscript-fixtures'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import {
  fromLineDetailsDto,
  fromLineDto,
  fromManuscriptDto,
  toManuscriptsDto,
} from 'corpus/application/dtos'
import { EditStatus } from 'corpus/domain/line'
import { EmptyLine } from 'transliteration/domain/line'

const newManuscriptTypes = [
  [ManuscriptTypes['Multi-column tablet'], 'Multi-column tablet'],
  [ManuscriptTypes['Collective tablet'], 'Collective tablet'],
  [ManuscriptTypes['Student-teacher tablet'], 'Student-teacher tablet'],
  [ManuscriptTypes['School lentils'], 'School lentils'],
  [ManuscriptTypes.Prisms, 'Prisms'],
  [ManuscriptTypes.Uncertain, 'Uncertain'],
] as const

test.each(newManuscriptTypes)(
  'manuscript type %o serializes to backend wire value %s',
  (type, expectedWireValue) => {
    const manuscript = manuscriptFactory.type(type).build()

    const { manuscripts } = toManuscriptsDto([manuscript], []) as {
      manuscripts: { type: string }[]
    }
    const dto = manuscripts[0]

    expect(dto.type).toEqual(expectedWireValue)
  },
)

test.each(newManuscriptTypes)(
  'manuscript type %o deserializes from backend wire value %s',
  (type, wireValue) => {
    const manuscriptDto = manuscriptDtoFactory.build({ type: wireValue })

    const manuscript = fromManuscriptDto(manuscriptDto)

    expect(manuscript.type).toEqual(type)
  },
)

test('a line without variants has none', () => {
  const line = fromLineDto({ number: '1', translation: '' })

  expect(line.variants).toEqual([])
  expect(line.status).toEqual(EditStatus.CLEAN)
})

function lineDetailsDtoWithManuscriptLine(type: string) {
  return {
    variants: [
      {
        note: null,
        manuscripts: [
          {
            provenance: 'Nippur',
            periodModifier: 'None',
            period: 'Ur III',
            type: 'School',
            siglumDisambiguator: '1',
            oldSigla: [],
            labels: [],
            line: { type, prefix: '', content: [] },
            paratext: [],
            references: [],
            joins: [],
            museumNumber: 'X.1',
            isInFragmentarium: false,
            accession: '',
            omittedWords: [],
          },
        ],
      },
    ],
  }
}

test('a manuscript line can be empty', () => {
  const lineDetails = fromLineDetailsDto(
    lineDetailsDtoWithManuscriptLine('EmptyLine'),
    0,
  )

  expect(lineDetails.variants[0].manuscripts[0].line).toBeInstanceOf(EmptyLine)
})

test('a manuscript line must be a text line or empty', () => {
  expect(() =>
    fromLineDetailsDto(lineDetailsDtoWithManuscriptLine('ControlLine'), 0),
  ).toThrow('Unexpected manuscript line type "ControlLine".')
})
