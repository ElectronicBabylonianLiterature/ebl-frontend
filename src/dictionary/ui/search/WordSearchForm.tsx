import React, { Component } from 'react'
import { stringify } from 'query-string'
import { Form, FormControl, Popover, Button, Row, Col } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import { WordQuery } from 'dictionary/application/WordService'

function HelpEntry(definition: JSX.Element | string): JSX.Element {
  const SearchHelp = (
    <Popover id={_.uniqueId('WordSearchHelp-')} title="Search dictionary">
      <Popover.Content>{definition}</Popover.Content>
    </Popover>
  )
  return <HelpTrigger overlay={SearchHelp} />
}

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

const basicDiacriticsHelp = (
  <>
    To enter diacritics, use:
    <ul>
      <li>
        <code>sz</code> → <code>š</code>
      </li>
      <li>
        <code>s,</code> → <code>ṣ</code>
      </li>
      <li>
        <code>t,</code> → <code>ṭ</code>
      </li>
      <li>
        <code>aa</code> → <code>ā</code>
      </li>
      <li>
        <code>aaa</code> → <code>â</code>
      </li>
      etc.
    </ul>
  </>
)

const wildCardsHelp = (
  <>
    Wildcards:
    <ul>
      <li>
        <code>?</code> for any one character.
      </li>
      <li>
        <code>*</code> for any sequence of characters.
      </li>
    </ul>
  </>
)

const exactSearchHelp = (
  <>
    Unicode diacritics and capital letters are collated in non-precise search{' '}
    (e.g. <code>s</code>, <code>S</code>, <code>š</code>, <code>Š</code>,{' '}
    <code>ṣ</code>, and <code>Ṣ</code> are interchangeable).
    <br />
    For precise search, warp your query in quotation marks (
    <code>&quot;&quot;</code>).{' '}
  </>
)

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
      return {
        word: '',
        meaning: '',
        root: '',
        ...this.props.query,
        vowelClass: initialVowelClass,
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
      </Form>
    )
  }
}

export default withRouter(WordSearch)
