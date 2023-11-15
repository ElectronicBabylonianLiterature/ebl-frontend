import React, { useEffect, useState } from 'react'
import { stringify } from 'query-string'
import _ from 'lodash'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { RouteComponentProps, withRouter, useHistory } from 'react-router-dom'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'
import { usePrevious } from 'common/usePrevious'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import Select, { ValueType } from 'react-select'
import AsyncSelect from 'react-select/async'
import { Markdown } from 'common/Markdown'
import Promise from 'bluebird'

export type AfoRegisterQuery = { text: string; textNumber: string }

interface TextSuggestionOption {
  value: string
  label: string | JSX.Element
  entry: AfoRegisterRecordSuggestion
}

const collator = new Intl.Collator([], { numeric: true })
function sorter(a: string, b: string, inputValue: string) {
  const removeSpecialChars = /[*^]/g
  const cleanedA = a.replace(removeSpecialChars, '')
  const cleanedB = b.replace(removeSpecialChars, '')
  const regex = new RegExp(`^${inputValue}`, 'i')
  const startsWithQueryA = regex.test(cleanedA)
  const startsWithQueryB = regex.test(cleanedB)
  if (startsWithQueryA === startsWithQueryB) {
    return collator.compare(cleanedA, cleanedB)
  }
  return startsWithQueryA ? -1 : 1
}

interface SelectProps {
  ariaLabel: string
  value: AfoRegisterRecordSuggestion | null
  searchSuggestions: (
    query: string
  ) => Promise<readonly AfoRegisterRecordSuggestion[]>
  onChange: (event: AfoRegisterRecordSuggestion) => void
  isClearable: boolean
}

type FormProps = {
  queryProp: AfoRegisterQuery
  afoRegisterService: AfoRegisterService
} & RouteComponentProps

function AfoRegisterTextSelect({
  ariaLabel,
  value,
  searchSuggestions,
  onChange,
  isClearable,
}: SelectProps): JSX.Element {
  const [
    selectedOption,
    setSelectedOption,
  ] = useState<TextSuggestionOption | null>(value ? createOption(value) : null)
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value && value !== prevValue) {
      setSelectedOption(createOption(value))
    }
  }, [value, prevValue])

  const loadOptions = (
    inputValue: string,
    callback: (options: TextSuggestionOption[]) => void
  ) => {
    searchSuggestions(inputValue).then((entries) => {
      const options = entries
        .map(createOption)
        .filter((option) => option !== null) as TextSuggestionOption[]
      options.sort((a, b) => sorter(a.value, b.value, inputValue))
      callback(options)
    })
  }

  function createOption(
    recordSuggestion: AfoRegisterRecordSuggestion
  ): TextSuggestionOption {
    return {
      value: recordSuggestion.text,
      label: recordSuggestion.text,
      entry: recordSuggestion,
    }
  }

  const handleChange = (
    selectedOption: ValueType<TextSuggestionOption, false>
  ) => {
    if (selectedOption) {
      setSelectedOption(selectedOption)
      onChange(selectedOption.entry)
    } else {
      onChange(new AfoRegisterRecordSuggestion({ text: '', textNumbers: [] }))
    }
  }

  function formatOptionLabel(option: TextSuggestionOption): JSX.Element {
    return <Markdown text={option.label as string} />
  }

  return (
    <>
      <AsyncSelect
        isClearable={isClearable}
        aria-label={ariaLabel}
        placeholder="Text or Publication"
        cacheOptions
        loadOptions={loadOptions}
        onChange={handleChange}
        value={selectedOption}
        formatOptionLabel={formatOptionLabel}
      />
    </>
  )
}

function AfoRegisterSearch({ queryProp, afoRegisterService }: FormProps) {
  const [query, setQuery] = useState<AfoRegisterQuery>(queryProp)
  const [textNumberOptions, setTextNumberOptions] = useState<
    Array<{ label: string; value: string }>
  >([])
  const history = useHistory()

  function submit(event) {
    event.preventDefault()
    history.push(`?${stringify(query)}`)
  }

  function onChangeTextField(suggestion: AfoRegisterRecordSuggestion): void {
    setTextNumberOptions([
      { label: '—', value: '' },
      ...suggestion.textNumbers.map((textNumber) => {
        return { label: textNumber, value: textNumber }
      }),
    ])
    setQuery({ text: suggestion.text, textNumber: '' })
  }

  function searchTextSuggestions(
    query: string
  ): Promise<readonly AfoRegisterRecordSuggestion[]> {
    if (query.length > 1) {
      return afoRegisterService.searchSuggestions(query)
    }
    return new Promise((resolve) => {
      resolve([])
    })
  }

  function getTextOrPublicationSelect(): JSX.Element {
    return (
      <AfoRegisterTextSelect
        ariaLabel={'Select text'}
        value={null}
        onChange={(suggestion) => onChangeTextField(suggestion)}
        searchSuggestions={searchTextSuggestions}
        isClearable={true}
      />
    )
  }

  function getTextNumberSelect(): JSX.Element {
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
        autoFocus={true}
        value={
          query.textNumber
            ? { value: query.textNumber, label: query.textNumber }
            : null
        }
      />
    )
  }

  return (
    <Form onSubmit={submit}>
      <Form.Group
        as={Row}
        controlId={_.uniqueId('AfoRegisterSearch-')}
        style={{ width: '100%' }}
      >
        <Col sm={5}>{getTextOrPublicationSelect()}</Col>
        <Col sm={4}>{getTextNumberSelect()}</Col>
        <Col sm={2}>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </Col>
      </Form.Group>
    </Form>
  )
}

export default withRouter(AfoRegisterSearch)
