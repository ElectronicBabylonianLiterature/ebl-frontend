import React from 'react'
import { render, screen } from '@testing-library/react'
import { getSelectedTokens } from 'fragmentarium/ui/text-annotation/selectionUtils'
import {
  createRange,
  createSelection,
  renderSelectionFixture,
} from 'fragmentarium/ui/text-annotation/selection.testSupport'

describe('getSelectedTokens', () => {
  it('returns an empty selection when browser selection is unavailable', () => {
    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(null)

    expect(getSelectedTokens(['Word-1'])).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when selection nodes are missing', () => {
    const selection = {
      anchorNode: null,
      focusNode: null,
      isCollapsed: false,
      rangeCount: 0,
      getRangeAt: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(['Word-1'])).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when selection is collapsed and has no range', () => {
    const { separator, words } = renderSelectionFixture()
    const selection = createSelection({
      anchorNode: separator,
      focusNode: separator,
      isCollapsed: true,
      rangeCount: 0,
      range: null,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when a collapsed range is reported', () => {
    const { separator, words } = renderSelectionFixture()
    const range = createRange({
      startContainer: separator,
      endContainer: separator,
      collapsed: true,
      intersectsNode: () => false,
    })
    const selection = createSelection({
      anchorNode: separator,
      focusNode: separator,
      isCollapsed: true,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual([])

    documentSelection.mockRestore()
  })

  it('returns an empty selection when sibling fallback finds no markable', () => {
    render(<span data-testid="outside">outside</span>)

    const outside = screen.getByTestId('outside')
    const selection = createSelection({
      anchorNode: outside,
      focusNode: outside,
      isCollapsed: false,
      rangeCount: 0,
      range: null,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(['Word-1'])).toEqual([])

    documentSelection.mockRestore()
  })

  it('falls back to range boundaries when intersectsNode throws', () => {
    const { markables, words } = renderSelectionFixture()
    const outside = document.createTextNode('outside')
    const range = createRange({
      startContainer: markables[0],
      endContainer: markables[1],
      collapsed: false,
      intersectsNode: () => {
        throw new Error('intersectsNode failed')
      },
    })
    const selection = createSelection({
      anchorNode: outside,
      focusNode: outside,
      isCollapsed: false,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual(words.slice(0, 2))

    documentSelection.mockRestore()
  })

  it('falls back to range boundaries when selection is collapsed but range is expanded', () => {
    const { markables, words } = renderSelectionFixture()
    const outside = document.createTextNode('outside')
    const range = createRange({
      startContainer: markables[0],
      endContainer: markables[1],
      collapsed: false,
      intersectsNode: () => false,
    })
    const selection = createSelection({
      anchorNode: outside,
      focusNode: outside,
      isCollapsed: true,
      rangeCount: 1,
      range,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(words)).toEqual(words.slice(0, 2))

    documentSelection.mockRestore()
  })

  it('returns an empty selection when resolved token ids are missing from words', () => {
    const { markables } = renderSelectionFixture()
    const selection = createSelection({
      anchorNode: markables[2],
      focusNode: markables[2],
      isCollapsed: false,
      rangeCount: 0,
      range: null,
    })

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)

    expect(getSelectedTokens(['Word-1', 'Word-2'])).toEqual([])

    documentSelection.mockRestore()
  })
})
