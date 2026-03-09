import React from 'react'
import { render, screen } from '@testing-library/react'

import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ProjectList } from './ResearchProjects'
import { ResearchProjects } from 'research-projects/researchProject'

let fragment: Fragment
const projects = [
  ResearchProjects.CAIC,
  ResearchProjects.AMPS,
  ResearchProjects.aluGeneva,
  ResearchProjects.RECC,
]

it('Renders logos for all projects', () => {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        projects,
      },
    },
  )
  render(<ProjectList projects={fragment.projects} />)
  projects.forEach((project) => {
    expect(screen.getByAltText(project.name)).toHaveAttribute(
      'src',
      project.logo,
    )
  })
})

it('Links to all project websites', () => {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        projects,
      },
    },
  )
  render(<ProjectList projects={fragment.projects} />)
  projects.forEach((project) => {
    expect(
      screen.getByLabelText(`Link to ${project.name} project`),
    ).toHaveAttribute('href', project.url)
  })
})
