import React, { useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function RealiaSearchForm({
  query,
}: {
  query: string
}): JSX.Element {
  const [value, setValue] = useState(query)
  const navigate = useNavigate()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    navigate('/tools/realia?query=' + encodeURIComponent(value))
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="align-items-end">
        <Col>
          <Form.Group controlId="realia-search-query">
            <Form.Label>Search realia</Form.Label>
            <Form.Control
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Enter a term…"
            />
          </Form.Group>
        </Col>
        <Col xs="auto">
          <Button type="submit" variant="primary">
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
