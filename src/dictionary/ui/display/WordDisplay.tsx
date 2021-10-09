import React from 'react'
import Word from 'dictionary/domain/Word'
import withData, { WithoutData } from 'http/withData'
import { RouteComponentProps } from 'react-router-dom'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Button, Col, Row } from 'react-bootstrap'
import './wordInformationDisplay.css'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import ExternalLink from 'common/ExternalLink'
import WordService from 'dictionary/application/WordService'
import {
  AmplifiedMeanings,
  AmplifiedMeaningsDetails,
  Derivatives,
  Join,
  Logogram,
  OtherForm,
  SingleDerivative,
} from 'dictionary/ui/display/WordDisplayParts'
import { Markdown } from 'common/Markdown'

const LiteratureRedirectBoxCDA = (): JSX.Element => (
  <div className="text-center border border-dark m-3">
    <strong>From</strong>
    <br />
    Black, J.; George, A.R.; Postgate, N.,{' '}
    <em>A Concise Dictionary of Akkadian</em>. 2<sup>nd</sup> (corrected)
    printing.&nbsp; SANTAG Arbeiten und Untersuchungen zur Keilschriftkunde 5.
    Wiesbaden: Harrassowitz, ²2000.
    <br />
    <strong>By permission from Harrassowitz.</strong>
    <br />
    <ExternalLink
      className="text-dark "
      href="https://www.harrassowitz-verlag.de/isbn_978-3-447-04264-2.ahtml"
    >
      <i className="pointer__hover my-2 fas fa-shopping-cart fa-2x" />
    </ExternalLink>
  </div>
)

const LiteratureRedirectBoxAGI = (): JSX.Element => (
  <div className="text-center border border-dark m-3">
    <strong>From</strong>
    <br />
    Sommerfeld, W., <em>Akkadische Glossare und Indizes.&nbsp;</em>
    Version 1.1 (26. Mai 2021). (
    <ExternalLink
      className="text-dark "
      href="https://creativecommons.org/licenses/by-nd/4.0/"
    >
      CC BY-ND 4.0
    </ExternalLink>
    ).
    <br />
    <ExternalLink
      className="text-dark "
      href="https://www.uni-marburg.de/cnms/forschung/dnms/apps/agi"
    >
      <i className="pointer__hover my-2 fas fa-external-link-square-alt" />
    </ExternalLink>
  </div>
)

const HeadingCDA = (): JSX.Element => (
  <Row>
    <Col>
      <h3>&#8544;. Concise Dictionary of Akkadian</h3>
    </Col>
  </Row>
)

const HeadingAGI = (): JSX.Element => (
  <Row>
    <Col>
      <h3>&#8545;. Akkadische Glossare und Indizes</h3>
    </Col>
  </Row>
)

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
      <HeadingCDA />
      <WordDisplayDetails word={word} />
      <LiteratureRedirectBoxCDA />
      {word.akkadischeGlossareUndIndices && <HeadingAGI />}
      {word.akkadischeGlossareUndIndices &&
        word.akkadischeGlossareUndIndices
          .slice()
          .sort((a, b) => (a.AfO > b.AfO ? 1 : -1))
          .map((akkadischeGlossareUndIndex) => (
            <>
              <Col className="offset-md-1">
                {akkadischeGlossareUndIndex.mainWord.length > 0 && (
                  <Row className="small text-black-50">
                    (
                    <MarkdownAndHtmlToHtml
                      markdownAndHtml={akkadischeGlossareUndIndex.mainWord}
                    />
                    )
                  </Row>
                )}
                {akkadischeGlossareUndIndex.note.length > 0 && (
                  <Row>
                    <MarkdownAndHtmlToHtml
                      markdownAndHtml={akkadischeGlossareUndIndex.note}
                    />
                  </Row>
                )}
                {akkadischeGlossareUndIndex.reference.length > 0 && (
                  <Row>
                    <MarkdownAndHtmlToHtml
                      markdownAndHtml={akkadischeGlossareUndIndex.reference}
                    />
                  </Row>
                )}
                <Row className="mb-3">
                  <div
                    className="small text-black-50 ml-3"
                    key={akkadischeGlossareUndIndex.AfO}
                  >
                    [{akkadischeGlossareUndIndex.AfO}]
                  </div>
                </Row>
              </Col>
            </>
          ))}
      {word.akkadischeGlossareUndIndices && <LiteratureRedirectBoxAGI />}
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
