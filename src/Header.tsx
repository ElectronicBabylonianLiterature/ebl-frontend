import React, { useState } from 'react'
import { Nav, Navbar, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

import User from './auth/User'
import ThemeToggle from './common/ThemeToggle'
import './Header.sass'

function EblLogo(): JSX.Element {
  return (
    <h1 className="Header__title">
      <span className="Header__title-main">
        electronic
        <br />
        <span className="Header__title-main__caps">B</span>abylonian
        <br />
        <span className="Header__title-main__caps">L</span>ibrary
      </span>
      <small className="Header__title-abbreviation">
        e<small className="Header__title-abbreviation__caps">bl</small>
      </small>
    </h1>
  )
}

export function NavItem({
  href,
  title,
  as,
}: {
  href: string
  title: string
  as?: React.ElementType
}): JSX.Element {
  return (
    <Nav.Item as={as}>
      <LinkContainer to={href}>
        <Nav.Link>{title}</Nav.Link>
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
          <LinkContainer
            to="/"
            title="electronic Babylonian Library (eBL)"
            onClick={() => setActiveKey('/')}
          >
            <Navbar.Brand>
              <EblLogo />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls={id} />
          <Navbar.Collapse id={id}>
            <div
              id="navbar-container"
              className="d-flex justify-content-between align-items-center w-100"
            >
              <Nav
                activeKey={activeKey}
                onSelect={(key) => setActiveKey(key ?? undefined)}
                className="me-auto"
                id="main-nav"
              >
                <NavItem href="/reference-library" title="Reference Library" />
                <NavItem href="/corpus" title="Corpus" />
                <NavItem href="/library" title="Library" />
                <NavItem href="/about" title="About" />
                <NavItem href="/tools" title="Tools" />
                <NavItem href="/projects" title="Projects" />
              </Nav>
              <Navbar.Text id="user">
                <div className="d-flex align-items-center">
                  <ThemeToggle />
                  <User />
                </div>
              </Navbar.Text>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}
