import React from 'react'
import { Col, Form, Popover, Row } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'

function TransliterationSearchHelp(): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('TransliterationSearchHelp-')}
      title="Search transliterations"
    >
      <Popover.Content>
        <ul>
          <li>
            Sequences of signs are retrieved regardless of the values entered:
            e.g., <code>me lik</code> will retrieve <code>šip taš</code>,{' '}
            <code>me ur</code>, etc.
          </li>
          <li>
            Signs in consecutive lines can be searched by entering them in
            consecutive lines of the search field.
          </li>
          <li>
            Text with diacritics (e.g. <code>ša₂</code>, <code>á</code>) or
            without them (e.g. <code>sza2</code> or <code>ca2</code>,{' '}
            <code>s,a3</code>, <code>t,a4</code>) can be entered.
          </li>
        </ul>
      </Popover.Content>
    </Popover>
  )
}

type Props = {
  onChange(value: string): void
  value: string | null | undefined
}

function TransliterationSearchForm(props: Props): JSX.Element {
  const rows = props.value?.split('\n').length ?? 0
  return (
    <Form>
      <Form.Group as={Row} controlId="transliteration">
        <Col
          sm={2}
          as={Form.Label}
          className="TransliterationSearchForm__label"
        >
          <HelpTrigger overlay={TransliterationSearchHelp()} />
        </Col>
        <Col sm={10}>
          <Form.Control
            as="textarea"
            value={props.value || ''}
            rows={Math.max(2, rows)}
            placeholder="Search transliterations"
            aria-label="Transliteration"
            name="transliteration"
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void =>
              props.onChange(event.target.value)
            }
          />
        </Col>
      </Form.Group>
    </Form>
  )
}

export default TransliterationSearchForm
