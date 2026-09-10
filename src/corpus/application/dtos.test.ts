import {
  manuscriptFactory,
  manuscriptDtoFactory,
} from 'test-support/manuscript-fixtures'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { fromManuscriptDto, toManuscriptsDto } from './dtos'

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
