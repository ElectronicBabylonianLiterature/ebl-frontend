import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { guestSession } from 'auth/Session'
import {
  editFirstLine,
  leavePage,
  mockEditSource,
  openManuscriptsTab,
  renderLoadedEditLiteRoute,
  tabPanel,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  firstSiglum,
  openManuscript,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import { loadedEditor } from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { unsavedChangesMessage } from 'fragmentarium/ui/edition/beforeUnloadWarning'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

test('leaving a page without changes does not warn', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await loadedEditor('1')

  expect(leavePage()).toBe('')
})

test('an unsaved draft warns until it is reset', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await editFirstLine()

  expect(leavePage()).toBe(unsavedChangesMessage)

  await userEvent.click(button('Reset'))

  expect(leavePage()).toBe('')
})

test('an unsaved draft warns until it is saved', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await editFirstLine()
  await userEvent.click(button('Save line'))
  await screen.findByRole('region', { name: 'Line 1a' })

  expect(leavePage()).toBe('')
})

test('a draft of a line that is no longer selected still warns', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await editFirstLine()
  await userEvent.click(button('Next'))
  await loadedEditor('2')

  expect(leavePage()).toBe(unsavedChangesMessage)
})

test('an unsaved new line warns until it is discarded', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await loadedEditor('1')
  await userEvent.click(button('Add line'))
  await screen.findByRole('button', { name: 'Discard new line' })

  expect(leavePage()).toBe(unsavedChangesMessage)

  await userEvent.click(button('Discard new line'))

  expect(leavePage()).toBe('')
})

test('an unsaved new line warns until it is saved', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await loadedEditor('1')
  await userEvent.click(button('Add line'))
  await userEvent.click(
    await screen.findByRole('button', { name: 'Save line' }),
  )
  await screen.findByRole('region', { name: 'Line 4' })

  expect(leavePage()).toBe('')
})

test('unsaved manuscripts warn until they are saved', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await openManuscriptsTab()
  const manuscript = within(await openManuscript(firstSiglum))

  expect(leavePage()).toBe('')

  await userEvent.type(manuscript.getByLabelText('Notes'), '!')

  expect(leavePage()).toBe(unsavedChangesMessage)

  await userEvent.click(button('Save manuscripts'))
  await within(tabPanel('Manuscripts')).findByText('1 manuscript')

  expect(leavePage()).toBe('')
})

test('undoing a manuscript edit stops the warning', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await openManuscriptsTab()
  const manuscript = within(await openManuscript(firstSiglum))
  await userEvent.type(manuscript.getByLabelText('Notes'), '!{Backspace}')

  expect(leavePage()).toBe('')
})

test('the warning is gone when the page is left', async () => {
  mockEditSource()
  const view = await renderLoadedEditLiteRoute()
  await editFirstLine()
  view.unmount()

  expect(leavePage()).toBe('')
})

test('a reader is never warned', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ session: guestSession })
  await loadedEditor('1')

  expect(leavePage()).toBe('')
})
