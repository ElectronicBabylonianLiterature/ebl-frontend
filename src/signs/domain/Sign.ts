export default interface Sign {
  name: string
  lists: readonly SignListRecord[]
  values: readonly Value[]
  logograms: readonly Logogram[]
  mesZl: string
  unicode: readonly number[]
}

interface Logogram {
  logogram: string
  atf: string
  wordId: readonly string[]
  schrammLogogramme: string
}
interface Value {
  value: string
  subIndex: number | undefined
}

interface SignListRecord {
  name: string
  number: string
}

export interface SignQuery {
  value: string | undefined
  subIndex: number | undefined
  listsName: string | undefined
  listsNumber: string | undefined
  isIncludeHomophones: boolean | undefined
  isComposite: boolean | undefined
}
