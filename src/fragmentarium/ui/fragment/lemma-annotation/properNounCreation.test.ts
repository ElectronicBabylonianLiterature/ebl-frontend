import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'
import {
  emptyMatchState,
  findMatchState,
  formatProperNounInput,
  shouldDisableCreateButton,
  validateCreatedWord,
} from 'fragmentarium/ui/fragment/lemma-annotation/properNounCreation'

const createWord = (lemma: string): Word =>
  wordFactory.build({ _id: `${lemma} I`, lemma: [lemma] })

describe('formatProperNounInput', () => {
  it('keeps latin letters and capitalizes the first one', () => {
    expect(formatProperNounInput(' šamaš-1 ')).toEqual('Šamaš-')
  })

  it('returns an empty string without latin letters', () => {
    expect(formatProperNounInput('123')).toEqual('')
  })
})

describe('shouldDisableCreateButton', () => {
  const enabled = {
    hasInputValue: true,
    hasExactMatch: false,
    hasNamedEntityTag: true,
    loading: false,
  }

  it.each([
    [{ ...enabled, hasInputValue: false }, true],
    [{ ...enabled, hasExactMatch: true }, true],
    [{ ...enabled, hasNamedEntityTag: false }, true],
    [{ ...enabled, loading: true }, true],
    [enabled, false],
  ])('returns the disabled state for %o', (state, expected) => {
    expect(shouldDisableCreateButton(state)).toEqual(expected)
  })
})

describe('findMatchState', () => {
  it('finds an exact match', () => {
    expect(findMatchState('Adad', [createWord('Adad')])).toEqual({
      exactMatch: 'Adad',
      lengthMatch: null,
    })
  })

  it('finds a match of the same length', () => {
    expect(findMatchState('Adad', [createWord('Enki')])).toEqual({
      exactMatch: null,
      lengthMatch: 'Enki',
    })
  })

  it('returns the empty state without matches', () => {
    expect(findMatchState('Adad', [createWord('Marduk')])).toBe(emptyMatchState)
  })
})

describe('validateCreatedWord', () => {
  it('returns a word with an id', () => {
    const word = createWord('Adad')
    expect(validateCreatedWord(word)).toBe(word)
  })

  it.each([
    '{"lemma":["Adad"]}',
    '{"_id":"","lemma":["Adad"]}',
    '{"_id":1,"lemma":["Adad"]}',
    'null',
  ])('throws for an invalid word %s', (json) => {
    const word: Word = JSON.parse(json)
    expect(() => validateCreatedWord(word)).toThrow(
      'Proper noun creation failed: backend did not return a valid word document.',
    )
  })
})
