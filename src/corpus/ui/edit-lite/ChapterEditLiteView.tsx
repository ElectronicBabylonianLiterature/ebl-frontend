import React, { useContext, useEffect, useMemo } from 'react'
import { Alert } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import { BibliographySearch } from 'bibliography/application/BibliographyService'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import { createChapterUrl } from 'corpus/application/chapterUrls'
import {
  createChapterEditSource,
  LoadedChapterEditSource,
} from 'corpus/application/edit-lite/createChapterEditSource'
import TextService from 'corpus/application/TextService'
import { Text } from 'corpus/domain/text'
import ChapterCrumb from 'corpus/ui/ChapterCrumb'
import CorpusTextCrumb from 'corpus/ui/CorpusTextCrumb'
import { parseEditLiteParameters } from 'corpus/ui/edit-lite/editLiteParameters'
import EditLiteTabs from 'corpus/ui/edit-lite/EditLiteTabs'
import { findInitialLine } from 'corpus/ui/edit-lite/lineIndex'
import { hasUnsavedChanges } from 'corpus/ui/edit-lite/lineStates'
import useEditLite from 'corpus/ui/edit-lite/useEditLite'
import GenreCrumb from 'corpus/ui/GenreCrumb'
import FragmentService from 'fragmentarium/application/FragmentService'
import { runBeforeUnloadEvent } from 'fragmentarium/ui/edition/beforeUnloadWarning'
import withData from 'http/withData'
import { ChapterId } from 'transliteration/domain/chapter-id'
import 'corpus/ui/edit-lite/ChapterEditLiteView.sass'

interface Props {
  readonly id: ChapterId
  readonly textService: TextService
  readonly fragmentService: FragmentService
  readonly bibliographyService: BibliographySearch
  readonly search: string
}

interface SessionProps {
  readonly canWrite: boolean
}

interface EditLiteData extends LoadedChapterEditSource, SessionProps {
  readonly text: Text
}

type ViewProps = Props & { readonly data: EditLiteData }

export const readOnlyNotice =
  'Editing needs permission to edit texts, so this page is read-only.'

function EditLiteView({
  data: { text, source, outline, canWrite },
  id,
  textService,
  fragmentService,
  bibliographyService,
  search,
}: ViewProps): JSX.Element {
  const { state, context } = useEditLite(source, outline, canWrite)
  const lines = state.outline.lines
  const initialLine = useMemo<number | undefined>(
    () => findInitialLine(lines, parseEditLiteParameters(search).line),
    [lines, search],
  )
  const hasUnsaved = hasUnsavedChanges(state)

  useEffect(
    () => runBeforeUnloadEvent({ hasChanges: (): boolean => hasUnsaved }),
    [hasUnsaved],
  )

  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(text.genre),
        CorpusTextCrumb.ofText(text),
        new ChapterCrumb(id),
        new TextCrumb('Edit'),
      ]}
      breadcrumbsFullWidth={false}
      title={
        <>
          Edit <InlineMarkdown source={text.name} /> {id.stage} {id.name}
        </>
      }
    >
      <div className="chapter-edit-view ebl-consistent-links">
        {!canWrite && (
          <Alert variant="info" className="chapter-edit-view__notice">
            {readOnlyNotice}
          </Alert>
        )}
        <EditLiteTabs
          id={id}
          text={text}
          state={state}
          context={context}
          initialLine={initialLine}
          textService={textService}
          fragmentService={fragmentService}
          bibliographyService={bibliographyService}
        />
      </div>
    </AppContent>
  )
}

async function loadEditLiteData(
  { id, textService, canWrite }: Props & SessionProps,
  signal: AbortSignal,
): Promise<EditLiteData> {
  const [text, loadedSource] = await Promise.all([
    textService.find(id.textId, signal),
    createChapterEditSource({ textService, id, canWrite, signal }),
  ])
  return { text, canWrite, ...loadedSource }
}

const LoadedEditLiteView = withData<Props, SessionProps, EditLiteData>(
  EditLiteView,
  loadEditLiteData,
  { watch: (props) => [createChapterUrl(props.id)] },
)

export default function ChapterEditLiteView(props: Props): JSX.Element {
  const session = useContext(SessionContext)
  return (
    <LoadedEditLiteView {...props} canWrite={session.isAllowedToWriteTexts()} />
  )
}
