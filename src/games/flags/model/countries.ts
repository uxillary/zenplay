export type Country = {
  id: string
  name: string
  flag: string
  region: FlagRegion
}

export const FLAG_REGIONS = ['Europe', 'Asia', 'Africa', 'Americas', 'Oceania'] as const
export type FlagRegion = (typeof FLAG_REGIONS)[number]

// UN M49 geographic regions, restricted to the existing 195-country game set.
// M49 assigns Türkiye, Cyprus, Armenia, Azerbaijan, and Georgia to Asia; Russia to Europe.
const regionCountryIds: Record<FlagRegion, readonly string[]> = {
  Europe: 'al ad at by be ba bg hr cz dk ee fi fr de gr va hu is ie it lv li lt lu mt md mc me nl mk no pl pt ro ru sm rs sk si es se ch ua gb'.split(' '),
  Asia: 'af am az bh bd bt bn kh cn cy ge in id ir iq il jp jo kz kp kr kw kg la lb my mv mn mm np om pk ps ph qa sa sg lk sy tj th tl tr tm ae uz vn ye'.split(' '),
  Africa: 'dz eg ly ma sd tn ao bj bw bf bi cv cm cf td km cg cd ci dj gq er sz et ga gm gh gn gw ke ls lr mg mw ml mr mu mz na ne ng rw st sn sc sl so za ss tz tg ug zm zw'.split(' '),
  Americas: 'ag ar bs bb bz bo br ca cl co cr cu dm do ec sv gd gt gy ht hn jm mx ni pa py pe kn lc vc sr tt us uy ve'.split(' '),
  Oceania: 'au fj ki mh fm nr pw pg ws sb to tv vu nz'.split(' '),
}

const regionByCountryId = new Map<string, FlagRegion>(
  FLAG_REGIONS.flatMap((region) => regionCountryIds[region].map((id) => [id, region] as const)),
)

