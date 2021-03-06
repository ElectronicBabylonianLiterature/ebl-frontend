import React, { Component } from 'react'
import AceEditor, { IAnnotation, ICommand } from 'react-ace'
import { Ace } from 'ace-builds'
import _ from 'lodash'

import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/mode-plain_text'
import 'ace-builds/src-noconflict/theme-kuroir'
import specialCharacters from './SpecialCharacters.json'
import AtfMode from './AtfMode'

function createAnnotations(compositeError): IAnnotation[] {
  return _.get(compositeError, 'data.errors', [])
    .filter((error) => _.has(error, 'lineNumber'))
    .map((error) => ({
      row: error.lineNumber - 1,
      column: 0,
      type: 'error',
      text: error.description,
    }))
}

const specialCharacterKeys: ICommand[] = Object.entries(specialCharacters).map(
  ([key, value]) => ({
    name: `insert a special character ${key}`,
    bindKey: value,
    exec(editor: Ace.Editor): void {
      editor.insert(key)
    },
  })
)

interface Props {
  readonly name: string
  readonly value: string
  readonly onChange: (value: string, event?: unknown) => void | undefined
  readonly disabled: boolean
  readonly error: Error | Record<string, unknown> | null
}

class Editor extends Component<Props> {
  static defaultProps = {
    error: null,
    disabled: false,
  }
  readonly aceEditor = React.createRef<AceEditor>()

  constructor(props: Props) {
    super(props)
    this.aceEditor = React.createRef()
  }

  componentDidMount(): void {
    const customMode = (new AtfMode() as unknown) as Ace.SyntaxMode
    this.aceEditor.current?.editor.getSession().setMode(customMode)
  }

  render(): JSX.Element {
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
        theme="kuroir" // AtfMode is designed to be used with kuroir theme
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
        setOptions={{
          showLineNumbers: false,
          // @ts-ignore https://github.com/securingsincity/react-ace/issues/752
          newLineMode: 'unix',
        }}
        commands={specialCharacterKeys}
      />
    )
  }
}
export default Editor
