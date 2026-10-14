import React, { Component } from 'react'
import { stringify } from 'common/utils/queryString'
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

function toArray(
  value: string | string[] | undefined,
  fallback: string[],
): string[] {
  if (Array.isArray(value)) {
    return value
  }
  return value ? [value] : fallback
}

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

      return {
        ...baseQuery,
        vowelClass: toArray(baseQuery.vowelClass, []),
        origin: toArray(baseQuery.origin, ['CDA']),
      }
    })(),
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { id } = event.target
    let { value } = event.target
    if (['word', 'root'].includes(id)) {
      value = replaceTransliteration(value, true, false, false)
    }

    this.setState({
      query: { ...this.state.query, [id]: value },
    })
  }

  submit = (event: React.FormEvent<HTMLFormElement>): void => {
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

  render(): JSX.Element {
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
          selected={this.state.query.origin}
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

function WordSearchWithRouter(props: Omit<Props, 'navigate'>): JSX.Element {
  const navigate = useNavigate()
  return <WordSearch {...props} navigate={navigate} />
}

export default WordSearchWithRouter
