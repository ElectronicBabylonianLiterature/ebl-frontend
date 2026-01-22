import { immerable } from 'immer'

interface FolioType {
  readonly name: string
  readonly hasImage: boolean
  readonly isOpen: boolean
}

const folioTypes: {
  readonly [key: string]: FolioType
} = {
  AHA: { name: 'Aaboe', hasImage: true, isOpen: true },
  AKG: { name: 'Grayson', hasImage: true, isOpen: true },
  ARG: { name: 'George', hasImage: true, isOpen: false },
  ARGC: { name: 'George Copies', hasImage: true, isOpen: true },
  AS: { name: 'Shaffer', hasImage: true, isOpen: false },
  CB: { name: 'Bezold', hasImage: true, isOpen: true },
  EL: { name: 'Leichty', hasImage: true, isOpen: true },
  ER: { name: 'Reiner', hasImage: true, isOpen: true },
  EVW: { name: 'von Weiher', hasImage: true, isOpen: false },
  FWG: { name: 'Geers', hasImage: true, isOpen: true },
  GS: { name: 'Smith', hasImage: true, isOpen: true },
  HHF: { name: 'Figulla', hasImage: true, isOpen: true },
  ILF: { name: 'Finkel', hasImage: true, isOpen: false },
  JA: { name: 'Aro', hasImage: true, isOpen: true },
  JPB: { name: 'Britton', hasImage: true, isOpen: true },
  JLP: { name: 'Peterson', hasImage: true, isOpen: false },
  JNP: { name: 'Postgate', hasImage: true, isOpen: false },
  JS: { name: 'Strassmaier', hasImage: true, isOpen: true },
  JVD: { name: 'van Dijk', hasImage: true, isOpen: false },
  LV: { name: 'Vacín', hasImage: true, isOpen: true },
  MJG: { name: 'Geller', hasImage: true, isOpen: false },
  RB: { name: 'Borger', hasImage: true, isOpen: true },
  SJL: { name: 'Lieberman', hasImage: true, isOpen: true },
  SP: { name: 'Parpola', hasImage: true, isOpen: false },
  UG: { name: 'Gabbay', hasImage: true, isOpen: false },
  USK: { name: 'Koch', hasImage: true, isOpen: false },
  VAM: { name: 'Vorderasiatisches Museum', hasImage: true, isOpen: true },
  WGL: { name: 'Lambert', hasImage: true, isOpen: true },
  WRM: { name: 'Mayer', hasImage: true, isOpen: false },
}

const FOLIO_MAPPING: Record<string, string> = {
  ARGC: 'ARG',
}

export function getMappedFolio(folioInitials: string): string {
  return FOLIO_MAPPING[folioInitials] ?? folioInitials
}

export default class Folio {
  [immerable] = true
  readonly name: string
  readonly number: string
  private readonly type: FolioType
  constructor({ name, number }: { name: string; number: string }) {
    this.name = name
    this.number = number
    this.type = folioTypes[name] || { name, hasImage: false, isOpen: false }
  }
  get humanizedName(): string {
    return this.type.name
  }
  get hasImage(): boolean {
    return this.type.hasImage
  }
  get fileName(): string {
    return `${this.name}_${this.number}`
  }
  get isOpen(): boolean {
    return this.type.isOpen
  }
  get isRestricted(): boolean {
    return !this.type.isOpen
  }
}
