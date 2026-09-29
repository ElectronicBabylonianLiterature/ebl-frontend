import React, { useEffect, useRef, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import SignService from 'signs/application/SignService'
import AbortableOperation from 'common/utils/AbortableOperation'
import { isCancellation } from 'common/utils/abortError'
import convertAtfLines from 'signs/ui/CuneiformConverter/convertAtfLines'
import './CuneiformConverterForm.sass'
import 'signs/ui/display/SignDisplay.css'

function reportQueryError(error: unknown): void {
  console.error('Query Error:', error)
}

function CuneiformConverterForm({
  signService,
}: {
  signService: SignService
}): JSX.Element {
  const [content, setContent] = useState('')
  const [convertedContent, setConvertedContent] = useState('')
  const [selectedFont, setSelectedFont] = useState('Assurbanipal')
  const conversionOperation = useRef(new AbortableOperation())
  useEffect(() => () => conversionOperation.current.abort(), [])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleConvert = () => {
    const signal = conversionOperation.current.start()
    convertAtfLines(signService, content, signal, reportQueryError)
      .then((convertedText) => {
        if (!signal.aborted) {
          setConvertedContent(convertedText)
        }
      })
      .catch((error) => {
        if (!isCancellation(error, signal)) {
          reportQueryError(error)
        }
      })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      handleConvert()
    }
  }
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(convertedContent)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFont(event.target.value)
  }

  return (
    <div className="cuneiform-converter-form">
      <Form.Label htmlFor="inputText">
        This tool allows to convert transliterations to Unicode cuneiform
        (ranges U+12000-U+123FF, U+12400-U+1247F, and U+12480-U+1254F), using
        the mapping from the eBL sign list. Different fonts, developed by C.
        Ziegeler and S. Vanseveren, can be used to display the cuneiform text.
      </Form.Label>
      <Form.Control
        as="textarea"
        id="inputText"
        aria-label="input-atf"
        aria-describedby="textHelpBlock"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Form.Text id="textHelpBlock" muted>
        Enter the text you want to convert to Unicode.
      </Form.Text>
      <Form.Group className="mt-3 mb-3">
        <Form.Label htmlFor="fontSelector">Select Font</Form.Label>
        <select
          id="fontSelector"
          className="form-select"
          value={selectedFont}
          onChange={handleFontChange}
        >
          <option value="Assurbanipal">Neo-Assyrian</option>
          <option value="Esagil">Neo-Babylonian</option>
          <option value="Santakku">Old Babylonian</option>
          <option value="OBFreie">Old Babylonian Literature</option>
          <option value="SantakkuM">Old Babylonian Monumental</option>
          <option value="UllikummiA">Hittite</option>
        </select>
      </Form.Group>
      <Button onClick={handleConvert}>Convert</Button>
      <Form.Label htmlFor="outputText" className="mt-3">
        Converted Text
      </Form.Label>
      <Form.Control
        as="textarea"
        id="outputText"
        className={`${selectedFont.toLowerCase().replace(/\s/g, '-')}`}
        aria-describedby="outputHelpBlock"
        value={convertedContent}
        readOnly
      />
      <Button onClick={copyToClipboard} variant="primary" className="mt-2">
        Copy
      </Button>
    </div>
  )
}

export default CuneiformConverterForm
