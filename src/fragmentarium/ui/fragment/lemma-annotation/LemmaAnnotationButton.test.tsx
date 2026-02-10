import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LemmaActionButton from './LemmaAnnotationButton'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'

jest.mock('transliteration/ui/DisplayToken', () => {
  return {
    __esModule: true,
    default: ({ token }: { token: { value: string } }) => (
      <span>{token.value}</span>
    ),
  }
})

const mockCallbacks = {
  onResetCurrent: jest.fn(),
  onMouseEnter: jest.fn(),
  onMouseLeave: jest.fn(),
  onMultiApply: jest.fn(),
  onMultiReset: jest.fn(),
  onCreateProperNoun: jest.fn(),
}

let token: EditableToken

const renderButton = () => {
  render(<LemmaActionButton token={token} {...mockCallbacks} />)
}

describe('LemmaActionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    token = new EditableToken(kurToken, 0, 0, 0, [])
  })

  it('renders the action button with reset icon', () => {
    renderButton()
    const resetButton = screen.getByLabelText('reset-current-token')
    expect(resetButton).toBeInTheDocument()
    expect(resetButton).toContainHTML('fa-rotate-left')
  })

  it('renders the dropdown toggle', () => {
    renderButton()
    const dropdownToggles = screen.getAllByRole('button')
    const dropdownToggle = dropdownToggles.find(
      (btn) => btn.getAttribute('id') === 'dropdown-split-basic'
    )
    expect(dropdownToggle).toBeInTheDocument()
  })

  it('disables reset button when token is not dirty', () => {
    token = new EditableToken(kurToken, 0, 0, 0, [])
    renderButton()
    const resetButton = screen.getByLabelText('reset-current-token')
    expect(resetButton).toBeDisabled()
  })

  it('enables reset button when token is dirty', () => {
    token = new EditableToken(kurToken, 0, 0, 0, [])
    token.updateLemmas({ value: 'test', homonym: 'I' } as any)
    renderButton()
    const resetButton = screen.getByLabelText('reset-current-token')
    expect(resetButton).toBeEnabled()
  })

  it('calls onResetCurrent when reset button is clicked', () => {
    token = new EditableToken(kurToken, 0, 0, 0, [])
    token.updateLemmas({ value: 'test', homonym: 'I' } as any)
    renderButton()
    const resetButton = screen.getByLabelText('reset-current-token')
    fireEvent.click(resetButton)
    expect(mockCallbacks.onResetCurrent).toHaveBeenCalledTimes(1)
  })

  describe('Dropdown Menu Items', () => {
    const getDropdownToggle = () =>
      screen
        .getAllByRole('button')
        .find(
          (btn) => btn.getAttribute('id') === 'dropdown-split-basic'
        ) as HTMLElement

    it('renders dropdown menu when toggle is clicked', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      expect(screen.getByText(/Update all instances of/)).toBeInTheDocument()
    })

    it('displays "Update all instances" menu item', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      expect(screen.getByText(/Update all instances of/)).toBeInTheDocument()
    })

    it('displays "Reset all instances" menu item', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      expect(screen.getByText(/Reset all instances of/)).toBeInTheDocument()
    })

    it('displays "Create a new proper noun" menu item when token is dirty', () => {
      token.updateLemmas({ value: 'test', homonym: 'I' } as any)
      renderButton()

      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      expect(
        screen.getByText(/Create a new proper noun for/)
      ).toBeInTheDocument()
    })

    it('does not display "Create a new proper noun" menu item when token is not dirty', () => {
      renderButton()

      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      expect(
        screen.queryByText(/Create a new proper noun for/)
      ).not.toBeInTheDocument()
    })

    it('displays divider between menu items', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      expect(screen.getByText(/Update all instances of/)).toBeInTheDocument()
      expect(screen.getByText(/Reset all instances of/)).toBeInTheDocument()
    })
  })

  describe('Menu Item Actions', () => {
    const getDropdownToggle = () =>
      screen
        .getAllByRole('button')
        .find(
          (btn) => btn.getAttribute('id') === 'dropdown-split-basic'
        ) as HTMLElement

    it('calls onMultiApply when "Update all instances" is clicked', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.click(updateOption)

      expect(mockCallbacks.onMultiApply).toHaveBeenCalledTimes(1)
    })

    it('calls onMultiReset when "Reset all instances" is clicked and token is dirty', () => {
      token.updateLemmas({ value: 'test', homonym: 'I' } as any)
      renderButton()

      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.click(resetOption)

      expect(mockCallbacks.onMultiReset).toHaveBeenCalledTimes(1)
    })

    it('disables "Reset all instances" when token is not dirty', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const resetOption = screen.getByText(
        /Reset all instances of/
      ) as HTMLElement
      fireEvent.click(resetOption)
      expect(mockCallbacks.onMultiReset).not.toHaveBeenCalled()
    })

    it('calls onCreateProperNoun when "Create a new proper noun" is clicked', () => {
      token.updateLemmas({ value: 'test', homonym: 'I' } as any)
      renderButton()

      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.click(createOption)

      expect(mockCallbacks.onCreateProperNoun).toHaveBeenCalledTimes(1)
    })
  })

  describe('Mouse Events', () => {
    const getDropdownToggle = () =>
      screen
        .getAllByRole('button')
        .find(
          (btn) => btn.getAttribute('id') === 'dropdown-split-basic'
        ) as HTMLElement

    it('calls onMouseEnter on "Update all instances" hover', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.mouseEnter(updateOption)

      expect(mockCallbacks.onMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseLeave on "Update all instances" hover leave', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.mouseLeave(updateOption)

      expect(mockCallbacks.onMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseEnter on "Reset all instances" hover', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.mouseEnter(resetOption)

      expect(mockCallbacks.onMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseLeave on "Reset all instances" hover leave', () => {
      renderButton()
      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.mouseLeave(resetOption)

      expect(mockCallbacks.onMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseEnter on "Create proper noun" hover when visible', () => {
      token.updateLemmas({ value: 'test', homonym: 'I' } as any)
      renderButton()

      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.mouseEnter(createOption)

      expect(mockCallbacks.onMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseLeave on "Create proper noun" hover leave when visible', () => {
      token.updateLemmas({ value: 'test', homonym: 'I' } as any)
      renderButton()

      const dropdownToggle = getDropdownToggle()
      fireEvent.click(dropdownToggle)

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.mouseLeave(createOption)

      expect(mockCallbacks.onMouseLeave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration', () => {
    it('allows for complete workflow with all Menu items', () => {
      token.updateLemmas({ value: 'test', homonym: 'I' } as any)
      renderButton()

      expect(mockCallbacks.onResetCurrent).not.toHaveBeenCalled()
      expect(mockCallbacks.onMultiApply).not.toHaveBeenCalled()
      expect(mockCallbacks.onMultiReset).not.toHaveBeenCalled()
      expect(mockCallbacks.onCreateProperNoun).not.toHaveBeenCalled()

      const resetButton = screen.getByLabelText('reset-current-token')
      fireEvent.click(resetButton)
      expect(mockCallbacks.onResetCurrent).toHaveBeenCalledTimes(1)

      const dropdownToggle = screen
        .getAllByRole('button')
        .find(
          (btn) => btn.getAttribute('id') === 'dropdown-split-basic'
        ) as HTMLElement
      fireEvent.click(dropdownToggle)

      const updateOption = screen.getByText(/Update all instances of/)
      fireEvent.click(updateOption)
      expect(mockCallbacks.onMultiApply).toHaveBeenCalledTimes(1)

      fireEvent.click(dropdownToggle)

      const resetOption = screen.getByText(/Reset all instances of/)
      fireEvent.click(resetOption)
      expect(mockCallbacks.onMultiReset).toHaveBeenCalledTimes(1)

      fireEvent.click(dropdownToggle)

      const createOption = screen.getByText(/Create a new proper noun for/)
      fireEvent.click(createOption)
      expect(mockCallbacks.onCreateProperNoun).toHaveBeenCalledTimes(1)
    })
  })
})
