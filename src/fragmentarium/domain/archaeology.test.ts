import _ from 'lodash'
import {
  archaeologyFactory,
  dateRangeFactory,
  findspotFactory,
} from 'test-support/fragment-fixtures'
import {
  BuildingType,
  Findspot,
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
const findspot = findspotFactory.build({
  site: excavationSites[site],
  date: dateRangeFactory.build(),
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
    'date'
  ),
  _id: findspot.id,
  site: site,
  plans: [planDto],
}
const displayParams: Partial<Findspot> = {
  area: '',
  building: 'a house',
  buildingType: 'RESIDENTIAL' as BuildingType,
  levelLayerPhase: 'II',
  date: {
    start: -1200,
    end: -1150,
    notes: '',
  },
  notes: '',
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
test.each([
  [
    'with area and notes',
    { ...displayParams, area: 'some area', notes: 'general notes' },
    'some area > a house (Residential), II (1200 BCE - 1150 BCE), general notes.',
  ],
  [
    'no area and notes',
    { ...displayParams, area: '' },
    'a house (Residential), II (1200 BCE - 1150 BCE).',
  ],
  [
    'no notes',
    { ...displayParams, notes: '' },
    'a house (Residential), II (1200 BCE - 1150 BCE).',
  ],
  [
    'no buildingType',
    { ...displayParams, buildingType: null },
    'a house, II (1200 BCE - 1150 BCE).',
  ],
  [
    'no levelLayerPhase and date',
    { ...displayParams, levelLayerPhase: '', date: null },
    'a house (Residential).',
  ],
  [
    'with date notes',
    {
      ...displayParams,
      date: { ...displayParams.date, notes: 'date notes' },
    },
    'a house (Residential), II (1200 BCE - 1150 BCE, date notes).',
  ],
])('Correctly builds findspot info %s', (_info, params, expected) => {
  const findspot = findspotFactory.build(params)
  expect(findspot.toString()).toEqual(expected)
})
