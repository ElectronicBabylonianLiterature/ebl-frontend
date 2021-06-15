import React, { useState } from 'react'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import InlineMarkdown from 'common/InlineMarkdown'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import ChapterEditor from './ChapterEditor'
import ChapterNavigation from './ChapterNavigation'
import usePromiseEffect from 'common/usePromiseEffect'
import { Text, Chapter } from 'corpus/domain/text'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { BibliographySearch } from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { ChapterAlignment } from 'corpus/domain/alignment'

function ChapterTitle({
  text,
  chapter,
}: {
  text: Text
  chapter: Chapter
}): JSX.Element {
  return (
    <>
      <InlineMarkdown source={text.name} /> {chapter.stage} {chapter.name}
    </>
  )
}
interface Props {
  text: Text
  chapter: Chapter
  textService: TextService
  bibliographyService: BibliographySearch
  fragmentService: FragmentService
}
function ChapterView({
  text,
  chapter,
  textService,
  bibliographyService,
  fragmentService,
}: Props): JSX.Element {
  const [currentChapter, setChapter] = useState(chapter)
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

  const setStateUpdated = (updatedChapter: Chapter): void => {
    setChapter(updatedChapter)
    setIsSaving(false)
    setIsDirty(false)
    setError(null)
  }

  const update = (updater: () => Promise<Chapter>): void => {
    cancelUpdatePromise()
    setStateUpdating()
    setUpdatePromise(updater().then(setStateUpdated).catch(setStateError))
  }

  const updateAlignment = (alignment: ChapterAlignment): void => {
    update(() =>
      textService.updateAlignment(
        currentChapter.textId.genre,
        currentChapter.textId.category,
        currentChapter.textId.index,
        currentChapter.stage,
        currentChapter.name,
        alignment
      )
    )
  }

  const updateManuscripts = (): void => {
    update(() =>
      textService.updateManuscripts(
        currentChapter.textId.genre,
        currentChapter.textId.category,
        currentChapter.textId.index,
        currentChapter.stage,
        currentChapter.name,
        currentChapter.manuscripts,
        currentChapter.uncertainFragments
      )
    )
  }

  const updateLines = (): void => {
    update(() =>
      textService.updateLines(
        currentChapter.textId.genre,
        currentChapter.textId.category,
        currentChapter.textId.index,
        currentChapter.stage,
        currentChapter.name,
        currentChapter.lines
      )
    )
  }

  const updateLemmatization = (lemmatization: ChapterLemmatization): void => {
    update(() =>
      textService.updateLemmatization(
        currentChapter.textId.genre,
        currentChapter.textId.category,
        currentChapter.textId.index,
        currentChapter.stage,
        currentChapter.name,
        lemmatization
      )
    )
  }

  const importChapter = (atf: string): void => {
    update(() =>
      textService.importChapter(
        currentChapter.textId.genre,
        currentChapter.textId.category,
        currentChapter.textId.index,
        currentChapter.stage,
        currentChapter.name,
        atf
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
      <ChapterEditor
        chapter={currentChapter}
        disabled={isSaving}
        dirty={isDirty}
        searchBibliography={(
          query: string
        ): Promise<readonly BibliographyEntry[]> =>
          bibliographyService.search(query)
        }
        fragmentService={fragmentService}
        textService={textService}
        onChange={handleChange}
        onSaveLines={updateLines}
        onSaveManuscripts={updateManuscripts}
        onSaveAlignment={updateAlignment}
        onSaveLemmatization={updateLemmatization}
        onImport={importChapter}
      />
      <Spinner loading={isSaving}>Saving...</Spinner>
      <ErrorAlert error={error} />
    </AppContent>
  )
}

export default withData<
  {
    genre: string
    category: string
    index: string
    stage: string
    name: string
    textService
    bibliographyService: BibliographySearch
    fragmentService: FragmentService
    wordService: WordService
  },
  { genre: string; category: string; index: string },
  [Text, Chapter]
>(
  ({ data, ...props }) => (
    <ChapterView text={data[0]} chapter={data[1]} {...props} />
  ),
  ({ genre, category, index, stage, name, textService }) =>
    Promise.all([
      textService.find(genre, category, index),
      textService.findChapter(genre, category, index, stage, name),
    ]),
  {
    watch: (props) => [
      props.genre,
      props.category,
      props.index,
      props.stage,
      props.name,
    ],
  }
)
