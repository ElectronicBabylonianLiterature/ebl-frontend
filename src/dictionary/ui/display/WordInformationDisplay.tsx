import React from 'react'
import Word from 'dictionary/domain/Word'
import withData, { WithoutData } from 'http/withData'
import { Link, RouteComponentProps } from 'react-router-dom'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Button, Col, Row } from 'react-bootstrap'
import { HashLink } from 'react-router-hash-link'
import './wordInformationDisplay.css'
import ReactMarkdown from 'react-markdown'
import ExternalLink from 'common/ExternalLink'
import WordService from 'dictionary/application/WordService'

const LiteratureRedirectBox = (): JSX.Element => (
  <ExternalLink
    style={{ color: 'black' }}
    href="https://www.harrassowitz-verlag.de/isbn_978-3-447-04264-2.ahtml"
    title="A Concise Dictionary of Akkadian, Harrassowitz Verlag"
  >
    <Row>
      <Col xs={11} className="mx-auto">
        <Row className="m-3 py-2 border border-dark">
          <Col xs="auto">
            <i className="linkContainer mt-2 fas fa-shopping-cart" />
          </Col>
          <Col className="linkContainer my-auto" style={{ fontSize: '0.7em' }}>
            From Black, J.; George, A.R.; Postgate, N., A Concise Dictionary of
            Akkadian. 2nd (corrected) printing. SANTAG Arbeiten und
            Untersuchungen zur Keilschriftkunde, Band 5. Wiesbaden:
            Harrassowitz, 2000
          </Col>
        </Row>
      </Col>
    </Row>
  </ExternalLink>
)

function WordInformation({ word }: { word: Word }): JSX.Element {
  const copyableInformation = `+${word.lemma[0]}[${word.guideWord}]${
    word.pos[0] ? word.pos[0] : ''
  }$`
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
              <div
                className="border border-dark p-1"
                style={{ fontSize: '0.5em', color: 'grey' }}
              >
                {copyableInformation}
                <Button
                  style={{ padding: '3px 5px 0 5px' }}
                  className="ml-2"
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
      <WordInformationDetails word={word} />
    </AppContent>
  )
}

function replaceByCurlyQuotes(str: string): string {
  return str.replace(/"([^"]*)"/g, '“$1”')
}

function OtherForms({
  forms,
}: {
  forms: { attested: boolean; lemma: string[] }[]
}): JSX.Element {
  const otherForm = (form) => {
    const attested = form.attested ? '' : '*'
    return form.lemma
      .map((lemmaElement) => `*${lemmaElement}*${attested}`)
      .join('; ')
  }
  return (
    <>
      Other forms:{' '}
      <ReactMarkdown renderers={{ paragraph: 'span' }}>
        {forms.map((form) => otherForm(form)).join(', ')}
      </ReactMarkdown>
    </>
  )
}
interface Derivative {
  lemma: string[]
  homonym: string
  notes: string[]
}

function Derivatives({
  derivatives,
}: {
  derivatives: Derivative[][]
}): JSX.Element {
  const extractLemmas = (derivatives: Derivative[][]): string[][] =>
    derivatives.map((derivative) =>
      derivative.map((derivativeParts) => {
        const homonym = derivativeParts.homonym
          ? ` ${derivativeParts.homonym}`
          : ''
        const filteredNotes = derivativeParts.notes.filter((note) => note)
        const notes = filteredNotes.length ? `${filteredNotes.join(',')}` : ''

        return `${derivativeParts.lemma[0]}${homonym}${notes}`
      })
    )

  const extractedLemmas = extractLemmas(derivatives)

  const extractedLemmasWithLink = extractedLemmas.map((lemmas, lemmasIndex) => (
    <span key={lemmasIndex}>
      {lemmas.map((lemma, lemmaIndex) => (
        <span key={lemmaIndex}>
          <a href={`/dictionary/${lemma}`}>
            <em>{lemma.split(' ')[0]}</em>
          </a>
          &nbsp;{lemma.split(' ')[1]}
          {lemmaIndex !== lemmas.length - 1 && <>,&nbsp;</>}
        </span>
      ))}
      {lemmasIndex !== extractedLemmas.length - 1 && <>;&nbsp;</>}
    </span>
  ))
  return <>Derivatives:&nbsp;{extractedLemmasWithLink}</>
}
interface AmplifiedMeaning {
  meaning: string
  key: string
  entries: { meaning: string }[]
}
function AmplifiedMeanings({
  amplifiedMeanings,
  wordId,
}: {
  amplifiedMeanings: AmplifiedMeaning[]
  wordId: string
}): JSX.Element {
  return (
    <>
      Attested stems:&nbsp;
      {amplifiedMeanings.map((amplifiedMeaning, index) => (
        <span key={index}>
          <HashLink to={`/dictionary/${wordId}#attested-stem-${index}`}>
            {amplifiedMeaning.key}
          </HashLink>
          {index !== amplifiedMeanings.length - 1 && <>,&nbsp;</>}
        </span>
      ))}
    </>
  )
}

function AmplifiedMeaningsDetails({
  amplifiedMeanings,
}: {
  amplifiedMeanings: AmplifiedMeaning[]
}): JSX.Element {
  const AttestedStemDetail = ({
    amplifiedMeaning,
  }: {
    amplifiedMeaning: AmplifiedMeaning
  }): JSX.Element => (
    <Row>
      <Col>
        <Row>
          <strong>{amplifiedMeaning.key}</strong>&nbsp;&nbsp;&nbsp;{' '}
          <ReactMarkdown>
            {replaceByCurlyQuotes(amplifiedMeaning.meaning)}
          </ReactMarkdown>
        </Row>
        <Row>
          <ol>
            {amplifiedMeaning.entries.map((entry, index) => (
              <li id={`attested-stem-${index}`} key={index}>
                <div className="ml-3">
                  <ReactMarkdown
                    source={replaceByCurlyQuotes(entry.meaning)}
                    renderers={{ paragraph: 'span' }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </Row>
      </Col>
    </Row>
  )
  return (
    <Col>
      {amplifiedMeanings.map((amplifiedMeaning, index) => (
        <AttestedStemDetail key={index} amplifiedMeaning={amplifiedMeaning} />
      ))}
    </Col>
  )
}

function WordInformationDetails({ word }: { word: Word }): JSX.Element {
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
  ({ data }) => <WordInformation word={data} />,
  (props) => props.wordService.find(props.match.params['id'])
)
