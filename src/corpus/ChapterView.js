import React, { Component } from 'react'
import { Form, Button, Col, Alert, Badge } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import _ from 'lodash'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import ListForm from 'common/List'
import withData from 'http/withData'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import { Manuscript } from './text'
import ManuscriptForm from './ManuscriptForm'
import ChapterNavigation from './ChapterNavigation'

function ChapterDetails ({ chapter }) {
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
        <Form.Label>Version</Form.Label>
        <Form.Control plaintext readOnly value={chapter.version} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Name</Form.Label>
        <Form.Control plaintext readOnly value={chapter.name} />
      </Form.Group>
    </Form.Row>
  )
}

function ChapterManuscripts ({ chapter, onChange, searchBibliography }) {
  const handeManuscriptsChange = manuscripts => onChange(chapter.set('manuscripts', manuscripts))
  return <ListForm label='Manuscripts' noun='manuscript' default={Manuscript()} value={chapter.manuscripts} onChange={handeManuscriptsChange}>
    {chapter.manuscripts.map((manuscript, index) =>
      <ManuscriptForm key={index} manuscript={manuscript} searchBibliography={searchBibliography} />
    )}
  </ListForm>
}

function ChapterView ({ text, stage, name, onChange, onSubmit, searchBibliography, disabled }) {
  const [chapterIndex, chapter] = text.chapters.findEntry(chapter => chapter.stage === stage && chapter.name === name) || [-1, null]
  const chapterId = <><ReactMarkdown source={text.name} disallowedTypes={['paragraph']} unwrapDisallowed /> {stage} {name}</>
  const handleChange = chapter => onChange(text.setIn(['chapters', chapterIndex], chapter))
  return (
    <AppContent crumbs={['Corpus', chapterId]} title={<>Edit {chapterId} <small><Badge variant='warning'>Beta</Badge></small></>}>
      <ChapterNavigation text={text} />
      {chapter
        ? (
          <Form onSubmit={onSubmit}>
            <fieldset disabled={disabled}>
              <ChapterDetails chapter={chapter} />
              <ChapterManuscripts chapter={chapter} searchBibliography={searchBibliography} onChange={handleChange} />
              <Button variant='primary' type='submit'>Save</Button>
            </fieldset>
          </Form>
        )
        : (stage !== '' && name !== '') && <Alert variant='danger'>Chapter {chapterId} not found.</Alert>
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
        stage={decodeURIComponent(this.props.match.params.stage || '')}
        name={decodeURIComponent(this.props.match.params.chapter || '')}
        onChange={this.handleChange}
        onSubmit={this.submit}
        searchBibliography={query => this.props.bibliographyService.search(query)}
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
