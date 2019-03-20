import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import _ from 'lodash'
import { Record, List, setIn, set } from 'immutable'
import { Form, Col } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'

const TranslationRow = Record({
  language: '',
  translation: ''
})

const ManuscriptRow = Record({
  name: '',
  side: '',
  row: '',
  atf: ''
})

const TextRow = Record({
  number: '',
  ideal: '',
  manuscripts: List(),
  translations: List()
})

const Text = Record({
  name: '',
  manuscripts: List(),
  languages: List(),
  rows: List()
})

const exampleText = Text({
  name: 'Palm & Vine',
  manuscripts: List.of('UrkHel1', 'UrkHel2'),
  languages: List.of('en', 'de'),
  rows: List.of(
    TextRow({
      number: '1\'',
      ideal: 'ammeni (?) | [...]',
      manuscripts: List.of(ManuscriptRow({
        name: 'UrkHel1',
        side: '0',
        row: '1\'',
        atf: 'am#-me#ni# X [x x x x x x x x]'
      })),
      translations: List.of(TranslationRow({
        language: 'en',
        translation: '*Why do you* [...]?'
      }))
    }),
    TextRow({
      number: '2\'',
      ideal: '    anaku-ma | [arhanu (?) || ...]',
      manuscripts: List.of(ManuscriptRow({
        name: 'UrkHel1',
        side: '0',
        row: '2\'',
        atf: 'a#-na-ku-ma [ar-ha-nu X x x x x x]'
      })),
      translations: List.of(TranslationRow({
        language: 'en',
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

function RowEdit ({ value, onChange, manuscripts, languages }) {
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
    <Form.Row>
      <Col>
        <ListForm label='Manuscripts' default={ManuscriptRow()} value={value.manuscripts} onChange={event => onChange(set(value, 'manuscripts', event))}>
          {value.manuscripts.map((manuscriptRow, index2) =>
            <ManuscriptRowEdit
              key={index2}
              value={manuscriptRow}
              manuscripts={manuscripts}
            />
          )}
        </ListForm>
      </Col><Col>
        <ListForm label='Translations' default={TranslationRow()} value={value.translations} onChange={event => onChange(set(value, 'translations', event))}>
          {value.translations.map((translationRow, index2) =>
            <TranslationRowEdit
              key={index2}
              value={translationRow}
              languages={languages}
            />
          )}
        </ListForm>
      </Col>
    </Form.Row>
  </>)
}

function ManuscriptRowEdit ({ value, onChange, manuscripts }) {
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
      <Form.Group as={Col} md={1} controlId={_.uniqueId('side-')}>
        <Form.Label>Side</Form.Label>
        <Form.Control type='text' value={value.side} onChange={event => onChange(set(value, 'side', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={1} controlId={_.uniqueId('row-')}>
        <Form.Label>Row</Form.Label>
        <Form.Control type='text' value={value.row} onChange={event => onChange(set(value, 'row', event.target.value))} />
      </Form.Group>
      <Form.Group as={Col} md={7} controlId={_.uniqueId('atf-')}>
        <Form.Label>ATF</Form.Label>
        <Form.Control type='text' value={value.atf} onChange={event => onChange(set(value, 'atf', event.target.value))} />
      </Form.Group>
    </Form.Row>
  )
}

function TranslationRowEdit ({ value, onChange, languages }) {
  return (
    <Form.Row>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('language-')}>
        <Form.Label>Language</Form.Label>
        <Form.Control as='select' value={value.language} onChange={event => onChange(set(value, 'language', event.target.value))}>
          {languages.map(lang =>
            <option key={lang} value={lang}>{lang}</option>
          )}
        </Form.Control>
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
                <ListForm label='Manuscripts' default='' value={text.manuscripts} onChange={handleManuscriptChange}>
                  {text.manuscripts.map((key, index) =>
                    <TextEdit key={index} index={index} value={key} placeholder='Manuscript identifier' />
                  )}
                </ListForm>
              </Col><Col>
                <ListForm label='Translations' default='' value={text.languages} onChange={handleLanguageChange}>
                  {text.languages.map((key, index) =>
                    <TextEdit key={index} index={index} value={key} placeholder='Language' />
                  )}
                </ListForm>
              </Col>
            </Form.Row>
            <ListForm label='Rows' default={TextRow({
              manuscripts: text.manuscripts.map(manuscript => ManuscriptRow({
                name: manuscript
              })),
              translations: text.languages.map(lang => TranslationRow({
                language: lang
              }))
            })} value={text.rows} onChange={handleRowsChange}>
              {text.rows.map((row, index) =>
                <RowEdit key={index} value={row} index={index}
                  manuscripts={text.manuscripts}
                  languages={text.languages} />)
              }
            </ListForm>
          </Form>
        </AppContent>
      )
      : <Redirect to='/' />
    }
  </SessionContext.Consumer>
}

export default TextEditorController
