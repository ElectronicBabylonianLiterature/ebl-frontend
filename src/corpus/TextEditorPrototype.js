import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import _ from 'lodash'
import { Record, List, setIn, set } from 'immutable'
import { Form, Col, Tabs, Tab } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'

const romanMatrix = List.of(
  List.of(1000, 'M'),
  List.of(900, 'CM'),
  List.of(500, 'D'),
  List.of(400, 'CD'),
  List.of(100, 'C'),
  List.of(90, 'XC'),
  List.of(50, 'L'),
  List.of(40, 'XL'),
  List.of(10, 'X'),
  List.of(9, 'IX'),
  List.of(5, 'V'),
  List.of(4, 'IV'),
  List.of(1, 'I')
)

function convertToRoman (number) {
  // Derived from https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript#37723879
  return romanMatrix
    .toSeq()
    .filter(roman => number >= roman.first())
    .map(roman => roman.last() + convertToRoman(number - roman.first()))
    .first('')
}

const ManuscriptLine = Record({
  name: '',
  side: '',
  line: '',
  atf: ''
})

const ChapterLine = Record({
  number: '',
  ideal: '',
  manuscripts: List()
})

const Chapter = Record({
  manuscripts: List(),
  lines: List()
})

const Text = Record({
  name: '',
  chapters: List()
})

const exampleText = Text({
  name: 'Palm & Vine',
  chapters: List.of(
    Chapter({
      manuscripts: List.of('UrkHel1', 'UrkHel2'),
      lines: List.of(
        ChapterLine({
          number: '1\'',
          ideal: 'ammeni (?) | [...]',
          manuscripts: List.of(ManuscriptLine({
            name: 'UrkHel1',
            side: '@obverse',
            line: '1\'',
            atf: 'am#-me#ni# X [x x x x x x x x]'
          }))
        }),
        ChapterLine({
          number: '2\'',
          ideal: '    anaku-ma | [arhanu (?) || ...]',
          manuscripts: List.of(ManuscriptLine({
            name: 'UrkHel1',
            side: '@obverse',
            line: '2\'',
            atf: 'a#-na-ku-ma [ar-ha-nu X x x x x x]'
          }))
        })
      )
    })
  )
})

class TextEditorController extends Component {
  constructor (props) {
    super(props)
    this.state = { text: exampleText }
  }

  render () {
    return <TextEditorPrototype
      handleChaptersChange={chapters => {
        this.setState(setIn(
          this.state,
          ['text', 'chapters'],
          chapters
        ))
      }}
      text={this.state.text} />
  }
}

function TextEdit ({ value, onChange, placeholder }) {
  return (
    <Form.Group controlId={_.uniqueId('text-')}>
      <Form.Control type='text' placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} />
    </Form.Group>
  )
}

function LineEdit ({ value, onChange, manuscripts }) {
  return (<>
    <Form.Row>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('number-')}>
        <Form.Label>Number</Form.Label>
        <Form.Control type='text' value={value.number} onChange={event => onChange(set(value, 'number', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={10} controlId={_.uniqueId('ideal-')}>
        <Form.Label>Ideal reconstruction</Form.Label>
        <Form.Control type='text' value={value.ideal} onChange={event => onChange(set(value, 'ideal', event.target.value))} />
      </Form.Group>
    </Form.Row>
    <ListForm label='Manuscripts' default={ManuscriptLine()} value={value.manuscripts} onChange={event => onChange(set(value, 'manuscripts', event))}>
      {value.manuscripts.map((manuscriptRow, index2) =>
        <ManuscriptLineEdit
          key={index2}
          value={manuscriptRow}
          manuscripts={manuscripts}
        />
      )}
    </ListForm>
  </>)
}

function ManuscriptLineEdit ({ value, onChange, manuscripts }) {
  return (
    <Form.Row>
      <Form.Group as={Col} md={3} controlId={_.uniqueId('name-')}>
        <Form.Label>Name</Form.Label>
        <Form.Control as='select' value={value.name} onChange={event => onChange(set(value, 'name', event.target.value))}>
          {manuscripts.map(manuscript =>
            <option key={manuscript} value={manuscript}>{manuscript}</option>
          )}
        </Form.Control>
      </Form.Group>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('side-')}>
        <Form.Label>Side</Form.Label>
        <Form.Control as='select' value={value.side} onChange={event => onChange(set(value, 'side', event.target.value))}>
          <option value=''>--</option>
          <option value='@obverse'>Obverse</option>
          <option value='@reverse'>Reverse</option>
        </Form.Control>
      </Form.Group>
      <Form.Group as={Col} md={1} controlId={_.uniqueId('line-')}>
        <Form.Label>Row</Form.Label>
        <Form.Control type='text' value={value.line} onChange={event => onChange(set(value, 'line', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={6} controlId={_.uniqueId('atf-')}>
        <Form.Label>ATF</Form.Label>
        <Form.Control type='text' value={value.atf} onChange={event => onChange(set(value, 'atf', event.target.value))} />
      </Form.Group>
    </Form.Row>
  )
}

function ChapterEdit ({ chapter, index, onChange }) {
  const handleManuscriptChange = manuscripts => {
    onChange(setIn(
      chapter,
      ['manuscripts'],
      manuscripts
    ))
  }
  const handleRowsChange = lines => {
    onChange(setIn(
      chapter,
      ['lines'],
      lines
    ))
  }
  return <section>
    <header><h3>Chapter {convertToRoman(index + 1)}</h3></header>
    <Tabs defaultActiveKey='manuscripts' id={_.uniqueId('tabs-')}>
      <Tab eventKey='manuscripts' title='Manuscripts'>
        <ListForm default='' value={chapter.manuscripts} onChange={handleManuscriptChange}>
          {chapter.manuscripts.map((key, index) =>
            <TextEdit key={index} index={index} value={key} placeholder='Manuscript identifier' />
          )}
        </ListForm>
      </Tab>
      <Tab eventKey='lines' title='Lines'>
        <ListForm default={ChapterLine({
          manuscripts: chapter.manuscripts.map(manuscript => ManuscriptLine({
            name: manuscript
          }))
        })} value={chapter.lines} onChange={handleRowsChange}>
          {chapter.lines.map((line, index) =>
            <LineEdit key={index} value={line} index={index}
              manuscripts={chapter.manuscripts}
            />)
          }
        </ListForm>
      </Tab>
    </Tabs>
  </section>
}
export function TextEditorPrototype ({ text, handleChaptersChange }) {
  return <SessionContext.Consumer>
    {session => session.hasBetaAccess()
      ? (
        <AppContent section='Corpus' active={text.name} title={`Edit ${text.name}`}>
          <Form>
            <ListForm label='Chapters' default={Chapter()} value={text.chapters} onChange={handleChaptersChange}>
              {text.chapters.map((chapter, index) => <ChapterEdit chapter={chapter} key={index} index={index} />)}
            </ListForm>
          </Form>
        </AppContent>
      )
      : <Redirect to='/' />
    }
  </SessionContext.Consumer>
}

export default TextEditorController
