import { BrowserDetector, SpellCheckManager } from './SpellCheckManager'

const mockNavigator = (userAgent: string) => {
  Object.defineProperty(window, 'navigator', {
    value: { userAgent },
    writable: true,
  })
}

describe('BrowserDetector', () => {
  beforeEach(() => {
    delete (window as any).navigator
  })

  describe('isFirefox', () => {
    it('returns true for Firefox user agent', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      expect(BrowserDetector.isFirefox()).toBe(true)
    })

    it('returns false for Chrome user agent', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(BrowserDetector.isFirefox()).toBe(false)
    })

    it('returns false when navigator is undefined', () => {
      expect(BrowserDetector.isFirefox()).toBe(false)
    })
  })

  describe('isChrome', () => {
    it('returns true for Chrome user agent', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(BrowserDetector.isChrome()).toBe(true)
    })

    it('returns false for Firefox user agent', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      expect(BrowserDetector.isChrome()).toBe(false)
    })

    it('returns false for Edge user agent', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edge/91.0.864.59')
      expect(BrowserDetector.isChrome()).toBe(false)
    })

    it('returns false when navigator is undefined', () => {
      expect(BrowserDetector.isChrome()).toBe(false)
    })
  })

  describe('supportsSpellCheck', () => {
    it('returns true for Firefox', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      expect(BrowserDetector.supportsSpellCheck()).toBe(true)
    })

    it('returns true for Chrome', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(BrowserDetector.supportsSpellCheck()).toBe(true)
    })

    it('returns false for unsupported browsers', () => {
      mockNavigator('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)')
      expect(BrowserDetector.supportsSpellCheck()).toBe(false)
    })
  })
})

describe('SpellCheckManager', () => {
  let mockAceEditor: any
  let spellCheckManager: SpellCheckManager
  let mockTextInputElement: HTMLElement
  let mockContainerElement: HTMLElement

  beforeEach(() => {
    mockTextInputElement = document.createElement('div')
    mockContainerElement = document.createElement('div')

    mockAceEditor = {
      textInput: {
        getElement: jest.fn(() => mockTextInputElement),
      },
      container: mockContainerElement,
      on: jest.fn(),
      off: jest.fn(),
      focus: jest.fn(),
      isFocused: jest.fn(() => true),
      getSelectionRange: jest.fn(() => ({
        start: { row: 0, column: 1 },
        end: { row: 0, column: 1 },
      })),
      getCursorPosition: jest.fn(() => ({ row: 0, column: 1 })),
    }

    spellCheckManager = new SpellCheckManager(mockAceEditor)

    delete (window as any).navigator
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Firefox implementation', () => {
    beforeEach(() => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
    })

    it('enables Firefox spell check', () => {
      spellCheckManager.enable()

      expect(mockTextInputElement.getAttribute('contenteditable')).toBe('true')
      expect(mockTextInputElement.getAttribute('spellcheck')).toBe('true')
      expect(mockContainerElement.getAttribute('contenteditable')).toBe('true')
      expect(mockContainerElement.getAttribute('spellcheck')).toBe('true')
      expect(mockAceEditor.focus).toHaveBeenCalled()
    })

    it('disables Firefox spell check', () => {
      spellCheckManager.enable()
      spellCheckManager.disable()

      expect(mockTextInputElement.hasAttribute('contenteditable')).toBe(false)
      expect(mockTextInputElement.hasAttribute('spellcheck')).toBe(false)
      expect(mockContainerElement.hasAttribute('contenteditable')).toBe(false)
      expect(mockContainerElement.hasAttribute('spellcheck')).toBe(false)
    })

    it('handles errors gracefully when enabling Firefox spell check', () => {
      mockAceEditor.textInput.getElement.mockImplementation(() => {
        throw new Error('Test error')
      })

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      expect(() => spellCheckManager.enable()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to enable Firefox spell check:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Chrome implementation', () => {
    beforeEach(() => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      Object.defineProperty(window, 'getSelection', {
        value: jest.fn(() => ({
          modify: jest.fn(),
        })),
        writable: true,
      })
    })

    it('enables Chrome spell check', () => {
      spellCheckManager.enable()

      expect(mockAceEditor.on).toHaveBeenCalledWith('change', expect.any(Function))
      expect(mockAceEditor.on).toHaveBeenCalledWith('changeSelection', expect.any(Function))
    })

    it('disables Chrome spell check', () => {
      spellCheckManager.enable()
      spellCheckManager.disable()

      expect(mockAceEditor.off).toHaveBeenCalledWith('change', expect.any(Function))
      expect(mockAceEditor.off).toHaveBeenCalledWith('changeSelection', expect.any(Function))
    })

    it('handles errors gracefully when enabling Chrome spell check', () => {
      mockAceEditor.on.mockImplementation(() => {
        throw new Error('Test error')
      })

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      expect(() => spellCheckManager.enable()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to enable Chrome spell check:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('general behavior', () => {
    it('does not enable spell check for unsupported browsers', () => {
      mockNavigator('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)')
      
      spellCheckManager.enable()
      
      expect(spellCheckManager.getIsEnabled()).toBe(false)
    })

    it('does not enable spell check twice', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      
      spellCheckManager.enable()
      spellCheckManager.enable()
      
      expect(mockAceEditor.focus).toHaveBeenCalledTimes(1)
    })

    it('does not disable spell check if not enabled', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      
      spellCheckManager.disable()
      
      expect(mockTextInputElement.hasAttribute('contenteditable')).toBe(false)
    })

    it('tracks enabled state correctly', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      
      expect(spellCheckManager.getIsEnabled()).toBe(false)
      
      spellCheckManager.enable()
      expect(spellCheckManager.getIsEnabled()).toBe(true)
      
      spellCheckManager.disable()
      expect(spellCheckManager.getIsEnabled()).toBe(false)
    })

    it('refreshes Firefox spell check after re-render', async () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      
      spellCheckManager.enable()
      
      mockAceEditor.focus.mockClear()
      
      spellCheckManager.refresh()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockAceEditor.focus).toHaveBeenCalled()
    })

    it('does not refresh if not enabled', async () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0')
      
      spellCheckManager.refresh()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockAceEditor.focus).not.toHaveBeenCalled()
    })
  })
})
