import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  ColophonStatus,
  ColophonOwnership,
  ColophonType,
  Colophon,
} from 'fragmentarium/domain/Colophon'
import {
  IndividualType,
  NameAttestation,
  IndividualAttestation,
  ProvenanceAttestation,
  IndividualTypeAttestation,
} from 'fragmentarium/domain/IndividualAttestation'
import { Provenances } from 'corpus/domain/provenance'

const chance = new Chance('colophon-fixtures')

const nameAttestationFactory = Factory.define<NameAttestation>(() => ({
  value: chance.name(),
  isBroken: chance.bool(),
  isUncertain: chance.bool(),
}))

const provenanceAttestationFactory = Factory.define<ProvenanceAttestation>(
  () => ({
    value: chance.pickone(Object.values(Provenances)).name,
    isBroken: chance.bool(),
    isUncertain: chance.bool(),
  }),
)

const individualTypeAttestationFactory =
  Factory.define<IndividualTypeAttestation>(() => ({
    value: chance.pickone(Object.values(IndividualType)),
    isBroken: chance.bool(),
    isUncertain: chance.bool(),
  }))

const individualAttestationFactory = Factory.define<IndividualAttestation>(
  () => {
    return new IndividualAttestation({
      name: nameAttestationFactory.build(),
      sonOf: chance.bool() ? nameAttestationFactory.build() : undefined,
      grandsonOf: chance.bool() ? nameAttestationFactory.build() : undefined,
      family: chance.bool() ? nameAttestationFactory.build() : undefined,
      nativeOf: provenanceAttestationFactory.build(),
      type: individualTypeAttestationFactory.build(),
    })
  },
)

export const colophonFactory = Factory.define<Colophon>(() => ({
  colophonOwnership: chance.pickone(Object.values(ColophonOwnership)),
  colophonType: chance.pickone(Object.values(ColophonType)),
  colophonStatus: chance.pickone(Object.values(ColophonStatus)),
  originalFrom: provenanceAttestationFactory.build(),
  writtenIn: provenanceAttestationFactory.build(),
  notesToScribalProcess: chance.sentence(),
  individuals: individualAttestationFactory.buildList(
    chance.integer({ min: 1, max: 5 }),
  ),
}))
