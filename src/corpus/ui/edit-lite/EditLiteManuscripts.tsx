import React, { useCallback, useState } from 'react'
import { castDraft, produce } from 'immer'
import _ from 'lodash'
import { Button } from 'react-bootstrap'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { toManuscriptsDto } from 'corpus/application/chapterDtoSerialization'
import { createChapterUrl } from 'corpus/application/chapterUrls'
import TextService from 'corpus/application/TextService'
import { Manuscript } from 'corpus/domain/manuscript'
import { Provenance, toProvenance } from 'corpus/domain/provenance'
import EditLiteManuscriptPreview from 'corpus/ui/edit-lite/EditLiteManuscriptPreview'
import EditLiteManuscriptRow from 'corpus/ui/edit-lite/EditLiteManuscriptRow'
import {
  isManuscriptEdited,
  manuscriptColumns,
} from 'corpus/ui/edit-lite/EditLiteManuscriptSummary'
import { pluralize } from 'corpus/ui/edit-lite/lineSummary'
import useStableCallback from 'corpus/ui/edit-lite/useStableCallback'
import FragmentService from 'fragmentarium/application/FragmentService'
import { sortProvenances } from 'fragmentarium/domain/Provenance'
import withData from 'http/withData'
import { ChapterId } from 'transliteration/domain/chapter-id'
import 'corpus/ui/edit-lite/EditLiteManuscripts.sass'

interface Props {
  readonly id: ChapterId
  readonly uncertainFragments: readonly string[]
  readonly textService: TextService
  readonly fragmentService: FragmentService
  readonly searchBibliography: (
    query: string,
  ) => Promise<readonly BibliographyEntry[]>
}

interface ManuscriptsData {
  readonly manuscripts: readonly Manuscript[]
  readonly provenances: readonly Provenance[]
}

type EditorProps = Omit<Props, 'textService' | 'fragmentService'>
type ServiceProps = Pick<Props, 'textService' | 'fragmentService'>

export const manuscriptsNotice =
  'Edits are kept on this page only: nothing is sent to the server.'

export function createManuscriptsTarget(id: ChapterId): string {
  return `POST ${createChapterUrl(id)}/manuscripts`
}

function loadManuscriptsData(
  { id, textService, fragmentService }: EditorProps & ServiceProps,
  signal: AbortSignal,
): Promise<ManuscriptsData> {
  return Promise.all([
    textService.findManuscripts(id, signal),
    fragmentService.fetchProvenances(),
  ]).then(([manuscripts, provenanceRecords]) => ({
    manuscripts,
    provenances: sortProvenances(provenanceRecords).map(toProvenance),
  }))
}

function ManuscriptsEditor({
  id,
  uncertainFragments,
  searchBibliography,
  data,
}: EditorProps & { readonly data: ManuscriptsData }): JSX.Element {
  const [manuscripts, setManuscripts] = useState<readonly Manuscript[]>(
    data.manuscripts,
  )
  const [openIndices, setOpenIndices] = useState<readonly number[]>([])
  const [preview, setPreview] = useState<Readonly<
    Record<string, unknown>
  > | null>(null)
  const stableSearchBibliography = useStableCallback(searchBibliography)
  const toggle = useCallback((index: number): void => {
    setOpenIndices((currentIndices) => _.xor(currentIndices, [index]))
  }, [])
  const change = useCallback((index: number, manuscript: Manuscript): void => {
    setManuscripts((currentManuscripts) =>
      produce(currentManuscripts, (draft) => {
        draft[index] = castDraft(manuscript)
      }),
    )
  }, [])
  const editedFlags = manuscripts.map((manuscript, index) =>
    isManuscriptEdited(data.manuscripts[index], manuscript),
  )
  const editedCount = editedFlags.filter(Boolean).length

  return (
    <section className="edit-lite-manuscript-list">
      <div className="edit-lite-manuscript-list__toolbar">
        <span className="edit-lite-manuscript-list__count">
          {pluralize(manuscripts.length, 'manuscript')}
          {editedCount > 0 && `, ${editedCount} edited`}
        </span>
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={(): void =>
            setPreview(toManuscriptsDto(manuscripts, uncertainFragments))
          }
        >
          Preview request
        </Button>
        <span className="edit-lite-manuscript-list__notice">
          {manuscriptsNotice}
        </span>
      </div>
      {manuscripts.length === 0 ? (
        <p className="edit-lite-manuscript-list__empty">
          This chapter has no manuscripts.
        </p>
      ) : (
        <>
          <div
            className="edit-lite-manuscript-list__captions"
            aria-hidden="true"
          >
            <span />
            {manuscriptColumns.map((column) => (
              <span
                key={column.key}
                className="edit-lite-manuscript-list__caption"
              >
                {column.caption}
              </span>
            ))}
          </div>
          <ol
            className="edit-lite-manuscript-list__rows"
            aria-label="Manuscripts"
          >
            {manuscripts.map((manuscript, index) => (
              <EditLiteManuscriptRow
                key={index}
                index={index}
                manuscript={manuscript}
                isEdited={editedFlags[index]}
                isOpen={openIndices.includes(index)}
                provenances={data.provenances}
                searchBibliography={stableSearchBibliography}
                onToggle={toggle}
                onChange={change}
              />
            ))}
          </ol>
        </>
      )}
      <EditLiteManuscriptPreview
        target={createManuscriptsTarget(id)}
        payload={preview}
        onHide={(): void => setPreview(null)}
      />
    </section>
  )
}

export default withData<EditorProps, ServiceProps, ManuscriptsData>(
  ManuscriptsEditor,
  loadManuscriptsData,
  { watch: (props) => [createChapterUrl(props.id)] },
)
