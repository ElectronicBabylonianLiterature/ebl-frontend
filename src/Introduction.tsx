import React from 'react'
import ExternalLink from 'common/ExternalLink'
import AppContent from 'common/AppContent'
import LMULogoGreen from 'LMU_Logo_green.svg'
import BAdWLogoBlue from 'BAdW_Logo_blue.svg'
import AvHLogo from 'AvH_Logo.svg'
import LRZLogoBlue from 'lrz_wortbild_d_blau-230.png'

import './Introduction.sass'
import { Col, Row } from 'react-bootstrap'
import { HeadTags } from 'router/head'

function HumboldtIcon(): JSX.Element {
  return (
    <ExternalLink
      className="HumboldtIcon"
      href="https://www.humboldt-foundation.de/"
      title="Humboldt Foundation"
    >
      <img
        className="HumboldtIcon__image"
        src={AvHLogo}
        alt="Alexander von Humboldt Stiftung / Foundation"
      />
    </ExternalLink>
  )
}

function BAdWIcon(): JSX.Element {
  return (
    <ExternalLink
      className="BAdWIcon"
      href="https://badw.de/"
      title="Bayerische Akademie der Wissenschaften"
    >
      <img
        className="BAdWIcon__image"
        src={BAdWLogoBlue}
        alt="Bayerische Akademie der Wissenschaften"
      />
    </ExternalLink>
  )
}

function LMUIcon(): JSX.Element {
  return (
    <ExternalLink
      className="LMUIcon"
      href="https://www.lmu.de/de/index.html"
      title="Ludwig-Maximilians-Universität München"
    >
      <img
        className="LMUIcon__image"
        src={LMULogoGreen}
        alt="Ludwig-Maximilians-Universität München"
      />
    </ExternalLink>
  )
}

function Auth0Badge(): JSX.Element {
  return (
    <ExternalLink
      className="Auth0Badge"
      href="https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss"
      title="Single Sign On & Token Based Authentication - Auth0"
    >
      <img
        className="Auth0Badge__image"
        alt="JWT Auth for open source projects"
        src="//cdn.auth0.com/oss/badges/a0-badge-dark.png"
      />
    </ExternalLink>
  )
}

function TwitterIcon(): JSX.Element {
  return (
    <ExternalLink
      className="icon__twitter"
      href="https://twitter.com/ebl_info?ref_src=twsrc%5Etfw"
      title="eBL Twitter account"
    >
      <i className="fab fa-x-twitter icon__large" />
      <span className="eblInfo">@eBL_info</span>
    </ExternalLink>
  )
}

function FacebookIcon(): JSX.Element {
  return (
    <ExternalLink
      href="https://www.facebook.com/profile.php?id=61556323986355"
      title="eBL Facebook account"
    >
      <i className="fab fa-facebook icon__large" />
      <span className="eblInfo">CAIC on Facebook</span>
    </ExternalLink>
  )
}

function LRZLogo(): JSX.Element {
  return (
    <ExternalLink
      className="LMUIcon"
      href="https://www.lrz.de/index.html"
      title="Leibniz-Rechenzentrum"
    >
      <img
        className="LMUIcon__image"
        src={LRZLogoBlue}
        alt="Leibniz-Rechenzentrum"
      />
    </ExternalLink>
  )
}

function IntroText(): JSX.Element {
  return (
    <>
      <p>
        The goal of the electronic Babylonian Library (eBL) platform is to
        advance the publication and reconstruction of cuneiform tablets
        worldwide. By offering a versatile platform for editing tablets and
        texts and for annotating editions and photographs, and a suite of tools
        for epigraphic, lexicographic and historiographic research, it aims to
        accelerate dramatically the pace at which the written documentation of
        ancient Mesopotamia is recovered for the modern world.
      </p>
      <p>
        The eBL platform is based at{' '}
        <a href="https://www.lmu.de/">Ludwig-Maximilians-Universität München</a>{' '}
        (LMU) and the{' '}
        <a href="https://badw.de/">Bayerische Akademie der Wissenschaften</a>{' '}
        (BAdW), and it is hosted by the{' '}
        <a href="https://www.lrz.de/">
          Leibniz-Rechenzentrum der Bayerischen Akademie der Wissenschaften
        </a>{' '}
        (LRZ). It was initially developed with funding from a Sofja Kovalevskaja
        Award (
        <a href="https://www.humboldt-foundation.de/">
          Alexander von Humboldt Stiftung
        </a>
        , 2018–2024). Since 2022, further development has been supported by the{' '}
        <a href="https://caic.badw.de">
          <i>Cuneiform Artefacts of Iraq in Context</i>
        </a>{' '}
        project (CAIC, BAdW, 2022–2046).
      </p>
    </>
  )
}

export default function Introduction(): JSX.Element {
  return (
    <AppContent title="The “electronic Babylonian Library” (eBL) Platform">
      <IntroText />
      <HeadTags
        title="Introduction: eBL"
        description="Homepage and introduction to the electronic Babylonian Library (eBL)."
      />
      <footer className="Introduction__footer mt-5 justify-content-center">
        <Row>
          <Col className={'text-right'}>
            <BAdWIcon />
          </Col>
          <Col className={'text-center'}>
            <LMUIcon />
          </Col>
          <Col className={'text-left'}>
            <HumboldtIcon />
          </Col>
        </Row>
        <Row>
          <Col className={'text-right'}>
            <LRZLogo />
          </Col>
          <Col className={'text-center'}>
            <TwitterIcon />
          </Col>
          <Col className={'text-left'}>
            <Auth0Badge />
          </Col>
        </Row>
        <Row>
          <Col>
            <FacebookIcon />
          </Col>
        </Row>
      </footer>
    </AppContent>
  )
}
