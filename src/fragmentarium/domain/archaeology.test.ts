import _ from 'lodash'
import {
  archaeologyFactory,
  dateRangeFactory,
  findspotFactory,
} from 'test-support/fragment-fixtures'
import {
  FindspotDto,
  SiteKey,
  createArchaeology,
  excavationSites,
  fromFindspotDto,
  fromPlanDto,
  toArchaeologyDto,
  toFindspotDto,
  toPlanDto,
} from './archaeology'
import MuseumNumber, { museumNumberToString } from './MuseumNumber'
import {
  cslDataFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'
import createReference from 'bibliography/application/createReference'

const excavationNumber: MuseumNumber = {
  prefix: 'A',
  number: '38',
  suffix: '',
}
const site: SiteKey = 'Assyria'

const cslData = cslDataFactory.build()
const referenceDto = referenceDtoFactory.build(
  { id: cslData.id },
  { associations: { document: cslData } }
)
const reference = createReference(referenceDto)
const planDto = {
  svg: '<svg></svg>',
  references: [referenceDto],
}
const plan = { svg: '<svg></svg>', references: [reference] }
const dateRange = dateRangeFactory.build()
const findspot = findspotFactory.build({
  site: excavationSites[site],
  dateRange: dateRange,
  plans: [plan],
})
const findspotDto: FindspotDto = {
  ..._.pick(
    findspot,
    'area',
    'building',
    'buildingType',
    'levelLayerPhase',
    'room',
    'context',
    'primaryContext',
    'notes',
    'dateRange'
  ),
  _id: findspot.id,
  site: site,
  plans: [planDto],
}
const archaeology = archaeologyFactory.build(
  {
    excavationNumber: museumNumberToString(excavationNumber),
  },
  {
    associations: {
      findspot,
    },
  }
)

test('fromPlanDto', () => {
  expect(fromPlanDto(planDto)).toEqual(plan)
})
test('toPlanDto', () => {
  expect(toPlanDto(plan)).toEqual(planDto)
})
test('fromFindspotDto', () => {
  expect(fromFindspotDto(findspotDto)).toEqual(findspot)
})
test('toFindspotDto', () => {
  expect(toFindspotDto(findspot)).toEqual(findspotDto)
})
test('fromPlanDto', () => {
  expect(fromPlanDto(planDto)).toEqual(plan)
})
test('toArchaeologyDto', () => {
  expect(toArchaeologyDto(archaeology)).toEqual({
    ...archaeology,
    site: archaeology.site?.name,
    findspot: archaeology.findspot ? toFindspotDto(archaeology.findspot) : null,
  })
})
test('createArchaeology', () => {
  expect(
    createArchaeology({
      ...toArchaeologyDto(archaeology),
      excavationNumber,
    })
  ).toEqual(archaeology)
})
