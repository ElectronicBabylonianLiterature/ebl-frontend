import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AlignmentPopover } from './AlignmentPopover'
import { LineGroup } from './LineGroup'
import {
  highlightIndexSetterMock,
  lemmatizableToken,
  lineInfo,
} from 'test-support/line-group-fixtures'
import { AkkadianWord, Token } from 'transliteration/domain/token'

const unlemmatizedToken: AkkadianWord = {
  ...(lemmatizableToken as AkkadianWord),
  uniqueLemma: [],
  sentenceIndex: 2,
}

const trigger = 'trigger'

function renderTrigger(token: Token, lineGroup: LineGroup) {
  return render(
    <MemoryRouter>
      <AlignmentPopover token={token} lineGroup={lineGroup}>
        {trigger}
      </AlignmentPopover>
    </MemoryRouter>,
  )
}

describe('AlignmentPopover with unlemmatized word', () => {
  it('shows the trigger without a popover button', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(unlemmatizedToken, lineGroup)

    expect(screen.getByText(trigger)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('sets the active token index on hover', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(unlemmatizedToken, lineGroup)

    fireEvent.mouseEnter(screen.getByText(trigger))
    expect(highlightIndexSetterMock).toHaveBeenCalledWith(2)
    expect(lineGroup.highlightIndex).toBe(2)
  })

  it('resets the active token index on mouse leave', () => {
    const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

    renderTrigger(unlemmatizedToken, lineGroup)

    fireEvent.mouseEnter(screen.getByText(trigger))
    fireEvent.mouseLeave(screen.getByText(trigger))

    expect(highlightIndexSetterMock).toHaveBeenCalledWith(0)
    expect(lineGroup.highlightIndex).toBe(0)
  })
})
