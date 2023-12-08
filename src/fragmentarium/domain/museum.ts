import { Fragment } from './fragment'
import bmLogo from './The_British_Museum.png'
import ybcLogo from './YBC_small.jpg'

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
    return fragment.getExternalNumber('bmIdNumber') !== ''
  }

  createLinkFor(fragment: Fragment): FragmentLink {
    if (this.hasFragmentLink(fragment)) {
      const bmIdNumber = fragment.getExternalNumber('bmIdNumber')
      return {
        name: this.name,
        logo: this.logo,
        url: `https://www.britishmuseum.org/collection/object/${encodeURIComponent(
          bmIdNumber
        )}`,
        label: `The British Museum object ${bmIdNumber}`,
      }
    } else {
      throw new Error(`Fragment ${fragment.number} does not have bmIdNumber.`)
    }
  }
}

class YaleBabylonianCollection extends Museum {
  hasFragmentLink(fragment: Fragment) {
    return fragment.accession !== ''
  }

  createLinkFor(fragment: Fragment): FragmentLink {
    if (this.hasFragmentLink(fragment)) {
      const accession = fragment.accession.replace('.', '-')
      return {
        name: this.name,
        logo: this.logo,
        url: `https://collections.peabody.yale.edu/search/Record/YPM-${encodeURIComponent(
          accession
        )}`,
        label: this.name,
      }
    } else {
      throw new Error(`Fragment ${fragment.number} does not have accession.`)
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
        '© [The Trustees of the British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
      museumClass: BritishMuseum,
    },
  ],
  [
    'The Iraq Museum, Baghdad',
    {
      copyright:
        'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
    },
  ],
  [
    'Yale Babylonian Collection, Peabody Museum',
    {
      logo: ybcLogo,
      url: 'https://babylonian-collection.yale.edu/',
      copyright:
        'Courtesy of the [Yale Babylonian Collection](https://peabody.yale.edu/about-us/terms-use-what-you-need-know)',
      museumClass: YaleBabylonianCollection,
    },
  ],
])
