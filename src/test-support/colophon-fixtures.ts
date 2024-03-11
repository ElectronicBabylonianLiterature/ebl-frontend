import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  IndividualType,
  ColophonStatus,
  ColophonOwnership,
  ColophonType,
  NameAttestation,
  Individual,
  Colophon,
  ProvenanceAttestation,
} from 'fragmentarium/ui/fragment/ColophonEditor'
import { Provenances } from 'corpus/domain/provenance'

const chance = new Chance()

const nameAttestationFactory = Factory.define<NameAttestation>(() => ({
  value: chance.name(),
  isBroken: chance.bool(),
  isUncertain: chance.bool(),
}))

const provenanceAttestationFactory = Factory.define<ProvenanceAttestation>(
  () => ({
    value: chance.pickone(Object.values(Provenances)),
    isBroken: chance.bool(),
    isUncertain: chance.bool(),
  })
)

const individualFactory = Factory.define<Individual>(() => ({
  name: nameAttestationFactory.build(),
  sonOf: chance.bool() ? nameAttestationFactory.build() : undefined,
  grandsonOf: chance.bool() ? nameAttestationFactory.build() : undefined,
  family: chance.bool() ? nameAttestationFactory.build() : undefined,
  nativeOf: provenanceAttestationFactory.build(),
  type: chance.pickone(Object.values(IndividualType)),
}))

export const colophonFactory = Factory.define<Colophon>(() => ({
  colophonStatus: chance.pickone(Object.values(ColophonStatus)),
  colophonOwnership: chance.pickone(Object.values(ColophonOwnership)),
  colophonType: chance.pickone(Object.values(ColophonType)),
  originalFrom: provenanceAttestationFactory.build(),
  writtenIn: provenanceAttestationFactory.build(),
  notesToScribalProcess: chance.sentence(),
  individuals: individualFactory.buildList(chance.integer({ min: 0, max: 5 })),
}))
