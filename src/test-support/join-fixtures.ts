import { Factory } from 'fishery'
import { Chance } from 'chance'
import { Join } from 'fragmentarium/domain/join'

const defaultChance = new Chance()

export type JoinWithMuseumNumber =
  | Omit<Join, 'museumNumber'>
  | { museumNumber: { prefix: string; number: string; suffix: string } }

export const joinDtoFactory = Factory.define<
  JoinWithMuseumNumber,
  { chance: Chance.Chance }
>(({ sequence, transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    museumNumber: { prefix: 'X', number: `${sequence}`, suffix: '' },
    isChecked: chance.bool(),
    joinedBy: chance.last(),
    date: chance.sentence(),
    note: chance.sentence(),
    legacyData: chance.sentence(),
    isInFragmentarium: chance.bool(),
    isEnvelope: chance.bool(),
  }
})

export const joinFactory = Factory.define<Join>(({ sequence }) => ({
  museumNumber: `X.${sequence}`,
  isChecked: defaultChance.bool(),
  joinedBy: defaultChance.last(),
  date: defaultChance.sentence(),
  note: defaultChance.sentence(),
  legacyData: defaultChance.sentence(),
  isInFragmentarium: defaultChance.bool(),
  isEnvelope: defaultChance.bool(),
}))
