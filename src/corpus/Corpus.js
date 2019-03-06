import React, { Component } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Image from 'fragmentarium/Image'
import Breadcrumbs from 'common/Breadcrumbs'

import './Corpus.css'

class Corpus extends Component {
    MainHeader = () => {
      return (
        <header>
          <Breadcrumbs section='Corpus' />
          <h2 className='Corpus__header'>Corpus</h2>
        </header>
      )
    }

    Texts = () => {
      return (
        <>
          <h3 className='Corpus__genre'>I. Narrative poetry</h3>
          <Container fluid as='ol'>
            <Row as='li'> <Col md={6}> 1. Story of the flood (Atraḫasīs) </Col> <Col md={6}> 500 verses </Col> </Row>
            <Row as='li'> <Col md={6}> 2. Poem of Creation (Enūma eliš) </Col> <Col md={6}> 950 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 3. Other creation tales </Col> <Col md={6}> ±300 vv.</Col> </Row>
            <Row as='li'> <Col md={6}> 4. Poem of Gilgameš </Col> <Col md={6}> 2,400 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 5. Erra and Išum </Col> <Col md={6}> 670 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 6. Nergal and Ereškigal </Col> <Col md={6}> 421 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 7. Adapa </Col> <Col md={6}> 130 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 8. Descent of Ištar </Col> <Col md={6}> 138 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 9. Etana </Col> <Col md={6}> 294 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 10. Anzû </Col> <Col md={6}> 544 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 11. The Poor Man of Nippur </Col> <Col md={6}> 160 vv. </Col> </Row>
            <Row as='li'> <Col md={6}> 12. Guthean Legend of Narām-Sîn </Col> <Col md={6}> 180 vv. </Col> </Row>
          </Container>
          <h3 className='Corpus__genre'>II. Monologue and dialogue literature</h3>
          <h3 className='Corpus__genre'>III. Literary Hymns and Prayers</h3>
        </>
      )
    }

    render () {
      return (
        <section className='App-content'>
          <this.MainHeader />
          <Container fluid>
            <Row>
              <Col md={6}>
                <this.Texts />
              </Col>
              <Col md={6}>
                <Image fragmentService={this.props.fragmentService} fileName='LibraryCropped.svg' />
              </Col>
            </Row>
          </Container>
        </section>
      )
    }
}

export default Corpus
