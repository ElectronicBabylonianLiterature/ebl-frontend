import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { castDraft, produce } from 'immer'
import _ from 'lodash'
import { Alert, Button } from 'react-bootstrap'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Spinner from 'common/ui/Spinner'
import { ChapterRequest } from 'corpus/application/edit-lite/ChapterEditSource'
import { Manuscript } from 'corpus/domain/manuscript'
import { Provenance } from 'corpus/domain/provenance'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import EditLiteManuscriptList from 'corpus/ui/edit-lite/EditLiteManuscriptList'
import EditLiteManuscriptPreview from 'corpus/ui/edit-lite/EditLiteManuscriptPreview'
import EditLiteUncertainFragments from 'corpus/ui/edit-lite/EditLiteUncertainFragments'
import {
  addManuscript,
  countDeletedManuscripts,
  findManuscriptStatuses,
  ManuscriptStatus,
  removeAt,
  shiftOpenIndices,
  summarizeManuscriptEdits,
} from 'corpus/ui/edit-lite/manuscriptEdits'
import useStableCallback from 'corpus/ui/edit-lite/useStableCallback'
import 'corpus/ui/edit-lite/EditLiteManuscripts.sass'

export interface ManuscriptsData {
  readonly manuscripts: readonly Manuscript[]
  readonly provenances: readonly Provenance[]
}

interface Props {
  readonly uncertainFragments: readonly string[]
  readonly searchBibliography: (
    query: string,
  ) => Promise<readonly BibliographyEntry[]>
  readonly data: ManuscriptsData
}

export const manuscriptsNotice =
  'Edits are kept on this page only: nothing is sent to the server.'

export default function EditLiteManuscriptsEditor({
  uncertainFragments,
  searchBibliography,
  data,
}: Props): JSX.Element {
  const { actions, canSave, canWrite, describeChange } = useEditLiteContext()
  const [manuscripts, setManuscripts] = useState<readonly Manuscript[]>(
    data.manuscripts,
  )
  const [fragments, setFragments] =
    useState<readonly string[]>(uncertainFragments)
  const [openIndices, setOpenIndices] = useState<readonly number[]>([])
  const [preview, setPreview] = useState<ChapterRequest | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
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
  const remove = useCallback((index: number): void => {
    setManuscripts((currentManuscripts) => removeAt(currentManuscripts, index))
    setOpenIndices((currentIndices) => shiftOpenIndices(currentIndices, index))
  }, [])
  const statuses = useMemo<readonly ManuscriptStatus[]>(
    () => findManuscriptStatuses(data.manuscripts, manuscripts),
    [data.manuscripts, manuscripts],
  )
  const deletedCount = countDeletedManuscripts(data.manuscripts, manuscripts)
  const hasUnsaved =
    deletedCount > 0 ||
    statuses.some((status) => status !== 'unchanged') ||
    !_.isEqual(fragments, uncertainFragments)

  useEffect(() => {
    actions.reportUnsavedManuscripts(hasUnsaved)
  }, [actions, hasUnsaved])
  useEffect(
    () => (): void => actions.reportUnsavedManuscripts(false),
    [actions],
  )

  const add = (): void => {
    setOpenIndices([...openIndices, manuscripts.length])
    setManuscripts(addManuscript(manuscripts))
  }
  const describe = (): ChapterRequest =>
    describeChange({
      type: 'saveManuscripts',
      manuscripts,
      uncertainFragments: fragments,
    })
  const save = (): void => {
    setIsSaving(true)
    setError(null)
    actions
      .saveManuscripts(manuscripts, fragments)
      .catch((saveError: Error) => setError(saveError.message))
      .finally(() => setIsSaving(false))
  }

  return (
    <section className="edit-lite-manuscript-list">
      {error !== null && (
        <Alert className="edit-lite-line__alert" variant="danger">
          {error}
        </Alert>
      )}
      <div className="edit-lite-manuscript-list__toolbar">
        <span className="edit-lite-manuscript-list__count">
          {summarizeManuscriptEdits(statuses, deletedCount)}
        </span>
        {canWrite && (
          <>
            <Button
              size="sm"
              variant="outline-primary"
              disabled={isSaving}
              onClick={add}
            >
              Add manuscript
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={isSaving || !hasUnsaved}
              onClick={canSave ? save : (): void => setPreview(describe())}
            >
              Save manuscripts
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={(): void => setPreview(describe())}
            >
              Preview request
            </Button>
          </>
        )}
        {isSaving && <Spinner>Saving...</Spinner>}
        {canWrite && !canSave && (
          <span className="edit-lite-manuscript-list__notice">
            {manuscriptsNotice}
          </span>
        )}
      </div>
      <EditLiteManuscriptList
        manuscripts={manuscripts}
        statuses={statuses}
        openIndices={openIndices}
        provenances={data.provenances}
        searchBibliography={stableSearchBibliography}
        onToggle={toggle}
        onChange={change}
        onDelete={remove}
        readOnly={!canWrite}
        disabled={isSaving}
      />
      <EditLiteUncertainFragments
        fragments={fragments}
        onChange={setFragments}
        readOnly={!canWrite}
        disabled={isSaving}
      />
      <EditLiteManuscriptPreview
        request={preview}
        onHide={(): void => setPreview(null)}
      />
    </section>
  )
}
