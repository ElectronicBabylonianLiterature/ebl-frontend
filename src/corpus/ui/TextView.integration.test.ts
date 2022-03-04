import Chance from 'chance'
import { ChapterId } from 'corpus/domain/chapter'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'corpus/domain/period'
import { Provenances } from 'corpus/domain/provenance'
import AppDriver from 'test-support/AppDriver'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import FakeApi from 'test-support/FakeApi'
import { joinDtoFactory } from 'test-support/join-fixtures'
import { textDto } from 'test-support/test-corpus-text'

const chance = new Chance('text view integration test')
const manuscriptsDto = [
  {
    id: 1,
    siglumDisambiguator: '1',
    museumNumber: 'BM.X',
    accession: '',
    periodModifier: PeriodModifiers.None.name,
    period: Periods['Old Babylonian'].name,
    provenance: Provenances.Assyria.name,
    type: ManuscriptTypes.School.name,
    notes: '',
    colophon: '1. kur',
    unplacedLines: '1. bu',
    references: referenceDtoFactory.buildList(
      1,
      {},
      { transient: { chance: chance } }
    ),
    joins: [
      [
        joinDtoFactory.build(
          {
            isChecked: false,
            isInFragmentarium: true,
          },
          { transient: { chance: chance } }
        ),
        joinDtoFactory.build(
          {
            isChecked: false,
            isInFragmentarium: false,
          },
          { transient: { chance: chance } }
        ),
      ],
      [
        joinDtoFactory.build(
          {
            isChecked: true,
            isInFragmentarium: true,
          },
          { transient: { chance: chance } }
        ),
        joinDtoFactory.build(
          {
            isChecked: true,
            isInFragmentarium: false,
          },
          { transient: { chance: chance } }
        ),
      ],
    ],
    isInFragmentarium: false,
  },
]

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

beforeEach(() => {
  fakeApi = new FakeApi()
  fakeApi.expectText(textDto)
  appDriver = new AppDriver(fakeApi.client).withPath(
    `/corpus/${textDto.genre}/${textDto.category}/${textDto.index}`
  )
})

test('With session', async () => {
  await appDriver.withSession().render()
  await appDriver.waitForText('Introduction')
  expect(appDriver.getView().container).toMatchSnapshot()
})

describe('Chapter', () => {
  beforeEach(async () => {
    await appDriver.withSession().render()
    await appDriver.waitForText(/Chapters/)
    appDriver.click(/Chapters/)
    await appDriver.waitForText(textDto.chapters[0].name)
  })

  test('Show chapter', async () => {
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Show list of manuscripts', async () => {
    const chapterId: ChapterId = {
      textId: {
        genre: textDto.genre,
        category: textDto.category,
        index: textDto.index,
      },
      stage: textDto.chapters[0].stage,
      name: textDto.chapters[0].name,
    }
    fakeApi
      .expectManuscripts(chapterId, manuscriptsDto)
      .expectExtantLines(chapterId, {
        AssaOBSch1: {
          'o iii': [
            {
              lineNumber: {
                number: 1,
                hasPrime: false,
                prefixModifier: null,
                suffixModifier: null,
              },
              isSideBoundary: true,
            },
            {
              lineNumber: {
                number: 2,
                hasPrime: false,
                prefixModifier: null,
                suffixModifier: null,
              },
              isSideBoundary: false,
            },
          ],
        },
      })
    appDriver.click(/List of Manuscripts/)
    await appDriver.waitForText(/^o iii/)
    expect(appDriver.getView().container).toMatchSnapshot()
  })
})

test('Without session', async () => {
  await appDriver.render()
  await appDriver.waitForText('Please log in to view the text.')
  expect(appDriver.getView().container).toMatchSnapshot()
})
