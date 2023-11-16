import React, { useState } from 'react'
import { stringify } from 'query-string'
import _ from 'lodash'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { RouteComponentProps, withRouter, useHistory } from 'react-router-dom'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import Select from 'react-select'
import Promise from 'bluebird'
import AfoRegisterTextSelect from 'afo-register/ui/AfoRegisterTextSelect'

export type AfoRegisterQuery = { text: string; textNumber: string }

type FormProps = {
  queryProp: AfoRegisterQuery
  afoRegisterService: AfoRegisterService
} & RouteComponentProps

function AfoRegisterSearch({ queryProp, afoRegisterService }: FormProps) {
  const [query, setQuery] = useState<AfoRegisterQuery>(updateQuery(queryProp))
  const [textNumberOptions, setTextNumberOptions] = useState<
    Array<{ label: string; value: string }>
  >([makeTextNumberOption(queryProp.textNumber)])
  const [isTextNumberSelect, setIsTextNumberSelect] = useState<boolean>(
    queryProp.textNumber &&
      queryProp.textNumber.length === query.textNumber.length + 2
      ? true
      : false
  )
  const history = useHistory()
  if (query.text) {
    fetchTextNumberOptions()
  }

  function updateQuery(queryProp: AfoRegisterQuery): AfoRegisterQuery {
    return {
      ...queryProp,
      textNumber: _.trim(queryProp.textNumber, '"'),
    }
  }

  async function fetchTextNumberOptions() {
    searchTextSuggestions(query.text).then(
      (suggestions: readonly AfoRegisterRecordSuggestion[]) => {
        const suggestion = _.find(
          suggestions,
          (suggestion) => suggestion.text === query.text
        )
        if (
          suggestion &&
          textNumberOptions.length !== suggestion.textNumbers.length + 1
        ) {
          loadTextNumberOptions(suggestion.textNumbers)
        }
      }
    )
  }

  function submit(event) {
    event.preventDefault()
    const _query = { ...query }
    if (isTextNumberSelect) {
      _query.textNumber = `"${query.textNumber}"`
    }
    history.push(`?${stringify(_query)}`)
  }

  function onChangeTextField(suggestion: AfoRegisterRecordSuggestion): void {
    loadTextNumberOptions(suggestion.textNumbers)
    setQuery({ text: suggestion.text, textNumber: '' })
  }

  function loadTextNumberOptions(textNumbers: string[]): void {
    setTextNumberOptions([
      { label: '—', value: '' },
      ...textNumbers.map(makeTextNumberOption),
    ])
  }

  function makeTextNumberOption(
    textNumber: string
  ): { label: string; value: string } {
    return { label: textNumber, value: textNumber }
  }

  function searchTextSuggestions(
    queryText: string
  ): Promise<readonly AfoRegisterRecordSuggestion[]> {
    if (queryText.replace(/\s/g, '').length > 1) {
      return afoRegisterService.searchSuggestions(queryText)
    }
    return new Promise((resolve) => {
      resolve([])
    })
  }

  function makeTextSelectValue(): AfoRegisterRecordSuggestion | null {
    return query.text
      ? new AfoRegisterRecordSuggestion({
          text: query.text,
          textNumbers: textNumberOptions
            ? textNumberOptions.map((option) => option.value)
            : [],
        })
      : null
  }

  function makeTextOrPublicationSelect(): JSX.Element {
    return (
      <AfoRegisterTextSelect
        ariaLabel={'Select text'}
        value={makeTextSelectValue()}
        onChange={(suggestion) => onChangeTextField(suggestion)}
        searchSuggestions={searchTextSuggestions}
        isClearable={true}
      />
    )
  }

  function makeTextNumberSelect(): JSX.Element {
    return (
      <Select
        aria-label="select-text-number"
        placeholder={'Number'}
        options={textNumberOptions}
        onChange={(option): void => {
          if (option) {
            setQuery({ ...query, textNumber: option.value })
          }
        }}
        isSearchable={true}
        value={
          query.textNumber
            ? { value: query.textNumber, label: query.textNumber }
            : null
        }
      />
    )
  }

  function makeTextNumberInput(): JSX.Element {
    return (
      <Form.Control
        aria-label="input-text-number"
        placeholder={'Number'}
        value={query.textNumber}
        onChange={(event): void => {
          setQuery({ ...query, textNumber: event.target.value })
        }}
      />
    )
  }

  function makeTextNumberField(): JSX.Element {
    return isTextNumberSelect ? makeTextNumberSelect() : makeTextNumberInput()
  }

  function makeTextNumberExactSwitch(): JSX.Element {
    return (
      <Form.Switch
        className="settings__switch"
        label={'Exact'}
        id={_.uniqueId('text-number-field-toggle-')}
        onChange={() => setIsTextNumberSelect(!isTextNumberSelect)}
        checked={isTextNumberSelect}
      />
    )
  }

  return (
    <Form onSubmit={submit}>
      <Form.Group
        controlId={_.uniqueId('AfoRegisterSearch-')}
        style={{ width: '100%' }}
      >
        <Row>
          <Col sm={8}>{makeTextOrPublicationSelect()}</Col>
          <Col sm={4}>{makeTextNumberField()}</Col>
        </Row>
        <Row style={{ paddingTop: '10px' }}>
          <Col sm={8}>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Col>
          <Col sm={4}>{makeTextNumberExactSwitch()}</Col>
        </Row>
      </Form.Group>
    </Form>
  )
}

export default withRouter(AfoRegisterSearch)
