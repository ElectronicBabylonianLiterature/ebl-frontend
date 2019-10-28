import React, { useContext } from 'react'
import _ from 'lodash'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ApiImage from 'common/ApiImage'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import InlineMarkdown from 'common/InlineMarkdown'
import { Text } from './text'

function TextLine({ text }) {
  const title = (
    <>
      {text.index}. <InlineMarkdown source={text.name} />
    </>
  )
  const session = useContext(SessionContext)
  return (
    <Row as="li">
      <Col md={8}>
        {session.isAllowedToWriteTexts() ? (
          <Link to={`/corpus/${text.category}/${text.index}`}>{title}</Link>
        ) : (
          title
        )}
      </Col>
      <Col md={4}>
        {text.numberOfVerses > 0 && (
          <>
            {text.approximateVerses ? '±' : ''}
            {text.numberOfVerses} vv.
          </>
        )}
      </Col>
    </Row>
  )
}

function Texts({ texts }) {
  return (
    <>
      {[
        '',
        'I. Narrative Poetry',
        'II. Monologue and dialogue literature',
        'III. Literary Hymns and Prayers'
      ].map((title, category) => (
        <section key={category}>
          <h3>{title}</h3>
          <Container fluid as="ol">
            {_(texts)
              .filter(text => text.category === category)
              .sortBy(text => text.index)
              .map((text, index) => <TextLine key={index} text={text} />)
              .value()}
          </Container>
        </section>
      ))}
    </>
  )
}

const TextsWithData = withData<{}, { textService }, readonly Text[]>(
  ({ data }) => <Texts texts={data} />,
  ({ textService }) => textService.list()
)

function Corpus({ fragmentService, textService }) {
  return (
    <AppContent crumbs={['Corpus']}>
      <Container fluid>
        <Row>
          <Col md={5}>
            <TextsWithData textService={textService} />
          </Col>
          <Col md={7}>
            <ApiImage fileName="LibraryCropped.svg" />
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}

export default Corpus
