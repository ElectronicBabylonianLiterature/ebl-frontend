import { Crumb } from 'common/ui/Breadcrumbs'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'

export default class FragmentCrumb implements Crumb {
  readonly text: string

  constructor(text: string) {
    this.text = text
  }

  get link(): string {
    return createFragmentUrl(this.text)
  }
}
