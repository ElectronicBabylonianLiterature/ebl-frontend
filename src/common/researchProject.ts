export const ResearchProjects = {
  CAIC: {
    name: 'Cuneiform Artefacts of Iraq in Context',
    abbreviation: 'CAIC',
    displayName: null,
    parent: null,
  },
}

export type ResearchProject = typeof ResearchProjects[keyof typeof ResearchProjects]
export const researchProjects = Object.values(ResearchProjects)
