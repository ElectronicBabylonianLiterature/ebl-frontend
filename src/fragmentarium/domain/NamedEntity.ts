import { EntityType } from 'fragmentarium/ui/text-annotation/EntityType'

export type NamedEntity = {
  readonly id: string
  readonly type: EntityType
}
