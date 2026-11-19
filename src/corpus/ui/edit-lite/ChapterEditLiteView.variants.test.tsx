import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  countTextRequests,
  createEditLiteFakeApi,
  createSourceMock,
  editLitePath,
  mockEditSource,
  renderLoadedEditLiteRoute,
  secondEditLiteChapterId,
  secondEditLitePath,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  queryTargetLine,
  waitForLoadedPage,
} from 'corpus/ui/edit-lite/PagedLines.testSupport'
import {
  loadedEditor,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

const scoreHint =
  'Select a line to edit it. Manuscript lines load as you scroll.'
const lastManuscriptRow = '8. ap-su-um-ma'

function versionLink(name: string): HTMLElement {
  return within(
    screen.getByRole('navigation', { name: 'Editor version' }),
  ).getByRole('link', { name })
}

function accordionHeader(lineNumber: string): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(`^${lineNumber} %n`) })
}

async function switchTo(name: string): Promise<void> {
  await userEvent.click(versionLink(name))
  expect(versionLink(name)).toHaveAttribute('aria-current', 'page')
}

async function editFirstLineInAccordion(): Promise<void> {
  await userEvent.click(accordionHeader('1'))
  await userEvent.type(await screen.findByLabelText('Number'), 'a')
}

test('shows the accordion by default', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  expect(screen.getByRole('list', { name: 'Lines' })).toBeInTheDocument()
  expect(versionLink('A · Accordion')).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('tab', { name: 'Lines' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('shows the pages', async () => {
  mockEditSource({ lines: buildEditLiteLines(30) })
  await renderLoadedEditLiteRoute({ search: '?variant=pages&size=25&line=27' })
  await waitForLoadedPage()

  expect(versionLink('B · Pages')).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText('Lines 26–30 of 30')).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: 'Lines per page' })).toHaveValue(
    '25',
  )
  expect(queryTargetLine()).toHaveTextContent(/^Line 27/)
})

test('shows the split view', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ search: '?variant=split&line=2' })
  await loadedEditor('2')

  expect(versionLink('C · Split view')).toHaveAttribute('aria-current', 'page')
  expect(selectedOptions()[0]).toHaveTextContent(/^2%n/)
})

test('shows the inline score', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ search: '?variant=score' })

  expect(await screen.findByText(lastManuscriptRow)).toBeInTheDocument()
  expect(versionLink('D · Inline score')).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(screen.getByText(scoreHint)).toBeInTheDocument()
})

test('links the versions without changing the other parameters', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ search: '?source=legacy&line=2' })

  expect(versionLink('A · Accordion')).toHaveAttribute(
    'href',
    `${editLitePath}?line=2&source=legacy&variant=accordion`,
  )
  expect(versionLink('C · Split view')).toHaveAttribute(
    'href',
    `${editLitePath}?line=2&source=legacy&variant=split`,
  )
  expect(accordionHeader('2')).toHaveAttribute('aria-expanded', 'true')
  expect(await screen.findByLabelText('Number')).toHaveValue('2')
})

test('keeps the loaded data and an edited draft when the version changes', async () => {
  const fakeApi = createEditLiteFakeApi()
  const source = mockEditSource()
  await renderLoadedEditLiteRoute({ fakeApi })
  await editFirstLineInAccordion()

  await switchTo('C · Split view')
  const splitEditor = await loadedEditor('1')

  expect(within(splitEditor).getByLabelText('Number')).toHaveValue('1a')
  expect(within(selectedOptions()[0]).getByText('edited')).toBeInTheDocument()

  await switchTo('D · Inline score')

  expect(await screen.findByText(lastManuscriptRow)).toBeInTheDocument()
  expect(
    within(screen.getByRole('button', { name: /^1a / })).getByText('edited'),
  ).toBeInTheDocument()

  await switchTo('B · Pages')
  await waitForLoadedPage()

  expect(
    screen.getByRole('heading', { name: 'Line 1 edited' }),
  ).toBeInTheDocument()
  expect(screen.getAllByLabelText('Number')[0]).toHaveValue('1a')

  await switchTo('A · Accordion')

  expect(within(accordionHeader('1')).getByText('edited')).toBeInTheDocument()
  expect(createSourceMock).toHaveBeenCalledTimes(1)
  expect(source.loadOutline).not.toHaveBeenCalled()
  expect(countTextRequests(fakeApi)).toBe(1)
  expect(source.loadLines.mock.calls).toEqual([
    [0, 1],
    [1, 1],
    [2, 1],
  ])
})

test('counts the document again when lines have loaded and the version changes', async () => {
  const countedElements = (): number =>
    Number(screen.getByTestId('edit-lite-dom-nodes').textContent)
  const presentElements = (): number =>
    (document.documentElement.outerHTML.match(/<[a-z]/gi) ?? []).length
  mockEditSource({ lines: buildEditLiteLines(30) })
  await renderLoadedEditLiteRoute({ search: '?variant=pages' })
  await waitForLoadedPage()
  const pagesCount = countedElements()

  expect(pagesCount).toBe(presentElements())

  await switchTo('C · Split view')
  await loadedEditor('1')

  expect(countedElements()).toBe(presentElements())
  expect(countedElements()).not.toBe(pagesCount)
})

test('keeps the loaded data when only the line changes', async () => {
  const lineLink = `${editLitePath}?line=2`
  mockEditSource()
  await renderLoadedEditLiteRoute({ links: [lineLink] })
  await editFirstLineInAccordion()

  await userEvent.click(screen.getByRole('link', { name: lineLink }))

  expect(screen.getByLabelText('Number')).toHaveValue('1a')
  expect(createSourceMock).toHaveBeenCalledTimes(1)
})

test('loads again and drops the drafts when the source mode changes', async () => {
  const legacyLink = `${editLitePath}?source=legacy`
  const fakeApi = createEditLiteFakeApi()
  mockEditSource()
  await renderLoadedEditLiteRoute({ fakeApi, links: [legacyLink] })
  await editFirstLineInAccordion()
  mockEditSource({ kind: 'legacy' })

  await userEvent.click(screen.getByRole('link', { name: legacyLink }))

  expect(await screen.findByTestId('edit-lite-source-kind')).toHaveTextContent(
    'legacy',
  )
  expect(createSourceMock).toHaveBeenCalledTimes(2)
  expect(createSourceMock).toHaveBeenLastCalledWith(
    expect.objectContaining({ mode: 'legacy' }),
  )
  expect(countTextRequests(fakeApi)).toBe(2)
  expect(accordionHeader('1')).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('loads again when the chapter changes', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ links: [secondEditLitePath] })
  await editFirstLineInAccordion()
  mockEditSource({ lines: buildEditLiteLines(5) })

  await userEvent.click(screen.getByRole('link', { name: secondEditLitePath }))

  expect(
    await screen.findByRole('heading', {
      name: /^Edit Poem of Creation Standard Babylonian II /,
    }),
  ).toBeInTheDocument()
  expect(createSourceMock).toHaveBeenCalledTimes(2)
  expect(createSourceMock).toHaveBeenLastCalledWith(
    expect.objectContaining({ id: secondEditLiteChapterId }),
  )
  expect(screen.getByTestId('edit-lite-line-count')).toHaveTextContent('5')
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})
