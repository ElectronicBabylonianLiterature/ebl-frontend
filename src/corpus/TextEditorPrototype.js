import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import _ from 'lodash'
import { Record, List, setIn, set } from 'immutable'
import { Form, Col, Tabs, Tab } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'
import References from 'bibliography/References'

const ManuscriptLine = Record({
  siglum: '',
  side: '',
  line: '',
  atf: ''
})

const ChapterLine = Record({
  number: '',
  ideal: '',
  manuscripts: List()
})

const Manuscript = Record({
  id: '',
  siglum: '',
  idType: 'Museum',
  period: 'NA',
  provenance: 'Nin',
  type: '',
  references: List()
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
      manuscripts: List.of(
        Manuscript({ siglum: 'UruHel1', provenance: 'Uru', period: 'Hel' }),
        Manuscript({ siglum: 'UruHel2', provenance: 'Uru', period: 'Hel' })
      ),
      lines: List.of(
        ChapterLine({
          number: '1\'',
          ideal: 'ammeni (?) | [...]',
          manuscripts: List.of(ManuscriptLine({
            siglum: 'UruHel1',
            side: '@obverse',
            line: '1\'',
            atf: 'am#-me#ni# X [x x x x x x x x]'
          }))
        }),
        ChapterLine({
          number: '2\'',
          ideal: '    anaku-ma | [arhanu (?) || ...]',
          manuscripts: List.of(ManuscriptLine({
            siglum: 'UruHel1',
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
        searchBibliography={query => this.props.fragmentService.searchBibliography(query)}
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
      <Form.Group as={Col} md={3} controlId={_.uniqueId('siglum-')}>
        <Form.Label>Siglum</Form.Label>
        <Form.Control as='select' value={value.siglum} onChange={event => onChange(set(value, 'siglum', event.target.value))}>
          {manuscripts.map(manuscript =>
            <option key={manuscript} value={manuscript.siglum}>{manuscript.siglum}</option>
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

function ManuscriptEdit ({ value, onChange, searchBibliography }) {
  return <>
    <Form.Row>
      <Form.Group as={Col} md={1} controlId={_.uniqueId('id-')}>
        <Form.Label>ID</Form.Label>
        <Form.Control type='text' value={value.id} onChange={event => onChange(set(value, 'id', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('type-')}>
        <Form.Label>ID Type</Form.Label>
        <Form.Control as='select' value={value.type} onChange={event => onChange(set(value, 'type', event.target.value))}>
          <option value='Museum'>Museum</option>
          <option value='Accession'>Accession</option>
        </Form.Control>
      </Form.Group>
      <Form.Group as={Col} md={5} controlId={_.uniqueId('period-')}>
        <Form.Label>Period</Form.Label>
        <Form.Control as='select' value={value.period} onChange={event => onChange(set(value, 'period', event.target.value))}>
          <option value='UrIII'>Ur III (ca. 2100-2000 BC)</option>
          <option value='OA'>Old Assyrian (ca. 1950-1850 BC)</option>
          <option value='OB'>Old Babylonian (ca. 2000-1600 BC)</option>
          <option value='MB'>Middle Babylonian (ca. 1400-1100 BC)</option>
          <option value='MA'>Middle Assyrian (ca. 1400-1000 BC)</option>
          <option value='Hit'>Hittite (ca. 1500-1100 BC)</option>
          <option value='NA'>Neo-Assyrian (ca. 911-612 BC)</option>
          <option value='NB'>Neo-Babylonian (ca. 626-539 BC)</option>
          <option value='Ach'>Achaemenid (547-331 BC)</option>
          <option value='Hel'>Hellenistic (323-63 BC)</option>
          <option value='Par'>Parthian (247-224 BC)</option>
          <option value='Unc'>Uncertain</option>
        </Form.Control>
      </Form.Group>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('provenance-')}>
        <Form.Label>Provenance</Form.Label>
        <Form.Control as='select' value={value.period} onChange={event => onChange(set(value, 'provenance', event.target.value))}>
          <option value='Ašš'>Aššur</option>
          <option value='Bab'>Babylon</option>
          <option value='Baba'>Babylonia</option>
          <option value='Bor'>Borsippa</option>
          <option value='Ḫuz'>Ḫuzirina</option>
          <option value='Kal'>Kalḫu</option>
          <option value='Nin'>Nineveh</option>
          <option value='Nip'>Nippur</option>
          <option value='Sip'>Sippar</option>
          <option value='Šad'>Šaduppûm</option>
          <option value='Ur'>Ur</option>
          <option value='Uru'>Uruk</option>
          <option value='Unc'>Unclear</option>
        </Form.Control>
      </Form.Group>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('type-')}>
        <Form.Label>Type</Form.Label>
        <Form.Control as='select' value={value.type} onChange={event => onChange(set(value, 'type', event.target.value))}>
          <option value=''>Library</option>
          <option value='Sch'>School</option>
          <option value='Var'>Varia</option>
        </Form.Control>
      </Form.Group>
    </Form.Row>
    <References
      references={value.references}
      searchBibliography={searchBibliography}
      updateReferences={references => onChange(set(value, 'references', references))} />
  </>
}

function ChapterEdit ({ chapter, onChange, searchBibliography }) {
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
          {chapter.manuscripts.map((manuscript, index) =>
            <ManuscriptEdit key={index} value={manuscript} searchBibliography={searchBibliography} />
          )}
        </ListForm>
      </Tab>
      <Tab eventKey='lines' title='Lines'>
        <ListForm default={ChapterLine({
          manuscripts: chapter.manuscripts.map(manuscript => ManuscriptLine({
            siglum: manuscript.siglum
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
export function TextEditorPrototype ({ text, chapter, handleChapterChange, searchBibliography }) {
  return <SessionContext.Consumer>
    {session => session.hasBetaAccess()
      ? (
        <AppContent section={`Corpus / ${text.name}`} active={chapter.name} title={`Edit ${text.name} ${chapter.name}`}>
          <Form>
            <ChapterEdit chapter={chapter} onChange={handleChapterChange} searchBibliography={searchBibliography} />
          </Form>
        </AppContent>
      )
      : <Redirect to='/' />
    }
  </SessionContext.Consumer>
}

export default TextEditorController
