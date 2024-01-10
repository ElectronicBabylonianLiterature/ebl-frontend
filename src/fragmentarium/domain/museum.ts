export const Museums = {
  ISTANBUL_ARKEOLOJI_MUSEUM: {
    name: 'İstanbul Arkeoloji Müzeleri',
    city: 'Istanbul',
    country: 'TUR',
    url: 'https://muze.gov.tr/muze-detay?SectionId=IAR01&DistId=IAR',
  },
  THE_IRAQ_MUSEUM: {
    name: 'The Iraq Museum',
    city: 'Baghdad',
    country: 'IRQ',
    url: 'https://theiraqmuseum.com/',
    copyright:
      'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
  },
  PENN_MUSEUM: {
    name: 'University of Pennsylvania Museum of Archaeology and Anthropology',
    city: 'Philadelphia',
    country: 'USA',
    url: 'https://www.penn.museum/',
  },
  ASHMOLEAN_MUSEUM: {
    name: 'Ashmolean Museum',
    city: 'Oxford',
    country: 'GBR',
    url: 'https://ashmolean.org/',
  },
  PHYSICIANS_COLLEGE_PHILADELPHIA: {
    name: 'College of Physicians of Philadelphia',
    city: 'Philadelphia',
    country: 'USA',
    url: 'https://www.collegeofphysicians.org/',
  },
  COUVENT_SAINT_ETIENNE: {
    name: 'Couvent Saint-Étienne',
    city: 'Jerusalem',
    country: 'ISR',
    url: 'https://www.ebaf.edu/couvent/',
  },
  REDPATH_MUSEUM: {
    name: 'Redpath Museum Ethnological Collections',
    city: 'Montreal',
    country: 'CAN',
    url: 'https://www.mcgill.ca/redpath/collections/ethnology',
  },
  HILPRECHT_COLLECTION: {
    name: 'Frau Professor Hilprecht Collection of Babylonian Antiquities',
    city: 'Jena',
    country: 'DEU',
    url:
      'https://www.gw.uni-jena.de/fakultaet/institut-fuer-orientalistik-indogermanistik-ur-und-fruehgeschichtliche-archaeologie/altorientalistik/hilprecht-sammlung',
  },
  HEARST_MUSEUM: {
    name: 'Phoebe A. Hearst Museum of Anthropology',
    city: 'Berkeley',
    country: 'USA',
    url: 'https://hearstmuseum.berkeley.edu/',
  },
  RYLANDS_INSTITUTE: {
    name: 'John Rylands Research Institute and Library',
    city: 'Manchester',
    country: 'GRB',
    url: 'https://www.library.manchester.ac.uk/rylands/',
  },
  KELSEY_MUSEUM: {
    name: 'Kelsey Museum of Archaeology',
    city: 'Ann Arbor',
    country: 'USA',
    url: 'https://lsa.umich.edu/kelsey',
  },
  KUNSTHISTORISCHES_MUSEUM: {
    name: 'Kunsthistorisches Museum',
    city: 'Vienna',
    country: 'AUT',
    url: 'https://www.khm.at/',
  },
  LOUVRE: {
    name: 'Louvre',
    city: 'Paris',
    country: 'FRA',
    url: 'https://www.louvre.fr/',
  },
  MUSEE_D_ART: {
    name: 'Musée d’Art et d’Histoire',
    city: 'Geneva',
    country: 'CHE',
    url: 'https://www.mahmah.ch/',
  },
  MUSEES_ROYAUX: {
    name: 'Musées royaux d’Art et d’Histoire',
    city: 'Brussels',
    country: 'BEL',
    url: 'https://www.kmkg-mrah.be/',
  },
  NATIONALMUSEET: {
    name: 'Nationalmuseet',
    city: 'Copenhagen',
    country: 'DNK',
    url: 'https://en.natmus.dk/',
  },
  OAKLAND_MUSEUM: {
    name: 'Oakland Museum of California',
    city: 'Oakland',
    country: 'USA',
    url: 'https://museumca.org/',
  },
  ANCIENT_CULTURES_CHICAGO: {
    name:
      'Institute for the Study of Ancient Cultures, West Asia & North Africa',
    city: 'Chicago',
    country: 'USA',
    url: 'https://isac.uchicago.edu/',
  },
  PIERPONT_MORGAN: {
    name: 'Pierpont Morgan Library & Museum',
    city: 'New York',
    country: 'USA',
    url: 'https://www.themorgan.org/',
  },
  PONTIFICAL_BIBLICAL_INSTITUTE: {
    name: 'Pontifical Biblical Institute',
    city: 'Rome',
    country: 'ITA',
    url: 'http://www.biblico.it/',
  },
  ROSICRUCIAN_EGYPTIAN_MUSEUM: {
    name: 'Rosicrucian Egyptian Museum',
    city: 'San Jose',
    country: 'USA',
    url: 'https://egyptianmuseum.org/',
  },
  THE_BRITISH_MUSEUM: {
    name: 'The British Museum',
    city: 'London',
    country: 'GBR',
    url: 'https://www.britishmuseum.org/',
    copyright:
      '© [The Trustees of the British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
  },
  TRINITY_COLLEGE_DUBLIN: {
    name: 'Trinity College Dublin',
    city: 'Dublin',
    country: 'IRL',
    url: 'https://www.tcd.ie/',
  },
  VATICAN_MUSEUMS: {
    name: 'Vatican Museums',
    city: 'Vatican City',
    country: 'VAT',
    url: 'http://www.museivaticani.va/',
  },
  VORDERASIATISCHES_MUSEUM: {
    name: 'Vorderasiatisches Museum',
    city: 'Berlin',
    country: 'DEU',
    url:
      'https://www.smb.museum/en/museums-institutions/vorderasiatisches-museum/home/',
  },
  THE_WALTERS_ART_MUSEUM: {
    name: 'The Walters Art Museum',
    city: 'Baltimore',
    country: 'USA',
    url: 'https://thewalters.org/',
  },
  YALE_PEABODY_COLLECTION: {
    name: 'Yale Peabody Museum, Yale Babylonian Collection',
    city: 'New Haven',
    country: 'USA',
    url:
      'https://peabody.yale.edu/explore/collections/yale-babylonian-collection',
  },
  ECOLE_PRATIQUE_DES_HAUTES_ETUDES: {
    name: 'École pratique des hautes Études',
    city: 'Paris',
    country: 'FRA',
    url: 'https://www.ephe.psl.eu/',
  },
  UNKNOWN: {
    name: '',
    city: '',
    country: '',
    url: '',
  },
} as const

export type Museum = typeof Museums[keyof typeof Museums]
export type MuseumKey = keyof typeof Museums

export interface FragmentLink {
  readonly name: string
  readonly city: string
  readonly country: string
  readonly url: string
}

export interface MuseumData {
  readonly name: string
  readonly city: string
  readonly country: string
  readonly url: string
  readonly logo: string
  readonly copyright: string
}
