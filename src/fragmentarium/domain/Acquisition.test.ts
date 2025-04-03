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

    const updateTestCases = [
      {
        name: 'supplier',
        method: 'setSupplier',
        value: 'Updated',
        expected: { supplier: 'Updated' },
      },
      {
        name: 'date',
        method: 'setDate',
        value: 2020,
        expected: { date: 2020 },
      },
      {
        name: 'description',
        method: 'setDescription',
        value: 'Updated',
        expected: { description: 'Updated' },
      },
      {
        name: 'date with undefined',
        method: 'setDate',
        value: undefined,
        expected: { date: undefined },
      },
    ]

    updateTestCases.forEach(({ name, method, value, expected }) => {
      it(`${method} creates new instance with updated ${name}`, () => {
        const updated = original[method](value)
        expect(updated).toMatchObject(expected)
        expect(updated).not.toBe(original)
      })
    })
  })

  describe('Edge cases', () => {
    const edgeCases = [
      {
        name: 'empty description',
        create: () => new Acquisition('Smithsonian', 1900, ''),
        expected: 'Smithsonian, 1900',
      },
      {
        name: 'zero date',
        create: () => new Acquisition('Smithsonian', 0),
        expected: 'Smithsonian',
      },
      {
        name: 'empty description with date',
        create: () => new Acquisition('Smithsonian', 1900, ''),
        expected: 'Smithsonian, 1900',
      },
      {
        name: 'zero date with description',
        create: () => new Acquisition('Smithsonian', 0, 'Artifact'),
        expected: 'Smithsonian (Artifact)',
      },
    ]

    edgeCases.forEach(({ name, create, expected }) => {
      it(`handles ${name}`, () => {
        const a = create()
        expect(a.toString()).toBe(expected)
      })
    })
  })
})
