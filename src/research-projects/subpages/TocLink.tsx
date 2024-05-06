import React from 'react'
import { Nav } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

export default function TocLink({
  ...props
}: { href: string } & React.ComponentProps<typeof Nav.Link>): JSX.Element {
  const history = useHistory()
  return (
    <Nav.Link
      onClick={(event) => {
        event.preventDefault()
        history.push(props.href)
      }}
      eventKey={props.children?.toString().toLowerCase()}
      {...props}
    />
  )
}
