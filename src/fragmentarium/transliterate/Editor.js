import React from 'react'
import AceEditor from 'react-ace'
import _ from 'lodash'

import 'brace/ext/searchbox'
import 'brace/mode/plain_text'
import 'brace/theme/kuroir'
import insertSpecialCharacters from './InsertSpecialCharacters'

function createAnnotations (compositeError) {
  return _.get(compositeError, 'data.errors', [])
    .filter(error => _.has(error, 'lineNumber'))
    .map(error => ({
      row: error.lineNumber - 1,
      column: 0,
      type: 'error',
      text: error.description
    }))
}

function Editor ({ name, value, onChange, disabled, error }) {
  const annotations = createAnnotations(error)
  return <AceEditor
    name={name}
    width='100%'
    heigth='auto'
    minLines={2}
    maxLines={2 * value.split('\n').length + 2}
    mode='plain_text'
    theme='kuroir'
    value={value}
    onChange={onChange}
    showPrintMargin={false}
    showGutter={!_.isEmpty(annotations)}
    wrapEnabled
    fontSize='initial'
    readOnly={disabled}
    annotations={annotations}
    editorProps={{
      $blockScrolling: Infinity
    }}
    setOptions={{
      showLineNumbers: false
    }}
    commands={insertSpecialCharacters}
  />
}

export default Editor
