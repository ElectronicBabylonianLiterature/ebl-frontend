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

  it('renders the action button with reset icon', () => {
    renderButton(token)
    const resetButton = screen.getByLabelText('reset-current-token')
    expect(resetButton).toBeInTheDocument()
    expect(resetButton).toContainHTML('fa-rotate-left')
  })

  it('renders the dropdown toggle', () => {
    renderButton(token)
    const dropdownToggles = screen.getAllByRole('button')
    const dropdownToggle = dropdownToggles.find(
      (btn) => btn.getAttribute('id') === 'dropdown-split-basic',
    )
    expect(dropdownToggle).toBeInTheDocument()
  })

  it('disables reset button when token is not dirty', () => {
    token = new EditableToken(kurToken, 0, 0, 0, [])
    renderButton(token)
    const resetButton = screen.getByLabelText('reset-current-token')
    expect(resetButton).toBeDisabled()
  })

  it('enables reset button when token is dirty', () => {
    token = new EditableToken(kurToken, 0, 0, 0, [])
    token.updateLemmas(dirtyLemmas)
    renderButton(token)
    const resetButton = screen.getByLabelText('reset-current-token')
    expect(resetButton).toBeEnabled()
  })

  it('calls onResetCurrent when reset button is clicked', () => {
    token = new EditableToken(kurToken, 0, 0, 0, [])
    token.updateLemmas(dirtyLemmas)
    renderButton(token)
    const resetButton = screen.getByLabelText('reset-current-token')
    fireEvent.click(resetButton)
    expect(mockCallbacks.onResetCurrent).toHaveBeenCalledTimes(1)
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
