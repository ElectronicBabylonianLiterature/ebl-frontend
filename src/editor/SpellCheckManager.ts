import _ from 'lodash'

export class BrowserDetector {
  static isFirefox(): boolean {
    return (
      typeof navigator !== 'undefined' && /Firefox/i.test(navigator.userAgent)
    )
  }

  static isChrome(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      /Chrome/i.test(navigator.userAgent) &&
      !/Edge/i.test(navigator.userAgent)
    )
  }

  static supportsSpellCheck(): boolean {
    return BrowserDetector.isFirefox() || BrowserDetector.isChrome()
  }
}

export class SpellCheckManager {
  private aceEditor: any
  private isEnabled = false
  private chromeSpellCheckDebounceTime = 10
  private triggerSpellCheckDebounced: (() => void) | null = null

  constructor(aceEditor: any) {
    this.aceEditor = aceEditor
  }

  enable(): void {
    if (!this.aceEditor || this.isEnabled) {
      return
    }

    this.isEnabled = true

    if (BrowserDetector.isFirefox()) {
      this.enableFirefoxSpellCheck()
    } else if (BrowserDetector.isChrome()) {
      this.enableChromeSpellCheck()
    }
  }

  disable(): void {
    if (!this.aceEditor || !this.isEnabled) {
      return
    }

    this.isEnabled = false

    if (BrowserDetector.isFirefox()) {
      this.disableFirefoxSpellCheck()
    } else if (BrowserDetector.isChrome()) {
      this.disableChromeSpellCheck()
    }
  }

  private enableFirefoxSpellCheck(): void {
    try {
      const textArea = this.aceEditor.textInput.getElement()
      const container = this.aceEditor.container

      if (textArea) {
        textArea.setAttribute('contenteditable', 'true')
        textArea.setAttribute('spellcheck', 'true')
      }

      if (container) {
        container.setAttribute('contenteditable', 'true')
        container.setAttribute('spellcheck', 'true')
      }

      this.aceEditor.focus()
    } catch (error) {
      console.warn('Failed to enable Firefox spell check:', error)
    }
  }

  private disableFirefoxSpellCheck(): void {
    try {
      const textArea = this.aceEditor.textInput.getElement()
      const container = this.aceEditor.container

      if (textArea) {
        textArea.removeAttribute('contenteditable')
        textArea.removeAttribute('spellcheck')
      }

      if (container) {
        container.removeAttribute('contenteditable')
        container.removeAttribute('spellcheck')
      }
    } catch (error) {
      console.warn('Failed to disable Firefox spell check:', error)
    }
  }

  private enableChromeSpellCheck(): void {
    try {
      this.triggerSpellCheckDebounced = _.debounce(() => {
        this.triggerChromeSpellCheck()
      }, this.chromeSpellCheckDebounceTime)

      this.aceEditor.on('change', this.triggerSpellCheckDebounced)
      this.aceEditor.on('changeSelection', this.triggerSpellCheckDebounced)
    } catch (error) {
      console.warn('Failed to enable Chrome spell check:', error)
    }
  }

  private disableChromeSpellCheck(): void {
    try {
      if (this.triggerSpellCheckDebounced) {
        this.aceEditor.off('change', this.triggerSpellCheckDebounced)
        this.aceEditor.off('changeSelection', this.triggerSpellCheckDebounced)
        this.triggerSpellCheckDebounced = null
      }
    } catch (error) {
      console.warn('Failed to disable Chrome spell check:', error)
    }
  }

  private triggerChromeSpellCheck(): void {
    try {
      const selection = window.getSelection()
      if (!selection || !selection.modify) {
        return
      }

      const selectionRange = this.aceEditor.getSelectionRange()
      const hasFocus = this.aceEditor.isFocused()
      const isCollapsed =
        selectionRange.start.row === selectionRange.end.row &&
        selectionRange.start.column === selectionRange.end.column

      if (hasFocus && isCollapsed) {
        const cursorPosition = this.aceEditor.getCursorPosition()

        if (cursorPosition.column > 0) {
          selection.modify('move', 'backward', 'character')
          selection.modify('move', 'forward', 'character')
        } else {
          selection.modify('move', 'forward', 'character')
          selection.modify('move', 'backward', 'character')
        }
      }
    } catch (error) {
      console.warn('Failed to trigger Chrome spell check:', error)
    }
  }

  refresh(): void {
    if (!this.isEnabled) {
      return
    }

    setTimeout(() => {
      if (BrowserDetector.isFirefox()) {
        this.enableFirefoxSpellCheck()
      }
    }, 100)
  }

  getIsEnabled(): boolean {
    return this.isEnabled
  }
}

export function createSpellCheckManager(aceEditor: any): SpellCheckManager {
  return new SpellCheckManager(aceEditor)
}
