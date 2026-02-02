import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import EditableToken from './EditableToken'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { wordFactory } from 'test-support/word-fixtures'
import { kurToken } from 'test-support/test-tokens'

describe('EditableToken', () => {
  const mockWords = [
    wordFactory.build({ _id: 'foo' }),
    wordFactory.build({ _id: 'bar' }),
  ]

  let token: EditableToken
  let mockLemmas: LemmaOption[]
  let newLemma: LemmaOption
  let lemmaSuggestion: LemmaOption

  beforeEach(() => {
    mockLemmas = mockWords.map((word) => new LemmaOption(word))
    token = new EditableToken(kurToken, 0, 0, 0, mockLemmas)
    newLemma = new LemmaOption(wordFactory.build({ _id: 'baz' }))
    lemmaSuggestion = new LemmaOption(wordFactory.build({ _id: 'maybe' }), true)
  })

  describe('Constructor', () => {
    it('initializes with the correct properties', () => {
      expect(token.token).toEqual(kurToken)
      expect(token.indexInText).toBe(0)
      expect(token.indexInLine).toBe(0)
      expect(token.lineIndex).toBe(0)
      expect(token.initialLemmas).toEqual(mockLemmas)
      expect(token.newLemmas).toBeNull()
      expect(token.isSelected).toBe(false)
      expect(token.isPending).toBe(false)
      expect(token.isGlowing).toBe(false)
    })
  })

  describe('isDirty getter', () => {
    it('returns false when newLemmas is null', () => {
      token.newLemmas = null
      expect(token.isDirty).toBe(false)
    })

    it('returns true when newLemmas is not null', () => {
      token.newLemmas = []
      expect(token.isDirty).toBe(true)
    })
  })

  describe('glow method', () => {
    it('correctly sets isGlowing', () => {
      token.glow()
      expect(token.isGlowing).toBe(true)
      token.glow(false)
      expect(token.isGlowing).toBe(false)
    })
  })

  describe('updateLemmas method', () => {
    it('sets newLemmas and triggers glow when different from initialLemmas', () => {
      const newLemmas = [newLemma]
      const glowSpy = jest.spyOn(token, 'glow')

      token.updateLemmas(newLemmas)

      expect(token.newLemmas).toEqual(newLemmas)
      expect(glowSpy).toHaveBeenCalled()
    })

    it('sets newLemmas to null when equivalent to initialLemmas', () => {
      token.updateLemmas(mockLemmas)
      expect(token.newLemmas).toBeNull()
    })

    it('handles null input correctly', () => {
      token.initialLemmas = []
      token.updateLemmas(null)
      expect(token.newLemmas).toBeNull()
    })
  })

  describe('confirmSuggestion method', () => {
    it('unsets suggestion flag for all lemmas', () => {
      const unsetSpy = jest.spyOn(lemmaSuggestion, 'unsetSuggestion')
      token.newLemmas = [lemmaSuggestion]
      token.confirmSuggestion()

      expect(unsetSpy).toHaveBeenCalled()
      expect(token.newLemmas?.[0].isSuggestion).toBe(false)
    })

    it('does nothing if no lemmas have suggestion flag', () => {
      const nonSuggestionLemmas = [newLemma]

      token.newLemmas = nonSuggestionLemmas
      const updateSpy = jest.spyOn(token, 'updateLemmas')

      token.confirmSuggestion()
      expect(updateSpy).not.toHaveBeenCalled()
    })
  })

  describe('lemmas getter', () => {
    it('returns newLemmas when dirty', () => {
      const newLemmas = [newLemma]
      token.newLemmas = newLemmas
      expect(token.lemmas).toEqual(newLemmas)
    })

    it('returns initialLemmas when not dirty', () => {
      token.newLemmas = null
      expect(token.lemmas).toEqual(mockLemmas)
    })

    it('returns empty array when both lemmas are null/undefined', () => {
      token.initialLemmas = [] as LemmaOption[]
      token.newLemmas = null
      expect(token.lemmas).toEqual([])
    })
  })

  describe('cleanValue getter', () => {
    it('returns token.cleanValue', () => {
      expect(token.cleanValue).toBe('kur')
    })
  })

  describe('select and unselect methods', () => {
    it('select sets isSelected to true', () => {
      token.isSelected = false
      const result = token.select()
      expect(token.isSelected).toBe(true)
      expect(result).toBe(token)
    })

    it('unselect sets isSelected to false', () => {
      token.isSelected = true
      const result = token.unselect()
      expect(token.isSelected).toBe(false)
      expect(result).toBe(token)
    })
  })

  describe('isConfirmed getter', () => {
    it('returns true when no lemmas have isSuggestion flag', () => {
      token.newLemmas = [newLemma]
      expect(token.isConfirmed).toBe(true)
    })

    it('returns false when at least one lemma has isSuggestion flag', () => {
      token.newLemmas = [lemmaSuggestion]
      expect(token.isConfirmed).toBe(false)
    })
  })

  describe('Display component', () => {
    it('renders with correct class names', () => {
      const onClick = jest.fn()

      const { rerender } = render(
        <token.Display onClick={onClick}>test</token.Display>,
      )

      expect(screen.getByText('test')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveClass(
        'lemmatizer__token-wrapper',
        'editable',
      )

      token.isSelected = true
      rerender(<token.Display onClick={onClick}>test</token.Display>)
      expect(screen.getByRole('button')).toHaveClass('selected')

      token.isPending = true
      rerender(<token.Display onClick={onClick}>test</token.Display>)
      expect(screen.getByRole('button')).toHaveClass('pending')

      token.isGlowing = true
      rerender(<token.Display onClick={onClick}>test</token.Display>)
      expect(screen.getByRole('button')).toHaveClass('glowing')
    })

    it('calls onClick when clicked', () => {
      const onClick = jest.fn()
      render(<token.Display onClick={onClick}>test</token.Display>)

      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })
  })

  describe('Lemma indicators', () => {
    it('renders new lemmas with green badges', () => {
      token.newLemmas = [newLemma]

      render(<token.DisplayLemmas />)

      expect(screen.getByText(newLemma.word._id)).toHaveTextContent(/baz\s*New/)
      expect(screen.getByText('New')).toHaveClass('bg-success')
    })

    it('renders suggested lemmas with yellow badges', () => {
      token.newLemmas = [lemmaSuggestion]

      render(<token.DisplayLemmas />)

      expect(screen.getByText(lemmaSuggestion.word._id)).toHaveTextContent(
        /maybe\s*New/,
      )
      expect(screen.getByText('New')).toHaveClass('bg-warning')
    })

    it('renders "Empty" badge when lemmas list is empty and not dirty', () => {
      token.initialLemmas = []
      token.newLemmas = null

      render(<token.DisplayLemmas />)
      expect(screen.getByText('Empty')).toHaveClass('bg-danger')
    })

    it('renders "---" with badge when lemmas list is empty and dirty', () => {
      token.initialLemmas = []
      token.newLemmas = []

      render(<token.DisplayLemmas />)
      expect(screen.getByText('---')).toBeInTheDocument()
    })
  })
})
