import React, { Component, Fragment } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Image from 'fragmentarium/Image'
import AppContent from 'common/AppContent'
import ReactMarkdown from 'react-markdown'
import corpusTexts from './CorpusTexts.json'
import SessionContext from 'auth/SessionContext'

function Text ({ text, category, index }) {
  const title = <ReactMarkdown source={text.text} disallowedTypes={['paragraph']} unwrapDisallowed />
  return (
    <Row as='li'>
      <Col md={8}>
        <SessionContext.Consumer>
          {session => session.isAllowedToWriteTexts()
            ? <Link to={`/corpus/${category}/${category === 0 ? index : index + 1}`}>
              {title}
            </Link>
            : title
          }
        </SessionContext.Consumer>
      </Col>
      <Col md={4}> {text.verses} </Col>
    </Row>
  )
}

class Corpus extends Component {
  texts = () => {
    return (
      corpusTexts.map((block, category) =>
        <Fragment key={category}>
          {block.hasOwnProperty('genre') &&
            <h3> {block.genre} </h3>}
          <Container fluid as='ol'>
            {block.texts.map((text, index) =>
              <Text key={index} text={text} category={category} index={index} />
            )}
          </Container>
        </Fragment>
      )
    )
  }

  render () {
    return (
      <AppContent crumbs={['Corpus']}>
        <Container fluid>
          <Row>
            <Col md={5}>
              <this.texts />
            </Col>
            <Col md={7}>
              <Image fragmentService={this.props.fragmentService} fileName='LibraryCropped.svg' />
            </Col>
          </Row>
        </Container>
      </AppContent>
    )
  }
}

export default Corpus
