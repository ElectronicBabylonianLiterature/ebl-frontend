import React, { Component } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Image from 'fragmentarium/Image'
import AppContent from 'common/AppContent'
import ReactMarkdown from 'react-markdown'

class Corpus extends Component {
    Texts = () => {
      const texts = [
        { 'texts': [['0. Ancient Catalogues']] },
        { 'genre': 'I. Narrative Poetry',
          'texts': [['1. Story  of the Flood (*Atraḫasīs*)', '500 verses'],
            ['2. Poem of Creation (*Enūma eliš*)', '950 vv.'],
            ['3. Other creation  tales', '±300 vv.'],
            ['4. Poem of  Gilgameš', '2,400 vv.'],
            ['5. Erra and Išum', '670 vv.'],
            ['6. Nergal and Ereškigal', '421 vv.'],
            ['7. Adapa', '130 vv.'],
            ['8. Descent of Ištar', '138 vv.'],
            ['9. Etana', '294 vv.'],
            ['10. Anzû', '544 vv.'],
            ['11. The Poor Man of Nippur', '160 vv.'],
            ['12. Cuthean Legend of Narām-Sîn', '180 vv.']] },
        { 'genre': 'II. Monologue and dialogue literature',
          'texts': [['1. Theodicy', '297 vv.'],
            ['2. Poem of the Righteous Sufferer', '600 vv.'],
            ['3. Counsels of Wisdom', '160 vv.'],
            ['4. Dialogue of Pessimism', '86 vv.'],
            ['5. Advice to a Prince', '59 vv.'],
            ['6. Other dialogues', '±200 vv.'],
            ['7. *Aluzinnu* Text', '400 vv.'],
            ['8. Series of the Poplar', '65 vv.'],
            ['9. Series of Ox and Horse', '219 vv.'],
            ['10. Series of the Fox', '300 vv.'],
            ['11. Series of the Spider', '66 vv.'],
            ['12. Palm and Vine', '54 vv.'],
            ['13. Other disputation poems', '±50 vv.']] },
        { 'genre': 'III. Literary Hymns and Prayers',
          'texts': [['1. Prayer to Marduk 1', '206 vv.'],
            ['2. Prayer to Marduk 2', '200 vv.'],
            ['3. Great Prayer to Šamaš', '200 vv.'],
            ['4. Great Prayer to Nabû', '226 vv.'],
            ['5. Hymn to the Queen of Nippur', '244 vv.'],
            ['6. Bulluṭsa-rabi’s Hymn to Gula', '200 vv.'],
            ['7. Great Prayer to Ištar (“Ištar 1”)', '105 vv.'],
            ['8. Hymn to Ištar (“Ištar 2”)', '180 vv.']] }
      ]

      return texts.map((block) => {
        return (
          <>
            <h3> {block.genre} </h3>
            <Container fluid as='ol'>
              {block.texts.map(([text, verses]) => {
                return <Row as='li'> <Col md={8}> <ReactMarkdown source={text} /> </Col> <Col md={4}> {verses} </Col> </Row>
              })}
            </Container>
        </>
        )
      })
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
