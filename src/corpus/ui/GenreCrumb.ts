import { Crumb } from 'common/ui/Breadcrumbs'
import createGenreLink from './createGenreLink'

export default class GenreCrumb implements Crumb {
  constructor(
    readonly text: string,
    readonly hasLink: boolean = true,
  ) {}

  get link(): string | null {
    return this.hasLink ? createGenreLink(this.text) : null
  }
}
