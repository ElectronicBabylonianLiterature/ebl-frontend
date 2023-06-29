import React from 'react'
import { render, screen } from '@testing-library/react'

import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ProjectList } from './ResearchProjects'
import { ResearchProjects } from 'research-projects/researchProject'

let fragment: Fragment
const project = ResearchProjects.CAIC

beforeEach(async () => {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        projects: [project],
      },
    }
  )
  render(<ProjectList fragment={fragment} />)
})

it('Renders logo', () => {
  expect(screen.getByAltText(project.name)).toHaveAttribute('src', project.logo)
})

it('Links to project website', () => {
  expect(
    screen.getByLabelText(`Link to ${project.name} project`)
  ).toHaveAttribute('href', project.url)
})
