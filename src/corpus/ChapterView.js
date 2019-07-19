import React, { Component } from 'react'
import { is } from 'immutable'
import { Alert } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import ChapterEditor from './ChapterEditor'
import ChapterNavigation from './ChapterNavigation'
import { produce } from 'immer'

function textChanged(prevProps, props) {
  return (
    prevProps.match.params.category !== props.match.params.category ||
    prevProps.match.params.index !== props.match.params.index
  )
}

function chapterChanged(prevProps, props) {
  return (
    !is(prevProps.text, props.text) ||
    prevProps.match.params.stage !== props.match.params.stage ||
    prevProps.match.params.name !== props.match.params.name
  )
}

function ChapterTitle({ text, stage, name }) {
  return (
    <>
      <ReactMarkdown
        source={text.name}
        disallowedTypes={['paragraph']}
        unwrapDisallowed
      />{' '}
      {stage} {name}
    </>
  )
}

function ChapterView({
  text,
  stage,
  name,
  onChange,
  onSaveLines,
  onSaveAlignment,
  onSaveManuscripts,
  searchBibliography,
  disabled
}) {
  const chapterIndex = text.chapters.findIndex(
    chapter => chapter.stage === stage && chapter.name === name
  )
  const title = <ChapterTitle text={text} stage={stage} name={name} />
  const handleChange = chapter =>
    onChange(
      produce(text, draft => {
        draft.chapters[chapterIndex] = chapter
      })
    )
  return (
    <AppContent crumbs={['Corpus', title]} title={<>Edit {title}</>}>
      <ChapterNavigation text={text} />
      {chapterIndex >= 0 ? (
        <ChapterEditor
          chapter={text.chapters[chapterIndex]}
          disabled={disabled}
          searchBibliography={searchBibliography}
          onChange={handleChange}
          onSaveLines={onSaveLines(chapterIndex)}
          onSaveManuscripts={onSaveManuscripts(chapterIndex)}
          onSaveAlignment={onSaveAlignment(chapterIndex)}
        />
      ) : (
        stage !== '' &&
        name !== '' && (
          <Alert variant="danger">Chapter {title} not found.</Alert>
        )
      )}
    </AppContent>
  )
}

class ChapterController extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: props.text,
      saving: false,
      error: null
    }
    this.updatePromise = Promise.resolve()
  }

  shouldUpdate(prevProps, props) {
    return chapterChanged(prevProps, props)
  }

  componentWillUnmount() {
    this.updatePromise.cancel()
  }

  setText = text => {
    this.setState(
      produce(state => {
        state.text = text
      })
    )
  }

  setStateUpdating = () => {
    this.updatePromise.cancel()
    this.setState(
      produce(state => {
        state.saving = true
        state.error = null
      })
    )
  }

  setStateError = error =>
    this.setState(
      produce(state => {
        state.saving = false
        state.error = error
      })
    )

  setStateUpdated = updatedText =>
    this.setState({
      text: updatedText,
      saving: false,
      error: null
    })

  updateAlignment = chapterIndex => () => {
    this.setStateUpdating()
    this.updatePromise = this.props.textService
      .updateAlignment(
        this.props.text.category,
        this.props.text.index,
        chapterIndex,
        this.state.text
      )
      .then(this.setStateUpdated)
      .catch(this.setStateError)
  }

  updateManuscripts = chapterIndex => () => {
    this.setStateUpdating()
    this.updatePromise = this.props.textService
      .updateManuscripts(
        this.props.text.category,
        this.props.text.index,
        chapterIndex,
        this.state.text
      )
      .then(this.setStateUpdated)
      .catch(this.setStateError)
  }

  updateLines = chapterIndex => () => {
    this.setStateUpdating()
    this.updatePromise = this.props.textService
      .updateLines(
        this.props.text.category,
        this.props.text.index,
        chapterIndex,
        this.state.text
      )
      .then(this.setStateUpdated)
      .catch(this.setStateError)
  }

  render() {
    return (
      <>
        <ChapterView
          text={this.state.text}
          stage={decodeURIComponent(this.props.match.params.stage || '')}
          name={decodeURIComponent(this.props.match.params.chapter || '')}
          onChange={this.setText}
          onSaveManuscripts={this.updateManuscripts}
          onSaveLines={this.updateLines}
          onSaveAlignment={this.updateAlignment}
          searchBibliography={query =>
            this.props.bibliographyService.search(query)
          }
          disabled={this.state.saving}
        />
        <Spinner loading={this.state.saving}>Saving...</Spinner>
        <ErrorAlert error={this.state.error} />
      </>
    )
  }
}

export default withData(
  ({ data, ...props }) => <ChapterController text={data} {...props} />,
  ({ match, textService }) => {
    const category = decodeURIComponent(match.params.category)
    const index = decodeURIComponent(match.params.index)
    return textService.find(category, index)
  },
  {
    shouldUpdate: textChanged
  }
)
