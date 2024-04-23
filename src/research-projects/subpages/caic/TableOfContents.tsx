import _ from 'lodash'
import React from 'react'
import { Nav } from 'react-bootstrap'
import { ResearchProjects } from 'research-projects/researchProject'
import TocLink from 'research-projects/subpages/TocLink'
import 'research-projects/subpages/ResearchProjects.sass'

function CaicTocLink({
  isHome,
  ...props
}: { isHome?: boolean } & React.ComponentProps<typeof Nav.Link>): JSX.Element {
  const suffix = isHome ? '' : props.children?.toString().toLowerCase()
  const href = _.compact([
    '/projects',
    ResearchProjects.CAIC.abbreviation,
    suffix,
  ]).join('/')
  return <TocLink {...props} href={href} />
}

export default function TableOfContents(): JSX.Element {
  return (
    <Nav className={'project-page__sidebar'}>
      <CaicTocLink isHome>Home</CaicTocLink>
      <CaicTocLink>Search</CaicTocLink>
      <CaicTocLink>Publications</CaicTocLink>
      <CaicTocLink>Contact</CaicTocLink>
    </Nav>
  )
}
