import React, { Fragment } from 'react'
import Word from 'dictionary/domain/Word'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Col, Row } from 'react-bootstrap'
import './wordInformationDisplay.sass'
import withData, { WithoutData } from 'http/withData'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'
import { AGI } from 'dictionary/ui/display/WordDisplayAGI'
import LogogramsDisplay from 'dictionary/ui/display/WordDisplayLogograms'
import { WordDisplayDetails } from 'dictionary/ui/display/WordDisplayDetails'
import { Markdown } from 'common/Markdown'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import SignService from 'signs/application/SignService'
import CorpusLemmaLines from 'dictionary/ui/search/CorpusLemmaLines'
import { EmptySection } from 'dictionary/ui/display/EmptySection'
import WordTitle from 'dictionary/ui/display/WordTitle'
import FragmentLemmaLines from '../search/FragmentLemmaLines'
import FragmentService from 'fragmentarium/application/FragmentService'
import { HeadTags } from 'router/head'
import { AfoRegisterRedirectBox } from 'afo-register/ui/AfoRegisterSearch'

const Heading = ({
  number,
  title,
}: {
  number: string
  title: string
}): JSX.Element => (
  <Row>
    <Col>
      <h3 id={number} className="dictionary-heading">
        {number}. {title}
      </h3>
    </Col>
  </Row>
)

const Sections = [
  { number: 'Ⅰ', title: 'A Concise Dictionary of Akkadian' },
  {
    number: 'Ⅱ',
    title:
      'A Concise Dictionary of Akkadian (Justifications, Addenda and Corrigenda)',
  },
  { number: 'Ⅲ', title: 'Akkadische Logogramme' },
  {
    number: 'Ⅳ',
    title: 'Akkadische Glossare und Indizes (AfO-Register)',
  },
  { number: 'Ⅴ', title: 'Supplement to the Akkadian Dictionaries' },
  { number: 'Ⅵ', title: 'Library Examples' },
  { number: 'Ⅶ', title: 'Corpus Examples' },
]

function WordDisplay({
  word,
  textService,
  signService,
  fragmentService,
}: {
  word: Word
  textService: TextService
  signService: SignService
  fragmentService: FragmentService
}): JSX.Element {
  const cda =
    word.origin === 'cda' ? (
      <Fragment key="cda">
        <WordDisplayDetails word={word} />
        <LiteratureRedirectBox
          authors="Black, J.; George, A.R.; Postgate, N."
          book={Sections[0].title}
          subtitle="Second (corrected) printing. SANTAG Arbeiten und Untersuchungen zur Keilschriftkunde 5. Wiesbaden: Harrassowitz, ²2000"
          notelink=""
          note="By permission from Harrassowitz"
          link="https://www.harrassowitz-verlag.de/isbn_978-3-447-04264-2.ahtml"
          icon="pointer__hover my-2 fas fa-shopping-cart fa-2x"
        />
      </Fragment>
    ) : (
      <EmptySection key="cda" />
    )

  const cdaAddenda = word.cdaAddenda ? (
    <Fragment key="cdaAddenda">
      <Row className="ml-5">
        <Col>
          {' '}
          <Markdown text={word.cdaAddenda} />
        </Col>
      </Row>
      <LiteratureRedirectBox
        authors="Postgate, N.; Worthington, M."
        book={Sections[1].title}
        notelink=""
        subtitle="2003–2011"
        note="By permission from the authors"
        link="https://www.soas.ac.uk/cda-archive/"
        icon="pointer__hover my-2 fas fa-external-link-square-alt"
      />
    </Fragment>
  ) : (
    <EmptySection key="cdaAddenda" />
  )

  const akkadischeLogogramme = (
    <LogogramsDisplay signService={signService} wordId={word._id} />
  )

  const akkadischeGlossareUndIndices = word.akkadischeGlossareUndIndices ? (
    <Fragment key="AkkadischeGlossareUndIndices">
      <AGI AkkadischeGlossareUndIndices={word.akkadischeGlossareUndIndices} />
      {AfoRegisterRedirectBox}{' '}
      <LiteratureRedirectBox
        authors="Sommerfeld, W."
        book="Akkadische Glossare und Indizes"
        notelink="https://creativecommons.org/licenses/by-nd/4.0/"
        subtitle="Version 1.1 (26. Mai 2021)"
        note="CC BY-ND 4.0"
        link="https://www.uni-marburg.de/cnms/forschung/dnms/apps/agi"
        icon="pointer__hover my-2 fas fa-external-link-square-alt"
      />
    </Fragment>
  ) : (
    <EmptySection key="akkadischeGlossareUndIndices" />
  )

  const supplementsAkkadianDictionaries = word.supplementsAkkadianDictionaries ? (
    <Fragment key="supplementsAkkadianDictionaries">
      <Row className="supplementsAkkadianDictionaries">
        <Col>
          {' '}
          <Markdown text={word.supplementsAkkadianDictionaries} />
        </Col>
      </Row>
      <LiteratureRedirectBox
        authors="Streck, M.P."
        book={Sections[4].title}
        notelink="https://creativecommons.org/licenses/by-sa/3.0/"
        subtitle="2013–"
        note="CC BY-ND 3.0"
        link="https://altorient.gko.uni-leipzig.de/etymd.html"
        icon="pointer__hover my-2 fas fa-external-link-square-alt"
      />
    </Fragment>
  ) : (
    <EmptySection key="supplementsAkkadianDictionaries" />
  )

  const fragmentarium = (
    <FragmentLemmaLines lemmaId={word._id} fragmentService={fragmentService} />
  )

  const corpus = (
    <CorpusLemmaLines textService={textService} lemmaId={word._id} />
  )
  return (
    <AppContent
      crumbs={[new SectionCrumb('Dictionary'), new TextCrumb(word._id)]}
      title={WordTitle({ word })}
    >
      <HeadTags
        title={`${word._id}: eBL`}
        description={`Information about the word ${word._id} in the electronic Babylonian Library (eBL).`}
      />
      {[
        cda,
        cdaAddenda,
        akkadischeLogogramme,
        akkadischeGlossareUndIndices,
        supplementsAkkadianDictionaries,
        fragmentarium,
        corpus,
      ].map((sectionDisplay, i) => (
        <Fragment key={`WordDisplay_${i}`}>
          <Heading
            number={Sections[i].number}
            title={Sections[i].title}
            key={`WordDisplayHeading_${i}`}
          />
          {sectionDisplay}
        </Fragment>
      ))}
    </AppContent>
  )
}
type Props = {
  data: Word
  wordService: WordService
  textService: TextService
  signService: SignService
  fragmentService: FragmentService
  wordId: string
}

export default withData<
  WithoutData<Props>,
  { wordId: string; wordService: WordService },
  Word
>(
  ({ data, textService, fragmentService, signService }) => (
    <WordDisplay
      textService={textService}
      signService={signService}
      word={data}
      fragmentService={fragmentService}
    />
  ),
  (props) => props.wordService.find(props.wordId)
)
