import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import {
  getDropdownToggle,
  mockCallbacks,
  renderButton,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.testSupport'

jest.mock('transliteration/ui/DisplayToken', () => {
  return {
    __esModule: true,
    default: ({ token }: { token: { value: string } }) => (
      <span>{token.value}</span>
    ),
  }
})

let token: EditableToken

describe('LemmaActionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    token = new EditableToken(kurToken, 0, 0, 0, [])
  })

  describe('Mouse Events', () => {
    it('calls onMouseEnter on "Update all instances" hover', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.mouseEnter(updateOption)

      expect(mockCallbacks.onMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseLeave on "Update all instances" hover leave', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.mouseLeave(updateOption)

      expect(mockCallbacks.onMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseEnter on "Reset all instances" hover', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.mouseEnter(resetOption)

      expect(mockCallbacks.onMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseLeave on "Reset all instances" hover leave', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.mouseLeave(resetOption)

      expect(mockCallbacks.onMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseEnter on "Create proper noun" hover when visible', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.mouseEnter(createOption)

      expect(mockCallbacks.onMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseLeave on "Create proper noun" hover leave when visible', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.mouseLeave(createOption)

      expect(mockCallbacks.onMouseLeave).toHaveBeenCalledTimes(1)
    })
  })
})
