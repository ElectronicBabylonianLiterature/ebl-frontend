import { produce, castDraft, Draft } from 'immer'
import _ from 'lodash'
import React from 'react'
import { Button, Card, Form, ListGroup } from 'react-bootstrap'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import { Line, EditStatus } from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/chapter'
import ChapterLineForm from 'corpus/ui/lines/ChapterLineForm'

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
