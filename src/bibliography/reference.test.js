import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import Cite from 'citation-js'
import Reference, { createReference, serializeReference } from './reference'

test('default reference', () => {
  expect(new Reference()).toEqual(
    new Reference('DISCUSSION', '', '', [], null)
  )
})

describe('Reference', () => {
  let reference

  beforeEach(async () => {
    reference = await factory.build('reference')
  })

  test.each([
    ['id', 'document.id'],
    ['author', 'document.author.0.family'],
    ['year', 'document.issued.date-parts.0.0'],
    ['title', 'document.title'],
    ['typeAbbreviation', 'type.0'],
    ['link', 'document.URL']
  ])('%s', async (property, path) =>
    expect(reference[property]).toEqual(_.get(reference, path))
  )

  test('non-dropping particle', async () => {
    const entry = await factory.build('bibliographyEntry', { author: [
      {
        'non-dropping-particle': 'von',
        'family': 'Soden'
      }
    ] })
    reference = await factory.build('reference', { document: entry })
    expect(reference.author).toEqual('von Soden')
  })

  test('fallback link', async () => {
    const entry = await factory.build('bibliographyEntry', { URL: null, DOI: 'doi' })
    reference = await factory.build('reference', { document: entry })
    expect(reference.link).toEqual(`https://doi.org/${entry.DOI}`)
  })

  test('citation', () => {
    expect(reference.citation).toBeInstanceOf(Cite)
  })
})

test('createReference', async () => {
  const entry = {}
  const bibliographyRepository = {
    find: jest.fn()
  }
  bibliographyRepository.find.mockReturnValueOnce(Promise.resolve(entry))
  const dto = await factory.build('referenceDto')
  await expect(createReference(dto, bibliographyRepository)).resolves.toEqual(
    new Reference(
      dto.type,
      dto.pages,
      dto.notes,
      dto.linesCited,
      entry
    )
  )
})

test('serializeReference', async () => {
  const reference = await factory.build('reference')
  expect(serializeReference(reference)).toEqual({
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited
  })
})
