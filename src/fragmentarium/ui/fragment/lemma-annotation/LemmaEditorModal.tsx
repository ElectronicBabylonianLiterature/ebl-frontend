import ExternalLink from 'common/ExternalLink'
import WordService from 'dictionary/application/WordService'
import LemmaActionButton, {
  LemmaActionCallbacks,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton'
import LemmaAnnotationForm from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationForm'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { annotationProcesses } from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import React from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'

interface Callbacks extends LemmaActionCallbacks {
  handleChange: (options: LemmaOption[] | null) => void
  selectNextToken: () => void
  selectPreviousToken: () => void
  autofillLemmas: () => void
  saveUpdates: () => void
}

export default function LemmaEditorModal({
  token,
  title,
  process,
  isDirty,
  wordService,
  ...callbacks
}: {
  token: EditableToken | null
  title: string
  process: keyof typeof annotationProcesses | null
  isDirty: boolean
  wordService: WordService
} & Callbacks): JSX.Element {
  const isProcessing = process !== null

  return (
    <div className="lemmatizer__editor">
      <div className="lemmatizer__modal">
        <div className="border rounded">
          <div className="border-bottom p-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">{title}</h6>
            <ExternalLink
              href={
                'https://syncandshare.lrz.de/getlink/fiXLc2zR58m7STmn9cYTps/How%20to_%20Annotate%20Lemmas.pdf'
              }
            >
              How to Use <i className="fas fa-external-link-square-alt"></i>
            </ExternalLink>
          </div>
          <div className="p-3">
            <Form
              onSubmit={(event) => {
                event.preventDefault()
                token?.confirmSuggestion()
                callbacks.selectNextToken()
              }}
            >
              <Form.Group className={'lemmatizer__editor__row'}>
                {token && (
                  <>
                    <LemmaAnnotationForm
                      key={JSON.stringify(token)}
                      token={token}
                      wordService={wordService}
                      onChange={callbacks.handleChange}
                      onTab={callbacks.selectNextToken}
                      onShiftTab={callbacks.selectPreviousToken}
                    />
                    <LemmaActionButton token={token} {...callbacks} />
                  </>
                )}
              </Form.Group>
            </Form>
          </div>
          {token && (
            <div className="border-top p-3 d-flex justify-content-between lemmatizer__editor__footer">
              <Button
                variant="outline-primary"
                disabled={isProcessing || isDirty}
                onClick={callbacks.autofillLemmas}
                aria-label="autofill-lemmas"
              >
                <>
                  <i className={'fas fa-wand-magic-sparkles'}></i>
                  &nbsp;
                  {process === 'loadingLemmas' ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    <>Autofill</>
                  )}
                </>
              </Button>
              <Button
                variant="primary"
                disabled={isProcessing || !isDirty}
                onClick={callbacks.saveUpdates}
                aria-label="save-updates"
              >
                {process === 'saving' ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <>Save</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
