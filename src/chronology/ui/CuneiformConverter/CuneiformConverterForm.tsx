import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import Bluebird from 'bluebird'
import SignService from 'signs/application/SignService'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import { displayUnicode } from 'signs/ui/search/SignsSearch'
import './CuneiformConverterForm.sass'

function CuneiformConverterForm({
  signService,
}: {
  signService: SignService
}): JSX.Element {
  const [content, setContent] = useState('')
  const [convertedContent, setConvertedContent] = useState('')
  const [selectedFont, setSelectedFont] = useState('Assurbanipal')

  const handleChange = (event) => {
    setContent(event.target.value)
  }

  const handleConvert = () => {
    const lines = content.split('\n')
    const replacedLines = lines.map((line) => replaceTransliteration(line))

    Promise.all(
      replacedLines
        .filter((line) => line.trim() !== '')
        .map((line) => query(line))
    )
      .then((results) => {
        const convertedText = results
          .map((result) =>
            result
              .map((entry) =>
                entry.unicode[0] === 9999 ? ' ' : displayUnicode(entry.unicode)
              )
              .join('')
          )
          .join('\n')

        setConvertedContent(convertedText)
      })
      .catch((error) => {
        console.error('Query Error:', error)
      })
  }

  const query = (content) => {
    return Bluebird.resolve(signService.getUnicodeFromAtf(content))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      handleConvert()
    }
  }

  const handleFontChange = (event) => {
    setSelectedFont(event.target.value)
  }

  return (
    <div className="cuneiform-converter-form">
      <Form.Label htmlFor="inputText">
        This tool allows to convert transliterations to Unicode cuneiform
        (ranges U+12000-U+123FF, U+12400-U+1247F, and U+12480-U+1254F), using
        the mapping from the eBL sign list. Different fonts, developed by S.
        Vanseveren, can be used to display the cuneiform text.
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
      <Form.Label htmlFor="fontSelector" style={{ paddingRight: '8px' }}>
        Select Font
      </Form.Label>
      <select
        id="fontSelector"
        className="form-select"
        value={selectedFont}
        onChange={handleFontChange}
      >
        <option value="Assurbanipal">Neo-Assyrian</option>
        <option value="Esagil">Neo-Babylonian</option>
        <option value="Santakku">Old Babylonian</option>
        <option value="SantakkuM">Old Babylonian Monumental</option>
        <option value="UllikummiA">Hittite</option>
      </select>
      <br></br>
      <Button onClick={handleConvert}>Convert</Button>
      <br></br>
      <Form.Label htmlFor="outputText">Converted Text</Form.Label>
      <Form.Control
        as="textarea"
        id="outputText"
        className={`${selectedFont.toLowerCase().replace(/\s/g, '-')}`}
        aria-describedby="outputHelpBlock"
        value={convertedContent}
        readOnly
      />
      <Form.Text id="outputHelpBlock" muted>
        This is the converted Unicode text.
      </Form.Text>
    </div>
  )
}

export default CuneiformConverterForm
