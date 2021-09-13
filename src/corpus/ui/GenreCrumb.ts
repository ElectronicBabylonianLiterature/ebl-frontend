import { Crumb } from 'common/Breadcrumbs'
import createGenreLink from './createGenreLink'

export default class GenreCrumb implements Crumb {
  constructor(readonly text: string) {}

  get link(): string {
    return createGenreLink(this.text)
  }
}
