// @flow
import _ from 'lodash'
import { Fragment } from './fragment'

export type FragmentLink = {| +url: string, +label: string |}
type FragmentLinkFactory = Fragment => FragmentLink

type MuseumConfig = {|
  +url?: string,
  +copyright?: string,
  +linkFactory?: FragmentLinkFactory
|}
const museums: $ReadOnlyMap<string, MuseumConfig> = new Map([
  [
    'The British Museum',
    {
      url: 'https://britishmuseum.org/',
      copyright:
        'Courtesy of the [Trustees of The British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
      linkFactory: fragment => {
        const bmIdNumber = fragment.bmIdNumber
        return {
          url: `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${encodeURIComponent(
            bmIdNumber
          )}&partId=1`,
          label: `The British Museum object ${bmIdNumber}`
        }
      }
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

export type MuseumData = {|
  +name: string,
  +url: string,
  +copyright: string,
  +linkFactory: ?FragmentLinkFactory
|}

export default class Museum {
  +name: string
  +url: string
  +copyright: string
  #linkFactory: ?FragmentLinkFactory

  static of(name: string): Museum {
    const data: MuseumData = {
      name,
      url: '',
      copyright: '',
      linkFactory: null,
      ...museums.get(name)
    }
    return new Museum(data)
  }

  constructor({ name, url, copyright, linkFactory }: MuseumData) {
    this.name = name
    this.url = url
    this.copyright = copyright
    this.#linkFactory = linkFactory
  }

  get hasUrl(): boolean {
    return this.url !== ''
  }

  get hasCopyright(): boolean {
    return this.copyright !== ''
  }

  get hasFragmentLink(): boolean {
    return !_.isNil(this.#linkFactory)
  }

  createLinkFor(fragment: Fragment): FragmentLink {
    return this.#linkFactory(fragment)
  }
}
