import React, { useEffect, useState } from 'react'
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

interface TextNumberOption {
  label: string
  value: string
}

type FormProps = {
  queryProp: AfoRegisterQuery
  afoRegisterService: AfoRegisterService
} & RouteComponentProps

interface TextOrPublicationSelectProps {
  query: AfoRegisterQuery
  setQuery: React.Dispatch<React.SetStateAction<AfoRegisterQuery>>
  searchTextSuggestions: (
    text: string
  ) => Promise<readonly AfoRegisterRecordSuggestion[]>
  textNumberOptions: TextNumberOption[]
  setTextNumberOptions: React.Dispatch<React.SetStateAction<TextNumberOption[]>>
}

function updateQuery(queryProp: AfoRegisterQuery): AfoRegisterQuery {
  return {
    ...queryProp,
    textNumber: _.trim(queryProp.textNumber, '"'),
  }
}

async function fetchTextNumberOptions(
  query: AfoRegisterQuery,
  textNumberOptions: TextNumberOption[],
  setTextNumberOptions: React.Dispatch<
    React.SetStateAction<TextNumberOption[]>
  >,
  afoRegisterService: AfoRegisterService
): Promise<void> {
  const suggestions = await searchTextSuggestions(
    query.text,
    afoRegisterService
  )
  const suggestion = suggestions.find(
    (suggestion) => suggestion.text === query.text
  )
  if (
    suggestion &&
    suggestion.textNumbers &&
    textNumberOptions.length !== suggestion.textNumbers.length + 1
  ) {
    loadTextNumberOptions(suggestion.textNumbers, setTextNumberOptions)
  }
}

function loadTextNumberOptions(
  textNumbers: string[] = [],
  setTextNumberOptions: React.Dispatch<React.SetStateAction<TextNumberOption[]>>
): void {
  setTextNumberOptions([
    { label: '—', value: '' },
    ...textNumbers.map(makeTextNumberOption).filter((option) => option.label),
  ])
}

function makeTextNumberOption(textNumber: string): TextNumberOption {
  return { label: textNumber, value: textNumber }
}

function searchTextSuggestions(
  queryText: string,
  afoRegisterService: AfoRegisterService
): Promise<readonly AfoRegisterRecordSuggestion[]> {
  if (queryText.replace(/\s/g, '').length > 1) {
    return afoRegisterService.searchSuggestions(queryText)
  }
  return Promise.resolve([])
}

function makeTextSelectValue(
  query: AfoRegisterQuery,
  textNumberOptions: TextNumberOption[]
): AfoRegisterRecordSuggestion | null {
  return query.text
    ? new AfoRegisterRecordSuggestion({
        text: query.text,
        textNumbers: textNumberOptions.map((option) => option.value),
      })
    : null
}

function AfoRegisterSearch({ queryProp, afoRegisterService }: FormProps) {
  const [query, setQuery] = useState<AfoRegisterQuery>(updateQuery(queryProp))
  const [textNumberOptions, setTextNumberOptions] = useState<
    Array<{ label: string; value: string }>
  >([makeTextNumberOption(queryProp.textNumber)])
  const [isTextNumberSelect, setIsTextNumberSelect] = useState<boolean>(
    !!queryProp.textNumber &&
      queryProp.textNumber.length === query.textNumber.length + 2
  )
  const history = useHistory()

  useEffect(() => {
    if (query.text) {
      fetchTextNumberOptions(
        query,
        textNumberOptions,
        setTextNumberOptions,
        afoRegisterService
      )
    }
  }, [query, textNumberOptions, setTextNumberOptions, afoRegisterService])

  function submit(event) {
    event.preventDefault()
    const _query = { ...query }
    if (isTextNumberSelect) {
      _query.textNumber = `"${query.textNumber}"`
    }
    history.push(`?${stringify(_query)}`)
  }

  return (
    <Form onSubmit={submit}>
      <Form.Group
        controlId={_.uniqueId('AfoRegisterSearch-')}
        style={{ width: '100%' }}
      >
        <Row>
          <Col sm={8}>
            <TextOrPublicationSelect
              query={query}
              setQuery={setQuery}
              searchTextSuggestions={(text: string) =>
                searchTextSuggestions(text, afoRegisterService)
              }
              textNumberOptions={textNumberOptions}
              setTextNumberOptions={setTextNumberOptions}
            />
          </Col>
          <Col sm={4}>
            <TextNumberField
              query={query}
              setQuery={setQuery}
              textNumberOptions={textNumberOptions}
              isTextNumberSelect={isTextNumberSelect}
            />
          </Col>
        </Row>
        <Row style={{ paddingTop: '10px' }}>
          <Col sm={8}>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Col>
          <Col sm={4}>
            <TextNumberExactSwitch
              isTextNumberSelect={isTextNumberSelect}
              setIsTextNumberSelect={setIsTextNumberSelect}
            />
          </Col>
        </Row>
      </Form.Group>
    </Form>
  )
}

function TextOrPublicationSelect({
  query,
  setQuery,
  searchTextSuggestions,
  textNumberOptions,
  setTextNumberOptions,
}: TextOrPublicationSelectProps): JSX.Element {
  return (
    <AfoRegisterTextSelect
      ariaLabel={'Select text'}
      value={makeTextSelectValue(query, textNumberOptions)}
      onChange={(suggestion) => {
        loadTextNumberOptions(
          suggestion.textNumbers || [],
          setTextNumberOptions
        )
        setQuery({ text: suggestion.text, textNumber: '' })
      }}
      searchSuggestions={searchTextSuggestions}
      isClearable={true}
    />
  )
}

interface TextNumberFieldProps {
  query: AfoRegisterQuery
  setQuery: React.Dispatch<React.SetStateAction<AfoRegisterQuery>>
  textNumberOptions: TextNumberOption[]
  isTextNumberSelect: boolean
}

function TextNumberField({
  query,
  setQuery,
  textNumberOptions,
  isTextNumberSelect,
}: TextNumberFieldProps): JSX.Element {
  return isTextNumberSelect ? (
    <Select
      aria-label="select-text-number"
      placeholder={'Number'}
      options={textNumberOptions}
      onChange={(option) => {
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
  ) : (
    <Form.Control
      aria-label="input-text-number"
      placeholder={'Number'}
      value={query.textNumber}
      onChange={(event) => {
        setQuery({ ...query, textNumber: event.target.value })
      }}
    />
  )
}

interface TextNumberExactSwitchProps {
  isTextNumberSelect: boolean
  setIsTextNumberSelect: React.Dispatch<React.SetStateAction<boolean>>
}

function TextNumberExactSwitch({
  isTextNumberSelect,
  setIsTextNumberSelect,
}: TextNumberExactSwitchProps): JSX.Element {
  return (
    <Form.Switch
      className="settings__switch"
      label={'Exact number'}
      id={_.uniqueId('text-number-field-toggle-')}
      onChange={() => setIsTextNumberSelect(!isTextNumberSelect)}
      checked={isTextNumberSelect}
    />
  )
}

export default withRouter(AfoRegisterSearch)
