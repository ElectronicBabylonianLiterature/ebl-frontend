// @flow
import _ from 'lodash'
import { Fragment } from './fragment'
import bmLogo from './The_British_Museum.png'

export type FragmentLink = {|
  +name: string,
  +logo: string,
  +url: string,
  +label: string
|}

export type MuseumData = {
  +name: string,
  +url: string,
  +logo: string,
  +copyright: string
}

export default class Museum {
  +name: string
  +logo: string
  +url: string
  +copyright: string

  static of(name: string): Museum {
    const data = {
      name,
      logo: '',
      url: '',
      copyright: '',
      museumClass: Museum,
      ...museums.get(name)
    }
    return new data.museumClass(data)
  }

  constructor({ name, logo, url, copyright }: MuseumData) {
    this.name = name
    this.logo = logo
    this.url = url
    this.copyright = copyright
  }

  get hasUrl(): boolean {
    return this.url !== ''
  }

  get hasCopyright(): boolean {
    return this.copyright !== ''
  }

  hasFragmentLink(fragment: Fragment): boolean {
    return false
  }

  createLinkFor(fragment: Fragment): FragmentLink {
    throw new Error(`${this.name} does not support fragment links.`)
  }
}

class BritishMuseum extends Museum {
  hasFragmentLink(fragment) {
    return fragment.bmIdNumber !== ''
  }

  createLinkFor(fragment) {
    if (this.hasFragmentLink(fragment)) {
      const bmIdNumber = fragment.bmIdNumber
      return {
        name: this.name,
        logo: this.logo,
        url: `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${encodeURIComponent(
          bmIdNumber
        )}&partId=1`,
        label: `The British Museum object ${bmIdNumber}`
      }
    } else {
      throw new Error(`Fragment ${fragment.number} does not have bmIdNumber.`)
    }
  }
}

type MuseumConfig = {|
  +logo?: string,
  +url?: string,
  +copyright?: string,
  +museumClass?: Class<Museum>
|}

const museums: $ReadOnlyMap<string, MuseumConfig> = new Map([
  [
    'The British Museum',
    {
      logo: bmLogo,
      url: 'https://britishmuseum.org/',
      copyright:
        'Courtesy of the [Trustees of The British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
      museumClass: BritishMuseum
    }
  ],
  [
    'National Museum of Iraq',
    {
      copyright:
        'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum'
    }
  ]
])
