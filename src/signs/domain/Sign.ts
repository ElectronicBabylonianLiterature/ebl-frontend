export default interface Sign {
  name: string
  lists: readonly SignListRecord[]
  values: readonly Value[] | null
  logograms: readonly Logogram[]
  mesZl: string | null
}
interface Logogram {
  logogram: string
  atf: string
  wordId: readonly string[]
  schrammLogogramme: string
}
interface Value {
  value: string
  subIndex: number | null
}

interface SignListRecord {
  name: string
  number: string
}

export interface SignQuery {
  value: string
  subIndex: string
  isIncludeHomophones: boolean
  isComposite: boolean
  signList: string
}
