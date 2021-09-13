import { Crumb } from 'common/Breadcrumbs'

export default class GenreCrumb implements Crumb {
  constructor(readonly text: string) {}

  get link(): string {
    return `/corpus/${this.text}`
  }
}
