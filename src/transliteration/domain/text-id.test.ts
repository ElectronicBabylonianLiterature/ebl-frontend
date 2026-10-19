import { textIdToDoiString } from 'transliteration/domain/text-id'

test('doi', () => {
  const textId = {
    genre: 'L',
    category: 99,
    index: 99,
  }
  expect(textIdToDoiString(textId)).toEqual('10.5282/ebl/l/99/99')
})
