import React, { Component } from 'react'
import { stringify } from 'query-string'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import { WordQuery } from 'dictionary/application/WordService'
import {
  HelpEntry,
  basicDiacriticsHelp,
  wildCardsHelp,
  exactSearchHelp,
} from 'dictionary/ui/search/WordSearchHelp'
import VowelClassSelector from 'dictionary/ui/search/VowelClassSelector'
import DictionarySourceFormGroup from 'dictionary/ui/search/DictionarySourceFormGroup'

type Props = {
  query: WordQuery
  navigate: (url: string) => void
}
type State = {
  query: WordQuery
}

class WordSearch extends Component<Props, State> {
  state = {
    query: (() => {
      const baseQuery = {
        word: '',
        meaning: '',
        root: '',
        ...this.props.query,
      }

      const initialVowelClass = Array.isArray(baseQuery.vowelClass)
        ? (baseQuery.vowelClass as string[])
        : baseQuery.vowelClass
          ? [baseQuery.vowelClass as string]
          : []

      const initialOrigin = Array.isArray(baseQuery.origin)
        ? (baseQuery.origin as string[])
        : baseQuery.origin
          ? [baseQuery.origin as string]
          : ['CDA']

      return {
        ...baseQuery,
        vowelClass: initialVowelClass,
        origin: initialOrigin,
      }
    })(),
  }

  onChange = (event) => {
    const { id } = event.target
    let { value } = event.target
    if (['word', 'root'].includes(id)) {
      value = replaceTransliteration(value, true, false, false)
    }

    this.setState({
      query: { ...this.state.query, [id]: value },
    })
  }

  submit = (event) => {
    event.preventDefault()
    this.props.navigate(
      `?${stringify(this.state.query, {
        skipEmptyString: true,
        arrayFormat: 'none',
      })}`,
    )
  }

  isQueryDisabled(): boolean {
    const { word, meaning, root, vowelClass } = this.state.query
    return (
      !word?.trim() &&
      !meaning?.trim() &&
      !root?.trim() &&
      (!vowelClass || vowelClass.length === 0)
    )
  }

  makeHelpHints(field: string): JSX.Element {
    return (
      <ul>
        <li>{exactSearchHelp}</li>
        {['word', 'root'].includes(field) && (
          <>
            <li>{basicDiacriticsHelp}</li>
            <li>{wildCardsHelp}</li>
          </>
        )}
      </ul>
    )
  }

  makeFormRow(
    field: string,
    label: string,
    helpText: JSX.Element | string,
  ): JSX.Element {
    const help = HelpEntry(
      <>
        {helpText}
        {this.makeHelpHints(field)}
      </>,
    )
    return (
      <>
        <Form.Label column sm={3}>
          {label}
        </Form.Label>
        <Col sm={1}>{help}</Col>
        <Col sm={6}>
          <FormControl
            type="text"
            value={this.state.query[field]}
            placeholder={field}
            onChange={this.onChange}
          />
        </Col>
      </>
    )
  }

  render() {
    return (
      <Form onSubmit={this.submit}>
        <Form.Group as={Row} controlId="word">
          {this.makeFormRow(
            'word',
            'Word',
            'The lemma and other forms for the word.',
          )}
          <Col sm={2}>
            <Button
              type="submit"
              variant="primary"
              disabled={this.isQueryDisabled()}
            >
              Query
            </Button>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="meaning">
          {this.makeFormRow(
            'meaning',
            'Meaning',
            'The meaning(s) and explanation(s).',
          )}
        </Form.Group>
        <Form.Group as={Row} controlId="root">
          {this.makeFormRow(
            'root',
            'Root',
            <>
              The verbal root (e.g. <code>prs</code>, <code>&apos;bt</code>,{' '}
              <code>šṭr</code>, <code>mrr</code>
            </>,
          )}
        </Form.Group>
        <Form.Group as={Row} controlId="vowelClass">
          <Form.Label column sm={3}>
            Vowel class
          </Form.Label>
          <Col sm={1}>{HelpEntry('The verbal vowel class.')}</Col>
          <Col sm={6}>
            <VowelClassSelector
              selected={this.state.query.vowelClass}
              onChange={(vowelClass) => {
                this.setState({
                  query: {
                    ...this.state.query,
                    vowelClass,
                  },
                })
              }}
            />
          </Col>
        </Form.Group>
        <hr />
        <DictionarySourceFormGroup
          origin={this.state.query.origin}
          onChange={(origin) => {
            this.setState({
              query: {
                ...this.state.query,
                origin,
              },
            })
          }}
        />
      </Form>
    )
  }
}

function WordSearchWithRouter(props: Omit<Props, 'navigate'>) {
  const navigate = useNavigate()
  return <WordSearch {...props} navigate={navigate} />
}

export default WordSearchWithRouter
