import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import _ from 'lodash'
import { Record, List, setIn, set } from 'immutable'
import { Form, Col, Tabs, Tab } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'

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
  name: '',
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
      name: 'I',
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
    }),
    Chapter({ name: 'II' })
  )
})

class TextEditorController extends Component {
  constructor (props) {
    super(props)
    this.state = { text: exampleText }
  }

  render () {
    const chapterName = this.props.match.params.id
    const chapterIndex = this.state.text.chapters.findIndex(chapter => chapter.name === chapterName)
    const chapter = this.state.text.chapters.get(chapterIndex)
    return chapterIndex >= 0
      ? <TextEditorPrototype
        handleChapterChange={chapter => {
          this.setState(setIn(
            this.state,
            ['text', 'chapters', chapterIndex],
            chapter
          ))
        }}
        text={this.state.text}
        chapter={chapter} />
      : <span>Chapter {chapterName} not found.</span>
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
  const handleNameChange = name => {
    onChange(setIn(
      chapter,
      ['name'],
      name
    ))
  }
  return <section>
    <TextEdit value={chapter.name} onChange={handleNameChange} />
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
export function TextEditorPrototype ({ text, chapter, handleChapterChange }) {
  return <SessionContext.Consumer>
    {session => session.hasBetaAccess()
      ? (
        <AppContent section={`Corpus / ${text.name}`} active={chapter.name} title={`Edit ${text.name} ${chapter.name}`}>
          <Form>
            <ChapterEdit chapter={chapter} onChange={handleChapterChange} />
          </Form>
        </AppContent>
      )
      : <Redirect to='/' />
    }
  </SessionContext.Consumer>
}

export default TextEditorController
