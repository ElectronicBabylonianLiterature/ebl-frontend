import React from 'react'
import Word from 'dictionary/domain/Word'
import withData, { WithoutData } from 'http/withData'
import { RouteComponentProps } from 'react-router-dom'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Button, Col, Row } from 'react-bootstrap'
import './wordInformationDisplay.css'
import WordService from 'dictionary/application/WordService'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'
import {
  AmplifiedMeanings,
  AmplifiedMeaningsDetails,
  Derivatives,
  Join,
  Logogram,
  OtherForm,
  SingleDerivative,
} from 'dictionary/ui/display/WordDisplayParts'
import { AGI } from 'dictionary/ui/display/WordDisplayAGI'
import { Markdown } from 'common/Markdown'

const Heading = ({
  number,
  title,
}: {
  number: string
  title: string
}): JSX.Element => (
  <Row>
    <Col>
      <h3 id={number}>
        {number}. {title}
      </h3>
    </Col>
  </Row>
)

const Sections = [
  { number: 'Ⅰ', title: 'A Concise Dictionary of Akkadian' },
  { number: 'Ⅱ', title: 'Akkadische Glossare und Indizes' },
]

function WordDisplay({ word }: { word: Word }): JSX.Element {
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
                {word.lemma.join(' ')}
                {word.attested === false && '*'} {word.homonym}
              </strong>
              , &ldquo;{word.guideWord}&rdquo;
              {word.arabicGuideWord.length > 0 && <> {word.arabicGuideWord}</>}
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
        </>
      }
    >
      <Heading number={Sections[0].number} title={Sections[0].title} />
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
      {word.akkadischeGlossareUndIndices && (
        <Heading number={Sections[1].number} title={Sections[1].title} />
      )}
      {word.akkadischeGlossareUndIndices && (
        <AGI AkkadischeGlossareUndIndices={word.akkadischeGlossareUndIndices} />
      )}
      {word.akkadischeGlossareUndIndices && (
        <LiteratureRedirectBox
          authors="Sommerfeld, W."
          book={Sections[1].title}
          notelink="https://creativecommons.org/licenses/by-nd/4.0/"
          subtitle="Version 1.1 (26. Mai 2021)"
          note="CC BY-ND 4.0"
          link="https://www.uni-marburg.de/cnms/forschung/dnms/apps/agi"
          icon="pointer__hover my-2 fas fa-external-link-square-alt"
        />
      )}
    </AppContent>
  )
}

function WordDisplayDetails({ word }: { word: Word }): JSX.Element {
  return (
    <Row>
      <Col>
        <Row>
          <Col xs={{ offset: 1 }}>
            <Row>
              <Col>
                {word.forms.length > 0 && (
                  <>
                    Other forms:&nbsp;
                    <Join
                      list={word.forms}
                      separator={', '}
                      Component={OtherForm}
                    />
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {word.amplifiedMeanings.length > 0 && (
                  <AmplifiedMeanings
                    amplifiedMeanings={word.amplifiedMeanings}
                    wordId={word._id}
                  />
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {word.derived.length > 0 && (
                  <>
                    Derivatives:&nbsp;
                    <Derivatives derivatives={word.derived} />
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {word.derivedFrom && (
                  <>
                    Derived from:&nbsp;
                    <SingleDerivative {...word.derivedFrom} />
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {word.logograms.length > 0 && (
                  <>
                    Logograms:&nbsp;
                    <Join
                      list={word.logograms}
                      separator={', '}
                      Component={Logogram}
                    />
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col>{word.roots && `Roots: ${word.roots.join(', ')}`}</Col>
            </Row>
            <Row>
              <Col>
                <br />
                {word.meaning && <Markdown text={word.meaning} />}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col>
            <AmplifiedMeaningsDetails
              amplifiedMeanings={word.amplifiedMeanings}
            />
          </Col>
        </Row>
        <Row>
          <Col></Col>
        </Row>
      </Col>
    </Row>
  )
}
type Props = {
  data: Word
  wordService: WordService
} & RouteComponentProps<{ id: string }>

export default withData<WithoutData<Props>, { match; wordService }, Word>(
  ({ data }) => <WordDisplay word={data} />,
  (props) => props.wordService.find(props.match.params['id'])
)
