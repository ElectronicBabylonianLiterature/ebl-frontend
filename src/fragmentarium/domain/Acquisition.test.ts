import { Acquisition } from './Acquisition'

describe('Acquisition', () => {
  describe('Basic functionality', () => {
    const testCases = [
      {
        name: 'Basic acquisition',
        acquisition: new Acquisition('British Museum'),
        expected: {
          supplier: 'British Museum',
          description: undefined,
          date: undefined,
          toString: 'British Museum',
          dto: { supplier: 'British Museum' },
        },
      },
      {
        name: 'With date',
        acquisition: new Acquisition('British Museum', 1925),
        expected: {
          supplier: 'British Museum',
          description: undefined,
          date: 1925,
          toString: 'British Museum, 1925',
          dto: { supplier: 'British Museum', date: 1925 },
        },
      },
      {
        name: 'With description',
        acquisition: new Acquisition(
          'British Museum',
          undefined,
          'Clay tablet'
        ),
        expected: {
          supplier: 'British Museum',
          description: 'Clay tablet',
          date: undefined,
          toString: 'British Museum (Clay tablet)',
          dto: { supplier: 'British Museum', description: 'Clay tablet' },
        },
      },
      {
        name: 'Complete acquisition',
        acquisition: new Acquisition('British Museum', 1925, 'Clay tablet'),
        expected: {
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
      },
    ]

    testCases.forEach(({ name, acquisition, expected }) => {
      describe(name, () => {
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

    it('setSupplier creates new instance with updated supplier', () => {
      const updated = original.setSupplier('Updated')
      expect(updated.supplier).toBe('Updated')
      expect(updated).not.toBe(original)
    })

    it('setDate creates new instance with updated date', () => {
      const updated = original.setDate(2020)
      expect(updated.date).toBe(2020)
      expect(updated).not.toBe(original)
    })

    it('setDescription creates new instance with updated description', () => {
      const updated = original.setDescription('Updated')
      expect(updated.description).toBe('Updated')
      expect(updated).not.toBe(original)
    })

    it('setDate handles undefined', () => {
      const updated = original.setDate(undefined)
      expect(updated.date).toBeUndefined()
      expect(updated).not.toBe(original)
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
