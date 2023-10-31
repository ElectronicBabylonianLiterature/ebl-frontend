import AfoRegisterRecord from 'afo-register/domain/Record'
import { fragmentFactory } from 'test-support/fragment-fixtures'

describe('AfoRegisterRecord', () => {
  const mockRecord = {
    afoNumber: '123',
    page: '456',
    text: 'Sample text',
    textNumber: '789',
    linesDiscussed: 'Some lines',
    discussedBy: 'John Doe',
    discussedByNotes: 'Notes by John',
  }

  const fragment1 = fragmentFactory.build({
    traditionalReferences: ['Sample text 789'],
    number: 'Fragment001',
  })

  const fragment2 = fragmentFactory.build({
    traditionalReferences: [],
    number: 'Fragment002',
  })

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
      const result = record.toMarkdownString([fragment1, fragment2])
      expect(result).toEqual(
        'Sample text 789(Fragment001), Some lines: John Doe Notes by John<small class="text-black-50 ml-3">123456</small>'
      )
    })

    it('Handles sup tags correctly', () => {
      const recordWithSup = new AfoRegisterRecord({
        ...mockRecord,
        text: 'Sample^text^',
      })
      const result = recordWithSup.toMarkdownString([fragment1, fragment2])
      expect(result).toContain('<sup>text</sup>')
    })
  })

  describe('Finds link to fragment', () => {
    it('should return the correct link to fragment', () => {
      const record = new AfoRegisterRecord(mockRecord)
      const result = record.findLinkToFragment([fragment1, fragment2])
      expect(result).toEqual('Fragment001')
    })

    it('Returns empty string if no matching fragments', () => {
      const record = new AfoRegisterRecord(mockRecord)
      const result = record.findLinkToFragment([fragment2])
      expect(result).toEqual('')
    })
  })
})
