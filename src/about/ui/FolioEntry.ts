import MarkupService from 'markup/application/MarkupService'

export interface FolioEntry {
  initials: string
  title: string
  content: (markupService: MarkupService) => JSX.Element
}
