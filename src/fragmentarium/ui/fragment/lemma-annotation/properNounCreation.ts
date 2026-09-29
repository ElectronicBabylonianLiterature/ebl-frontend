import Word from 'dictionary/domain/Word'

export interface MatchState {
  exactMatch: string | null
  lengthMatch: string | null
}

export const emptyMatchState: MatchState = {
  exactMatch: null,
  lengthMatch: null,
}

function hasWordId(value: Word): value is Word {
  return Boolean(
    value &&
    typeof value === 'object' &&
    '_id' in value &&
    typeof (value as { _id?: unknown })._id === 'string' &&
    (value as { _id?: string })._id,
  )
}

export function formatProperNounInput(input: string): string {
  const latinOnly = input
    .replace(/[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s-]/g, '')
    .trim()
  if (latinOnly.length === 0) {
    return ''
  }
  return latinOnly.charAt(0).toUpperCase() + latinOnly.slice(1)
}

export function shouldDisableCreateButton({
  hasInputValue,
  hasExactMatch,
  hasNamedEntityTag,
  loading,
}: {
  hasInputValue: boolean
  hasExactMatch: boolean
  hasNamedEntityTag: boolean
  loading: boolean
}): boolean {
  if (!hasInputValue) {
    return true
  }
  if (hasExactMatch) {
    return true
  }
  if (!hasNamedEntityTag) {
    return true
  }
  return loading
}

export function findMatchState(
  inputValue: string,
  words: readonly Word[],
): MatchState {
  const exact = words.find((word) => word.lemma[0] === inputValue)
  if (exact) {
    return {
      exactMatch: exact.lemma[0],
      lengthMatch: null,
    }
  }

  const byLength = words.find(
    (word) => word.lemma[0].length === inputValue.length,
  )
  if (byLength) {
    return {
      exactMatch: null,
      lengthMatch: byLength.lemma[0],
    }
  }

  return emptyMatchState
}

export function validateCreatedWord(createdWord: Word): Word {
  if (!hasWordId(createdWord)) {
    throw new Error(
      'Proper noun creation failed: backend did not return a valid word document.',
    )
  }
  return createdWord
}
