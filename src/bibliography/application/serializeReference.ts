import Reference from 'bibliography/domain/Reference'

export default function serializeReference(
  reference: Reference,
): Pick<Reference, 'type' | 'pages' | 'notes' | 'linesCited'> & { id: string } {
  return {
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited,
  }
}
