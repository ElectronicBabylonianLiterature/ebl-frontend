import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import ExternalLink from 'common/ExternalLink'
import './Footer.sass'

type FooterLink = {
  label: string
  href: string
  isExternal?: boolean
}

type FooterSection = {
  title: string
  links: FooterLink[]
}

const footerSections: FooterSection[] = [
  {
    title: 'About eBL',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Research Projects', href: '/projects' },
      { label: 'CAIC', href: 'https://caic.badw.de', isExternal: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Signs', href: '/reference-library/signs' },
      { label: 'Dictionary', href: '/reference-library/dictionary' },
      { label: 'Bibliography', href: '/reference-library/bibliography' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
    ],
  },
]

const partnerLinks = [
  {
    label: 'BAdW',
    href: 'https://badw.de/',
    title: 'Bayerische Akademie der Wissenschaften',
  },
  {
    label: 'LMU',
    href: 'https://www.lmu.de/',
    title: 'Ludwig-Maximilians-Universität München',
  },
  {
    label: 'LRZ',
    href: 'https://www.lrz.de/',
    title: 'Leibniz-Rechenzentrum',
  },
  {
    label: 'AvH',
    href: 'https://www.humboldt-foundation.de/',
    title: 'Alexander von Humboldt Stiftung',
  },
]

export default function Footer(): JSX.Element {
  return (
    <footer className="main-footer">
      <Container>
        <Row className="main-footer__content">
          {footerSections.map((section) => (
            <Col key={section.title} md={3} className="main-footer__section">
              <h6 className="main-footer__title">{section.title}</h6>
              <ul className="main-footer__links">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <ExternalLink href={link.href}>{link.label}</ExternalLink>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </Col>
          ))}

          <Col md={3} className="main-footer__section">
            <h6 className="main-footer__title">Connect</h6>
            <div className="main-footer__social">
              <ExternalLink
                href="https://twitter.com/ebl_info"
                className="main-footer__social-link"
                title="eBL on X (Twitter)"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </ExternalLink>
              <ExternalLink
                href="https://www.facebook.com/profile.php?id=61556323986355"
                className="main-footer__social-link"
                title="CAIC on Facebook"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </ExternalLink>
            </div>
          </Col>
        </Row>

        <Row className="main-footer__bottom">
          <Col>
            <div className="main-footer__partners">
              {partnerLinks.map((partner, index) => (
                <React.Fragment key={partner.label}>
                  {index > 0 && (
                    <span className="main-footer__separator">·</span>
                  )}
                  <ExternalLink
                    href={partner.href}
                    className="main-footer__partner-link"
                    title={partner.title}
                  >
                    {partner.label}
                  </ExternalLink>
                </React.Fragment>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="main-footer__copyright">
          <Col>
            <p>© {new Date().getFullYear()} electronic Babylonian Library</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
