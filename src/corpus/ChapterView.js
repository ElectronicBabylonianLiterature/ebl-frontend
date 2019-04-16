import React, { Component } from 'react'
import { is } from 'immutable'
import { Alert, Badge } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import ChapterForm from './ChapterForm'
import ChapterNavigation from './ChapterNavigation'

function textChanged (prevProps, props) {
  return prevProps.match.params.category !== props.match.params.category ||
    prevProps.match.params.index !== props.match.params.index
}

function chapterChanged (prevProps, props) {
  return !is(prevProps.text, props.text) ||
    prevProps.match.params.stage !== props.match.params.stage ||
    prevProps.match.params.name !== props.match.params.name
}

function ChapterTitle ({ text, stage, name }) {
  return <>
    <ReactMarkdown source={text.name} disallowedTypes={['paragraph']} unwrapDisallowed /> {stage} {name}
  </>
}

function ChapterView ({ text, stage, name, onChange, onSubmit, searchBibliography, disabled }) {
  const [chapterIndex, chapter] = text.chapters.findEntry(chapter => chapter.stage === stage && chapter.name === name) || [-1, null]
  const title = <ChapterTitle text={text} stage={stage} name={name} />
  const handleChange = chapter => onChange(text.setIn(['chapters', chapterIndex], chapter))
  return (
    <AppContent crumbs={['Corpus', title]} title={<>Edit {title} <small><Badge variant='warning'>Beta</Badge></small></>}>
      <ChapterNavigation text={text} />
      {chapter
        ? <ChapterForm chapter={chapter} disabled={disabled} searchBibliography={searchBibliography} onChange={handleChange} onSubmit={onSubmit} />
        : (stage !== '' && name !== '') && <Alert variant='danger'>Chapter {title} not found.</Alert>
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
    return chapterChanged(prevProps, props)
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
    shouldUpdate: textChanged
  }
)
