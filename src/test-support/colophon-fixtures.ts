import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  IndividualType,
  ColophonStatus,
  ColophonOwnership,
  ColophonType,
  Name,
  Individual,
  Colophon,
} from 'fragmentarium/ui/fragment/ColophonEditor'
import { Provenances } from 'corpus/domain/provenance'

const chance = new Chance()

const nameFactory = Factory.define<Name>(() => ({
  value: chance.name(),
  isBroken: chance.bool(),
  isUncertain: chance.bool(),
}))

const individualFactory = Factory.define<Individual>(() => ({
  name: nameFactory.build(),
  sonOf: chance.bool() ? nameFactory.build() : undefined,
  grandsonOf: chance.bool() ? nameFactory.build() : undefined,
  family: chance.bool() ? nameFactory.build() : undefined,
  nativeOf: chance.pickone(Object.values(Provenances)),
  type: chance.pickone(Object.values(IndividualType)),
}))

export const colophonFactory = Factory.define<Colophon>(() => ({
  colophonStatus: chance.pickone(Object.values(ColophonStatus)),
  colophonOwnership: chance.pickone(Object.values(ColophonOwnership)),
  colophonType: chance.pickone(Object.values(ColophonType)),
  originalFrom: chance.pickone(Object.values(Provenances)),
  writtenIn: chance.pickone(Object.values(Provenances)),
  notesToScribalProcess: chance.sentence(),
  individuals: individualFactory.buildList(chance.integer({ min: 0, max: 5 })),
}))
