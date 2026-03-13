import React, { useEffect, useState } from 'react'
import { Nav, Navbar, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { useLocation } from 'react-router-dom'

import User from './auth/User'
import './Header.sass'
import lmuLogo from './LMU_Logo.svg'
import badwLogo from './BAdW_Logo.svg'
import ExternalLink from 'common/ExternalLink'

function EblLogo(): JSX.Element {
  return (
    <h1 className="Header__title">
      <span className="Header__title-abbreviation">
        e<span className="Header__title-abbreviation__caps">bl</span>
      </span>
      <span className="Header__title-main">
        <span className="Header__title-main__line">electronic</span>
        <span className="Header__title-main__line">
          <span className="Header__title-main__caps">B</span>abylonian
        </span>
        <span className="Header__title-main__line">
          <span className="Header__title-main__caps">L</span>ibrary
        </span>
      </span>
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
      <Nav.Link as={Link} to={href} eventKey={href}>
        {title}
      </Nav.Link>
    </Nav.Item>
  )
}

function PartnerLogos(): JSX.Element {
  return (
    <div className="Header__partner-logos">
      <ExternalLink
        href="https://www.lmu.de"
        className="Header__partner-logo-link"
      >
        <img
          className="Header__lmu-logo"
          src={lmuLogo}
          alt="Ludwig-Maximilians-Universitat Munchen"
        />
      </ExternalLink>
      <span className="Header__logo-divider" aria-hidden="true" />
      <ExternalLink
        href="https://badw.de/"
        className="Header__partner-logo-link"
      >
        <img
          className="Header__badw-logo"
          src={badwLogo}
          alt="Bayerische Akademie der Wissenschaften"
        />
      </ExternalLink>
    </div>
  )
}

export default function Header(): JSX.Element {
  const [activeKey, setActiveKey] = useState<string>()
  const id = _.uniqueId('Header-')
  const location = useLocation()

  useEffect(() => {
    setActiveKey(location.pathname)
  }, [location.pathname])
  return (
    <header className="Header">
      <Navbar variant="dark" expand="lg">
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            title="electronic Babylonian Library (eBL)"
            onClick={() => setActiveKey('/')}
          >
            <span className="visually-hidden">
              electronic Babylonian Library (eBL)
            </span>
            <EblLogo />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={id} className="Header__toggle" />
          <Navbar.Collapse id={id}>
            <Nav
              activeKey={activeKey}
              onSelect={(key) => setActiveKey(key ?? undefined)}
              className="Header__nav mx-auto"
            >
              <NavItem href="/library" title="Library" />
              <NavItem href="/about" title="About" />
              <NavItem href="/bibliography" title="Bibliography" />
              <NavItem href="/tools" title="Tools" />
              <NavItem href="/projects" title="Projects" />
            </Nav>
            <div className="Header__right">
              <PartnerLogos />
              <div className="Header__user">
                <User />
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}
