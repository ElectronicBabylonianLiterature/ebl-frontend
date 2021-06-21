import { referenceFactory } from 'test-support/bibliography-fixtures'
import serializeReference from './serializeReference'

test('serializeReference', async () => {
  const reference = referenceFactory.build()
  expect(serializeReference(reference)).toEqual({
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited,
  })
})
