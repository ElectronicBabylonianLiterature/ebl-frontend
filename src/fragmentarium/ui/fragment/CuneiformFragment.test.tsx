import { screen, within } from '@testing-library/react'
import _ from 'lodash'
import {
  CuneiformFragmentTestContext,
  setUpCuneiformFragment,
} from 'fragmentarium/ui/fragment/CuneiformFragment.testSupport'
import ResizeObserver from 'resize-observer-polyfill'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('auth/Session')

global.ResizeObserver = ResizeObserver

let context: CuneiformFragmentTestContext

const setup = async (): Promise<void> => {
  context = await setUpCuneiformFragment()
}

test.each(['collection', 'accession'])('Renders %s', async (property) => {
  await setup()
  expect(context.container).toHaveTextContent(context.fragment[property])
})

it('Renders CDLI number', async () => {
  await setup()
  expect(context.container).toHaveTextContent(
    context.fragment.getExternalNumber('cdliNumber'),
  )
})

it('Renders museum', async () => {
  await setup()
  expect(context.container).toHaveTextContent(context.fragment.museum.name)
})

it('Renders all joins', async () => {
  await setup()
  const joinsSection = screen.getByText(
    (_content, element) =>
      element?.classList.contains('Details-joins') ?? false,
  )

  for (const join of context.fragment.joins.flat()) {
    expect(
      within(joinsSection).getByText(
        new RegExp(_.escapeRegExp(join.museumNumber)),
      ),
    ).toBeInTheDocument()
  }
})

it('Renders all measures', async () => {
  await setup()
  for (const property of ['length', 'width', 'thickness']) {
    expect(context.container).toHaveTextContent(
      context.fragment.measures[property],
    )
  }
})

it('Renders all references', async () => {
  await setup()
  for (const reference of context.fragment.references) {
    expect(context.container).toHaveTextContent(reference.primaryAuthor)
  }
})

it('Renders all records', async () => {
  await setup()
  for (const uniqueRecord of context.fragment.uniqueRecord) {
    expect(context.container).toHaveTextContent(uniqueRecord.user)
  }
})

it('Renders all folios', async () => {
  await setup()
  for (const folio of context.fragment.folios) {
    expect(context.container).toHaveTextContent(folio.number)
  }
})
