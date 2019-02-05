export function createReference (id = '', type = 'DISCUSSION', pages = '', notes = '', linesCited = []) {
  return {
    id: id,
    type: type,
    pages: pages,
    notes: notes,
    linesCited: linesCited,
    document: null
  }
}

export function createHydratedReference (data, bibliographyRepository) {
  return bibliographyRepository.find(data.id).then(entry => ({
    ...createReference(data.id, data.type, data.pages, data.notes, data.linesCited),
    document: entry
  }))
}
