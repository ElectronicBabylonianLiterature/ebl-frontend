import React, { useState } from 'react'
import { Nav, Navbar, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

import User from './auth/User'

import './Header.css'

function EblLogo(): JSX.Element {
  return (
    <h1 className="Header__title">
      <span className="Header__title-main">
        electronic
        <br />
        Babylonian
        <br />
        Literature
      </span>
      <small className="Header__title-abbreviation">eBL</small>
    </h1>
  )
}

function NavItem(props: {
  href: string
  title: string
  eventKey: string
}): JSX.Element {
  return (
    <Nav.Item>
      <LinkContainer to={props.href}>
        <Nav.Link eventKey={props.eventKey}>{props.title}</Nav.Link>
      </LinkContainer>
    </Nav.Item>
  )
}

export default function Header(): JSX.Element {
  const [activeKey, setActiveKey] = useState('/')
  const id = _.uniqueId('Header-')
  return (
    <header className="Header">
      <Navbar variant="light" expand="md">
        <Container>
          <LinkContainer
            to="/"
            title="electronic Babylonian Literature (eBL)"
            onClick={() => setActiveKey('/')}
          >
            <Navbar.Brand>
              <EblLogo />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id={id}>
            <Nav
              activeKey={activeKey}
              onSelect={(key) => setActiveKey(key!)}
              className="mx-auto"
            >
              <NavItem
                eventKey="/dictionary"
                href="/dictionary"
                title="Dictionary"
              />
              <NavItem eventKey="/corpus" href="/corpus" title="Corpus" />
              <NavItem
                eventKey="/fragmentarium"
                href="/fragmentarium"
                title="Fragmentarium"
              />
              <NavItem
                eventKey="/bibliography"
                href="/bibliography"
                title="Bibliography"
              />
            </Nav>
            <Navbar.Text>
              <User />
            </Navbar.Text>
          </Navbar.Collapse>
          <Navbar.Toggle aria-controls={id} />
        </Container>
      </Navbar>
    </header>
  )
}
