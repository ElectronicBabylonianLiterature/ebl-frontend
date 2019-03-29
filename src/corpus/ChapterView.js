import React from 'react'
import { Form, Col, Alert } from 'react-bootstrap'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import convertToRoman from './convertToRoman'

function DetailsRow ({ chapter }) {
  return (
    <Form.Row>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Classification</Form.Label>
        <Form.Control plaintext readOnly defaultValue={chapter.classification} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Period</Form.Label>
        <Form.Control plaintext readOnly defaultValue={chapter.period} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Number</Form.Label>
        <Form.Control plaintext readOnly defaultValue={chapter.number} />
      </Form.Group>
    </Form.Row>
  )
}

function ChapterView ({ text, chapterId }) {
  const chapter = text.chapters.find(chapter => chapterId === `${chapter.period} ${convertToRoman(chapter.number)}`)
  return (
    <AppContent crumbs={['Corpus', `${text.category}.${text.index}`, chapterId]} title={`Edit ${text.name} ${chapterId}`}>
      {chapter
        ? (
          <Form>
            <DetailsRow chapter={chapter} />
          </Form>
        )
        : <Alert variant='danger'>Chapter {chapterId} not found.</Alert>
      }
    </AppContent>
  )
}

export default withData(
  ({ data, match, ...props }) => <ChapterView
    text={data}
    chapterId={decodeURIComponent(match.params.chapter)}
    {...props}
  />,
  ({ match, textService }) => {
    const [category, index] = decodeURIComponent(match.params.text).split('.')
    return textService.find(category, index)
  },
  {
    shouldUpdate: (prevProps, props) => prevProps.text !== props.text || prevProps.chapter !== props.chapter
  }
)
