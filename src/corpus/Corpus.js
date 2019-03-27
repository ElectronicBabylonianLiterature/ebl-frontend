import React, { Component, Fragment } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Image from 'fragmentarium/Image'
import AppContent from 'common/AppContent'
import ReactMarkdown from 'react-markdown'
import corpusTexts from './CorpusTexts.json'

function Text (props) {
  return (
    <Row as='li'>
      <Col md={8}> <ReactMarkdown source={props.text.text} disallowedTypes={['paragraph']} unwrapDisallowed /> </Col>
      <Col md={4}> {props.text.verses} </Col>
    </Row>
  )
}

class Corpus extends Component {
  texts = () => {
    return (
      corpusTexts.map((block, index) =>
        <Fragment key={index}>
          {block.hasOwnProperty('genre') &&
            <h3> {block.genre} </h3>}
          <Container fluid as='ol'>
            {block.texts.map((text, index) =>
              <Text key={index} text={text} />
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
