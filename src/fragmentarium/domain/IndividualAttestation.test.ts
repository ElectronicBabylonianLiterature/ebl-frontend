import {
  IndividualAttestation,
  IndividualType,
} from 'fragmentarium/domain/IndividualAttestation'

it('formats broken, uncertain and missing values', () => {
  const individual = new IndividualAttestation({
    name: { value: 'Nabu', isBroken: true, isUncertain: true },
    sonOf: { isBroken: false },
    grandsonOf: { isUncertain: true },
    type: { value: IndividualType.Scribe },
  })

  expect(individual.toString()).toEqual('Scribe: [Nabu?], gs. …?')
})

it('sets the provenance of the individual', () => {
  const individual = new IndividualAttestation({}).setNativeOf({
    value: 'Babylon',
  })

  expect(individual.nativeOf).toEqual({ value: 'Babylon' })
  expect(individual.toString()).toEqual('n. Babylon')
})
