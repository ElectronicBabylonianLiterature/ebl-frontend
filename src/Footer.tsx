import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import ExternalLink from 'common/ExternalLink'
import './Footer.sass'

export default function Footer(): JSX.Element {
  return (
    <footer className="main-footer">
      <Container>
        <Row className="main-footer__content">
          <Col md={3} className="main-footer__section">
            <h6 className="main-footer__title">About eBL</h6>
            <ul className="main-footer__links">
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/projects">Research Projects</a>
              </li>
              <li>
                <ExternalLink href="https://caic.badw.de">CAIC</ExternalLink>
              </li>
            </ul>
          </Col>

          <Col md={3} className="main-footer__section">
            <h6 className="main-footer__title">Resources</h6>
            <ul className="main-footer__links">
              <li>
                <a href="/reference-library/signs">Signs</a>
              </li>
              <li>
                <a href="/reference-library/dictionary">Dictionary</a>
              </li>
              <li>
                <a href="/reference-library/bibliography">Bibliography</a>
              </li>
            </ul>
          </Col>

          <Col md={3} className="main-footer__section">
            <h6 className="main-footer__title">Legal</h6>
            <ul className="main-footer__links">
              <li>
                <a href="/impressum">Impressum</a>
              </li>
              <li>
                <a href="/datenschutz">Datenschutz</a>
              </li>
            </ul>
          </Col>

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
              <ExternalLink
                href="https://badw.de/"
                className="main-footer__partner-link"
                title="Bayerische Akademie der Wissenschaften"
              >
                BAdW
              </ExternalLink>
              <span className="main-footer__separator">·</span>
              <ExternalLink
                href="https://www.lmu.de/"
                className="main-footer__partner-link"
                title="Ludwig-Maximilians-Universität München"
              >
                LMU
              </ExternalLink>
              <span className="main-footer__separator">·</span>
              <ExternalLink
                href="https://www.lrz.de/"
                className="main-footer__partner-link"
                title="Leibniz-Rechenzentrum"
              >
                LRZ
              </ExternalLink>
              <span className="main-footer__separator">·</span>
              <ExternalLink
                href="https://www.humboldt-foundation.de/"
                className="main-footer__partner-link"
                title="Alexander von Humboldt Stiftung"
              >
                AvH
              </ExternalLink>
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
