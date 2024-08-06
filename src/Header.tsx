import React, { useState } from 'react'
import { Image, Nav, Navbar, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

import User from './auth/User'
import './Header.css'
import lmuLogo from './LMU_Logo.svg'
import badwLogo from './BAdW_Logo.svg'
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

function LogoLink(props: {
  href: string
  className: string
  src: string
}): JSX.Element {
  return (
    <ExternalLink href={props.href}>
      <Image className={props.className} src={props.src} fluid />
    </ExternalLink>
  )
}

function LogoContainer(): JSX.Element {
  const logos = [
    { href: 'https://www.lmu.de', className: 'Header__lmu-logo', src: lmuLogo },
    { href: 'https://badw.de/', className: 'Header__badw-logo', src: badwLogo },
  ]

  return (
    <Container className="Header__logo-container">
      {logos.map((logo) => (
        <LogoLink key={logo.href} {...logo} />
      ))}
    </Container>
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
          <Navbar.Brand>
            <LogoContainer />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={id} />
          <Navbar.Collapse id={id}>
            <div
              id="navbar-container"
              className="d-flex justify-content-between"
            >
              <div id="menu-lines">
                <Nav
                  activeKey={activeKey}
                  onSelect={(key) => setActiveKey(key ?? undefined)}
                  className="mx-auto"
                >
                  <NavItem href="/signs" title="Signs" />
                  <NavItem href="/dictionary" title="Dictionary" />
                  <NavItem href="/corpus" title="Corpus" />
                  <NavItem href="/fragmentarium" title="Fragmentarium" />
                </Nav>
                <Nav
                  activeKey={activeKey}
                  onSelect={(key) => setActiveKey(key ?? undefined)}
                  className="mx-auto"
                >
                  <NavItem href="/about" title="About" />
                  <NavItem href="/bibliography" title="Bibliography" />
                  <NavItem href="/tools" title="Tools" />
                  <NavItem href="/projects" title="Projects" />
                </Nav>
              </div>
              <Navbar.Text id="user">
                <User />
              </Navbar.Text>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}
