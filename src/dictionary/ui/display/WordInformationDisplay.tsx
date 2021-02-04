import React from 'react'
import Word from 'dictionary/domain/Word'
import withData, { WithoutData } from 'http/withData'
import { Link, RouteComponentProps } from 'react-router-dom'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Col, Navbar, Row } from 'react-bootstrap'
import { HashLink } from 'react-router-hash-link'
import { LinkContainer } from 'react-router-bootstrap'

type Props = {
  data: Word
  wordService
} & RouteComponentProps<{ id: string }>

function WordInformationDisplay({ word }: { word: Word }) {
  console.log(word)

  const replaceByCurlyQuotes = (str: string): string =>
    str.replace(/"([^"]*)"/g, '“$1”')
  const AttestedStems = () => (
    <>
      Attested stems:&nbsp;
      {word.amplifiedMeanings.map((amplifiedMeaning, index) => (
        <>
          <HashLink to={`/dictionary/${word._id}#attested-stem-${index}`}>
            {amplifiedMeaning.key}
          </HashLink>
          {index !== word.amplifiedMeanings.length - 1 && <>,&nbsp;</>}
        </>
      ))}
    </>
  )
  const AttestedStemsDetails = () => {
    const AttestedStemDetail = ({ amplifiedMeaning }) => (
      <Row>
        <Col xs={12}>
          <strong>{amplifiedMeaning.key}</strong>&nbsp;&nbsp;&nbsp;
          {replaceByCurlyQuotes(amplifiedMeaning.meaning)}
          <ol>
            {amplifiedMeaning.entries.map((entry, index) => (
              <li id={`attested-stem-${index}`} key={index}>
                <div className="ml-3">
                  {replaceByCurlyQuotes(entry.meaning)}
                </div>
              </li>
            ))}
          </ol>
        </Col>
      </Row>
    )
    return (
      <Col>
        {word.amplifiedMeanings.map((amplifiedMeaning, index) => (
          <AttestedStemDetail key={index} amplifiedMeaning={amplifiedMeaning} />
        ))}
      </Col>
    )
  }

  const extractLemmas = (derivatives) =>
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

  const Derivatives = () => {
    const extractedLemmas = extractLemmas(word.derived)
    console.log(extractedLemmas)
    const extractedLemmasWithLink = extractedLemmas.map(
      (lemmas, lemmasIndex) => (
        <>
          {lemmas.map((lemma, lemmaIndex) => (
            <>
              <Link to={`/dictionary/${lemma}`}>{lemma.split(' ')[0]}</Link>
              &nbsp;{lemma.split(' ')[1]}
              {lemmaIndex !== lemmas.length - 1 && <>,&nbsp;</>}
            </>
          ))}
          {lemmasIndex !== extractedLemmas.length - 1 && <>;&nbsp;</>}
        </>
      )
    )
    return <>Derivatives:&nbsp;{extractedLemmasWithLink}</>
  }

  const DetailsSection = () => {
    return (
      <Row>
        <Row>
          <Col xs={{ offset: 1 }}>
            <Row>
              <Col>{word.attested && <AttestedStems />}</Col>
            </Row>
            <Row>
              <Col>{word.derived.length && <Derivatives />}</Col>
            </Row>
            <Row>
              <Col>
                {word.logograms.length &&
                  `Logograms: ${word.logograms
                    .map((logogram) => logogram.logogram[0])
                    .join(', ')}`}
              </Col>
            </Row>
            <Row>
              <Col>
                {word.roots.length && `Roots: ${word.roots.join(', ')}`}
              </Col>
            </Row>
            <Row>
              <Col>
                <br />
                {word.meaning && replaceByCurlyQuotes(word.meaning)}
                <br />
                <br />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col>
            <AttestedStemsDetails />
          </Col>
        </Row>
      </Row>
    )
  }
  const LiteratureRedirectBox = () => (
    <LinkContainer to="/" title="electronic Babylonian Literature (eBL)">
      <Row>
        <Col xs="auto" className="ml-3 border border-dark text-center">
          From askldölkasjdlkasjdlkasjdlkasjdlkasjdlkasdjlaksjdlkasdjlkasjdlkj
        </Col>
        <Col>
          <i className="mt-2 fas fa-shopping-cart" />
        </Col>
      </Row>
    </LinkContainer>
  )

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
                {word.attested === false && '*'}
                {word.lemma.join(' ')} {word.homonym}
              </strong>
              , &ldquo;{word.guideWord}&rdquo;
            </Col>
            <Col>
              <span className="text-secondary">({word.pos.join(', ')})</span>
            </Col>
          </Row>
        </>
      }
    >
      <DetailsSection />
    </AppContent>
  )
}

export default withData<WithoutData<Props>, { match; wordService }, Word>(
  ({ data, match }) => <WordInformationDisplay word={data} />,
  (props) => props.wordService.find(props.match.params['id'])
)
