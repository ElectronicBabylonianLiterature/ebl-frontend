import { immerable } from 'immer'

interface FolioType {
  readonly name: string
  readonly hasImage: boolean
}

const folioTypes: {
  readonly [key: string]: FolioType
} = {
  WGL: { name: 'Lambert', hasImage: true },
  FWG: { name: 'Geers', hasImage: true },
  EL: { name: 'Leichty', hasImage: true },
  AKG: { name: 'Grayson', hasImage: true },
  MJG: { name: 'Geller', hasImage: true },
  WRM: { name: 'Mayer', hasImage: true },
  CB: { name: 'Bezold', hasImage: true },
  JS: { name: 'Strassmaier', hasImage: true },
  USK: { name: 'Koch', hasImage: true },
  ILF: { name: 'Finkel', hasImage: true },
  RB: { name: 'Borger', hasImage: true },
  SP: { name: 'Parpola', hasImage: true },
  ARG: { name: 'George', hasImage: true },
  ER: { name: 'Reiner', hasImage: true },
  UG: { name: 'Gabbay', hasImage: true },
  GS: { name: 'Smith', hasImage: true },
  EVW: { name: 'von Weiher', hasImage: true },
  SJL: { name: 'Lieberman', hasImage: true },
}

export default class Folio {
  [immerable] = true
  readonly name: string
  readonly number: string
  private readonly type: FolioType
  constructor({ name, number }: { name: string; number: string }) {
    this.name = name
    this.number = number
    this.type = folioTypes[name] || { name, hasImage: false }
  }
  get humanizedName(): string {
    return this.type.name
  }
  get hasImage(): boolean {
    return this.type.hasImage
  }
  get fileName(): string {
    return `${this.name}_${this.number}.jpg`
  }
}
