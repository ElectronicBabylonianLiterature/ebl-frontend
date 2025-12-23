import React, { Component } from 'react'
import { stringify } from 'query-string'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import { WordQuery } from 'dictionary/application/WordService'
import {
  HelpEntry,
  basicDiacriticsHelp,
  wildCardsHelp,
  exactSearchHelp,
} from 'dictionary/ui/search/WordSearchHelp'

type VowelClassSelectorProps = {
  selected: string[]
  onChange: (vowelClass: string[]) => void
}

function VowelClassSelector({
  selected,
  onChange,
}: VowelClassSelectorProps): JSX.Element {
  const vowels = ['a/a', 'a/i', 'a/u', 'e/e', 'e/u', 'i/i', 'u/u']
  const firstRow = vowels.slice(0, 4)
  const secondRow = vowels.slice(4)

  const handleChange = (vowel: string, checked: boolean) => {
    let vowelClass: string[] = Array.isArray(selected)
      ? [...(selected as string[])]
      : []
    if (checked) {
      vowelClass.push(vowel)
    } else {
      vowelClass = vowelClass.filter((v) => v !== vowel)
    }
    onChange(vowelClass)
  }

  const renderCheckbox = (vowel: string) => (
    <Form.Check
      key={vowel}
      inline
      type="checkbox"
      id={`vowel-${vowel}`}
      label={vowel}
      checked={
        Array.isArray(selected) && (selected as string[]).includes(vowel)
      }
      onChange={(event) => {
        handleChange(vowel, event.target.checked)
      }}
    />
  )

  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        {firstRow.map(renderCheckbox)}
      </div>
      <div>{secondRow.map(renderCheckbox)}</div>
    </div>
  )
}

type DictionarySourceSelectorProps = {
  selected: string[]
  onChange: (origin: string[]) => void
}

function DictionarySourceSelector({
  selected,
  onChange,
}: DictionarySourceSelectorProps): JSX.Element {
  const sources = [
    { value: 'CDA', label: 'Concise Dictionary of Akkadian' },
    { value: 'AFO_REGISTER', label: 'AfO Register' },
    { value: 'SAD', label: 'Supplements to the Akkadian Dictionaries' },
  ]

  const isAllSelected = !selected || selected.length === 0

  const handleAllChange = (checked: boolean) => {
    if (checked) {
      onChange([])
    } else {
      onChange(['CDA'])
    }
  }

  const handleSourceChange = (source: string, checked: boolean) => {
    if (isAllSelected && checked) {
      onChange([source])
    } else {
      let originList: string[] = Array.isArray(selected)
        ? [...(selected as string[])]
        : []
      if (checked) {
        originList.push(source)
      } else {
        originList = originList.filter((s) => s !== source)
      }
      onChange(originList)
    }
  }

  const renderSwitch = (source: { value: string; label: string }) => (
    <Form.Check
      key={source.value}
      type="switch"
      inline
      id={`origin-${source.value}`}
      label={source.label}
      checked={
        !isAllSelected &&
        Array.isArray(selected) &&
        (selected as string[]).includes(source.value)
      }
      onChange={(event) => {
        handleSourceChange(source.value, event.target.checked)
      }}
    />
  )

  return (
    <div>
      <Form.Check
        type="switch"
        id="origin-all"
        label="All sources"
        checked={isAllSelected}
        onChange={(event) => {
          handleAllChange(event.target.checked)
        }}
        style={{ fontWeight: 'bold', marginRight: '1rem' }}
      />
      {sources.map(renderSwitch)}
    </div>
  )
}

type DictionarySourceFormGroupProps = {
  origin: string[]
  onChange: (origin: string[]) => void
}

function DictionarySourceFormGroup({
  origin,
  onChange,
}: DictionarySourceFormGroupProps): JSX.Element {
  return (
    <Form.Group as={Row} controlId="origin">
      <Form.Label column sm={3}>
        Dictionary source
      </Form.Label>
      <Col sm={1}>
        {HelpEntry(
          'Select one or more dictionary sources. Select "All sources" to search across all dictionaries.'
        )}
      </Col>
      <Col sm={8}>
        <DictionarySourceSelector selected={origin} onChange={onChange} />
      </Col>
    </Form.Group>
  )
}

type Props = {
  query: WordQuery
  history
  location
  match
} & RouteComponentProps
type State = {
  query: WordQuery
}

class WordSearch extends Component<Props, State> {
  state = {
    query: (() => {
      const initialVowelClass = Array.isArray(this.props.query.vowelClass)
        ? (this.props.query.vowelClass as string[])
        : this.props.query.vowelClass
        ? [this.props.query.vowelClass as string]
        : []
      const initialOrigin = Array.isArray(this.props.query.origin)
        ? (this.props.query.origin as string[])
        : this.props.query.origin
        ? [this.props.query.origin as string]
        : ['CDA']
      return {
        word: '',
        meaning: '',
        root: '',
        ...this.props.query,
        vowelClass: initialVowelClass,
        origin: initialOrigin,
      }
    })(),
  }

  onChange = (event) => {
    const { id } = event.target
    let { value } = event.target
    if (id === 'vowelClass') {
      const selectedOptions = Array.from(
        event.target.selectedOptions,
        (option: HTMLOptionElement) => option.value
      )
      value = selectedOptions
    } else if (['word', 'root'].includes(id)) {
      value = replaceTransliteration(value, true, false, false)
    }

    this.setState({
      query: { ...this.state.query, [id]: value },
    })
  }

  submit = (event) => {
    event.preventDefault()
    this.props.history.push(
      `?${stringify(this.state.query, { skipEmptyString: true })}`
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
    helpText: JSX.Element | string
  ): JSX.Element {
    const help = HelpEntry(
      <>
        {helpText}
        {this.makeHelpHints(field)}
      </>
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
            'The lemma and other forms for the word.'
          )}
          <Col sm={2}>
            <Button type="submit" variant="primary">
              Query
            </Button>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="meaning">
          {this.makeFormRow(
            'meaning',
            'Meaning',
            'The meaning(s) and explanation(s).'
          )}
        </Form.Group>
        <Form.Group as={Row} controlId="root">
          {this.makeFormRow(
            'root',
            'Root',
            <>
              The verbal root (e.g. <code>prs</code>, <code>&apos;bt</code>,{' '}
              <code>šṭr</code>, <code>mrr</code>
            </>
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

export default withRouter(WordSearch)
