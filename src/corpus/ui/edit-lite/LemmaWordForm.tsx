import React, { useId, useState } from 'react'
import _ from 'lodash'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { WordFlow } from 'corpus/ui/edit-lite/useWordFlow'
import { handleWordKeys, useFieldFocus } from 'corpus/ui/edit-lite/wordKeys'
import { WordActionButton } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton'
import ProperNounCreationPanel from 'fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel'
import LemmaSelect, {
  searchLemmaOptions,
} from 'fragmentarium/ui/lemmatization/LemmaSelect'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import Lemma from 'transliteration/domain/Lemma'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import 'fragmentarium/ui/fragment/lemma-annotation/Lemmatizer.sass'

export interface LemmaWordActions {
  setLemma(uniqueLemma: UniqueLemma): void
  reset(): void
  resetAll(): void
  updateAll(): void
  highlight(isHighlighting: boolean): void
}

interface Props {
  readonly word: string
  readonly language: string | undefined
  readonly token: LemmatizationToken
  readonly isChanged: boolean
  readonly canResetAll: boolean
  readonly updateAllProblem: string | null
  readonly flow: WordFlow
  readonly actions: LemmaWordActions
}

export default function LemmaWordForm({
  word,
  language,
  token,
  isChanged,
  canResetAll,
  updateAllProblem,
  flow,
  actions,
}: Props): JSX.Element {
  const context = useEditLiteContext()
  const inputId = useId()
  const [isCreating, setCreating] = useState(false)
  const { fieldsRef, focusField } = useFieldFocus(isCreating)
  const uniqueLemma = _.toArray(token.uniqueLemma)
  const withFocus = (action: () => void) => (): void => {
    action()
    focusField()
  }
  const handleKeyDown = (event: React.KeyboardEvent): void =>
    handleWordKeys(event, {
      accept: (): void => {
        if (token.suggested || token.hasLemma) {
          actions.setLemma(uniqueLemma)
        }
        flow.next()
      },
      next: flow.next,
      previous: flow.previous,
    })

  return (
    <div ref={fieldsRef} className="edit-lite-word-form">
      {isCreating ? (
        <ProperNounCreationPanel
          wordService={context}
          onClose={(): void => setCreating(false)}
          onCreated={(created): void =>
            actions.setLemma([new LemmaOption(created)])
          }
        />
      ) : (
        <div className="lemmatizer__editor__row">
          <div
            className="edit-lite-word-form__select"
            onKeyDown={handleKeyDown}
          >
            <LemmaSelect<Lemma>
              ariaLabel="Lemma"
              inputId={inputId}
              value={uniqueLemma}
              defaultOptions={_(token.suggestions)
                .flatten()
                .uniqBy('value')
                .value()}
              autoFocus={false}
              blurInputOnSelect={false}
              isDisabled={false}
              loadOptions={(inputValue, callback): void => {
                void searchLemmaOptions(context, inputValue, language).then(
                  callback,
                )
              }}
              onChange={(options): void => actions.setLemma([...options])}
              onTab={flow.next}
              onShiftTab={flow.previous}
            />
          </div>
          <WordActionButton
            word={word}
            isDirty={isChanged}
            hasLemmas={uniqueLemma.length > 0 && !token.suggested}
            canResetAll={canResetAll}
            multiApplyProblem={updateAllProblem}
            onResetCurrent={withFocus(actions.reset)}
            onMultiApply={actions.updateAll}
            onMultiReset={withFocus(actions.resetAll)}
            onCreateProperNoun={(): void => setCreating(true)}
            onMouseEnter={(): void => actions.highlight(true)}
            onMouseLeave={(): void => actions.highlight(false)}
            onFocus={(): void => actions.highlight(true)}
            onBlur={(): void => actions.highlight(false)}
          />
        </div>
      )}
    </div>
  )
}
