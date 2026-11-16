import { finitePosition, isEditableTarget } from 'map/domain/mapToolInput'

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

it.each([-90, 90])(
  'accepts latitude boundary %s with world-copy longitude',
  (latitude) => {
    expect(finitePosition(403, latitude)).toEqual([403, latitude])
  },
)

it.each([-90.01, 90.01])(
  'rejects latitude %s outside the valid range',
  (latitude) => {
    expect(finitePosition(43, latitude)).toBeNull()
  },
)
