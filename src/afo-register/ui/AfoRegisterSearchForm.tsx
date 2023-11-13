import React, { useEffect, useState } from 'react'
import { stringify } from 'query-string'
import _ from 'lodash'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { RouteComponentProps, withRouter, useHistory } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'
import { usePrevious } from 'common/usePrevious'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import Select from 'react-select'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import Promise from 'bluebird'

export type AfoRegisterQuery = { text: string; textNumber: string }

interface SelectedOption {
  value: string
  label: string | JSX.Element
  entry: AfoRegisterRecordSuggestion
}
const collator = new Intl.Collator([], { numeric: true })

interface SelectProps {
  ariaLabel: string
  value: AfoRegisterRecordSuggestion
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
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    createOption(value)
  )
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value !== prevValue) {
      setSelectedOption(createOption(value))
    }
  }, [value, prevValue])

  const loadOptions = (
    inputValue: string,
    callback: (options: SelectedOption[]) => void
  ) => {
    searchSuggestions(inputValue).then((entries) => {
      const options = entries
        .map(createOption)
        .filter((option) => option !== null) as SelectedOption[]
      options.sort((a, b) => collator.compare(a.value, b.value))
      callback(options)
    })
  }

  function createOption(
    recordSuggestion: AfoRegisterRecordSuggestion
  ): SelectedOption {
    return {
      value: recordSuggestion.text,
      label: recordSuggestion.text,
      entry: recordSuggestion,
    }
  }

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedOption(selectedOption)
      onChange(selectedOption.entry)
    } else {
      onChange(new AfoRegisterRecordSuggestion({ text: '', textNumbers: [] }))
    }
  }

  function formatOptionLabel(option: SelectedOption): JSX.Element {
    return (
      <MarkdownAndHtmlToHtml markdownAndHtml={option.label} container="span" />
    )
  }

  return (
    <>
      <AsyncSelect
        isClearable={isClearable}
        aria-label={ariaLabel}
        placeholder="Name Year Title"
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
    console.log(suggestion.textNumbers)
    setTextNumberOptions([
      { label: '--', value: '' },
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
        value={new AfoRegisterRecordSuggestion({ text: '', textNumbers: [] })}
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
        options={textNumberOptions}
        onChange={(option): void => {
          if (option) {
            setQuery({ ...query, textNumber: option.value })
          }
        }}
        isSearchable={true}
        autoFocus={true}
        placeholder="Text number"
        value={{ value: query.textNumber, label: query.textNumber }}
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
