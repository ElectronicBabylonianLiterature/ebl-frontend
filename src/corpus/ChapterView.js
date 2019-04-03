import React, { Component } from 'react'
import { Form, Col, Alert } from 'react-bootstrap'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'
import withData from 'http/withData'
import { Manuscript, periods, provenances, types } from './text'

function DetailsRow ({ chapter }) {
  return (
    <Form.Row>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Classification</Form.Label>
        <Form.Control plaintext readOnly defaultValue={chapter.classification} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Stage</Form.Label>
        <Form.Control plaintext readOnly defaultValue={chapter.stage} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Name</Form.Label>
        <Form.Control plaintext readOnly defaultValue={chapter.name} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Order</Form.Label>
        <Form.Control plaintext readOnly defaultValue={chapter.order} />
      </Form.Group>
    </Form.Row>
  )
}

function ManuscriptForm ({ manuscript, onChange }) {
  const handleChange = property => event => onChange(manuscript.set(property, event.target.value))
  const handelRecordChange = (property, values) => event => onChange(manuscript.set(property, values.get(event.target.value)))

  return <Form.Row>
    <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
      <Form.Label>Siglum</Form.Label>
      <Form.Control value={manuscript.siglum} onChange={handleChange('siglum')} />
    </Form.Group>
    <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
      <Form.Label>Museum Number</Form.Label>
      <Form.Control value={manuscript.museumNumber} onChange={handleChange('museumNumber')} />
    </Form.Group>
    <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
      <Form.Label>Accession</Form.Label>
      <Form.Control value={manuscript.accession} onChange={handleChange('accession')} />
    </Form.Group>
    <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
      <Form.Label>Period</Form.Label>
      <Form.Control as='select' value={manuscript.period.name} onChange={handelRecordChange('period', periods)}>
        {periods.toIndexedSeq().map(period => <option key={period.name} value={period.name}>{period.name} {period.description}</option>)}
      </Form.Control>
    </Form.Group>
    <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
      <Form.Label>Provenance</Form.Label>
      <Form.Control as='select' value={manuscript.provenance.name} onChange={handelRecordChange('provenance', provenances)}>
        {provenances.toIndexedSeq().map(provenance => <option key={provenance.name} value={provenance.name}>{provenance.name}</option>)}
      </Form.Control>
    </Form.Group>
    <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
      <Form.Label>Type</Form.Label>
      <Form.Control as='select' value={manuscript.type.name} onChange={handelRecordChange('type', types)}>
        {types.toIndexedSeq().map(type => <option key={type.name} value={type.name}>{type.name}</option>)}
      </Form.Control>
    </Form.Group>
  </Form.Row>
}

function ChapterView ({ text, chapterId, onChange }) {
  const [chapterIndex, chapter] = text.chapters.findEntry(chapter => chapterId === `${chapter.stage} ${chapter.name}`) || [-1, null]
  const handeManuscriptsChange = manuscripts => onChange(text.setIn(['chapters', chapterIndex, 'manuscripts'], manuscripts))
  return (
    <AppContent crumbs={['Corpus', text.name, chapterId]} title={`Edit ${text.name} ${chapterId}`}>
      {chapter
        ? (
          <Form>
            <DetailsRow chapter={chapter} />
            <ListForm label='Manuscripts' noun='manuscript' default={Manuscript()} value={chapter.manuscripts} onChange={handeManuscriptsChange}>
              {chapter.manuscripts.map((manuscript, index) =>
                <ManuscriptForm key={index} manuscript={manuscript} />
              )}
            </ListForm>
          </Form>
        )
        : <Alert variant='danger'>Chapter {chapterId} not found.</Alert>
      }
    </AppContent>
  )
}

class ChapterController extends Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.text
    }
  }

  handleChange = text => {
    this.setState({
      text: text
    })
  }

  render () {
    return <ChapterView
      text={this.state.text}
      chapterId={decodeURIComponent(this.props.match.params.chapter)}
      onChange={this.handleChange}
    />
  }
}

export default withData(
  ({ data, ...props }) => <ChapterController
    text={data}
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
