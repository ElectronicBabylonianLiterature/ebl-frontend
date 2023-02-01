import React from 'react'
import ExternalLink from 'common/ExternalLink'
import AppContent from 'common/AppContent'
import LMULogoGreen from 'LMU_Logo_green.svg'
import AvHLogo from 'AvH_Logo.svg'

import './Introduction.css'

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
      className="TwitterIcon"
      href="https://twitter.com/ebl_info?ref_src=twsrc%5Etfw"
      title="eBL Twitter account"
    >
      <i className="fab fa-twitter" />
      <span className="eblInfo"> @eBL_info</span>
    </ExternalLink>
  )
}

function IntroText(): JSX.Element {
  return (
    <>
      <p>
        The electronic Babylonian Library (eBL) Project brings together ancient
        Near Eastern specialists and data scientists to revolutionize the way in
        which the literature of Iraq in the first millennium BCE is
        reconstructed and analyzed. Generations of scholars have striven to
        explore the written culture of this period, in which literature in
        cuneiform script flourished to an unprecedented degree, but their
        efforts have been hampered by two factors: the literature’s fragmentary
        state of reconstruction and the lack of an electronic corpus of texts on
        which to perform computer-aided analyses.
      </p>
      <p>
        The eBL project aims to overcome both challenges. First, a comprehensive
        electronic corpus has been compiled, and legacy raw material now largely
        inaccessible has been transcribed into a database of fragments
        (“Fragmentarium”). Secondly, a pioneering sequence alignment algorithm
        (“cuneiBLAST”) has been developed to query these corpora. This algorithm
        will propel the reconstruction of Babylonian literature forward by
        identifying hundreds of new pieces of text, not only in the course of
        the project but also in the decades to come.
      </p>
      <p>
        In order to answer several fundamental and much-debated questions about
        the nature of the Babylonian poetic expression and the composition and
        transmission of the texts, three tools are being developed to data-mine
        the eBL corpus. The first will search for patterns in the spelling
        variants in the manuscripts, the second will find rhythmical patterns,
        and the third will sift the corpus for intertextual parallels. The
        bottom-up study of the corpus by means of these tools will decisively
        change our conceptions of how Babylonian literature was composed and
        experienced by ancient audiences.
      </p>
      <p>
        The eBL project is based at Ludwig-Maximilians-Universität München. The
        project is funded by a Sofja Kovalevskaja Award of the Alexander von
        Humboldt Foundation (2018–2024).
      </p>
    </>
  )
}

export default function Introduction(): JSX.Element {
  return (
    <AppContent title="The “electronic Babylonian Library” (eBL) Project">
      <IntroText />

      <footer className="Introduction__footer">
        <LMUIcon />
        <HumboldtIcon />
        <TwitterIcon />
        <Auth0Badge />
      </footer>
    </AppContent>
  )
}
