import React from 'react'
import ExternalLink from 'common/ExternalLink'
import AppContent from 'common/AppContent'

import eblChart from './ebl_chart.jpg'

import './Introduction.css'

function Auth0Badge () {
  return (
    <ExternalLink
      className='Auth0Badge'
      href='https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss'
      title='Single Sign On & Token Based Authentication - Auth0'
    >
      <img
        className='Auth0Badge__image'
        alt='JWT Auth for open source projects'
        src='//cdn.auth0.com/oss/badges/a0-badge-light.png'
      />
    </ExternalLink>
  )
}

function IntroText () {
  return (
    <>
      <p>
        The Electronic Babylonian Literature (eBL) Project brings together
        ancient Near Eastern specialists and data scientists to revolutionize
        the way in which the literature of Iraq in the first millennium BCE is
        reconstructed and analyzed. Generations of scholars have striven to
        explore the written culture of this period, in which literature in
        cuneiform script flourished to an unprecedented degree, but their
        efforts have been hampered by two factors: the literature’s fragmentary
        state of reconstruction and the lack of an electronic corpus of texts on
        which to perform computer-aided analyses.
      </p>
      <p>
        The eBL project aims to overcome both challenges. First, a comprehensive
        electronic corpus will be compiled, and legacy raw material now largely
        inaccessible will be transcribed into a database of fragments
        (“Fragmentarium”). Secondly, a pioneering sequence alignment algorithm
        (“cuneiBLAST”) will be developed to query these corpora. This algorithm
        will propel the reconstruction of Babylonian literature forward by
        identifying hundreds of new pieces of text, not only in the course of
        the project but also in the decades to come.
      </p>
      <p>
        The eBL team will be composed of four members: the PI, a PhD student in
        Computer Science, a post-doctoral researcher and a PhD student in
        ancient Near Eastern studies. In addition, Turkish and Iraqi external
        collaborators will work on manuscripts kept in museums in Istanbul and
        Baghdad.
      </p>
      <p>
        In order to answer several fundamental and much-debated questions about
        the nature of the Babylonian poetic expression and the composition and
        transmission of the texts, three tools will be developed to data-mine
        the eBL corpus. The first will search for patterns in the spelling
        variants in the manuscripts, the second will find rhythmical patterns,
        and the third will sift the corpus for intertextual parallels. The
        bottom-up study of the corpus by means of these tools will decisively
        change our conceptions of how Babylonian literature was composed and
        experienced by ancient audiences.
      </p>
      <img className='Introduction__chart' src={eblChart} alt='eBL chart' />
    </>
  )
}

export default function Introduction () {
  return (
    <AppContent
      className='App-content'
      title='The “Electronic Babylonian Literature” (eBL) Project: A general introduction'
    >
      <IntroText />

      <footer className='Introduction__footer'>
        <Auth0Badge />
      </footer>
    </AppContent>
  )
}
