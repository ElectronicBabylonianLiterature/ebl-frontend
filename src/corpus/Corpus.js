import React, { Component, Fragment } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Image from 'fragmentarium/Image'
import AppContent from 'common/AppContent'
import ReactMarkdown from 'react-markdown'
import CorpusTexts from './CorpusTexts.json'

class Corpus extends Component {
  CreateRow (text, index) {
    return <Row as='li' key={index}> <Col md={8}> <ReactMarkdown source={text.text} /> </Col> <Col md={4}> {text.verses} </Col> </Row>
  }

  Texts = () => {
    return (
      CorpusTexts.map((block, index) =>
        <Fragment key={index}>
          {block.hasOwnProperty('genre')
            ? <h3> {block.genre} </h3>
            : ''}
          <Container fluid as='ol'>
            {block.texts.map((text, index) =>
              this.CreateRow(text, index)
            )}
          </Container>
        </Fragment>
      )
    )
  }

  render () {
    return (
      <AppContent section='Corpus'>
        <Container fluid>
          <Row>
            <Col md={5}>
              <this.Texts />
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
