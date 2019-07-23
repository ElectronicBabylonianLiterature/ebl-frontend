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

  const update = updater => {
    setStateUpdating()
    updateRef.current = updater()
      .then(setStateUpdated)
      .catch(setStateError)
  }

  const updateAlignment = () => {
    update(() =>
      textService.updateAlignment(
        text.category,
        text.index,
        chapterIndex,
        state.text
      )
    )
  }

  const updateManuscripts = () => {
    update(() =>
      textService.updateManuscripts(
        text.category,
        text.index,
        chapterIndex,
        state.text
      )
    )
  }

  const updateLines = () => {
    update(() =>
      textService.updateLines(
        text.category,
        text.index,
        chapterIndex,
        state.text
      )
    )
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
          onSaveLines={updateLines}
          onSaveManuscripts={updateManuscripts}
          onSaveAlignment={updateAlignment}
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
  ({ data, stage, name, ...props }) => (
    <ChapterView
      text={data}
      chapterIndex={data.findChapterIndex(stage, name)}
      {...props}
    />
  ),
  ({ category, index, textService }) => textService.find(category, index)
)
