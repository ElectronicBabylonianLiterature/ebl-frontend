import { eblRealiaEntryLabel } from 'realia/domain/eblRealiaEntryLabel'
import { eblRealiaEntryFactory } from 'test-support/realia-fixtures'

const emptyEntry = eblRealiaEntryFactory.build({
  id: '',
  transliteration: '',
  translation: '',
})

describe('eblRealiaEntryLabel', () => {
  it('uses the transliteration first', () => {
    expect(
      eblRealiaEntryLabel(
        { ...emptyEntry, transliteration: 'SI₄', translation: 'Lisi' },
        0,
      ),
    ).toEqual('SI₄')
  })

  it('falls back to the translation', () => {
    expect(
      eblRealiaEntryLabel({ ...emptyEntry, translation: 'Lisi', id: 'x' }, 0),
    ).toEqual('Lisi')
  })

  it('falls back to the ID', () => {
    expect(eblRealiaEntryLabel({ ...emptyEntry, id: 'SI₄' }, 0)).toEqual('SI₄')
  })

  it('falls back to a numbered entry when every value is blank', () => {
    expect(eblRealiaEntryLabel({ ...emptyEntry, id: '  ' }, 1)).toEqual(
      'Entry 2',
    )
  })
})
