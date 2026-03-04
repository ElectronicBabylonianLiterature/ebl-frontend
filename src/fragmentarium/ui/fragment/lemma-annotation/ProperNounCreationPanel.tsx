import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, Alert } from 'react-bootstrap'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'

const NOUN_POS_TAGS = {
  'Agricultural (locus) Name': 'AN',
  'Celestial Name': 'CN',
  'Divine Name': 'DN',
  'Ethnos Name': 'EN',
  'Field Name': 'FN',
  'Geographical Name': 'GN',
  'Line Name (ancestral clan)': 'LN',
  'Month Name': 'MN',
  'Object Name': 'ON',
  'Personal Name': 'PN',
  'Quarter Name (city area)': 'QN',
  'Royal Name': 'RN',
  'Settlement Name': 'SN',
  'Temple Name': 'TN',
  'Watercourse Name': 'WN',
  'Year Name': 'YN',
}

interface ProperNounCreationPanelProps {
  wordService: WordService
  onClose: () => void
  onCreated: (word: Word) => void
}

interface MatchState {
  exactMatch: string | null
  lengthMatch: string | null
}

const emptyMatchState: MatchState = {
  exactMatch: null,
  lengthMatch: null,
}

function hasWordId(value: Word): value is Word {
  return Boolean(
    value &&
    typeof value === 'object' &&
    '_id' in value &&
    typeof (value as { _id?: unknown })._id === 'string' &&
    (value as { _id?: string })._id,
  )
}

function formatProperNounInput(input: string): string {
  const latinOnly = input.replace(/[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s-]/g, '')
  if (latinOnly.length === 0) {
    return ''
  }
  return latinOnly.charAt(0).toUpperCase() + latinOnly.slice(1)
}

function findMatchState(
  inputValue: string,
  words: readonly Word[],
): MatchState {
  const exact = words.find((word) => word.lemma[0] === inputValue)
  if (exact) {
    return {
      exactMatch: exact.lemma[0],
      lengthMatch: null,
    }
  }

  const byLength = words.find(
    (word) => word.lemma[0].length === inputValue.length,
  )
  if (byLength) {
    return {
      exactMatch: null,
      lengthMatch: byLength.lemma[0],
    }
  }

  return emptyMatchState
}

function validateCreatedWord(createdWord: Word): Word {
  if (!hasWordId(createdWord)) {
    throw new Error(
      'Proper noun creation failed: backend did not return a valid word document.',
    )
  }
  return createdWord
}

export default function ProperNounCreationPanel({
  wordService,
  onClose,
  onCreated,
}: ProperNounCreationPanelProps): JSX.Element {
  const [properNounInputValue, setProperNounInputValue] = useState('')
  const [properNounPosTag, setProperNounPosTag] = useState('')
  const [{ exactMatch, lengthMatch }, setMatchState] =
    useState<MatchState>(emptyMatchState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!properNounInputValue.trim()) {
      setMatchState(emptyMatchState)
      return () => {
        cancelled = true
      }
    }

    wordService.searchLemma(properNounInputValue).then((results) => {
      if (cancelled) {
        return
      }
      setMatchState(findMatchState(properNounInputValue, results))
    })

    return () => {
      cancelled = true
    }
  }, [properNounInputValue, wordService])

  const handleInputChange = (inputValue: string) => {
    setProperNounInputValue(formatProperNounInput(inputValue))
  }

  const handleCreate = () => {
    setError(null)
    setLoading(true)

    wordService
      .createProperNoun(properNounInputValue, properNounPosTag)
      .then((createdWord) => validateCreatedWord(createdWord))
      .then((createdWord) => {
        onCreated(createdWord)
        onClose()
      })
      .catch((creationError: Error) => {
        setError(creationError)
        setLoading(false)
      })
  }

  const hasInputValue = Boolean(properNounInputValue.trim())
  const hasExactMatch = Boolean(exactMatch)
  const hasPosTag = Boolean(properNounPosTag)
  const createDisabled =
    !hasInputValue || hasExactMatch || !hasPosTag || loading

  const properNounInput = (
    <>
      <Form.Label>Proper Noun Name</Form.Label>
      <Form.Control
        type="text"
        placeholder="Enter new proper noun"
        value={properNounInputValue}
        onChange={(event) => handleInputChange(event.target.value)}
        aria-label="properNoun-input"
        isInvalid={!!exactMatch}
      />
      {exactMatch && (
        <Form.Control.Feedback type="invalid">
          This lemma already exists: &quot;{exactMatch}&quot;
        </Form.Control.Feedback>
      )}
      {lengthMatch && !exactMatch && (
        <div className="small text-muted mt-2">
          A similar lemma exists: &quot;{lengthMatch}&quot;
        </div>
      )}
    </>
  )

  const posTagSelect = (
    <>
      <Form.Label className={'mt-3'}>Part of Speech</Form.Label>
      <Form.Control
        as="select"
        value={properNounPosTag}
        onChange={(e) => setProperNounPosTag(e.target.value)}
        aria-label="properNoun-pos-select"
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

  const cancelButton = (
    <Button
      variant="secondary"
      onClick={onClose}
      aria-label="cancel-properNoun-creation"
    >
      Cancel
    </Button>
  )

  const createButton = (
    <Button
      variant="primary"
      disabled={createDisabled}
      onClick={handleCreate}
      aria-label="save-properNoun-creation"
    >
      Create & Save
    </Button>
  )

  return (
    <>
      <Modal.Body className={'lemmatizer__editor__properNoun-panel'}>
        {error && <Alert variant="danger">{error.message}</Alert>}
        <Form.Group>
          {properNounInput}
          {posTagSelect}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className={'lemmatizer__editor__properNoun-footer'}>
        {cancelButton}
        {createButton}
      </Modal.Footer>
    </>
  )
}
