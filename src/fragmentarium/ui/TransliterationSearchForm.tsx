import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import HelpCol from './HelpCol'
import { TransliterationSearchHelp } from './SearchHelp'
import { helpColSize } from './SearchForm'

interface TransliterationSearchFormProps {
  value: string | null
  onChangeTransliteration: (value: string) => void
  rows: number
}

export default function TransliterationSearchForm({
  value,
  onChangeTransliteration,
  rows,
}: TransliterationSearchFormProps): JSX.Element {
  return (
    <Form.Group as={Row} controlId="transliteration">
      <HelpCol overlay={TransliterationSearchHelp()} />
      <Col sm={12 - helpColSize}>
        <Form.Control
          as="textarea"
          value={value || ''}
          rows={Math.max(2, rows)}
          placeholder="Transliterations"
          aria-label="Transliteration"
          name="transliteration"
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChangeTransliteration(event.target.value)
          }
        />
      </Col>
    </Form.Group>
  )
}
