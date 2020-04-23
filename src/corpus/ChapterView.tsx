import React, { useState } from 'react'
import { Alert } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import InlineMarkdown from 'common/InlineMarkdown'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import ChapterEditor from './ChapterEditor'
import ChapterNavigation from './ChapterNavigation'
import usePromiseEffect from 'common/usePromiseEffect'
import { Text, Chapter } from './text'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { BibliographySearch } from 'bibliography/application/BibliographyService'

function ChapterTitle({
  text,
  chapter
}: {
  text: Text
  chapter: Chapter
}): JSX.Element {
  return (
    <>
      <InlineMarkdown source={text.name} />{' '}
      {chapter && `${chapter.stage} ${chapter.name}`}
    </>
  )
}
interface Props {
  text: Text
  chapterIndex: number
  textService
  bibliographyService: BibliographySearch
}
function ChapterView({
  text,
  chapterIndex,
  textService,
  bibliographyService
}: Props): JSX.Element {
  const [chapter, setChapter] = useState(text.chapters[chapterIndex])
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [setUpdatePromise, cancelUpdatePromise] = usePromiseEffect<void>()

  const setStateUpdating = (): void => {
    setIsSaving(true)
    setError(null)
  }

  const setStateError = (error: Error): void => {
    setIsSaving(false)
    setError(error)
  }

  const setStateUpdated = (updatedText: Text): void => {
    setChapter(updatedText.chapters[chapterIndex])
    setIsSaving(false)
    setIsDirty(false)
    setError(null)
  }

  const update = (updater: () => Promise<Text>): void => {
    cancelUpdatePromise()
    setStateUpdating()
    setUpdatePromise(
      updater()
        .then(setStateUpdated)
        .catch(setStateError)
    )
  }

  const updateAlignment = (): void => {
    update(() =>
      textService.updateAlignment(
        text.category,
        text.index,
        chapterIndex,
        chapter.lines
      )
    )
  }

  const updateManuscripts = (): void => {
    update(() =>
      textService.updateManuscripts(
        text.category,
        text.index,
        chapterIndex,
        chapter.manuscripts
      )
    )
  }

  const updateLines = (): void => {
    update(() =>
      textService.updateLines(
        text.category,
        text.index,
        chapterIndex,
        chapter.lines
      )
    )
  }

  const handleChange = (chapter: Chapter): void => {
    setChapter(chapter)
    setIsDirty(true)
  }
  const title = <ChapterTitle text={text} chapter={chapter} />

  return (
    <AppContent
      crumbs={[new SectionCrumb('Corpus'), new TextCrumb(title)]}
      title={<>Edit {title}</>}
    >
      <ChapterNavigation text={text} />
      {chapter ? (
        <ChapterEditor
          chapter={chapter}
          disabled={isSaving}
          dirty={isDirty}
          searchBibliography={(
            query: string
          ): Promise<readonly BibliographyEntry[]> =>
            bibliographyService.search(query)
          }
          onChange={handleChange}
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

export default withData<
  {
    stage: string
    name: string
    textService
    bibliographyService: BibliographySearch
  },
  { category: string; index: string },
  Text
>(
  ({ data, stage, name, ...props }) => (
    <ChapterView
      text={data}
      chapterIndex={data.findChapterIndex(stage, name)}
      {...props}
    />
  ),
  ({ category, index, textService }) => textService.find(category, index),
  {
    watch: props => [props.stage, props.name]
  }
)
