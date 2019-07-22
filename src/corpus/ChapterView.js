import React, { useState, useRef, useEffect } from 'react'
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
  chapterIndex,
  textService,
  bibliographyService
}) {
  const [state, setState] = useState({
    text: text,
    saving: false,
    error: null
  })

  const updateRef = useRef()
  useEffect(() => {
    updateRef.current = Promise.resolve()
    return () => {
      updateRef.current.cancel()
    }
  }, [text])

  const setStateUpdating = () => {
    updateRef.current.cancel()
    setState(
      produce(state => {
        state.saving = true
        state.error = null
      })
    )
  }

  const setStateError = error =>
    setState(
      produce(state => {
        state.saving = false
        state.error = error
      })
    )

  const setStateUpdated = updatedText =>
    setState({
      text: updatedText,
      saving: false,
      error: null
    })

  const updateAlignment = chapterIndex => () => {
    setStateUpdating()
    updateRef.current = textService
      .updateAlignment(text.category, text.index, chapterIndex, state.text)
      .then(setStateUpdated)
      .catch(setStateError)
  }

  const updateManuscripts = chapterIndex => () => {
    setStateUpdating()
    updateRef.current = textService
      .updateManuscripts(text.category, text.index, chapterIndex, state.text)
      .then(setStateUpdated)
      .catch(setStateError)
  }

  const updateLines = chapterIndex => () => {
    setStateUpdating()
    updateRef.current = textService
      .updateLines(text.category, text.index, chapterIndex, state.text)
      .then(setStateUpdated)
      .catch(setStateError)
  }

  const title = <ChapterTitle text={text} stage={stage} name={name} />
  const handleChange = chapter =>
    setState(
      produce(state, draft => {
        draft.text.chapters[chapterIndex] = chapter
      })
    )
  return (
    <AppContent crumbs={['Corpus', title]} title={<>Edit {title}</>}>
      <ChapterNavigation text={text} />
      {chapterIndex >= 0 ? (
        <ChapterEditor
          chapter={state.text.chapters[chapterIndex]}
          disabled={state.saving}
          searchBibliography={query => bibliographyService.search(query)}
          onChange={handleChange}
          onSaveLines={updateLines(chapterIndex)}
          onSaveManuscripts={updateManuscripts(chapterIndex)}
          onSaveAlignment={updateAlignment(chapterIndex)}
        />
      ) : (
        stage !== '' &&
        name !== '' && (
          <Alert variant="danger">Chapter {title} not found.</Alert>
        )
      )}
      <Spinner loading={state.saving}>Saving...</Spinner>
      <ErrorAlert error={state.error} />
    </AppContent>
  )
}

export default withData(
  ({ data, match, ...props }) => {
    const stage = decodeURIComponent(match.params.stage || '')
    const name = decodeURIComponent(match.params.chapter || '')
    const chapterIndex = data.chapters.findIndex(
      chapter => chapter.stage === stage && chapter.name === name
    )
    return (
      <ChapterView
        text={data}
        stage={stage}
        name={name}
        chapterIndex={chapterIndex}
        {...props}
      />
    )
  },
  ({ match, textService }) => {
    const category = decodeURIComponent(match.params.category)
    const index = decodeURIComponent(match.params.index)
    return textService.find(category, index)
  },
  {
    shouldUpdate: textChanged
  }
)
