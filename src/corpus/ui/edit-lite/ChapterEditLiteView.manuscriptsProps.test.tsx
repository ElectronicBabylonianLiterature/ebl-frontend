import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import TextService from 'corpus/application/TextService'
import { createText } from 'corpus/domain/text'
import ChapterEditLiteView from 'corpus/ui/edit-lite/ChapterEditLiteView'
import {
  editLiteChapterId,
  mockEditSource,
  waitForLoadedEditLite,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import FragmentService from 'fragmentarium/application/FragmentService'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { ChapterId } from 'transliteration/domain/chapter-id'

interface ManuscriptsProps {
  readonly id: ChapterId
  readonly uncertainFragments: readonly string[]
  readonly textService: TextService
  readonly fragmentService: FragmentService
  readonly searchBibliography: (
    query: string,
  ) => Promise<readonly BibliographyEntry[]>
}

const mockManuscriptsRenders: ManuscriptsProps[] = []

jest.mock('corpus/ui/edit-lite/EditLiteManuscripts', () => ({
  __esModule: true,
  default: (props: ManuscriptsProps): JSX.Element => {
    mockManuscriptsRenders.push(props)
    return <p>Manuscripts of {props.id.name}</p>
  },
}))
jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')
jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')

const text = createText({
  ...editLiteChapterId.textId,
  name: 'Poem of Creation',
  chapters: [
    {
      stage: editLiteChapterId.stage,
      name: editLiteChapterId.name,
      title: [],
      uncertainFragments: [{ museumNumber: 'K.1' }, { museumNumber: 'BM.2' }],
    },
  ],
})
const entries = bibliographyEntryFactory.buildList(2)
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const bibliographyService = { search: jest.fn() }

function createView(search: string): JSX.Element {
  return (
    <MemoryRouter>
      <ChapterEditLiteView
        id={{ ...editLiteChapterId }}
        textService={textService}
        fragmentService={fragmentService}
        bibliographyService={bibliographyService}
        search={search}
      />
    </MemoryRouter>
  )
}

function lastProps(): ManuscriptsProps {
  return mockManuscriptsRenders[mockManuscriptsRenders.length - 1]
}

async function renderOpenManuscripts(): Promise<RenderResult> {
  const view = render(createView(''))
  await waitForLoadedEditLite()
  await userEvent.click(screen.getByRole('tab', { name: 'Manuscripts' }))
  expect(screen.getByText('Manuscripts of I')).toBeInTheDocument()
  return view
}

beforeEach(() => {
  mockManuscriptsRenders.splice(0)
  textService.find.mockResolvedValue(text)
  bibliographyService.search.mockResolvedValue(entries)
  mockEditSource()
})

test('renders no manuscripts before the tab is opened', async () => {
  render(createView(''))
  await waitForLoadedEditLite()

  expect(mockManuscriptsRenders).toHaveLength(0)
  expect(textService.find).toHaveBeenCalledWith(
    editLiteChapterId.textId,
    expect.any(AbortSignal),
  )
})

test('gives the manuscripts the chapter, the services and the uncertain fragments', async () => {
  await renderOpenManuscripts()

  expect(mockManuscriptsRenders).toHaveLength(1)
  expect(lastProps().id).toEqual(editLiteChapterId)
  expect(lastProps().uncertainFragments).toEqual(['K.1', 'BM.2'])
  expect(lastProps().textService).toBe(textService)
  expect(lastProps().fragmentService).toBe(fragmentService)
})

test('searches the bibliography through the service', async () => {
  await renderOpenManuscripts()

  await expect(lastProps().searchBibliography('Borger')).resolves.toBe(entries)
  expect(bibliographyService.search).toHaveBeenCalledTimes(1)
  expect(bibliographyService.search).toHaveBeenCalledWith('Borger')
})

test('does not render the manuscripts again while a line is edited', async () => {
  await renderOpenManuscripts()
  await userEvent.click(screen.getByRole('tab', { name: 'Lines' }))

  await userEvent.type(await screen.findByLabelText('Number'), 'abc')

  expect(screen.getByLabelText('Number')).toHaveValue('1abc')
  expect(mockManuscriptsRenders).toHaveLength(1)
})

test('keeps the uncertain fragments and the search when the route renders again', async () => {
  const view = await renderOpenManuscripts()
  const firstProps = lastProps()

  view.rerender(createView('?line=2'))
  await screen.findByRole('listbox', { name: 'Lines' })
  await screen.findByLabelText('Number')

  expect(mockManuscriptsRenders).toHaveLength(2)
  expect(lastProps().uncertainFragments).toBe(firstProps.uncertainFragments)
  expect(lastProps().searchBibliography).toBe(firstProps.searchBibliography)
  expect(lastProps().id).not.toBe(firstProps.id)
  expect(textService.find).toHaveBeenCalledTimes(1)
})
