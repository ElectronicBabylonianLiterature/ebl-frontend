import React, { useState } from 'react'
import { Nav, Navbar, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

import User from './auth/User'
import BAdWLogo from './BAdW_Logo.svg'
import LMULogo from './LMU_Logo.svg'

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
      <div className="Header__partner-strip">
        <Container>
          <div className="Header__partner-strip-content">
            <span className="Header__partner-label">In partnership with</span>
            <div className="Header__partner-logos">
              <a
                href="https://badw.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="Header__partner-logo-link"
                title="Bayerische Akademie der Wissenschaften"
              >
                <img
                  src={BAdWLogo}
                  alt="BAdW"
                  className="Header__partner-logo-img"
                />
              </a>
              <span className="Header__partner-divider"></span>
              <a
                href="https://www.lmu.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="Header__partner-logo-link"
                title="Ludwig-Maximilians-Universität München"
              >
                <img
                  src={LMULogo}
                  alt="LMU"
                  className="Header__partner-logo-img"
                />
              </a>
            </div>
          </div>
        </Container>
      </div>
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
            <Nav
              activeKey={activeKey}
              onSelect={(key) => setActiveKey(key ?? undefined)}
              className="mx-auto"
            >
              <NavItem href="/corpus" title="Corpus" />
              <NavItem href="/library" title="Library" />
              <NavItem href="/about" title="About" />
              <NavItem href="/tools" title="Tools" />
              <NavItem href="/projects" title="Projects" />
            </Nav>
            <Navbar.Text id="user">
              <User />
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}
