import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import _ from 'lodash'
import { Record, List, setIn, set } from 'immutable'
import { Form, Col } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'

const TranslationRow = Record({
  language: 'en',
  translation: '...'
})

const ManuscriptRow = Record({
  name: 'UrkHel1',
  side: '0',
  row: '5\'',
  atf: '...'
})

const TextRow = Record({
  number: '1',
  standard: '...',
  manuscripts: List.of(ManuscriptRow()),
  translations: List.of(TranslationRow())
})

const Text = Record({
  name: 'Palm & Vine',
  manuscripts: List.of('UrkHel1', 'UrkHel2'),
  languages: List.of('en', 'de'),
  rows: List.of(TextRow(), TextRow())
})

const exampleText = Text({
  rows: List.of(
    TextRow({
      number: '1\'',
      standard: 'ammeni (?) | [...]',
      manuscripts: List.of(ManuscriptRow({
        row: '1\'',
        atf: 'am#-me#ni# X [x x x x x x x x]'
      })),
      translations: List.of(TranslationRow({
        translation: '*Why do you* [...]?'
      }))
    }),
    TextRow({
      number: '2\'',
      standard: '    anaku-ma | [arhanu (?) || ...]',
      manuscripts: List.of(ManuscriptRow({
        row: '2\'',
        atf: 'a#-na-ku-ma [ar-ha-nu X x x x x x]'
      })),
      translations: List.of(TranslationRow({
        translation: '    "I am [Palm, the ...],'
      }))
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
      handleManuscriptChange={manuscripts =>
        this.setState(setIn(
          this.state,
          ['text', 'manuscripts'],
          manuscripts
        ))
      }
      handleLanguageChange={languages =>
        this.setState(setIn(
          this.state,
          ['text', 'languages'],
          languages
        ))
      }
      handleRowsChange={rows =>
        this.setState(setIn(
          this.state,
          ['text', 'rows'],
          rows
        ))
      }
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

function RowEdit ({ value, onChange }) {
  return (<>
    <Form.Row>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('number-')}>
        <Form.Label>Number</Form.Label>
        <Form.Control type='text' value={value.number} onChange={event => onChange(set(value, 'number', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={10} controlId={_.uniqueId('standard-')}>
        <Form.Label>Standard</Form.Label>
        <Form.Control type='text' value={value.standard} onChange={event => onChange(set(value, 'standard', event.target.value))} />
      </Form.Group>
    </Form.Row>
    <Form.Row>
      <Col>
        <ListForm default={ManuscriptRow()} value={value.manuscripts} onChange={event => onChange(set(value, 'manuscripts', event))}>
          {value.manuscripts.map((manuscriptRow, index2) =>
            <ManuscriptRowEdit
              key={index2}
              value={manuscriptRow}
            />
          )}
        </ListForm>
      </Col><Col>
        <ListForm default={ManuscriptRow()} value={value.translations} onChange={event => onChange(set(value, 'translations', event))}>
          {value.translations.map((translationRow, index2) =>
            <TranslationRowEdit
              key={index2}
              value={translationRow}
            />
          )}
        </ListForm>
      </Col>
    </Form.Row>
  </>)
}

function ManuscriptRowEdit ({ value, onChange }) {
  return (
    <Form.Row>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('name-')}>
        <Form.Label>Name</Form.Label>
        <Form.Control type='text' value={value.name} onChange={event => onChange(set(value, 'name', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={1} controlId={_.uniqueId('side-')}>
        <Form.Label>Side</Form.Label>
        <Form.Control type='text' value={value.side} onChange={event => onChange(set(value, 'side', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={1} controlId={_.uniqueId('row-')}>
        <Form.Label>Row</Form.Label>
        <Form.Control type='text' value={value.row} onChange={event => onChange(set(value, 'row', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={8} controlId={_.uniqueId('atf-')}>
        <Form.Label>ATF</Form.Label>
        <Form.Control type='text' value={value.atf} onChange={event => onChange(set(value, 'atf', event.target.value))} />
      </Form.Group>
    </Form.Row>
  )
}

function TranslationRowEdit ({ value, onChange }) {
  return (
    <Form.Row>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('language-')}>
        <Form.Label>Language</Form.Label>
        <Form.Control type='text' value={value.language} onChange={event => onChange(set(value, 'language', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={10} ontrolId={_.uniqueId('translation-')}>
        <Form.Label>Translation</Form.Label>
        <Form.Control type='text' value={value.translation} onChange={event => onChange(set(value, 'translation', event.target.value))} />
      </Form.Group>
    </Form.Row>
  )
}

export function TextEditorPrototype ({ text, handleManuscriptChange, handleLanguageChange, handleRowsChange }) {
  console.log(text)
  return <SessionContext.Consumer>
    {session => session.hasBetaAccess()
      ? (
        <AppContent section='Corpus' active={text.name} title={`Edit ${text.name}`}>
          <Form>
            <Form.Row>
              <Col>
                <h3>Manuscripts</h3>
                <ListForm default='' value={text.manuscripts} onChange={handleManuscriptChange}>
                  {text.manuscripts.map((key, index) =>
                    <TextEdit key={index} index={index} value={key} placeholder='Manuscript identifier' />
                  )}
                </ListForm>
              </Col><Col>
                <h3>Translations</h3>
                <ListForm default='' value={text.languages} onChange={handleLanguageChange}>
                  {text.languages.map((key, index) =>
                    <TextEdit key={index} index={index} value={key} placeholder='Language' />
                  )}
                </ListForm>
              </Col>
            </Form.Row>
            <h3>Rows</h3>
            <ListForm default={TextRow()} value={text.rows} onChange={handleRowsChange}>
              {text.rows.map((row, index) => <RowEdit key={index} value={row} index={index} />)}
            </ListForm>
          </Form>
        </AppContent>
      )
      : <Redirect to='/' />
    }
  </SessionContext.Consumer>
}

export default TextEditorController
