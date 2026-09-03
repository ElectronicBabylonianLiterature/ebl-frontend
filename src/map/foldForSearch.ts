const NON_SPACING_MARKS = /[\u0300-\u036f]/g
const NON_DECOMPOSING = /[ʾʿʼʽ’‘＇]/g

export default function foldForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(NON_SPACING_MARKS, '')
    .replace(NON_DECOMPOSING, '')
    .toLowerCase()
}
