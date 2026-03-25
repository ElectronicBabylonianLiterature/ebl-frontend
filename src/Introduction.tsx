import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Card, Row, Col } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import './Introduction.sass'
import { HeadTags } from 'router/head'
import { newsletters } from 'about/ui/news'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import LatestTransliterations from 'fragmentarium/ui/front-page/LatestTransliterations'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { getIntroductionFeatureCards } from 'library/application/referenceSections'

const featureCards = getIntroductionFeatureCards()

function Hero(): JSX.Element {
  return (
    <div className="hero">
      <div className="hero__content">
        <div className="hero__badge">EXPLORE ANCIENT MESOPOTAMIA</div>
        <h1 className="hero__title">
          Electronic <br />
          Babylonian Library
        </h1>
        <p className="hero__subtitle">
          Advancing the publication and reconstruction of cuneiform tablets
          worldwide
        </p>
        <div className="hero__links">
          <Link to="/library/search" className="hero__link">
            Library
          </Link>
          <span className="hero__divider">|</span>
          <Link to="/corpus" className="hero__link">
            Corpus
          </Link>
          <span className="hero__divider">|</span>
          <Link to="/dictionary" className="hero__link">
            Dictionary
          </Link>
        </div>
      </div>
    </div>
  )
}

function IntroText(): JSX.Element {
  return (
    <section className="introduction-text">
      <Container>
        <p>
          The goal of the electronic Babylonian Library (eBL) platform is to
          advance the publication and reconstruction of cuneiform tablets
          worldwide. By offering a versatile platform for editing tablets and
          texts and for annotating editions and photographs, and a suite of
          tools for epigraphic, lexicographic and historiographic research, it
          aims to accelerate dramatically the pace at which the written
          documentation of ancient Mesopotamia is recovered for the modern
          world.
        </p>
        <p>
          The eBL platform is based at{' '}
          <a href="https://www.lmu.de/">
            Ludwig-Maximilians-Universität München
          </a>{' '}
          (LMU) and the{' '}
          <a href="https://badw.de/">Bayerische Akademie der Wissenschaften</a>{' '}
          (BAdW), and it is hosted by the{' '}
          <a href="https://www.lrz.de/">
            Leibniz-Rechenzentrum der Bayerischen Akademie der Wissenschaften
          </a>{' '}
          (LRZ). It was initially developed with funding from a Sofja
          Kovalevskaja Award (
          <a href="https://www.humboldt-foundation.de/">
            Alexander von Humboldt Stiftung
          </a>
          , 2018–2024). Since 2022, further development has been supported by
          the{' '}
          <a href="https://caic.badw.de">
            <i>Cuneiform Artefacts of Iraq in Context</i>
          </a>{' '}
          project (CAIC, BAdW, 2022–2046).
        </p>
      </Container>
    </section>
  )
}

function FeatureCards(): JSX.Element {
  return (
    <section className="introduction-content">
      <Container>
        <Row>
          {featureCards.map((featureCard) => (
            <Col key={featureCard.title} md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-card__icon">{featureCard.icon}</div>
                  <h3 className="feature-card__title">{featureCard.title}</h3>
                  <p className="feature-card__text">
                    {featureCard.description}
                  </p>
                  <Link to={featureCard.to} className="feature-card__link">
                    {featureCard.linkText}
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

function NewsSection(): JSX.Element {
  const latestNewsletter = newsletters[0]
  const olderNewsletters = newsletters.slice(1, 4)

  const getNewsletterPreview = (content: string): string => {
    const lines = content.split('\n')
    const contentLines = lines
      .slice(4)
      .filter((line) => line.trim() && !line.startsWith('#'))
    return contentLines.slice(0, 3).join(' ').substring(0, 280) + '...'
  }

  return (
    <section className="introduction-news">
      <Container>
        <div className="introduction-news__header">
          <div className="introduction-news__header-content">
            <h2 className="introduction-news__title">Latest from eBL</h2>
            <p className="introduction-news__subtitle">
              Stay updated with new features, improvements, and announcements
            </p>
          </div>
          <Link to="/news" className="introduction-news__view-all-btn">
            View all updates
            <span className="introduction-news__view-all-arrow">→</span>
          </Link>
        </div>

        <div className="introduction-news__featured">
          <Link
            to={`/news/${latestNewsletter.number}`}
            className="introduction-news__featured-card"
          >
            <div className="introduction-news__featured-badge">
              <span className="introduction-news__featured-badge-label">
                Latest
              </span>
              <span className="introduction-news__featured-badge-number">
                #{latestNewsletter.number}
              </span>
            </div>
            <div className="introduction-news__featured-content">
              <div className="introduction-news__featured-date">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {latestNewsletter.date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <h3 className="introduction-news__featured-title">
                Newsletter #{latestNewsletter.number}
              </h3>
              <p className="introduction-news__featured-preview">
                {getNewsletterPreview(latestNewsletter.content)}
              </p>
              <div className="introduction-news__featured-cta">
                Read full newsletter
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="introduction-news__recent-list">
            {olderNewsletters.map((newsletter) => (
              <Link
                key={newsletter.number}
                to={`/news/${newsletter.number}`}
                className="introduction-news__recent-item"
              >
                <div className="introduction-news__recent-badge">
                  #{newsletter.number}
                </div>
                <div className="introduction-news__recent-content">
                  <div className="introduction-news__recent-date">
                    {newsletter.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="introduction-news__recent-title">
                    Newsletter #{newsletter.number}
                  </div>
                </div>
                <div className="introduction-news__recent-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

export default function Introduction({
  fragmentService,
  dossiersService,
}: {
  fragmentService: FragmentService
  dossiersService: DossiersService
}): JSX.Element {
  return (
    <>
      <Hero />
      <AppContent crumbs={[]}>
        <IntroText />
        <FeatureCards />
        <SessionContext.Consumer>
          {(session: Session) =>
            session.isAllowedToReadFragments() ? (
              <Container>
                <LatestTransliterations
                  fragmentService={fragmentService}
                  dossiersService={dossiersService}
                  mode="homepage"
                />
              </Container>
            ) : null
          }
        </SessionContext.Consumer>
        <NewsSection />
        <HeadTags
          title="Introduction: eBL"
          description="Homepage and introduction to the electronic Babylonian Library (eBL)."
        />
      </AppContent>
    </>
  )
}
