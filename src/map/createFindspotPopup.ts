import { buildFragmentSearchLink } from './mapLinks'

export function createFindspotPopup(name: string): HTMLDivElement {
  const content = document.createElement('div')
  const title = document.createElement('strong')
  const link = document.createElement('a')

  title.textContent = name
  link.textContent = 'View fragments'
  link.setAttribute('href', buildFragmentSearchLink(name))

  content.append(title, document.createElement('br'), link)

  return content
}
