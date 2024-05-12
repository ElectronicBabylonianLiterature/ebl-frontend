import {
  Colophon,
  IndividualAttestation,
  ColophonStatus,
  ColophonOwnership,
  ColophonType,
  IndividualType,
} from 'fragmentarium/domain/Colophon'

describe('Colophon', () => {
  describe('constructor', () => {
    it('should initialize with empty values if no arguments provided', () => {
      const colophon = new Colophon({})
      expect(colophon.colophonStatus).toBeUndefined()
      expect(colophon.colophonOwnership).toBeUndefined()
      expect(colophon.colophonTypes).toBeUndefined()
      expect(colophon.originalFrom).toBeUndefined()
      expect(colophon.writtenIn).toBeUndefined()
      expect(colophon.notesToScribalProcess).toBeUndefined()
      expect(colophon.individuals).toBeUndefined()
    })

    it('should properly assign values', () => {
      const colophon = new Colophon({
        colophonStatus: ColophonStatus.Yes,
        colophonOwnership: ColophonOwnership.Library,
        colophonTypes: [ColophonType.AsbA],
        originalFrom: { value: 'Babylon', isBroken: false },
        writtenIn: { value: 'Assyria', isUncertain: true },
        notesToScribalProcess: 'Detailed notes',
        individuals: [
          new IndividualAttestation({ name: { value: 'John Doe' } }),
        ],
      })

      expect(colophon.colophonStatus).toEqual(ColophonStatus.Yes)
      expect(colophon.colophonOwnership).toEqual(ColophonOwnership.Library)
      expect(colophon.colophonTypes).toEqual([ColophonType.AsbA])
      expect(colophon.originalFrom?.value).toEqual('Babylon')
      expect(colophon.writtenIn?.isUncertain).toBeTruthy()
      expect(colophon.notesToScribalProcess).toEqual('Detailed notes')
      expect(colophon.individuals?.length).toEqual(1)
      if (colophon.individuals) {
        expect(colophon.individuals[0]?.name?.value).toEqual('John Doe')
      }
    })
  })

  describe('fromJson', () => {
    it('should create an instance from a DTO', () => {
      const colophonDto = {
        colophonStatus: ColophonStatus.Yes,
        colophonOwnership: ColophonOwnership.Private,
        colophonTypes: [ColophonType.AsbE],
        originalFrom: { value: 'Babylon', isBroken: false },
        writtenIn: { value: 'Assur', isUncertain: true },
        notesToScribalProcess: 'Notes here',
        individuals: [{ name: { value: 'Jane Doe', isUncertain: true } }],
      }

      const colophon = Colophon.fromJson(colophonDto)

      expect(colophon.colophonStatus).toEqual(ColophonStatus.Yes)
      expect(colophon.colophonOwnership).toEqual(ColophonOwnership.Private)
      expect(colophon.colophonTypes).toEqual([ColophonType.AsbE])
      expect(colophon.originalFrom?.value).toEqual('Babylon')
      expect(colophon.writtenIn?.value).toEqual('Assur')
      expect(colophon.notesToScribalProcess).toEqual('Notes here')
      expect(colophon.individuals?.length).toEqual(1)
      if (colophon.individuals) {
        expect(colophon.individuals[0].name?.value).toEqual('Jane Doe')
      }
    })
  })
})

describe('IndividualAttestation', () => {
  it('should correctly initialize properties', () => {
    const attestation = new IndividualAttestation({
      name: { value: 'John Doe', isBroken: true },
      type: { value: IndividualType.Owner },
    })

    expect(attestation.name?.value).toEqual('John Doe')
    expect(attestation.name?.isBroken).toBeTruthy()
    expect(attestation.type?.value).toEqual(IndividualType.Owner)
  })

  it('should update name field properly', () => {
    let attestation = new IndividualAttestation({
      name: { value: 'Initial Name' },
    })
    attestation = attestation.setNameField('name', { value: 'Updated Name' })
    expect(attestation.name?.value).toEqual('Updated Name')
  })

  it('should update type field properly', () => {
    let individual = new IndividualAttestation({
      type: { value: IndividualType.Scribe },
    })
    individual = individual.setTypeField({ value: IndividualType.Owner })
    expect(individual.type?.value).toEqual(IndividualType.Owner)
  })

  it('should format toString output correctly', () => {
    const attestation = new IndividualAttestation({
      type: { value: IndividualType.Scribe },
      name: { value: 'John Doe' },
      sonOf: { value: 'John Senior' },
    })
    expect(attestation.toString()).toEqual('Scribe: John Doe, s. John Senior')
  })
})
