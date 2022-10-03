import React from 'react'
import { match as Match } from 'react-router-dom'
import Word from 'dictionary/domain/Word'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Button, Col, Row, Tab, Tabs } from 'react-bootstrap'
import './wordInformationDisplay.sass'
import withData, { WithoutData } from 'http/withData'
import { RouteComponentProps } from 'react-router-dom'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'
import { AGI } from 'dictionary/ui/display/WordDisplayAGI'
import { WordDisplayDetails } from 'dictionary/ui/display/WordDisplayDetails'
import { Markdown } from 'common/Markdown'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import LinesWithLemma from 'dictionary/ui/search/LinesWithLemma'
import { EmptySection } from 'dictionary/ui/display/EmptySection'

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
  { number: 'Ⅲ', title: 'Akkadische Glossare und Indizes' },
  { number: 'Ⅳ', title: 'Supplement to the Akkadian Dictionaries' },
  { number: 'Ⅴ', title: 'Corpus' },
]

const genres: readonly { readonly genre: string; readonly name: string }[] = [
  { genre: 'L', name: 'Literature' },
  { genre: 'D', name: 'Divination' },
  { genre: 'Lex', name: 'Lexicography' },
  { genre: 'Med', name: 'Medicine' },
]

function WordDisplay({
  word,
  textService,
}: {
  word: Word
  textService: TextService
}): JSX.Element {
  const guideWord = `[${word.guideWord}]`
  const pos = word.pos[0] ?? ''

  const copyableInformation = `+${word.lemma[0]}${guideWord}${pos}$`
  return (
    <AppContent
      crumbs={[new SectionCrumb('Dictionary'), new TextCrumb(word._id)]}
      title={
        <>
          <Row>
            <Col>
              <strong>
                {word.attested === false && '*'}
                {word.lemma.join(' ')} {word.homonym}
              </strong>
              {word.guideWord.length > 0 && (
                <>
                  , &ldquo;
                  <Markdown text={word.guideWord} />
                  &rdquo;
                </>
              )}
            </Col>

            {word.pos.length > 0 && (
              <Col>
                <h5 className="text-secondary">({word.pos.join(', ')})</h5>
              </Col>
            )}

            <Col xs="auto" className="pr-5 mr-5">
              <div className="border border-dark p-1 text-secondary h6">
                {copyableInformation}
                <Button
                  className="ml-2 copyIcon"
                  onClick={async () =>
                    await navigator.clipboard.writeText(copyableInformation)
                  }
                >
                  <i className="fas fa-copy" />
                </Button>
              </div>
            </Col>
          </Row>
          {word.arabicGuideWord.length > 0 && (
            <Row>
              <Col className="arabicGuideWord">{word.arabicGuideWord}</Col>
            </Row>
          )}
        </>
      }
    >
      <Heading number={Sections[0].number} title={Sections[0].title} />
      {word.origin === 'cda' ? (
        <>
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
        </>
      ) : (
        <EmptySection />
      )}

      <Heading number={Sections[1].number} title={Sections[1].title} />
      {word.cdaAddenda ? (
        <>
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
        </>
      ) : (
        <EmptySection />
      )}

      <Heading number={Sections[2].number} title={Sections[2].title} />
      {word.akkadischeGlossareUndIndices ? (
        <>
          <AGI
            AkkadischeGlossareUndIndices={word.akkadischeGlossareUndIndices}
          />
          <LiteratureRedirectBox
            authors="Sommerfeld, W."
            book={Sections[2].title}
            notelink="https://creativecommons.org/licenses/by-nd/4.0/"
            subtitle="Version 1.1 (26. Mai 2021)"
            note="CC BY-ND 4.0"
            link="https://www.uni-marburg.de/cnms/forschung/dnms/apps/agi"
            icon="pointer__hover my-2 fas fa-external-link-square-alt"
          />
        </>
      ) : (
        <EmptySection />
      )}

      <Heading number={Sections[3].number} title={Sections[3].title} />
      {word.supplementsAkkadianDictionaries ? (
        <>
          <Row className="supplementsAkkadianDictionaries">
            <Col>
              {' '}
              <Markdown text={word.supplementsAkkadianDictionaries} />
            </Col>
          </Row>
          <LiteratureRedirectBox
            authors="Streck, M.P."
            book={Sections[3].title}
            notelink="https://creativecommons.org/licenses/by-sa/3.0/"
            subtitle="2013–"
            note="CC BY-ND 3.0"
            link="https://altorient.gko.uni-leipzig.de/etymd.html"
            icon="pointer__hover my-2 fas fa-external-link-square-alt"
          />
        </>
      ) : (
        <EmptySection />
      )}

      <Heading number={Sections[4].number} title={Sections[4].title} />
      <>
        <Tabs defaultActiveKey={genres[0].genre}>
          {genres.map(({ genre, name }, index) => (
            <Tab
              eventKey={genre}
              title={name}
              className={'lines-with-lemma__tab'}
              key={index}
            >
              <LinesWithLemma
                textService={textService}
                lemmaId={word._id}
                genre={genre}
              />
            </Tab>
          ))}
        </Tabs>
      </>
    </AppContent>
  )
}
type Props = {
  data: Word
  wordService: WordService
  textService: TextService
} & RouteComponentProps<{ id: string }>

export default withData<
  WithoutData<Props>,
  { match: Match; wordService: WordService },
  Word
>(
  ({ data, textService }) => (
    <WordDisplay textService={textService} word={data} />
  ),
  (props) =>
    props.wordService.find(decodeURIComponent(props.match.params['id']))
)
