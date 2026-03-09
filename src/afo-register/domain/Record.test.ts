import AfoRegisterRecord from 'afo-register/domain/Record'

describe('AfoRegisterRecord', () => {
  const mockRecord = {
    afoNumber: '123',
    page: '456',
    text: 'Sample text',
    textNumber: '789',
    linesDiscussed: 'Some lines',
    discussedBy: 'John Doe',
    discussedByNotes: 'Notes by John',
    fragmentNumbers: ['BM777'],
  }

  describe('constructor', () => {
    describe('constructor', () => {
      it('should initialize properties correctly', () => {
        const record = new AfoRegisterRecord(mockRecord)
        expect(record.afoNumber).toEqual('123')
        expect(record.page).toEqual('456')
        expect(record.text).toEqual('Sample text')
        expect(record.textNumber).toEqual('789')
        expect(record.linesDiscussed).toEqual('Some lines')
        expect(record.discussedBy).toEqual('John Doe')
        expect(record.discussedByNotes).toEqual('Notes by John')
      })
    })
  })

  describe('Converts to Markdown string', () => {
    it('Returns the correct markdown string with fragments', () => {
      const record = new AfoRegisterRecord(mockRecord)
      const result = record.toMarkdownString()
      expect(result).toEqual(
        'Sample text 789 ([BM777](/library/BM777)), Some lines: John Doe Notes by John<small class="text-black-50 ml-3">[123, 456]</small>',
      )
    })

    it('Handles sup tags correctly', () => {
      const recordWithSup = new AfoRegisterRecord({
        ...mockRecord,
        text: 'Sample^text^',
      })
      const result = recordWithSup.toMarkdownString()
      expect(result).toContain('<sup>text</sup>')
    })
  })
})
