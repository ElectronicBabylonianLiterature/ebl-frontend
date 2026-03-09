import React, { useState } from 'react'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import InlineMarkdown from 'common/InlineMarkdown'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import ChapterEditor from './ChapterEditor'
import ChapterNavigation from './ChapterNavigation'
import usePromiseEffect from 'common/usePromiseEffect'
import { Text } from 'corpus/domain/text'
import { Chapter } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { BibliographySearch } from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { ChapterAlignment } from 'corpus/domain/alignment'
import CorpusTextCrumb from './CorpusTextCrumb'
import GenreCrumb from './GenreCrumb'
import ChapterCrumb from './ChapterCrumb'

function EditChapterTitle({
  text,
  chapter,
}: {
  text: Text
  chapter: Chapter
}): JSX.Element {
  return (
    <>
      Edit <InlineMarkdown source={text.name} /> {chapter.stage} {chapter.name}
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

function ChapterEditView({
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
    update(() => textService.updateAlignment(chapter.id, alignment))
  }

  const updateManuscripts = (): void => {
    update(() =>
      textService.updateManuscripts(
        chapter.id,
        currentChapter.manuscripts,
        currentChapter.uncertainFragments,
      ),
    )
  }

  const updateLines = (): void => {
    update(() => textService.updateLines(chapter.id, currentChapter.lines))
  }

  const updateLemmatization = (lemmatization: ChapterLemmatization): void => {
    update(() => textService.updateLemmatization(chapter.id, lemmatization))
  }

  const importChapter = (atf: string): void => {
    update(() => textService.importChapter(chapter.id, atf))
  }

  const handleChange = (chapter: Chapter): void => {
    setChapter(chapter)
    setIsDirty(true)
  }

  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(text.genre),
        CorpusTextCrumb.ofText(text),
        new ChapterCrumb(chapter.id),
        new TextCrumb('Edit'),
      ]}
      title={<EditChapterTitle text={text} chapter={chapter} />}
    >
      <ChapterNavigation text={text} />
      <ChapterEditor
        chapter={currentChapter}
        disabled={isSaving}
        dirty={isDirty}
        searchBibliography={(
          query: string,
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
    textService
    bibliographyService: BibliographySearch
    fragmentService: FragmentService
    wordService: WordService
  },
  { id: ChapterId },
  [Text, Chapter]
>(
  ({ data: [text, chapter], ...props }) => (
    <ChapterEditView text={text} chapter={chapter} {...props} />
  ),
  ({ id, textService }) =>
    Promise.all([textService.find(id.textId), textService.findChapter(id)]),
  {
    watch: (props) => [props.id],
  },
)
