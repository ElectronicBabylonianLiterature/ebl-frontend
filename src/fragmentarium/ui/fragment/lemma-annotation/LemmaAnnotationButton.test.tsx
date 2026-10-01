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

  describe('Dropdown Menu Items', () => {
    it('renders dropdown menu when toggle is clicked', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(screen.getByText(/Update all instances of/)).toBeInTheDocument()
    })

    it('displays "Update all instances" menu item', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(screen.getByText(/Update all instances of/)).toBeInTheDocument()
    })

    it('displays "Reset all instances" menu item', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(screen.getByText(/Reset all instances of/)).toBeInTheDocument()
    })

    it('displays "Create a new proper noun" menu item for empty unannotated token with scope', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(
        screen.getByText(/Create a new proper noun for/),
      ).toBeInTheDocument()
    })

    it('does not display "Create a new proper noun" menu item without scope', async () => {
      token.updateLemmas(dirtyLemmas)
      renderButton(token, sessionWithoutScope)
      await userEvent.click(getDropdownToggle())

      expect(
        screen.queryByText(/Create a new proper noun for/),
      ).not.toBeInTheDocument()
    })

    it('displays "Create a new proper noun" menu item for empty token (not dirty)', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(
        screen.getByText(/Create a new proper noun for/),
      ).toBeInTheDocument()
    })

    it('does not display "Create a new proper noun" menu item for annotated clean token', async () => {
      token = new EditableToken(kurToken, 0, 0, 0, dirtyLemmas)
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(
        screen.queryByText(/Create a new proper noun for/),
      ).not.toBeInTheDocument()
    })

    it('displays "Create a new proper noun" menu item when token is dirty', async () => {
      token.updateLemmas(dirtyLemmas)
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(
        screen.getByText(/Create a new proper noun for/),
      ).toBeInTheDocument()
    })
    it('displays divider between menu items', async () => {
      renderButton(token)
      await userEvent.click(getDropdownToggle())

      expect(screen.getByText(/Update all instances of/)).toBeInTheDocument()
      expect(screen.getByText(/Reset all instances of/)).toBeInTheDocument()
    })
  })
})
