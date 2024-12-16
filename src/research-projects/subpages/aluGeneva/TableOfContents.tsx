import _ from 'lodash'
import React from 'react'
import { Nav } from 'react-bootstrap'
import { ResearchProjects } from 'research-projects/researchProject'
import TocLink from 'research-projects/subpages/TocLink'
import 'research-projects/ResearchProjects.sass'

function AluGenevaTocLink({
  isHome,
  path,
  ...props
}: { isHome?: boolean; path?: string } & React.ComponentProps<
  typeof Nav.Link
>): JSX.Element {
  const suffix = isHome ? '' : path || props.children?.toString().toLowerCase()
  const href = _.compact([
    '/projects',
    ResearchProjects.aluGeneva.abbreviation,
    suffix,
  ]).join('/')
  return <TocLink {...props} href={href} />
}

export default function TableOfContents(): JSX.Element {
  return (
    <Nav className={'project-page__sidebar'}>
      <AluGenevaTocLink isHome>Home</AluGenevaTocLink>
      <AluGenevaTocLink path={'search'}>
        Search Ālu Geneva Texts
      </AluGenevaTocLink>
    </Nav>
  )
}
