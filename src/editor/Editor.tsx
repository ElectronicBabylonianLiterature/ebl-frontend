import React, { Component } from 'react'
import AceEditor from 'react-ace'
import _ from 'lodash'

import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/mode-plain_text'
import 'ace-builds/src-noconflict/theme-kuroir'
import specialCharacters from './SpecialCharacters.json'
import AtfMode from './AtfMode'

function createAnnotations(compositeError) {
  return _.get(compositeError, 'data.errors', [])
    .filter((error) => _.has(error, 'lineNumber'))
    .map((error) => ({
      row: error.lineNumber - 1,
      column: 0,
      type: 'error',
      text: error.description,
    }))
}

const specialCharacterKeys = Object.entries(specialCharacters).map(
  ([key, value]) => ({
    name: `insert a special character ${key}`,
    bindKey: value,
    exec(editor: any): void {
      editor.insert(key)
    },
  })
)
interface Props {
  readonly name: string
  readonly value: string
  readonly onChange: (value: string, event?: any) => void | undefined
  readonly disabled: boolean
  readonly error: object
}

class Editor extends Component<Props> {
  static defaultProps = {
    error: null,
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
        theme="kuroir" /*used theme tokens only to distinguish color. Have no
          semantical meaning corresponding to common tokens from theme*/
        value={value}
        onChange={onChange}
        showPrintMargin={false}
        showGutter={!_.isEmpty(annotations)}
        wrapEnabled
        fontSize="initial"
        readOnly={disabled}
        annotations={annotations}
        editorProps={{
          $blockScrolling: Infinity,
        }}
        // @ts-ignore
        setOptions={{
          showLineNumbers: false,
          newLineMode: 'unix',
        }}
        // @ts-ignore
        commands={specialCharacterKeys}
      />
    )
  }
}
export default Editor
