import React from 'react'
import AceEditor from 'react-ace'
import _ from 'lodash'

import 'brace/ext/searchbox'
import 'brace/mode/plain_text'
import 'brace/theme/kuroir'

function createAnnotations (error) {
  const lineNumber = _.get(error, 'data.lineNumber', null)
  return _.isNil(lineNumber)
    ? []
    : [{
      row: Number(lineNumber) - 1,
      column: 0,
      type: 'error',
      text: 'Invalid line'
    }]
}

function Editor ({ name, value, onChange, disabled, error }) {
  const annotations = createAnnotations(error)
  return <AceEditor
    name={name}
    width='100%'
    heigth='auto'
    minLines={2}
    maxLines={Math.max(2, value.split('\n').length)}
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
  />
}

export default Editor
