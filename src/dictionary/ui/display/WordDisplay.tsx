import React from 'react'
import Word from 'dictionary/domain/Word'
import withData, { WithoutData } from 'http/withData'
import { RouteComponentProps } from 'react-router-dom'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Button, Col, Row } from 'react-bootstrap'
import './wordInformationDisplay.css'
import ReactMarkdown from 'react-markdown'
import ExternalLink from 'common/ExternalLink'
import WordService from 'dictionary/application/WordService'
import {
  AmplifiedMeanings,
  AmplifiedMeaningsDetails,
  Derivatives,
  OtherForms,
  replaceByCurlyQuotes,
} from 'dictionary/ui/display/WordDisplayParts'

const LiteratureRedirectBox = (): JSX.Element => (
  <ExternalLink
    className="text-dark"
    href="https://www.harrassowitz-verlag.de/isbn_978-3-447-04264-2.ahtml"
    title="A Concise Dictionary of Akkadian, Harrassowitz Verlag"
  >
    <Row>
      <Col xs={11} className="mx-auto">
        <Row className="m-3 py-2 border border-dark">
          <Col xs="auto">
            <i className="pointer__hover mt-2 fas fa-shopping-cart" />
          </Col>
          <Col className="pointer__hover my-auto">
            <h5>
              {' '}
              From Black, J.; George, A.R.; Postgate, N., A Concise Dictionary
              of Akkadian. 2nd (corrected) printing. SANTAG Arbeiten und
              Untersuchungen zur Keilschriftkunde, Band 5. Wiesbaden:
              Harrassowitz, 2000
            </h5>
          </Col>
        </Row>
      </Col>
    </Row>
  </ExternalLink>
)

function WordDisplay({ word }: { word: Word }): JSX.Element {
  const guideWord = word.guideWord ? `[${word.guideWord}]` : ''
  const pos = word.pos[0] ?? ''

  const copyableInformation = `+${word.lemma[0]}${guideWord}${pos}$`
  return (
    <AppContent
      crumbs={[new SectionCrumb('Dictionary'), new TextCrumb(word._id)]}
      title={
        <>
          <Row>
            <Col>
              <LiteratureRedirectBox />
            </Col>
          </Row>
          <Row>
            <Col>
              <strong>
                {word.lemma.join(' ')}
                {word.attested === false && '*'} {word.homonym}
              </strong>
              , &ldquo;{word.guideWord}&rdquo;
            </Col>
            <Col>
              {Boolean(word.pos.length) && (
                <h5 className="text-secondary">({word.pos.join(', ')})</h5>
              )}
            </Col>
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
      <WordDisplayDetails word={word} />
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
                {word.forms.length && <OtherForms forms={word.forms} />}
              </Col>
            </Row>
            <Row>
              <Col>
                {Boolean(word.amplifiedMeanings.length) &&
                  Boolean(word.amplifiedMeanings[0].key) && (
                    <AmplifiedMeanings
                      amplifiedMeanings={word.amplifiedMeanings}
                      wordId={word._id}
                    />
                  )}
              </Col>
            </Row>
            <Row>
              <Col>
                {Boolean(word.derived.length) && (
                  <Derivatives derivatives={word.derived} />
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {Boolean(word.logograms.length) &&
                  `Logograms: ${word.logograms
                    .map((logogram) => logogram.logogram[0])
                    .join(', ')}`}
              </Col>
            </Row>
            <Row>
              <Col>{word.roots && `Roots: ${word.roots.join(', ')}`}</Col>
            </Row>
            <Row>
              <Col>
                <br />
                {word.meaning && (
                  <ReactMarkdown>
                    {replaceByCurlyQuotes(word.meaning)}
                  </ReactMarkdown>
                )}
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
