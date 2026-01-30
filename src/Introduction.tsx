import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Card, Row, Col } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import './Introduction.sass'
import { HeadTags } from 'router/head'
import { newsletters } from 'about/ui/news'

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
          <Col md={4} className="mb-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="feature-card__icon">𒀀</div>
                <h3 className="feature-card__title">Signs</h3>
                <p className="feature-card__text">
                  Comprehensive reference tool for cuneiform script with
                  palaeographic resources
                </p>
                <Link to="/signs" className="feature-card__link">
                  Explore Signs →
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="feature-card__icon">Aa</div>
                <h3 className="feature-card__title">Dictionary</h3>
                <p className="feature-card__text">
                  Flexible reference for Akkadian vocabulary with CDA and guide
                  words
                </p>
                <Link to="/dictionary" className="feature-card__link">
                  Browse Dictionary →
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="feature-card__icon">⊞</div>
                <h3 className="feature-card__title">Bibliography</h3>
                <p className="feature-card__text">
                  Complete bibliography of cuneiform publications with 11,497+
                  entries
                </p>
                <Link
                  to="/bibliography/references"
                  className="feature-card__link"
                >
                  View Bibliography →
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

function NewsSection(): JSX.Element {
  const latestNews = newsletters.slice(0, 3)

  return (
    <section className="introduction-news">
      <Container>
        <div className="introduction-news__header">
          <h2 className="introduction-news__title">Latest Updates</h2>
          <Link to="/news" className="introduction-news__view-all-link">
            View all →
          </Link>
        </div>
        <div className="introduction-news__list">
          {latestNews.map((newsletter) => (
            <Link
              key={newsletter.number}
              to={`/news/${newsletter.number}`}
              className="introduction-news__item"
            >
              <div className="introduction-news__item-badge">
                #{newsletter.number}
              </div>
              <div className="introduction-news__item-content">
                <div className="introduction-news__item-title">
                  Newsletter #{newsletter.number}
                </div>
                <div className="introduction-news__item-date">
                  {newsletter.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className="introduction-news__item-arrow">→</div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default function Introduction(): JSX.Element {
  return (
    <>
      <Hero />
      <AppContent crumbs={[]}>
        <IntroText />
        <FeatureCards />
        <NewsSection />
        <HeadTags
          title="Introduction: eBL"
          description="Homepage and introduction to the electronic Babylonian Library (eBL)."
        />
      </AppContent>
    </>
  )
}