// ISO 3166-1 alpha-2 codes: UN member states plus the two UN observer states.
// The code list is a stable dataset convention, not an assertion about contested sovereignty.
const entries: ReadonlyArray<readonly [string, string]> = [
  ['af', 'Afghanistan'], ['al', 'Albania'], ['dz', 'Algeria'], ['ad', 'Andorra'], ['ao', 'Angola'], ['ag', 'Antigua and Barbuda'], ['ar', 'Argentina'], ['am', 'Armenia'], ['au', 'Australia'], ['at', 'Austria'],
  ['az', 'Azerbaijan'], ['bs', 'Bahamas'], ['bh', 'Bahrain'], ['bd', 'Bangladesh'], ['bb', 'Barbados'], ['by', 'Belarus'], ['be', 'Belgium'], ['bz', 'Belize'], ['bj', 'Benin'], ['bt', 'Bhutan'],
  ['bo', 'Bolivia'], ['ba', 'Bosnia and Herzegovina'], ['bw', 'Botswana'], ['br', 'Brazil'], ['bn', 'Brunei'], ['bg', 'Bulgaria'], ['bf', 'Burkina Faso'], ['bi', 'Burundi'], ['cv', 'Cabo Verde'], ['kh', 'Cambodia'],
  ['cm', 'Cameroon'], ['ca', 'Canada'], ['cf', 'Central African Republic'], ['td', 'Chad'], ['cl', 'Chile'], ['cn', 'China'], ['co', 'Colombia'], ['km', 'Comoros'], ['cg', 'Republic of the Congo'], ['cr', 'Costa Rica'],
  ['ci', "Côte d’Ivoire"], ['hr', 'Croatia'], ['cu', 'Cuba'], ['cy', 'Cyprus'], ['cz', 'Czechia'], ['kp', 'North Korea'], ['cd', 'Democratic Republic of the Congo'], ['dk', 'Denmark'], ['dj', 'Djibouti'], ['dm', 'Dominica'],
  ['do', 'Dominican Republic'], ['ec', 'Ecuador'], ['eg', 'Egypt'], ['sv', 'El Salvador'], ['gq', 'Equatorial Guinea'], ['er', 'Eritrea'], ['ee', 'Estonia'], ['sz', 'Eswatini'], ['et', 'Ethiopia'], ['fj', 'Fiji'],
  ['fi', 'Finland'], ['fr', 'France'], ['ga', 'Gabon'], ['gm', 'Gambia'], ['ge', 'Georgia'], ['de', 'Germany'], ['gh', 'Ghana'], ['gr', 'Greece'], ['gd', 'Grenada'], ['gt', 'Guatemala'],
  ['gn', 'Guinea'], ['gw', 'Guinea-Bissau'], ['gy', 'Guyana'], ['ht', 'Haiti'], ['hn', 'Honduras'], ['hu', 'Hungary'], ['is', 'Iceland'], ['in', 'India'], ['id', 'Indonesia'], ['ir', 'Iran'],
  ['iq', 'Iraq'], ['ie', 'Ireland'], ['il', 'Israel'], ['it', 'Italy'], ['jm', 'Jamaica'], ['jp', 'Japan'], ['jo', 'Jordan'], ['kz', 'Kazakhstan'], ['ke', 'Kenya'], ['ki', 'Kiribati'],
  ['kw', 'Kuwait'], ['kg', 'Kyrgyzstan'], ['la', 'Laos'], ['lv', 'Latvia'], ['lb', 'Lebanon'], ['ls', 'Lesotho'], ['lr', 'Liberia'], ['ly', 'Libya'], ['li', 'Liechtenstein'], ['lt', 'Lithuania'],
  ['lu', 'Luxembourg'], ['mg', 'Madagascar'], ['mw', 'Malawi'], ['my', 'Malaysia'], ['mv', 'Maldives'], ['ml', 'Mali'], ['mt', 'Malta'], ['mh', 'Marshall Islands'], ['mr', 'Mauritania'], ['mu', 'Mauritius'],
  ['mx', 'Mexico'], ['fm', 'Micronesia'], ['mc', 'Monaco'], ['mn', 'Mongolia'], ['me', 'Montenegro'], ['ma', 'Morocco'], ['mz', 'Mozambique'], ['mm', 'Myanmar'], ['na', 'Namibia'], ['nr', 'Nauru'],
  ['np', 'Nepal'], ['nl', 'Netherlands'], ['nz', 'New Zealand'], ['ni', 'Nicaragua'], ['ne', 'Niger'], ['ng', 'Nigeria'], ['mk', 'North Macedonia'], ['no', 'Norway'], ['om', 'Oman'], ['pk', 'Pakistan'],
  ['pw', 'Palau'], ['pa', 'Panama'], ['pg', 'Papua New Guinea'], ['py', 'Paraguay'], ['pe', 'Peru'], ['ph', 'Philippines'], ['pl', 'Poland'], ['pt', 'Portugal'], ['qa', 'Qatar'], ['kr', 'South Korea'],
  ['md', 'Moldova'], ['ro', 'Romania'], ['ru', 'Russia'], ['rw', 'Rwanda'], ['kn', 'Saint Kitts and Nevis'], ['lc', 'Saint Lucia'], ['vc', 'Saint Vincent and the Grenadines'], ['ws', 'Samoa'], ['sm', 'San Marino'], ['st', 'Sao Tome and Principe'],
  ['sa', 'Saudi Arabia'], ['sn', 'Senegal'], ['rs', 'Serbia'], ['sc', 'Seychelles'], ['sl', 'Sierra Leone'], ['sg', 'Singapore'], ['sk', 'Slovakia'], ['si', 'Slovenia'], ['sb', 'Solomon Islands'], ['so', 'Somalia'],
  ['za', 'South Africa'], ['ss', 'South Sudan'], ['es', 'Spain'], ['lk', 'Sri Lanka'], ['sd', 'Sudan'], ['sr', 'Suriname'], ['se', 'Sweden'], ['ch', 'Switzerland'], ['sy', 'Syria'], ['tj', 'Tajikistan'],
  ['th', 'Thailand'], ['tl', 'Timor-Leste'], ['tg', 'Togo'], ['to', 'Tonga'], ['tt', 'Trinidad and Tobago'], ['tn', 'Tunisia'], ['tr', 'Türkiye'], ['tm', 'Turkmenistan'], ['tv', 'Tuvalu'], ['ug', 'Uganda'],
  ['ua', 'Ukraine'], ['ae', 'United Arab Emirates'], ['gb', 'United Kingdom'], ['tz', 'Tanzania'], ['us', 'United States'], ['uy', 'Uruguay'], ['uz', 'Uzbekistan'], ['vu', 'Vanuatu'], ['ve', 'Venezuela'], ['vn', 'Vietnam'],
  ['ye', 'Yemen'], ['zm', 'Zambia'], ['zw', 'Zimbabwe'], ['va', 'Vatican City'], ['ps', 'State of Palestine'],
]

// ISO IDs map directly to same-named local SVGs in public/flags.
export const COUNTRIES: readonly Country[] = entries.map(([id, name]) => {
  const region = regionByCountryId.get(id)
  if (!region) throw new Error(`Country ${id} has no M49 region mapping.`)
  return { id, name, region, flag: `/flags/${id}.svg` }
})

export const getCountriesForRegion = (region: FlagRegion | 'all', countries: readonly Country[] = COUNTRIES): readonly Country[] =>
  region === 'all' ? countries : countries.filter((country) => country.region === region)

export const findCountry = (id: string): Country | undefined => COUNTRIES.find((country) => country.id === id)
