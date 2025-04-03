import { Acquisition } from './Acquisition'

describe('Acquisition', () => {
  const testCases = [
    [
      'Basic acquisition',
      new Acquisition('British Museum'),
      {
        supplier: 'British Museum',
        description: undefined,
        date: undefined,
        toString: 'British Museum',
        dto: { supplier: 'British Museum' },
      },
    ],
    [
      'With date',
      new Acquisition('British Museum', 1925),
      {
        supplier: 'British Museum',
        description: undefined,
        date: 1925,
        toString: 'British Museum, 1925',
        dto: { supplier: 'British Museum', date: 1925 },
      },
    ],
    [
      'With description',
      new Acquisition('British Museum', undefined, 'Clay tablet'),
      {
        supplier: 'British Museum',
        description: 'Clay tablet',
        date: undefined,
        toString: 'British Museum (Clay tablet)',
        dto: { supplier: 'British Museum', description: 'Clay tablet' },
      },
    ],
    [
      'Complete acquisition',
      new Acquisition('British Museum', 1925, 'Clay tablet'),
      {
        supplier: 'British Museum',
        description: 'Clay tablet',
        date: 1925,
        toString: 'British Museum, 1925 (Clay tablet)',
        dto: {
          supplier: 'British Museum',
          date: 1925,
          description: 'Clay tablet',
        },
      },
    ],
  ]

  describe.each(testCases)('%s', (_, acquisition, expected) => {
    it('has expected properties', () => {
      expect(acquisition.supplier).toEqual(expected.supplier)
      expect(acquisition.description).toEqual(expected.description)
      expect(acquisition.date).toEqual(expected.date)
    })

    it('formats string representation correctly', () => {
      expect(acquisition.toString()).toEqual(expected.toString)
    })

    it('converts to DTO correctly', () => {
      expect(acquisition.toDto()).toEqual(expected.dto)
    })
  })

  describe('Dto conversions', () => {
    it('creates from DTO correctly', () => {
      const dto = { supplier: 'Louvre', date: 1800, description: 'Painting' }
      const acquisition = Acquisition.fromDto(dto)
      expect(acquisition.toDto()).toEqual(dto)
    })
  })

  describe('Immutable updates', () => {
    const original = new Acquisition('Original', 2000, 'Original description')

    const updateCases = [
      ['supplier', 'setSupplier', 'Updated', { supplier: 'Updated' }],
      ['date', 'setDate', 2020, { date: 2020 }],
      ['description', 'setDescription', 'Updated', { description: 'Updated' }],
      ['date', 'setDate', undefined, { date: undefined }],
    ]

    describe.each(updateCases)('%s', (_, method, value, expected) => {
      it('creates new instance with updated value', () => {
        const updated = original[method](value)
        expect(updated).toMatchObject(expected)
        expect(updated).not.toBe(original)
      })
    })
  })

  describe('Edge cases', () => {
    it('handles empty description', () => {
      const a = new Acquisition('Smithsonian', 1900, '')
      expect(a.toString()).toBe('Smithsonian, 1900')
    })

    it('handles zero date', () => {
      const a = new Acquisition('Smithsonian', 0)
      expect(a.toString()).toBe('Smithsonian')
    })

    it('handles empty description with date', () => {
      const a = new Acquisition('Smithsonian', 1900, '')
      expect(a.toString()).toBe('Smithsonian, 1900')
    })

    it('handles zero date with description', () => {
      const a = new Acquisition('Smithsonian', 0, 'Artifact')
      expect(a.toString()).toBe('Smithsonian (Artifact)')
    })
  })
})
