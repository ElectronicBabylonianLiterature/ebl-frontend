import _ from 'lodash'
import caicLogo from './logos/CAIC Briefkopf 2023.png'
import aluLogo from './logos/Alu.png'

export interface ResearchProject {
  name: string
  abbreviation: string
  displayName?: string
  parent?: string
  url?: string
  logo?: string
}

export const ResearchProjects = {
  CAIC: {
    name: 'Cuneiform Artefacts of Iraq in Context',
    abbreviation: 'CAIC',
    logo: caicLogo,
    url: 'https://caic.badw.de/',
  },
  aluGeneva: {
    name: 'Edition of the Omen Series Summa Alu',
    abbreviation: 'aluGeneva',
    logo: aluLogo,
    url: 'https://data.snf.ch/grants/grant/175970',
  },
}

export const researchProjects = Object.values(ResearchProjects)

export function createResearchProject(abbreviation: string): ResearchProject {
  const project = _.find(researchProjects, { abbreviation })
  if (!project) {
    throw new Error(`Unknown project abbreviation: ${abbreviation}`)
  }
  return project
}
