import React, { useCallback, useContext, useId, useMemo } from 'react'
import { Alert, Tab, Tabs } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import { BibliographySearch } from 'bibliography/application/BibliographyService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
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
import EditLiteContext from 'corpus/ui/edit-lite/EditLiteContext'
import EditLiteManuscripts from 'corpus/ui/edit-lite/EditLiteManuscripts'
import {
  EditLiteParameters,
  parseEditLiteParameters,
} from 'corpus/ui/edit-lite/editLiteParameters'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import PerformanceReadout from 'corpus/ui/edit-lite/PerformanceReadout'
import useEditLite from 'corpus/ui/edit-lite/useEditLite'
import VariantLines from 'corpus/ui/edit-lite/VariantLines'
import VariantSwitcher from 'corpus/ui/edit-lite/VariantSwitcher'
import GenreCrumb from 'corpus/ui/GenreCrumb'
import FragmentService from 'fragmentarium/application/FragmentService'
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

interface EditLiteData extends LoadedChapterEditSource {
  readonly text: Text
  readonly loadMilliseconds: number
}

type ManuscriptsProps = Omit<Props, 'search'> & { readonly text: Text }
type ViewProps = Props & { readonly data: EditLiteData }

export const previewNotice =
  'This is a preview of a lighter chapter editor that loads lines on demand.'
export const legacyNotice =
  'The data comes from the existing endpoints, so saving is a dry run that only shows the request.'

function findUncertainFragments(
  text: Text,
  stage: string,
  name: string,
): readonly string[] {
  const chapter = text.chapters.find(
    (listing) => listing.stage === stage && listing.name === name,
  )
  return (chapter?.uncertainFragments ?? []).map(
    (fragment) => fragment.museumNumber,
  )
}

function countSettledLines(state: EditLiteState): number {
  return Object.values(state.lines).filter(
    (lineState) => lineState.status !== 'loading',
  ).length
}

const Manuscripts = React.memo(function Manuscripts({
  id,
  text,
  textService,
  fragmentService,
  bibliographyService,
}: ManuscriptsProps): JSX.Element {
  const { stage, name } = id
  const uncertainFragments = useMemo<readonly string[]>(
    () => findUncertainFragments(text, stage, name),
    [text, stage, name],
  )
  const searchBibliography = useCallback(
    (query: string): Promise<readonly BibliographyEntry[]> =>
      bibliographyService.search(query),
    [bibliographyService],
  )

  return (
    <EditLiteManuscripts
      id={id}
      uncertainFragments={uncertainFragments}
      textService={textService}
      fragmentService={fragmentService}
      searchBibliography={searchBibliography}
    />
  )
})

function EditLiteView({
  data: { text, source, outline, loadMilliseconds },
  id,
  textService,
  fragmentService,
  bibliographyService,
  search,
}: ViewProps): JSX.Element {
  const tabsId = useId()
  const { state, context } = useEditLite(source, outline)
  const parameters = useMemo<EditLiteParameters>(
    () => parseEditLiteParameters(search),
    [search],
  )
  const chapterCrumb = new ChapterCrumb(id)

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
          .{source.kind === 'legacy' && ` ${legacyNotice}`}
        </Alert>
        <VariantSwitcher variant={parameters.variant} search={search} />
        <PerformanceReadout
          recountKey={`${parameters.variant}:${countSettledLines(state)}`}
          loadMilliseconds={loadMilliseconds}
          kind={source.kind}
          lineCount={state.outline.lines.length}
          manuscriptCount={state.outline.manuscripts.length}
          diagnostics={source.diagnostics}
        />
        <Tabs
          defaultActiveKey="lines"
          id={tabsId}
          mountOnEnter
          transition={false}
        >
          <Tab eventKey="lines" title="Lines">
            <EditLiteContext.Provider value={context}>
              <VariantLines state={state} parameters={parameters} />
            </EditLiteContext.Provider>
          </Tab>
          <Tab eventKey="manuscripts" title="Manuscripts">
            <Manuscripts
              id={id}
              text={text}
              textService={textService}
              fragmentService={fragmentService}
              bibliographyService={bibliographyService}
            />
          </Tab>
        </Tabs>
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
  return { text, ...loadedSource }
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
