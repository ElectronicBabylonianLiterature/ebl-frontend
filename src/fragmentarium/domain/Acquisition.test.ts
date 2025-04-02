import { Acquisition } from './Acquisition'

describe('Acquisition', () => {
  describe.each([
    [
      'Basic acquisition',
      new Acquisition('British Museum'),
      {
        supplier: 'British Museum',
        description: undefined,
        date: undefined,
        toString: 'British Museum',
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
      },
    ],
  ])('%s', (_, acquisition, expected) => {
    test('has expected supplier', () => {
      expect(acquisition.supplier).toEqual(expected.supplier)
    })

    test('has expected description', () => {
      expect(acquisition.description).toEqual(expected.description)
    })

    test('has expected date', () => {
      expect(acquisition.date).toEqual(expected.date)
    })

    test('toString has expected format', () => {
      expect(acquisition.toString()).toEqual(expected.toString) // Changed to use class method
    })
  })
})
