import { finitePosition, isEditableTarget } from 'map/mapToolInput'

it.each(['input', 'textarea', 'select'])(
  'recognizes %s as an editable shortcut target',
  (tagName) => {
    expect(isEditableTarget(document.createElement(tagName))).toBe(true)
  },
)

it('recognizes contenteditable targets', () => {
  const target = document.createElement('div')
  Object.defineProperty(target, 'isContentEditable', { value: true })
  expect(isEditableTarget(target)).toBe(true)
})

it('rejects null, non-element, and noneditable shortcut targets', () => {
  expect(isEditableTarget(null)).toBe(false)
  expect(isEditableTarget(window)).toBe(false)
  expect(isEditableTarget(document.createElement('button'))).toBe(false)
})

it('accepts finite coordinates and rejects malformed positions', () => {
  expect(finitePosition(43, 35)).toEqual([43, 35])
  expect(finitePosition(Number.NaN, 35)).toBeNull()
  expect(finitePosition(43, Number.POSITIVE_INFINITY)).toBeNull()
})
