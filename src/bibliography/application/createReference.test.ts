import Reference from 'bibliography/domain/Reference'
import createReference from './createReference'
import {
  bibliographyEntryFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'

test('createReference', async () => {
  const entry = bibliographyEntryFactory.build()
  const bibliographyRepository = {
    find: jest.fn(),
  }
  bibliographyRepository.find.mockReturnValueOnce(Promise.resolve(entry))
  const dto = referenceDtoFactory.build()
  await expect(createReference(dto, bibliographyRepository)).resolves.toEqual(
    new Reference(dto.type, dto.pages, dto.notes, dto.linesCited, entry)
  )
})
