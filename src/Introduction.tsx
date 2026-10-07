import React from 'react'
import { Container } from 'react-bootstrap'
import AvHLogo from 'AvH_Logo.svg'
import LRZLogoBlue from 'lrz_wortbild_d_blau-230.png'
import AppContent from 'common/ui/AppContent'
import 'Introduction.sass'
import { HeadTags } from 'router/head'
import NewsSection from 'IntroductionNews'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import LatestTransliterations from 'fragmentarium/ui/front-page/LatestTransliterations'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'

function Hero(): JSX.Element {
  return (
    <div className="hero">
      <img
        className="hero__background-image"
        src="/hero_section_img.svg"
        alt=""
        aria-hidden="true"
      />
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
        <div className="hero__partners" aria-label="Project supporters">
          <p className="hero__partners-label">Supported by</p>
          <div className="hero__logos">
            <a
              href="https://www.lrz.de/index.html"
              className="hero__logo-link"
              title="Leibniz-Rechenzentrum"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="hero__logo hero__logo--lrz"
                src={LRZLogoBlue}
                alt="Leibniz-Rechenzentrum"
              />
            </a>
            <a
              href="https://www.humboldt-foundation.de/"
              className="hero__logo-link"
              title="Humboldt Foundation"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="hero__logo hero__logo--humboldt"
                src={AvHLogo}
                alt="Alexander von Humboldt Stiftung"
              />
            </a>
            <a
              href="https://erc.europa.eu/homepage"
              className="hero__logo-link"
              title="European Research Council"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="hero__logo hero__logo--erc"
                src="/LOGO_ERC-FLAG_EU TRANSPARENT.png"
                alt="European Research Council"
              />
            </a>
          </div>
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
          project (CAIC, BAdW, 2022–2046). From 2025 to 2030, the project
          receives additional support from an ERC Consolidator Grant (
          <a href="https://doi.org/10.3030/101171038">
            <i>Rewriting the End of Cuneiform Culture</i>
          </a>
          , Grant agreement ID: 101171038).
        </p>
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
        <SessionContext.Consumer>
          {(session: Session) =>
            session.isAllowedToReadFragments() ? (
              <LatestTransliterations
                fragmentService={fragmentService}
                dossiersService={dossiersService}
                preview={true}
              />
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
