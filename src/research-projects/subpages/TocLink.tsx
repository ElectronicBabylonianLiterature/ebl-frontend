import _ from 'lodash'
import React from 'react'
import { Nav } from 'react-bootstrap'
import { ResearchProject } from 'research-projects/researchProject'
import 'research-projects/ResearchProjects.sass'
import { useHistory } from 'router/compat'

export default function TocLink({
  path,
  project,
  ...props
}: { path: string; project: ResearchProject } & React.ComponentProps<
  typeof Nav.Link
>): JSX.Element {
  const history = useHistory()

  const href = _.compact(['/projects', project.abbreviation, path]).join('/')
  return (
    <Nav.Link
      onClick={(event) => {
        event.preventDefault()
        history.push(href)
      }}
      eventKey={props.children?.toString().toLowerCase()}
      {...props}
    />
  )
}
