import { produce, castDraft, Draft } from 'immer'
import _ from 'lodash'
import React from 'react'
import { Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap'
import ListForm from 'common/List'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import {
  createVariant,
  LineVariant,
  Line,
  EditStatus,
} from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/chapter'
import { Manuscript } from 'corpus/domain/manuscript'
import Editor from 'editor/Editor'
import { ManuscriptLines } from './ManuscriptLines'

interface VariantFormProps {
  value: LineVariant
  manuscripts: readonly Manuscript[]
  onChange: (line: LineVariant) => void
  disabled?: boolean
}

function LineVariantForm({
  value,
  manuscripts,
  onChange,
  disabled = false,
}: VariantFormProps) {
  const handleChange =
    (property: string) =>
    (propertyValue): void =>
      onChange(
        produce(value, (draft) => {
          draft[property] = propertyValue
        }),
      )

  return (
    <>
      <Row>
        <Col>
          <label>Intertext</label>
          <Editor
            name={_.uniqueId('Intertext-')}
            value={value.intertext}
            onChange={handleChange('intertext')}
            disabled={disabled}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <label>Ideal reconstruction</label>
          <Editor
            name={_.uniqueId('IdealReconstruction-')}
            value={value.reconstruction}
            onChange={handleChange('reconstruction')}
            disabled={disabled}
          />
        </Col>
      </Row>
      <ManuscriptLines
        lines={value.manuscripts}
        manuscripts={manuscripts}
        onChange={handleChange('manuscripts')}
        disabled={disabled}
      />
    </>
  )
}

interface FormProps {
  value: Line
  manuscripts: readonly Manuscript[]
  onChange: (line: Line) => void
  disabled?: boolean
}

function ChapterLineForm({
  value,
  manuscripts,
  onChange,
  disabled = false,
}: FormProps) {
  const handleChange =
    (property: string) =>
    (propertyValue): void =>
      onChange(
        produce(value, (draft) => {
          if (draft.status !== EditStatus.NEW) {
            draft.status = EditStatus.EDITED
          }
          draft[property] = propertyValue
        }),
      )

  const handleNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    onChange(
      produce(value, (draft) => {
        draft.number = event.target.value
        if (draft.status !== EditStatus.NEW) {
          draft.status = EditStatus.EDITED
        }
      }),
    )
  }
  const handleVariantsChange = (variants: LineVariant[]): void =>
    onChange(
      produce(value, (draft) => {
        draft.variants = castDraft(variants)
        if (draft.status !== EditStatus.NEW) {
          draft.status = EditStatus.EDITED
        }
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

interface ChapterLinesLinesProps {
  chapter: Chapter
  onChange: (chapter: Chapter) => void
  onSave: () => unknown
  disabled?: boolean
}

export default function ChapterLines({
  chapter,
  onChange,
  onSave,
  disabled = false,
}: ChapterLinesLinesProps): JSX.Element {
  const handleChange = (lines: readonly Line[]): void =>
    onChange(
      produce(chapter, (draft) => {
        draft.lines = castDraft(lines)
      }),
    )
  return (
    <Form>
      <fieldset disabled={disabled}>
        <Card className="mb-2">
          <ListGroup as={'ol'} variant="flush">
            {chapter.lines.map(
              (line: Line, index: number) =>
                line.status !== EditStatus.DELETED && (
                  <ListGroup.Item as="li" key={index}>
                    <ChapterLineForm
                      onChange={(line) =>
                        handleChange(
                          produce(chapter.lines, (draft: Draft<Line[]>) => {
                            draft[index] = castDraft(line)
                          }),
                        )
                      }
                      value={line}
                      manuscripts={chapter.manuscripts}
                      disabled={disabled}
                    />
                  </ListGroup.Item>
                ),
            )}
          </ListGroup>
          <Card.Body>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() =>
                handleChange([
                  ...chapter.lines,
                  createDefaultLineFactory(
                    _(chapter.lines)
                      .reject((line) => line.status === EditStatus.DELETED)
                      .last(),
                  )(),
                ])
              }
            >
              Add line
            </Button>
          </Card.Body>
        </Card>
        <Button onClick={onSave}>Save lines</Button>
      </fieldset>
    </Form>
  )
}
