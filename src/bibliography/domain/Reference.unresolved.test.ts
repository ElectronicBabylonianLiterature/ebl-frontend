import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import serializeReference from 'bibliography/application/serializeReference'
import { borgerDocument } from 'test-support/fragment-query-summary'

const unresolvedReference = new Reference(
  'DISCUSSION',
  '12-13',
  'Summary note',
  ['1.'],
  new BibliographyEntry(),
).withIdentity('RN52', true)

const replacement = new BibliographyEntry({ ...borgerDocument, id: 'RN99' })

describe('setDocument restores the resolved invariant', () => {
  it('clears the unresolved flag when a real document is selected', () => {
    const edited = unresolvedReference.setDocument(replacement)

    expect(edited.hasUnresolvedDocument).toBe(false)
    expect(unresolvedReference.hasUnresolvedDocument).toBe(true)
  })

  it('makes citation metadata usable after the edit', () => {
    const edited = unresolvedReference.setDocument(replacement)

    expect(edited.document.label.trim()).not.toEqual('')
    expect(edited.primaryAuthor).toEqual('Borger')
    expect(edited.year).toEqual('1957')
  })

  it('serializes the selected document id', () => {
    expect(serializeReference(unresolvedReference).id).toEqual('RN52')
    expect(
      serializeReference(unresolvedReference.setDocument(replacement)).id,
    ).toEqual('RN99')
  })

  it('keeps the invariant coherent through chained setters', () => {
    const edited = unresolvedReference
      .setDocument(replacement)
      .setPages('99')
      .setNotes('changed')

    expect(edited.hasUnresolvedDocument).toBe(false)
    expect(edited.referenceId).toEqual('')
    expect(edited.id).toEqual('RN99')
    expect(edited.pages).toEqual('99')
    expect(edited.notes).toEqual('changed')
    expect(serializeReference(edited).id).toEqual('RN99')
  })

  it('never reports both a real document and an unresolved state', () => {
    const edited = unresolvedReference.setDocument(replacement)

    expect(
      edited.hasUnresolvedDocument && edited.document.label.trim() !== '',
    ).toBe(false)
  })
})

describe('canonical summary identity before an explicit edit', () => {
  const canonicalDocument = new BibliographyEntry({
    ...borgerDocument,
    id: 'CANONICAL-1',
  })
  const canonicalReference = new Reference(
    'DISCUSSION',
    '12-13',
    '',
    [],
    canonicalDocument,
  ).withIdentity('RN52')

  it('keeps the occurrence id while the document stays canonical', () => {
    expect(canonicalReference.id).toEqual('RN52')
    expect(canonicalReference.document.id).toEqual('CANONICAL-1')
    expect(canonicalReference.hasUnresolvedDocument).toBe(false)
    expect(serializeReference(canonicalReference).id).toEqual('RN52')
  })

  it('switches to the replacement id only after an explicit edit', () => {
    const edited = canonicalReference.setDocument(replacement)

    expect(edited.id).toEqual('RN99')
    expect(edited.hasUnresolvedDocument).toBe(false)
    expect(canonicalReference.id).toEqual('RN52')
  })

  it.each([
    ['setPages', (reference: Reference) => reference.setPages('99')],
    ['setNotes', (reference: Reference) => reference.setNotes('changed')],
    ['setType', (reference: Reference) => reference.setType('COPY')],
  ])('%s preserves the canonical occurrence id', (unusedName, copy) => {
    expect(copy(canonicalReference).id).toEqual('RN52')
  })
})
