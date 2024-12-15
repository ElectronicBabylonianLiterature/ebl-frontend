import _ from 'lodash'
import {
  archaeologyFactory,
  dateRangeFactory,
  findspotFactory,
} from 'test-support/fragment-data-fixtures'
import {
  BuildingType,
  Findspot,
  PartialDate,
  SiteKey,
  excavationSites,
} from './archaeology'
import {
  FindspotDto,
  fromFindspotDto,
  fromPlanDto,
  toFindspotDto,
  toPlanDto,
} from './archaeologyDtos'
import { createArchaeology, toArchaeologyDto } from './archaeologyDtos'
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
    'sector',
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
const defaultParams: Partial<Findspot> = {
  sector: '',
  sector: '',
  area: '',
  building: 'a house',
  buildingType: 'RESIDENTIAL' as BuildingType,
  levelLayerPhase: 'II',
  date: {
    start: new PartialDate(-1200),
    end: new PartialDate(-1150),
    notes: '',
  },
  room: '',
  context: '',
  primaryContext: null,
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
    'with full info',
    {
      sector: 'some sector',
      sector: 'some sector',
      area: 'some area',
      room: 'Room 42',
      context: 'On the floor',
      primaryContext: true,
      notes: 'General notes.',
    },
    'some sector > some area > a house (Residential), II (1200 BCE – 1150 BCE), ' +
      'Room 42, On the floor (primary context). General notes.',
    'de-DE',
  ],
  [
    'with secondary context',
    {
      primaryContext: false,
      context: 'in shelf',
      date: null,
    },
    'a house (Residential), II, in shelf (secondary context).',
    'de-DE',
  ],
  [
    'with area and notes',
    { area: 'some area', notes: 'General notes.' },
    'some area > a house (Residential), II (1200 BCE – 1150 BCE). General notes.',
    'de-DE',
  ],
  [
    'without area or notes',
    { area: '' },
    'a house (Residential), II (1200 BCE – 1150 BCE).',
    'en-US',
  ],
  [
    'without notes',
    { notes: '' },
    'a house (Residential), II (1200 BCE – 1150 BCE).',
    'en-US',
  ],
  [
    'without building',
    { building: '' },
    '(Residential), II (1200 BCE – 1150 BCE).',
    'de-DE',
  ],
  [
    'without buildingType',
    { buildingType: null },
    'a house, II (1200 BCE – 1150 BCE).',
    'en-US',
  ],
  [
    'without levelLayerPhase and date',
    { levelLayerPhase: '', date: null },
    'a house (Residential).',
    'de-DE',
  ],
  [
    'with date notes',
    {
      date: { ...defaultParams.date, notes: 'date notes' },
    },
    'a house (Residential), II (1200 BCE – 1150 BCE, date notes).',
    'en-US',
  ],
  [
    'with CE date (en-US)',
    {
      date: {
        start: new PartialDate(1920, 6, 5),
        end: null,
        notes: '',
      },
    },
    'a house (Residential), II (06/05/1920).',
    'en-US',
  ],
  [
    'with CE date (de-DE)',
    {
      date: {
        start: new PartialDate(1920, 6, 5),
        end: null,
        notes: '',
      },
    },
    'a house (Residential), II (06/05/1920).',
    'de-DE',
  ],
])(
  'Correctly builds findspot info %s',
  (_info, overrideParams, expected, locale) => {
    const findspot = findspotFactory.build({
      ...defaultParams,
      ...overrideParams,
    })

    expect(findspot.toString()).toEqual(expected)
  }
)
