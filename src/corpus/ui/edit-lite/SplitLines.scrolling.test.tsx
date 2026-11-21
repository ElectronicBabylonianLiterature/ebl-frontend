import userEvent from '@testing-library/user-event'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import { revealOption } from 'corpus/ui/edit-lite/SplitLines'
import {
  button,
  listbox,
  loadedEditor,
  pressKeys,
  renderSplit,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lineCount = 8
const optionHeight = 40
const listBorder = 1
const listTop = 100
const listHeight = 100

function rectangle(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON: (): Record<string, never> => ({}),
  }
}

function optionRectangle(option: Element): DOMRect {
  const position = Number(option.id.split('-option-')[1])
  return rectangle(
    listTop + position * optionHeight - listbox().scrollTop,
    optionHeight,
  )
}

function mockLayout(): void {
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: Element): DOMRect {
      switch (this.getAttribute('role')) {
        case 'listbox':
          return rectangle(listTop - listBorder, listHeight + 2 * listBorder)
        case 'option':
          return optionRectangle(this)
        default:
          return rectangle(0, 0)
      }
    })
  jest.spyOn(Element.prototype, 'clientTop', 'get').mockReturnValue(listBorder)
  jest
    .spyOn(Element.prototype, 'clientHeight', 'get')
    .mockReturnValue(listHeight)
}

async function renderLoadedSplit(initialLine: number): Promise<void> {
  renderSplit(initialLine, { lines: buildEditLiteLines(lineCount) })
  await loadedEditor(`${initialLine + 1}`)
}

let scrollIntoView: jest.SpyInstance

beforeEach(() => {
  scrollIntoView = jest.spyOn(window.HTMLElement.prototype, 'scrollIntoView')
  mockLayout()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('the list stays at the top for the first line', async () => {
  await renderLoadedSplit(0)

  expect(listbox().scrollTop).toBe(0)
})

test('the initial line is scrolled into view inside the list', async () => {
  await renderLoadedSplit(5)

  expect(listbox().scrollTop).toBe(140)
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('the keyboard scrolls the list only as far as needed', async () => {
  await renderLoadedSplit(0)
  await userEvent.tab()
  await pressKeys('{ArrowDown}', '2')

  expect(listbox().scrollTop).toBe(0)

  await pressKeys('{ArrowDown}', '3')

  expect(listbox().scrollTop).toBe(20)

  await pressKeys('{End}', '8')

  expect(listbox().scrollTop).toBe(220)

  await pressKeys('{ArrowUp}', '7')

  expect(listbox().scrollTop).toBe(220)

  await pressKeys('{Home}', '1')

  expect(listbox().scrollTop).toBe(0)
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('the next button scrolls the list without moving the page', async () => {
  await renderLoadedSplit(1)
  await userEvent.click(button('Next'))
  await loadedEditor('3')

  expect(listbox().scrollTop).toBe(20)
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('a moved line is kept in view inside the list', async () => {
  await renderLoadedSplit(1)
  await userEvent.click(button('Move down'))
  await waitForOrder(['1', '3', '2', '4', '5', '6', '7', '8'])

  expect(listbox().scrollTop).toBe(20)

  await userEvent.click(button('Move down'))
  await waitForOrder(['1', '3', '4', '2', '5', '6', '7', '8'])

  expect(listbox().scrollTop).toBe(60)
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('revealing a missing option leaves the list where it is', async () => {
  await renderLoadedSplit(5)
  revealOption(listbox(), lineCount)
  revealOption(null, 0)

  expect(listbox().scrollTop).toBe(140)
})
