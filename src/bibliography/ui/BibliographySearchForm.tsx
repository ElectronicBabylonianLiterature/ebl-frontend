import React, { useState } from 'react'
import { stringify } from 'query-string'
import _ from 'lodash'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

type Props = { query: string | null | undefined }

function BibliographySearch({ query: initialQuery }: Props) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialQuery || '')
  const id = _.uniqueId('BibliographySearch-')

  const onChange = (event) => {
    setQuery(event.target.value)
  }

  const submit = (event) => {
    event.preventDefault()
    navigate(`?${stringify({ query })}`)
  }

  return (
    <Form onSubmit={submit}>
      <Form.Group as={Row} controlId={id}>
        <Col sm={8}>
          <FormControl
            aria-label="Bibliography-Query"
            type="text"
            value={query}
            placeholder="Author Year Title / Container-Title-Short Collection-Number"
            onChange={onChange}
          />
        </Col>
        <Col sm={4}>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </Col>
      </Form.Group>
    </Form>
  )
}

export default BibliographySearch
