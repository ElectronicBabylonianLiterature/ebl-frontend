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

      const resetOption = screen.getByText(
        /Reset all instances of/,
      ) as HTMLElement
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
})
