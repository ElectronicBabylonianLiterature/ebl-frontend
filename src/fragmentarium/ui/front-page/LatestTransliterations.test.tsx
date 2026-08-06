import { screen } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { queryItemOf } from 'test-support/utils'
import {
  chance,
  createLatestTransliterationsTestContext,
  LatestTransliterationsTestContext,
} from 'fragmentarium/ui/front-page/LatestTransliterations.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('dossiers/application/DossiersService')

const numberOfFragments = 2

let context: LatestTransliterationsTestContext

beforeEach(() => {
  jest.clearAllMocks()
  context = createLatestTransliterationsTestContext()
})

test('Snapshot', async () => {
  const { fragmentService, dossiersService, renderLatest } = context
  const fragments: Fragment[] = fragmentFactory.buildList(
    numberOfFragments,
    {},
    { transient: { chance } },
  )
  fragmentService.queryLatest.mockReturnValueOnce(
    Promise.resolve({
      items: fragments.map(queryItemOf),
      matchCountTotal: 0,
    }),
  )
  fragmentService.find
    .mockReturnValueOnce(Promise.resolve(fragments[0]))
    .mockReturnValueOnce(Promise.resolve(fragments[1]))
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })
  dossiersService.queryByIds.mockResolvedValue([])

  const view = renderLatest()

  await screen.findByText('Latest Additions')
  await screen.findByText(fragments[0].number)
  await screen.findByText(fragments[1].number)

  expect(view).toMatchSnapshot()
})
