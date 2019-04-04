import React, { Component } from 'react'
import { Form, Button, Col, Alert, Badge, Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'
import withData from 'http/withData'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import { Manuscript, periods, provenances, types } from './text'

function DetailsRow ({ chapter }) {
  return (
    <Form.Row>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Classification</Form.Label>
        <Form.Control plaintext readOnly value={chapter.classification} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Stage</Form.Label>
        <Form.Control plaintext readOnly value={chapter.stage} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Name</Form.Label>
        <Form.Control plaintext readOnly value={chapter.name} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Order</Form.Label>
        <Form.Control plaintext readOnly value={chapter.order} />
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

function ChapterView ({ text, stage, name, onChange, onSubmit, disabled }) {
  const [chapterIndex, chapter] = text.chapters.findEntry(chapter => chapter.stage === stage && chapter.name === name) || [-1, null]
  const chapterId = `${text.name} ${stage} ${name}`
  const handeManuscriptsChange = manuscripts => onChange(text.setIn(['chapters', chapterIndex, 'manuscripts'], manuscripts))
  return (
    <AppContent crumbs={['Corpus', chapterId]} title={<>Edit {chapterId} <small><Badge variant='warning'>Beta</Badge></small></>}>
      <Nav variant='tabs'>
        {text.chapters.map((chapter, index) =>
          <Nav.Item key={index}>
            <LinkContainer to={`/corpus/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}>
              <Nav.Link>{chapter.stage} {chapter.name}</Nav.Link>
            </LinkContainer>
          </Nav.Item>
        )}
      </Nav>
      {chapter
        ? (
          <Form onSubmit={onSubmit}>
            <fieldset disabled={disabled}>
              <DetailsRow chapter={chapter} />
              <ListForm label='Manuscripts' noun='manuscript' default={Manuscript()} value={chapter.manuscripts} onChange={handeManuscriptsChange}>
                {chapter.manuscripts.map((manuscript, index) =>
                  <ManuscriptForm key={index} manuscript={manuscript} />
                )}
              </ListForm>
              <Button variant='primary' type='submit'>Save</Button>
            </fieldset>
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
      text: props.text,
      saving: false,
      error: null
    }
    this.updatePromise = Promise.resolve()
  }

  shouldUpdate (prevProps, props) {
    return !_.isEqual(prevProps.match.params, props.match.params)
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
  }

  handleChange = text => {
    this.setState({
      ...this.state,
      text: text
    })
  }

  submit = event => {
    event.preventDefault()
    this.updatePromise.cancel()
    this.setState({
      ...this.state,
      saving: true,
      error: null
    })
    this.updatePromise = this.props.textService.update(
      this.props.text.category,
      this.props.text.index,
      this.state.text
    ).then(updatedText => this.setState({
      text: updatedText,
      saving: false,
      error: null
    })).catch(error => this.setState({
      saving: false,
      error: error
    }))
  }

  render () {
    return <>
      <ChapterView
        text={this.state.text}
        stage={decodeURIComponent(this.props.match.params.stage)}
        name={decodeURIComponent(this.props.match.params.chapter)}
        onChange={this.handleChange}
        onSubmit={this.submit}
        disabled={this.state.saving}
      />
      <Spinner loading={this.state.saving}>Saving...</Spinner>
      <ErrorAlert error={this.state.error} />
    </>
  }
}

export default withData(
  ({ data, ...props }) => <ChapterController
    text={data}
    {...props}
  />,
  ({ match, textService }) => {
    const category = decodeURIComponent(match.params.category)
    const index = decodeURIComponent(match.params.index)
    return textService.find(category, index)
  },
  {
    shouldUpdate: (prevProps, props) => prevProps.match.params.category !== props.match.params.category || prevProps.match.params.index !== props.match.params.index
  }
)
