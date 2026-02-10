import React, { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import WordService from 'dictionary/application/WordService'

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

interface ProperNounCreationPanelProps {
  wordService: WordService
  onClose: () => void
}

export default function ProperNounCreationPanel({
  wordService,
  onClose,
}: ProperNounCreationPanelProps): JSX.Element {
  const [properNounInputValue, setProperNounInputValue] = useState('')
  const [properNounPosTag, setProperNounPosTag] = useState('')
  const [exactMatch, setExactMatch] = useState<string | null>(null)
  const [lengthMatch, setLengthMatch] = useState<string | null>(null)

  useEffect(() => {
    if (!properNounInputValue.trim()) {
      setExactMatch(null)
      setLengthMatch(null)
      return
    }

    wordService.searchLemma(properNounInputValue).then((results) => {
      const exact = results.find(
        (word) => word.lemma[0] === properNounInputValue
      )
      if (exact) {
        setExactMatch(exact.lemma[0])
        setLengthMatch(null)
        return
      }
      const byLength = results.find(
        (word) => word.lemma[0].length === properNounInputValue.length
      )
      if (byLength) {
        setLengthMatch(byLength.lemma[0])
        setExactMatch(null)
      } else {
        setLengthMatch(null)
        setExactMatch(null)
      }
    })
  }, [properNounInputValue, wordService])

  const properNounInput = (
    <>
      <Form.Label>Proper Noun Name</Form.Label>
      <Form.Control
        type="text"
        placeholder="Enter new proper noun"
        value={properNounInputValue}
        onChange={(e) => {
          const input = e.target.value
          const latinOnly = input.replace(
            /[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s-]/g,
            ''
          )
          if (latinOnly.length === 0) {
            setProperNounInputValue('')
          } else {
            const formatted =
              latinOnly.charAt(0).toUpperCase() + latinOnly.slice(1)
            setProperNounInputValue(formatted)
          }
        }}
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
      disabled={!properNounInputValue.trim() || !!exactMatch}
      onClick={() => {
        // TODO: Implement Proper Noun creation logic
        onClose()
      }}
      aria-label="save-properNoun-creation"
    >
      Create & Save
    </Button>
  )

  return (
    <>
      <Modal.Body className={'lemmatizer__editor__properNoun-panel'}>
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
