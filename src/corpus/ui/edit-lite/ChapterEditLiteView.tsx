import React, { useContext, useEffect, useMemo } from 'react'
import { Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import { BibliographySearch } from 'bibliography/application/BibliographyService'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import { createChapterUrl } from 'corpus/application/chapterUrls'
import { ChapterEditSourceKind } from 'corpus/application/edit-lite/ChapterEditSource'
import {
  createChapterEditSource,
  LoadedChapterEditSource,
} from 'corpus/application/edit-lite/createChapterEditSource'
import TextService from 'corpus/application/TextService'
import { Text } from 'corpus/domain/text'
import ChapterCrumb from 'corpus/ui/ChapterCrumb'
import CorpusTextCrumb from 'corpus/ui/CorpusTextCrumb'
import { parseEditLiteParameters } from 'corpus/ui/edit-lite/editLiteParameters'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import EditLiteTabs from 'corpus/ui/edit-lite/EditLiteTabs'
import { findInitialLine } from 'corpus/ui/edit-lite/lineIndex'
import { hasUnsavedChanges } from 'corpus/ui/edit-lite/lineStates'
import PerformanceReadout from 'corpus/ui/edit-lite/PerformanceReadout'
import useEditLite from 'corpus/ui/edit-lite/useEditLite'
import GenreCrumb from 'corpus/ui/GenreCrumb'
import FragmentService from 'fragmentarium/application/FragmentService'
import { runBeforeUnloadEvent } from 'fragmentarium/ui/edition/beforeUnloadWarning'
import withData from 'http/withData'
import { ChapterId } from 'transliteration/domain/chapter-id'
import 'corpus/ui/ChapterEditView.sass'
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
  readonly loadMilliseconds: number
}

type ViewProps = Props & { readonly data: EditLiteData }

export const previewNotice =
  'This is a preview of a lighter chapter editor that loads lines on demand.'
export const legacyNotice =
  'The data comes from the existing endpoints, so saving is a dry run that only shows the request.'
export const readOnlyNotice =
  'Editing needs permission to edit texts, so this page is read-only.'

function findSourceNotice(
  kind: ChapterEditSourceKind,
  canWrite: boolean,
): string | null {
  if (!canWrite) {
    return readOnlyNotice
  }
  return kind === 'legacy' ? legacyNotice : null
}

function countSettledLines(state: EditLiteState): number {
  return Object.values(state.lines).filter(
    (lineState) => lineState.status !== 'loading',
  ).length
}

function EditLiteView({
  data: { text, source, outline, loadMilliseconds, canWrite },
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
  const chapterCrumb = new ChapterCrumb(id)
  const sourceNotice = findSourceNotice(source.kind, canWrite)
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
        chapterCrumb,
        new TextCrumb('Edit (lite preview)'),
      ]}
      breadcrumbsFullWidth={false}
      title={
        <>
          Edit <InlineMarkdown source={text.name} /> {id.stage} {id.name}{' '}
          <small className="chapter-edit-lite__tag">lite preview</small>
        </>
      }
    >
      <div className="chapter-edit-view chapter-edit-lite ebl-consistent-links">
        <Alert variant="info" className="chapter-edit-lite__notice">
          {previewNotice}{' '}
          <Alert.Link as={Link} to={`${chapterCrumb.link}/edit`}>
            Open the classic edit page
          </Alert.Link>
          .{sourceNotice !== null && ` ${sourceNotice}`}
        </Alert>
        <PerformanceReadout
          recountKey={`${countSettledLines(state)}`}
          loadMilliseconds={loadMilliseconds}
          kind={source.kind}
          lineCount={lines.length}
          manuscriptCount={state.outline.manuscripts.length}
          diagnostics={source.diagnostics}
        />
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
  { id, textService, search, canWrite }: Props & SessionProps,
  signal: AbortSignal,
): Promise<EditLiteData> {
  const startedAt = performance.now()
  const [text, loadedSource] = await Promise.all([
    textService.find(id.textId, signal),
    createChapterEditSource({
      textService,
      id,
      mode: parseEditLiteParameters(search).source,
      canWrite,
      signal,
    }).then((loaded) => ({
      ...loaded,
      loadMilliseconds: performance.now() - startedAt,
    })),
  ])
  return { text, canWrite, ...loadedSource }
}

const LoadedEditLiteView = withData<Props, SessionProps, EditLiteData>(
  EditLiteView,
  loadEditLiteData,
  {
    watch: (props) => [
      createChapterUrl(props.id),
      parseEditLiteParameters(props.search).source,
    ],
  },
)

export default function ChapterEditLiteView(props: Props): JSX.Element {
  const session = useContext(SessionContext)
  return (
    <LoadedEditLiteView {...props} canWrite={session.isAllowedToWriteTexts()} />
  )
}
