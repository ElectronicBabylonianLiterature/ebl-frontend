// @flow
import { isConstructorDeclaration } from 'typescript'

type MuseumConfig = {| +url: string, +copyright: string |}
const museums: $ReadOnlyMap<string, MuseumConfig> = new Map([
  [
    'The British Museum',
    {
      url: 'https://britishmuseum.org/',
      copyright:
        'Courtesy of the [Trustees of The British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)'
    }
  ],
  [
    'National Museum of Iraq',
    {
      url: '',
      copyright:
        'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum'
    }
  ]
])

export type MuseumData = {| +name: string, +url: string, +copyright: string |}

export default class Museum {
  +name: string
  +url: string
  +copyright: string

  static of(name: string): Museum {
    const data = { name, url: '', copyright: '', ...museums.get(name) }
    return new Museum(data)
  }

  constructor({ name, url, copyright }: MuseumData) {
    this.name = name
    this.url = url
    this.copyright = copyright
  }

  get hasUrl(): boolean {
    return this.url !== ''
  }

  get hasCopyright(): boolean {
    return this.copyright !== ''
  }
}
