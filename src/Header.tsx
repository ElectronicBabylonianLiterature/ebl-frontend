import React, { useState } from 'react'
import { Image, Nav, Navbar, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

import User from './auth/User'

import './Header.css'
import lmuLogo from './LMU_Logo.svg'
import ExternalLink from 'common/ExternalLink'

function EblLogo(): JSX.Element {
  return (
    <h1 className="Header__title">
      <span className="Header__title-main">
        electronic
        <br />
        Babylonian
        <br />
        Library
      </span>
      <small className="Header__title-abbreviation">eBL</small>
    </h1>
  )
}

function NavItem(props: { href: string; title: string }): JSX.Element {
  return (
    <Nav.Item>
      <LinkContainer to={props.href}>
        <Nav.Link>{props.title}</Nav.Link>
      </LinkContainer>
    </Nav.Item>
  )
}

export default function Header(): JSX.Element {
  const [activeKey, setActiveKey] = useState<string>()
  const id = _.uniqueId('Header-')
  return (
    <header className="Header">
      <Navbar variant="light" expand="md">
        <Container>
          <Navbar.Brand>
            <ExternalLink href="https://www.lmu.de">
              <Image className="Header__corporate-logo" src={lmuLogo} fluid />
            </ExternalLink>
          </Navbar.Brand>
          <LinkContainer
            to="/"
            title="electronic Babylonian Library (eBL)"
            onClick={() => setActiveKey('/')}
          >
            <Navbar.Brand>
              <EblLogo />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id={id}>
            <Nav
              activeKey={activeKey}
              onSelect={(key) => setActiveKey(key ?? undefined)}
              className="mx-auto"
            >
              <NavItem href="/about" title="About" />
              <NavItem href="/signs" title="Signs" />
              <NavItem href="/dictionary" title="Dictionary" />
              <NavItem href="/corpus" title="Corpus" />
              <NavItem href="/fragmentarium" title="Fragmentarium" />
              <NavItem href="/bibliography" title="Bibliography" />
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
