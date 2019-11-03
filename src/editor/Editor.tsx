import React, { Component } from 'react'
import AceEditor from 'react-ace'
import _ from 'lodash'

import 'brace/ext/searchbox'
import 'brace/mode/plain_text'
import 'brace/theme/kuroir'
import specialCharacters from './SpecialCharacters.json'
import AtfMode from './AtfMode'

function createAnnotations(compositeError) {
  return _.get(compositeError, 'data.errors', [])
    .filter(error => _.has(error, 'lineNumber'))
    .map(error => ({
      row: error.lineNumber - 1,
      column: 0,
      type: 'error',
      text: error.description
    }))
}

const specialCharacterKeys = Object.entries(specialCharacters).map(
  ([key, value]) => ({
    name: `insert a special character ${key}`,
    bindKey: value,
    exec(editor: any) {
      editor.insert(key)
    }
  })
)
interface Props {
  readonly name: string
  readonly value: string
  readonly onChange: any
  readonly disabled: boolean
  readonly error: string | null
}

class Editor extends Component<Props> {
  static defaultProps = {
    error: null
  }
  readonly aceEditor = React.createRef<AceEditor>()

  constructor(props: Props) {
    super(props)
    this.aceEditor = React.createRef()
  }
  componentDidMount() {
    const customMode = new AtfMode()
    this.aceEditor.current!.editor.getSession().setMode(customMode)
  }

  render() {
    const { name, value, onChange, disabled, error } = this.props
    const annotations = createAnnotations(error)
    return (
      <AceEditor
        ref={this.aceEditor}
        name={name}
        width="100%"
        heigth="auto"
        minLines={2}
        maxLines={2 * value.split('\n').length + 2}
        mode="plain_text"
        theme="kuroir"
        value={value}
        onChange={onChange}
        showPrintMargin={false}
        showGutter={!_.isEmpty(annotations)}
        wrapEnabled
        fontSize="initial"
        readOnly={disabled}
        annotations={annotations}
        editorProps={{
          $blockScrolling: Infinity
        }}
        // @ts-ignore
        setOptions={{
          showLineNumbers: false,
          newLineMode: 'unix'
        }}
        // @ts-ignore
        commands={specialCharacterKeys}
      />
    )
  }
}
//Editor.defaultProps = { error: null }
export default Editor
