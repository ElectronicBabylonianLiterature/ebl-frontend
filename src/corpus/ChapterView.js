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
  const [chapter, setChapter] = useState(text.chapters[chapterIndex])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const updateRef = useRef()
  useEffect(() => {
    updateRef.current = Promise.resolve()
    return () => {
      updateRef.current.cancel()
    }
  }, [text])

  const setStateUpdating = () => {
    setIsSaving(true)
    setError(null)
  }

  const setStateError = error => {
    setIsSaving(false)
    setError(error)
  }

  const setStateUpdated = updatedText => {
    setChapter(updatedText.chapters[chapterIndex])
    setIsSaving(false)
    setError(null)
  }

  const update = updater => {
    updateRef.current.cancel()
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
        chapter.lines
      )
    )
  }

  const updateManuscripts = () => {
    update(() =>
      textService.updateManuscripts(
        text.category,
        text.index,
        chapterIndex,
        chapter.manuscripts
      )
    )
  }

  const updateLines = () => {
    update(() =>
      textService.updateLines(
        text.category,
        text.index,
        chapterIndex,
        chapter.lines
      )
    )
  }
  const title = <ChapterTitle text={text} chapter={chapter} />

  return (
    <AppContent crumbs={['Corpus', title]} title={<>Edit {title}</>}>
      <ChapterNavigation text={text} />
      {chapter ? (
        <ChapterEditor
          chapter={chapter}
          disabled={isSaving}
          searchBibliography={query => bibliographyService.search(query)}
          onChange={setChapter}
          onSaveLines={updateLines}
          onSaveManuscripts={updateManuscripts}
          onSaveAlignment={updateAlignment}
        />
      ) : (
        <Alert variant="danger">Chapter not found.</Alert>
      )}
      <Spinner loading={isSaving}>Saving...</Spinner>
      <ErrorAlert error={error} />
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
