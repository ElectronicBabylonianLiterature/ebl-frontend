import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
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
      <Form.Group>
        <Form.Control
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search"
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="mt-2">
        Search
      </Button>
    </Form>
  )
}
