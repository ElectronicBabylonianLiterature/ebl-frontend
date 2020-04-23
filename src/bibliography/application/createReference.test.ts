import { factory } from 'factory-girl'
import Reference from 'bibliography/domain/Reference'
import createReference from './createReference'

test('createReference', async () => {
  const entry = await factory.build('bibliographyEntry')
  const bibliographyRepository = {
    find: jest.fn(),
  }
  bibliographyRepository.find.mockReturnValueOnce(Promise.resolve(entry))
  const dto = await factory.build('referenceDto')
  await expect(createReference(dto, bibliographyRepository)).resolves.toEqual(
    new Reference(dto.type, dto.pages, dto.notes, dto.linesCited, entry)
  )
})
