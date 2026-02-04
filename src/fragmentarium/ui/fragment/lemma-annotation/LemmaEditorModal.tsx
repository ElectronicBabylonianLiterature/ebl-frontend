import ExternalLink from 'common/ExternalLink'
import WordService from 'dictionary/application/WordService'
import LemmaActionButton, {
  LemmaActionCallbacks,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton'
import LemmaAnnotationForm from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationForm'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { annotationProcesses } from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, Row, Spinner } from 'react-bootstrap'

const NOUN_POS_TAGS = {
  'Divine Name': 'DN',
  'Ethnos Name': 'EN',
  'Geographical Name': 'GN',
  'Month Name': 'MN',
  'Object Name': 'ON',
  'Personal Name': 'PN',
  'Royal Name': 'RN',
  'Settlement Name': 'SN',
  'Temple Name': 'TN',
  'Watercourse Name': 'WN',
  'Agricultural (locus) Name': 'AN',
  'Celestial Name': 'CN',
  'Field Name': 'FN',
  'Line Name (ancestral clan)': 'LN',
  'Quarter Name (city area)': 'QN',
  'Year Name': 'YN',
}

function ProperNounCreationPanel({
  value,
  onChange,
  posTag,
  onPosTagChange,
}: {
  value: string
  onChange: (value: string) => void
  posTag: string
  onPosTagChange: (tag: string) => void
}): JSX.Element {
  const posTagSelect = (
    <>
      <Form.Label className={'mt-3'}>Part of Speech</Form.Label>
      <Form.Control
        as="select"
        value={posTag}
        onChange={(e) => onPosTagChange(e.target.value)}
        aria-label="pn-pos-select"
      >
        <option value="">---</option>
        {Object.entries(NOUN_POS_TAGS).map(([label, value]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Form.Control>
    </>
  )

  return (
    <Modal.Body className={'lemmatizer__editor__pn-panel'}>
      <Form.Group>
        <Form.Label>Proper Noun Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter new proper noun"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="pn-input"
        />
        {posTagSelect}
      </Form.Group>
    </Modal.Body>
  )
}

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
  const [showProperNamePanel, setShowProperNamePanel] = useState(false)
  const [pnInputValue, setProperNameInputValue] = useState('')
  const [pnPosTag, setPNPosTag] = useState('')

  // Reset PN panel when token changes
  useEffect(() => {
    setShowProperNamePanel(false)
    setProperNameInputValue('')
    setPNPosTag('')
  }, [token?.token.value])

  const isProcessing = process !== null
  const header = (
    <Modal.Header>
      <Modal.Title as={'h6'}>{title}</Modal.Title>
      <ExternalLink
        href={
          'https://syncandshare.lrz.de/getlink/fiXLc2zR58m7STmn9cYTps/How%20to_%20Annotate%20Lemmas.pdf'
        }
      >
        How to Use <i className="fas fa-external-link-square-alt"></i>
      </ExternalLink>
    </Modal.Header>
  )

  const formBody = (
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
              onTab={callbacks.selectNextToken}
              onShiftTab={callbacks.selectPreviousToken}
            />
            <LemmaActionButton
              token={token}
              {...callbacks}
              onCreateProperNoun={() => setShowProperNamePanel(true)}
            />
          </>
        )}
      </Form.Group>
    </Form>
  )

  const body = <Modal.Body>{formBody}</Modal.Body>

  const properNounCreationPanel =
    showProperNamePanel && token ? (
      <ProperNounCreationPanel
        value={pnInputValue}
        onChange={setProperNameInputValue}
        posTag={pnPosTag}
        onPosTagChange={setPNPosTag}
      />
    ) : null

  const cancelProperNounButton = (
    <Button
      variant="secondary"
      onClick={() => {
        setShowProperNamePanel(false)
        setProperNameInputValue('')
        setPNPosTag('')
      }}
      aria-label="cancel-pn-creation"
    >
      Cancel
    </Button>
  )

  const createProperNounButton = (
    <Button
      variant="primary"
      disabled={!pnInputValue.trim()}
      onClick={() => {
        // TODO: Implement Proper Noun creation logic
        setShowProperNamePanel(false)
        setProperNameInputValue('')
        setPNPosTag('')
      }}
      aria-label="save-pn-creation"
    >
      Create & Save
    </Button>
  )

  const autofillButton = (
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
  )

  const saveButton = (
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
  )

  const footer = token ? (
    <Modal.Footer className={'lemmatizer__editor__footer'}>
      {showProperNamePanel ? (
        <>
          {cancelProperNounButton}
          {createProperNounButton}
        </>
      ) : (
        <>
          {autofillButton}
          {saveButton}
        </>
      )}
    </Modal.Footer>
  ) : null

  return (
    <div className="modal show lemmatizer__editor">
      <Modal.Dialog className="lemmatizer__modal">
        {header}
        {!showProperNamePanel && body}
        {properNounCreationPanel}
        {footer}
      </Modal.Dialog>
    </div>
  )
}
