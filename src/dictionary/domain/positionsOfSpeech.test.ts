import { partOfSpeechLabel } from 'dictionary/domain/positionsOfSpeech'

describe('partOfSpeechLabel', () => {
  it.each([
    ['CN', 'Celestial Name'],
    ['DN', 'Divine Name'],
    ['N', 'noun'],
    ['AJ', 'adjective'],
  ])('names the code %s', (code, label) => {
    expect(partOfSpeechLabel(code)).toEqual(label)
  })

  it.each(['XYZ', 'toString', 'constructor'])(
    'returns null for the unknown code %s',
    (code) => {
      expect(partOfSpeechLabel(code)).toBeNull()
    },
  )
})
