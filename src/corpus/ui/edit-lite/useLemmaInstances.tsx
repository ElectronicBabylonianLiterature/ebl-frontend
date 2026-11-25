import React, { useState } from 'react'
import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
import ConfirmModal from 'corpus/ui/edit-lite/ConfirmModal'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { errorMessage } from 'corpus/ui/edit-lite/editLiteStore'
import { useLineFlow } from 'corpus/ui/edit-lite/LineFlowContext'
import { pluralize } from 'corpus/ui/edit-lite/lineSummary'
import { WordActivation } from 'corpus/ui/edit-lite/useWordFlow'
import { UniqueLemma } from 'transliteration/domain/Lemmatization'

interface InstancesRequest {
  readonly position: number
  readonly uniqueLemma: UniqueLemma
  readonly instances: WordInstances
}

export interface LemmaInstances {
  readonly problem: string | null
  readonly dialog: JSX.Element
  request(position: number, word: string, uniqueLemma: UniqueLemma): void
}

export function describeLemma(uniqueLemma: UniqueLemma): string {
  return uniqueLemma.map((lemma) => `${lemma.lemma}${lemma.homonym}`).join(', ')
}

export function describeInstances({ words, lines }: WordInstances): string {
  return `${pluralize(words, 'word')} in ${pluralize(lines.length, 'line')} of this chapter.`
}

export function describeReplacedLemmas({ lemmatized }: WordInstances): string {
  return `${lemmatized} of them already ${lemmatized === 1 ? 'has' : 'have'} a lemma, which will be replaced.`
}

export default function useLemmaInstances(
  index: number,
  activation: WordActivation,
  onAccept: (position: number, uniqueLemma: UniqueLemma) => void,
): LemmaInstances {
  const { actions } = useEditLiteContext()
  const { holdFocus } = useLineFlow()
  const [request, setRequest] = useState<InstancesRequest | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const close = (): void => {
    holdFocus()
    setRequest(null)
  }
  const cancel = ({ position }: InstancesRequest): void => {
    close()
    activation.request(position)
  }
  const confirm = ({
    position,
    uniqueLemma,
    instances,
  }: InstancesRequest): void => {
    close()
    onAccept(position, uniqueLemma)
    actions.lemmatizeInstances(
      index,
      instances.word,
      uniqueLemma.map((lemma) => lemma.value),
      () => activation.request(position),
    )
  }

  return {
    problem,
    request: (position, word, uniqueLemma): void => {
      setProblem(null)
      actions.countWordInstances(word).then(
        (instances) => setRequest({ position, uniqueLemma, instances }),
        (error: unknown) => {
          setProblem(errorMessage(error))
          activation.request(position)
        },
      )
    },
    dialog: (
      <ConfirmModal
        show={request !== null}
        title="Update all instances"
        confirmLabel="Update all instances"
        confirmVariant="primary"
        onConfirm={(): void => confirm(request as InstancesRequest)}
        onCancel={(): void => cancel(request as InstancesRequest)}
        restoreFocus={false}
      >
        {request !== null && (
          <>
            <p>
              Set the lemma{' '}
              <strong>{describeLemma(request.uniqueLemma)}</strong> on every
              instance of <strong>{request.instances.word}</strong>?
            </p>
            <p>{describeInstances(request.instances)}</p>
            {request.instances.lemmatized > 0 && (
              <p>{describeReplacedLemmas(request.instances)}</p>
            )}
          </>
        )}
      </ConfirmModal>
    ),
  }
}
