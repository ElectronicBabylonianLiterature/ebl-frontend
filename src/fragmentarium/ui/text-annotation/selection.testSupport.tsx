import React from 'react'
import { render, screen } from '@testing-library/react'

export type SelectionConfig = {
  anchorNode: Node
  focusNode: Node
  isCollapsed: boolean
  rangeCount: number
  range: Range | null
}

export const createSelection = ({
  anchorNode,
  focusNode,
  isCollapsed,
  rangeCount,
  range,
}: SelectionConfig): Selection =>
  ({
    anchorNode,
    focusNode,
    isCollapsed,
    rangeCount,
    getRangeAt: jest.fn().mockReturnValue(range),
    empty: jest.fn(),
    removeAllRanges: jest.fn(),
  }) as unknown as Selection

export const createRange = ({
  startContainer,
  endContainer,
  collapsed,
  intersectsNode,
}: {
  startContainer: Node
  endContainer: Node
  collapsed: boolean
  intersectsNode: (node: Node) => boolean
}): Range =>
  ({
    startContainer,
    endContainer,
    collapsed,
    intersectsNode,
  }) as unknown as Range

export const renderSelectionFixture = (): {
  words: string[]
  markables: HTMLElement[]
  separator: HTMLElement
} => {
  render(
    <div>
      <span className="markable" data-id="Word-1">
        first
      </span>
      <span data-testid="separator"> </span>
      <span className="markable" data-id="Word-2">
        second
      </span>
      <span className="markable" data-id="Word-3">
        third
      </span>
    </div>,
  )

  const markables = screen.getAllByText(/first|second|third/)
  const separator = screen.getByTestId('separator')

  return {
    words: ['Word-1', 'Word-2', 'Word-3'],
    markables,
    separator,
  }
}
