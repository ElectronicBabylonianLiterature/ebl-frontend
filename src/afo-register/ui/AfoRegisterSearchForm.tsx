import React, { useEffect, useState } from 'react'
import { stringify } from 'query-string'
import _ from 'lodash'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import ErrorAlert from 'common/errors/ErrorAlert'
import { isCancellation } from 'common/utils/abortError'
import {
  AfoRegisterQuery,
  loadTextNumberOptions,
  makeTextNumberOption,
  TextNumberExactSwitch,
  TextNumberField,
  TextNumberOption,
  TextOrPublicationSelect,
} from 'afo-register/ui/AfoRegisterSearchFields'

export type { AfoRegisterQuery } from 'afo-register/ui/AfoRegisterSearchFields'

type FormProps = {
  queryProp: AfoRegisterQuery
  afoRegisterService: AfoRegisterService
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
  afoRegisterService: AfoRegisterService,
  signal: AbortSignal,
): Promise<void> {
  const suggestions = await searchTextSuggestions(
    query.text,
    afoRegisterService,
  )
  if (signal.aborted) {
    return
  }
  const suggestion = suggestions.find(
    (suggestion) => suggestion.text === query.text,
  )
  if (
    suggestion &&
    suggestion.textNumbers &&
    textNumberOptions.length !== suggestion.textNumbers.length + 1
  ) {
    loadTextNumberOptions(suggestion.textNumbers, setTextNumberOptions)
  }
}

function searchTextSuggestions(
  queryText: string,
  afoRegisterService: AfoRegisterService,
): Promise<readonly AfoRegisterRecordSuggestion[]> {
  if (queryText.replace(/\s/g, '').length > 1) {
    return afoRegisterService.searchSuggestions(queryText)
  }
  return Promise.resolve([])
}

function AfoRegisterSearch({ queryProp, afoRegisterService }: FormProps) {
  const [query, setQuery] = useState<AfoRegisterQuery>(updateQuery(queryProp))
  const [textNumberOptions, setTextNumberOptions] = useState<
    Array<{ label: string; value: string }>
  >([makeTextNumberOption(queryProp.textNumber)])
  const [isTextNumberSelect, setIsTextNumberSelect] = useState<boolean>(
    !!queryProp.textNumber &&
      queryProp.textNumber.length === query.textNumber.length + 2,
  )
  const [suggestionsError, setSuggestionsError] = useState<Error | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.text) {
      return
    }
    const controller = new AbortController()
    fetchTextNumberOptions(
      query,
      textNumberOptions,
      setTextNumberOptions,
      afoRegisterService,
      controller.signal,
    ).catch((error) => {
      if (!isCancellation(error, controller.signal)) {
        setSuggestionsError(error as Error)
      }
    })
    return () => controller.abort()
  }, [query, textNumberOptions, setTextNumberOptions, afoRegisterService])

  function submit(event) {
    event.preventDefault()
    const _query = { ...query }
    if (isTextNumberSelect) {
      _query.textNumber = `"${query.textNumber}"`
    }
    navigate(`?${stringify(_query)}`)
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
        <ErrorAlert error={suggestionsError} />
      </Form.Group>
    </Form>
  )
}

export default AfoRegisterSearch
