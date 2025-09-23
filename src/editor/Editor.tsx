import React, { Component } from 'react'
import AceEditor, { IAnnotation, ICommand } from 'react-ace'
import { Ace, Range } from 'ace-builds'
import _ from 'lodash'

import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/mode-plain_text'
import 'ace-builds/src-noconflict/theme-kuroir'
import 'ace-builds/src-noconflict/ext-rtl'
import specialCharacters from './SpecialCharacters.json'
import atSnippets from './atSnippets.json'
import hashSnippets from './hashSnippets.json'
import AtfMode from './AtfMode'
import ErrorBoundary from 'common/ErrorBoundary'
import { setCompleters } from 'ace-builds/src-noconflict/ext-language_tools'
import { createSpellCheckManager, SpellCheckManager, BrowserDetector } from './SpellCheckManager'

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

function createCompleter(
  triggerRegex: RegExp,
  snippets,
  lineStartOnly = false
) {
  return {
    getCompletions: function (editor, session, pos, prefix, callback) {
      const isTriggerPosition =
        !lineStartOnly || (lineStartOnly && pos.column === 1)

      if (prefix.match(triggerRegex) && isTriggerPosition) {
        callback(null, snippets)
      }
    },
    identifierRegexps: [triggerRegex],
  }
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
  readonly enableSpellCheck?: boolean
}

class Editor extends Component<Props> {
  static defaultProps = {
    error: null,
    disabled: false,
    enableSpellCheck: false,
  }
  readonly aceEditor = React.createRef<AceEditor>()
  private spellCheckManager: SpellCheckManager | null = null

  constructor(props: Props) {
    super(props)
    this.aceEditor = React.createRef()
    this.setSnippets()
  }

  componentDidMount(): void {
    const customMode = (new AtfMode() as unknown) as Ace.SyntaxMode
    this.aceEditor.current?.editor.getSession().setMode(customMode)
    
    this.initializeSpellCheck()
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.enableSpellCheck !== this.props.enableSpellCheck) {
      if (this.props.enableSpellCheck) {
        this.initializeSpellCheck()
      } else {
        this.disableSpellCheck()
      }
    }
    
    if (this.props.enableSpellCheck && this.spellCheckManager) {
      this.spellCheckManager.refresh()
    }
  }

  componentWillUnmount(): void {
    this.disableSpellCheck()
  }

  private initializeSpellCheck(): void {
    if (!this.props.enableSpellCheck || !BrowserDetector.supportsSpellCheck()) {
      return
    }

    const editor = this.aceEditor.current?.editor
    if (!editor) {
      return
    }

    try {
      this.spellCheckManager = createSpellCheckManager(editor)
      this.spellCheckManager.enable()
    } catch (error) {
      console.warn('Failed to initialize spell check:', error)
    }
  }

  private disableSpellCheck(): void {
    if (this.spellCheckManager) {
      this.spellCheckManager.disable()
      this.spellCheckManager = null
    }
  }

  setSnippets(): void {
    const atCompleter = createCompleter(/^@/, atSnippets)
    const hashCompleter = createCompleter(/^#/, hashSnippets, true)

    setCompleters([atCompleter, hashCompleter])
  }

  lineNumberAutoComplete(editor: Ace.Editor): void {
    const { row } = editor.selection.getCursor()
    const thisLine = editor.session.getTextRange(new Range(row, 0, row, 10))
    const nextLine = editor.session.getTextRange(
      new Range(row + 1, 0, row + 1, 10)
    )
    const match = thisLine.match(/^(\d+)([^.]*)\./)
    if (!nextLine && match) {
      const [, lineNumber, suffix] = match
      const incrementedLineNumber = parseInt(lineNumber) + 1
      editor.insert(
        `\n${incrementedLineNumber}${suffix.match(/\w/) ? '' : suffix}. `
      )
    } else {
      editor.insert('\n')
    }
  }

  incrementLineNumbers(editor: Ace.Editor, i: number): void {
    const selection = editor.selection.getRange()
    const start = selection.start
    const end = selection.end

    if (_.isEqual(start, end) || start.column !== 0) {
      return
    }

    editor.selection.setRange(new Range(start.row, 0, end.row, Infinity))

    const lines = editor
      .getSelectedText()
      .split('\n')
      .map((line) => {
        return line.replace(/^\d+/, (oldNumber) => `${parseInt(oldNumber) + i}`)
      })
      .join('\n')

    editor.insert(lines)
    const newEnd = editor.selection.getCursor()

    editor.selection.setRange(
      new Range(start.row, 0, newEnd.row, newEnd.column)
    )
  }

  render(): JSX.Element {
    const { name, value, onChange, disabled, error, enableSpellCheck } = this.props
    const annotations = createAnnotations(error)
    return (
      <ErrorBoundary>
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
            autoScrollEditorIntoView: true,
            rtlText: true,
          }}
          enableSnippets={true}
          enableLiveAutocompletion={true}
          commands={[
            ...specialCharacterKeys,
            {
              name: 'line number',
              bindKey: { win: 'Enter', mac: 'Enter' },
              exec: this.lineNumberAutoComplete,
            },
            {
              name: 'increment line numbers by 1',
              bindKey: { win: 'Ctrl-Shift-UP', mac: 'Option-UP' },
              exec: (editor) => this.incrementLineNumbers(editor, 1),
            },
            {
              name: 'decrement line numbers by 1',
              bindKey: { win: 'Ctrl-Shift-DOWN', mac: 'Option-DOWN' },
              exec: (editor) => this.incrementLineNumbers(editor, -1),
            },
          ]}
        />
      </ErrorBoundary>
    )
  }
}
export default Editor
