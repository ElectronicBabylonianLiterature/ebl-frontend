import { produce, castDraft, Draft } from 'immer'
import _ from 'lodash'
import React from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import ListForm from 'common/ui/List'
import {
  createVariant,
  LineVariant,
  Line,
  EditStatus,
} from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import Editor from 'editor/Editor'
import LineVariantForm from 'corpus/ui/lines/LineVariantForm'

interface FormProps {
  value: Line
  manuscripts: readonly Manuscript[]
  onChange: (line: Line) => void
  disabled?: boolean
}

function markAsEdited(draft: Draft<Line>): void {
  if (draft.status !== EditStatus.NEW) {
    draft.status = EditStatus.EDITED
  }
}

export default function ChapterLineForm({
  value,
  manuscripts,
  onChange,
  disabled = false,
}: FormProps): JSX.Element {
  const handleChange =
    (property: string) =>
    (propertyValue): void =>
      onChange(
        produce(value, (draft) => {
          markAsEdited(draft)
          draft[property] = propertyValue
        }),
      )

  const handleNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    onChange(
      produce(value, (draft) => {
        draft.number = event.target.value
        markAsEdited(draft)
      }),
    )
  }
  const handleVariantsChange = (variants: LineVariant[]): void =>
    onChange(
      produce(value, (draft) => {
        draft.variants = castDraft(variants)
        markAsEdited(draft)
      }),
    )
  return (
    <>
      <Row>
        <Col md={1}>
          <Form.Group controlId={_.uniqueId('Lines-')}>
            <Form.Label>Number</Form.Label>
            <Form.Control value={value.number} onChange={handleNumberChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Check
            inline
            type="checkbox"
            id={_.uniqueId('secondLineOfParallelism-')}
            label="second line of parallelism"
            checked={value.isSecondLineOfParallelism}
            onChange={(): void =>
              handleChange('isSecondLineOfParallelism')(
                !value.isSecondLineOfParallelism,
              )
            }
          />
          <Form.Check
            inline
            type="checkbox"
            id={_.uniqueId('beginningOfSection-')}
            label="beginning of a section"
            checked={value.isBeginningOfSection}
            onChange={(): void =>
              handleChange('isBeginningOfSection')(!value.isBeginningOfSection)
            }
          />
        </Col>
        <Col>
          <label>Translation</label>
          <Editor
            name={_.uniqueId('Translation-')}
            value={value.translation}
            onChange={handleChange('translation')}
            disabled={disabled}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <ListForm
            noun="variant"
            defaultValue={createVariant({})}
            value={value.variants}
            onChange={handleVariantsChange}
          >
            {(
              variant: LineVariant,
              onChange: (variant: LineVariant) => void,
            ) => (
              <LineVariantForm
                onChange={onChange}
                value={variant}
                manuscripts={manuscripts}
                disabled={disabled}
              />
            )}
          </ListForm>
        </Col>
      </Row>
      <Row>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handleChange('status')(EditStatus.DELETED)}
        >
          Delete line
        </Button>
      </Row>
    </>
  )
}
