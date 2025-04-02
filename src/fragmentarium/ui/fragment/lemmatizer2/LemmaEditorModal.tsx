import WordService from 'dictionary/application/WordService'
import LemmaActionButton, {
  LemmaActionCallbacks,
} from 'fragmentarium/ui/fragment/lemmatizer2/LemmaAnnotationButton'
import LemmaAnnotationForm from 'fragmentarium/ui/fragment/lemmatizer2/LemmaAnnotationForm'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { annotationProcesses } from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import React from 'react'
import { Button, Form, Modal, Row, Spinner } from 'react-bootstrap'

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
    <div className="modal show lemmatizer__editor">
      <Modal.Dialog className="lemmatizer__modal">
        <Modal.Header>
          <Modal.Title as={'h6'}>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(event) => {
              event.preventDefault()
              token?.confirmSuggestion()
              callbacks.selectNextToken()
            }}
          >
            <Form.Group as={Row} className={'lemmatizer__editor__row'}>
              {token && (
                <>
                  <LemmaAnnotationForm
                    key={JSON.stringify(token)}
                    token={token}
                    wordService={wordService}
                    onChange={callbacks.handleChange}
                    onKeyDown={(event: React.KeyboardEvent) => {
                      if (event.code === 'Tab') {
                        event.preventDefault()
                        if (event.shiftKey) {
                          callbacks.selectPreviousToken()
                        } else {
                          callbacks.selectNextToken()
                        }
                      }
                    }}
                  />
                  <LemmaActionButton
                    token={token.token}
                    disabled={!token.isDirty}
                    {...callbacks}
                  />
                </>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        {token && (
          <Modal.Footer className={'lemmatizer__editor__footer'}>
            <Button
              variant="outline-primary"
              disabled={isProcessing || isDirty}
              onClick={callbacks.autofillLemmas}
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
          </Modal.Footer>
        )}
      </Modal.Dialog>
    </div>
  )
}
