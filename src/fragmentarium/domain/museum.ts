import { museumsAToI } from 'fragmentarium/domain/museums/museumsAToI'
import { museumsKToP } from 'fragmentarium/domain/museums/museumsKToP'
import { museumsRToZ } from 'fragmentarium/domain/museums/museumsRToZ'

export const Museums = {
  ...museumsAToI,
  ...museumsKToP,
  ...museumsRToZ,
} as const

export type MuseumKey = keyof typeof Museums

export interface Museum {
  readonly key: MuseumKey
  readonly name: string
  readonly city: string
  readonly country: string
  readonly url?: string
  readonly copyright?: string
}
