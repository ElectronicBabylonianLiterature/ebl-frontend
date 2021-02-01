import React from 'react'
import Word from 'dictionary/domain/Word'
import withData, { WithoutData } from 'http/withData'
import { Link, RouteComponentProps } from 'react-router-dom'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Col, Row } from 'react-bootstrap'
import { stringify } from 'query-string'

type Props = {
  data: Word
  wordService
} & RouteComponentProps<{ id: string }>

function WordInformationDisplay({ word }: { word: Word }) {
  console.log(word)

  const AttestedStems = () => (
    <>
      Attested stems:{' '}
      {word.amplifiedMeanings
        .map((amplifiedMeaning) => amplifiedMeaning.key)
        .join(', ')}
    </>
  )
  const extractLemmas = (derivatives) =>
    derivatives.map((derivative) =>
      derivative.map((derivativeParts) => derivativeParts.lemma[0])
    )

  const Derivatives = () => {
    const extractedLemmas = extractLemmas(word.derived)
    const extractedLemmasWithLink = extractedLemmas.map((lemmas) => (
      <>
        {lemmas.map((lemma) => (
          <>
            <Link to={`/dictionary/${lemma}`}>{lemma}</Link>
          </>
        ))}
        ,&nbsp;
      </>
    ))
    return <>Derivatives:&nbsp;{extractedLemmasWithLink}</>
  }

  const DetailsSection = () => {
    return (
      <Row>
        <Col>
          <Row>
            <strong>
              {word.attested === false && '*'}
              {word.lemma.join(' ')} {word.homonym}
            </strong>
            , &ldquo;{word.guideWord}&rdquo;
            <span className="text-secondary">({word.pos.join(', ')})</span>
          </Row>
          <Row>
            <Col xs={{ offset: 1 }}>
              <Row>{word.attested && <AttestedStems />}</Row>
              <Row>{word.derived.length && <Derivatives />}</Row>
              <Row>
                {word.logograms.length &&
                  `Logograms: ${word.logograms
                    .map((logogram) => logogram.logogram[0])
                    .join(', ')}`}
              </Row>
              <Row>
                {word.roots.length && `Roots: ${word.roots.join(', ')}`}
              </Row>
              <Row>
                <br />
                {word.meaning && word.meaning}
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
  return (
    <AppContent
      crumbs={[new SectionCrumb('Dictionary'), new TextCrumb(word._id)]}
    >
      <DetailsSection />
    </AppContent>
  )
}

export default withData<WithoutData<Props>, { match; wordService }, Word>(
  ({ data, match }) => <WordInformationDisplay word={data} />,
  (props) => props.wordService.find(props.match.params['id'])
)
