import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import {
  dirtyLemmas,
  getDropdownToggle,
  mockCallbacks,
  renderButton,
  sessionWithoutScope,
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

describe('LemmaActionButton actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    token = new EditableToken(kurToken, 0, 0, 0, [])
  })

  describe('Menu Item Actions', () => {
    it('calls onMultiApply when "Update all instances" is clicked', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.click(updateOption)

      expect(mockCallbacks.onMultiApply).toHaveBeenCalledTimes(1)
    })

    it('calls onMultiReset when "Reset all instances" is clicked and token is dirty', async () => {
      token.updateLemmas(dirtyLemmas)
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.click(resetOption)

      expect(mockCallbacks.onMultiReset).toHaveBeenCalledTimes(1)
    })

    it('disables "Reset all instances" when token is not dirty', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.click(resetOption)
      expect(mockCallbacks.onMultiReset).not.toHaveBeenCalled()
    })

    it('calls onCreateProperNoun when "Create a new proper noun" is clicked', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.click(createOption)

      expect(mockCallbacks.onCreateProperNoun).toHaveBeenCalledTimes(1)
    })

    it('does not call onCreateProperNoun without scope', async () => {
      token.updateLemmas(dirtyLemmas)
      renderButton(token, sessionWithoutScope)
      await userEvent.click(getDropdownToggle())

      expect(
        screen.queryByText(/Create a new proper noun for/),
      ).not.toBeInTheDocument()
      expect(mockCallbacks.onCreateProperNoun).not.toHaveBeenCalled()
    })
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

  describe('Integration', () => {
    it('allows for complete workflow with all Menu items', async () => {
      token.updateLemmas(dirtyLemmas)
      renderButton(token)

      expect(mockCallbacks.onResetCurrent).not.toHaveBeenCalled()
      expect(mockCallbacks.onMultiApply).not.toHaveBeenCalled()
      expect(mockCallbacks.onMultiReset).not.toHaveBeenCalled()
      expect(mockCallbacks.onCreateProperNoun).not.toHaveBeenCalled()

      const resetButton = screen.getByLabelText('reset-current-token')
      fireEvent.click(resetButton)
      expect(mockCallbacks.onResetCurrent).toHaveBeenCalledTimes(1)

      const dropdownToggle = getDropdownToggle()
      await userEvent.click(dropdownToggle)

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.click(updateOption)
      expect(mockCallbacks.onMultiApply).toHaveBeenCalledTimes(1)

      await userEvent.click(dropdownToggle)

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.click(resetOption)
      expect(mockCallbacks.onMultiReset).toHaveBeenCalledTimes(1)

      await userEvent.click(dropdownToggle)

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.click(createOption)
      expect(mockCallbacks.onCreateProperNoun).toHaveBeenCalledTimes(1)
    })
  })
})
