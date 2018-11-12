import React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/plain_text'
import 'brace/theme/kuroir'

function Editor ({ name, value, onChange, disabled }) {
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
    showGutter={false}
    wrapEnabled
    fontSize='initial'
    readOnly={disabled}
    editorProps={{
      $blockScrolling: Infinity
    }}
  />
}

export default Editor
