import React, { useState, useRef, useEffect } from 'react'
import { Alert } from 'react-bootstrap'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import InlineMarkdown from 'common/InlineMarkdown'
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

function ChapterTitle({ text, chapter }) {
  return (
    <>
      <InlineMarkdown source={text.name} />{' '}
      {chapter && `${chapter.stage} ${chapter.name}`}
    </>
  )
}

function ChapterView({ text, chapterIndex, textService, bibliographyService }) {
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
  const chapter = state.text.chapters[chapterIndex]
  const title = <ChapterTitle text={text} chapter={chapter} />
  const handleChange = chapter =>
    setState(
      produce(state, draft => {
        draft.text.chapters[chapterIndex] = chapter
      })
    )
  return (
    <AppContent crumbs={['Corpus', title]} title={<>Edit {title}</>}>
      <ChapterNavigation text={text} />
      {chapter ? (
        <ChapterEditor
          chapter={chapter}
          disabled={state.saving}
          searchBibliography={query => bibliographyService.search(query)}
          onChange={handleChange}
          onSaveLines={updateLines(chapterIndex)}
          onSaveManuscripts={updateManuscripts(chapterIndex)}
          onSaveAlignment={updateAlignment(chapterIndex)}
        />
      ) : (
        <Alert variant="danger">Chapter not found.</Alert>
      )}
      <Spinner loading={state.saving}>Saving...</Spinner>
      <ErrorAlert error={state.error} />
    </AppContent>
  )
}

export default withData(
  ({ data, match, ...props }) => {
    const stage = decodeURIComponent(match.params.stage)
    const name = decodeURIComponent(match.params.chapter)
    return (
      <ChapterView
        text={data}
        chapterIndex={data.findChapterIndex(stage, name)}
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
