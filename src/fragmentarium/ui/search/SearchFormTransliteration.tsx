import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import { HelpCol, TransliterationSearchHelp } from 'fragmentarium/ui/SearchHelp'
import { helpColSize } from 'fragmentarium/ui/SearchForm'

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
          rows={Math.max(3, rows)}
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
