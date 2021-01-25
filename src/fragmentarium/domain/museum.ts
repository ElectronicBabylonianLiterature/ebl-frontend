import { Fragment } from './fragment'
import bmLogo from './The_British_Museum.png'

export interface FragmentLink {
  readonly name: string
  readonly logo: string
  readonly url: string
  readonly label: string
}

export interface MuseumData {
  readonly name: string
  readonly url: string
  readonly logo: string
  readonly copyright: string
}

export default class Museum {
  static of(name: string): Museum {
    const data = {
      name,
      logo: '',
      url: '',
      copyright: '',
      museumClass: Museum,
      ...museums.get(name),
    }
    return new data.museumClass(data.name, data.logo, data.url, data.copyright)
  }

  protected constructor(
    readonly name: string,
    readonly logo: string,
    readonly url: string,
    readonly copyright: string
  ) {}

  get hasUrl(): boolean {
    return this.url !== ''
  }

  get hasCopyright(): boolean {
    return this.copyright !== ''
  }

  hasFragmentLink(_fragment: Fragment): boolean {
    return false
  }

  createLinkFor(_fragment: Fragment): FragmentLink {
    throw new Error(`${this.name} does not support fragment links.`)
  }
}

class BritishMuseum extends Museum {
  hasFragmentLink(fragment: Fragment) {
    return fragment.bmIdNumber !== ''
  }

  createLinkFor(fragment: Fragment): FragmentLink {
    if (this.hasFragmentLink(fragment)) {
      const bmIdNumber = fragment.bmIdNumber
      return {
        name: this.name,
        logo: this.logo,
        url: `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${encodeURIComponent(
          bmIdNumber
        )}&partId=1`,
        label: `The British Museum object ${bmIdNumber}`,
      }
    } else {
      throw new Error(`Fragment ${fragment.number} does not have bmIdNumber.`)
    }
  }
}

interface MuseumConfig {
  readonly logo?: string
  readonly url?: string
  readonly copyright?: string
  readonly museumClass?: typeof Museum
}

const museums: ReadonlyMap<string, MuseumConfig> = new Map([
  [
    'The British Museum',
    {
      logo: bmLogo,
      url: 'https://britishmuseum.org/',
      copyright:
        'Courtesy of the [Trustees of The British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
      museumClass: BritishMuseum,
    },
  ],
  [
    'National Museum of Iraq',
    {
      copyright:
        'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
    },
  ],
  [
    'Yale Babylonian Collection, Peabody Museum',
    {
      url: 'https://babylonian-collection.yale.edu/',
      copyright:
        'Courtesy of the [Yale Babylonian Collection](https://peabody.yale.edu/about-us/terms-use-what-you-need-know)',
    },
  ],
])
