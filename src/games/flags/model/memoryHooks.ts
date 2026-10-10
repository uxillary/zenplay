import { COUNTRIES } from './countries.ts'

export const FLAG_MEMORY_HOOK_CATEGORIES = ['visual', 'symbol', 'comparison', 'country'] as const
export type FlagMemoryHookCategory = (typeof FLAG_MEMORY_HOOK_CATEGORIES)[number]

export type FlagMemoryHook = {
  countryId: string
  hook: string
  explanation?: string
  category: FlagMemoryHookCategory
  sources: readonly { title: string; url: string }[]
  relatedCountryIds?: readonly string[]
}

const fotw = (countryCode: string) => ({
  title: 'Flags of the World — national flag description',
  url: `https://www.fotw.info/flags/${countryCode}.html`,
})
const brazilGov = {
  title: 'Government of Brazil — National Flag',
  url: 'https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/simbolos-nacionais/bandeira/bandeira-nacional',
}
const indiaGov = {
  title: 'Know India — Indian Tricolour',
  url: 'https://knowindia.india.gov.in/my-india-my-pride/indian-tricolor.php',
}
const saudiGov = {
  title: 'Saudi National Platform — Know About Kingdom',
  url: 'https://my.gov.sa/en/content/139',
}
const ukArchives = {
  title: 'The National Archives — Act of Union 1801',
  url: 'https://www.nationalarchives.gov.uk/education/resources/significant-events/act-of-union-1801/',
}

// Keep claims short, flag-specific, and supported by the cited vexillological
// reference. The local SVGs were checked against each visual description.
export const FLAG_MEMORY_HOOKS = [
  { countryId: 'jp', hook: 'Look for the red sun disc centred on a plain white field.', category: 'visual', sources: [fotw('jp')] },
  { countryId: 'al', hook: 'Albania’s red field carries a black eagle with two heads.', category: 'visual', sources: [fotw('al')] },
  { countryId: 'np', hook: 'Nepal’s flag is the only national flag that is not rectangular.', explanation: 'Its shape joins two pennants, one above the other.', category: 'country', sources: [fotw('np')] },
  { countryId: 'fj', hook: 'On Fiji’s pale-blue field, find a Union Jack and a small shield.', category: 'visual', sources: [fotw('fj')] },
  { countryId: 'zm', hook: 'Zambia places an orange eagle above red, black, and orange stripes near the fly.', category: 'visual', sources: [fotw('zm')] },
  { countryId: 'ca', hook: 'Canada’s red maple leaf sits between two broad red side panels.', category: 'visual', sources: [fotw('ca')] },
  { countryId: 'br', hook: 'Brazil’s yellow diamond frames a blue globe crossed by a white band.', category: 'visual', sources: [brazilGov] },
  { countryId: 'kr', hook: 'South Korea pairs a red-and-blue taegeuk with four black trigrams.', category: 'visual', sources: [fotw('kr')] },
  { countryId: 'in', hook: 'A 24-spoke Dharma Chakra, or wheel of law, sits in India’s white stripe.', category: 'symbol', sources: [indiaGov] },
  { countryId: 'ch', hook: 'Switzerland’s bold white cross is centred on a distinctive square red flag.', category: 'visual', sources: [fotw('ch')] },
  { countryId: 'jm', hook: 'Jamaica’s gold diagonal cross divides the green and black sections.', category: 'visual', sources: [fotw('jm')] },
  { countryId: 'bt', hook: 'A white dragon stretches across Bhutan’s diagonal yellow and orange fields.', category: 'visual', sources: [fotw('bt')] },
  { countryId: 'za', hook: 'South Africa’s green Y-shape joins the flag’s coloured sections.', category: 'visual', sources: [fotw('za')] },
  { countryId: 'gb', hook: 'The Union Flag combines the crosses of England, Scotland, and Ireland, joined under one sovereign.', category: 'symbol', sources: [ukArchives] },
  { countryId: 'gr', hook: 'Greece combines nine blue-and-white stripes with a white cross in a blue corner.', category: 'visual', sources: [fotw('gr')] },
  { countryId: 'mx', hook: 'Mexico’s green-white-red stripes resemble Italy’s; the eagle emblem identifies Mexico.', category: 'comparison', sources: [fotw('mx'), fotw('it')], relatedCountryIds: ['it'] },
  { countryId: 'sa', hook: 'Saudi Arabia’s flag pairs the Shahada, Islam’s declaration of faith, with a white sword.', category: 'symbol', sources: [saudiGov] },
  { countryId: 'kz', hook: 'Kazakhstan’s sky-blue field centres a gold sun above a soaring eagle.', category: 'visual', sources: [fotw('kz')] },
  { countryId: 'ar', hook: 'Argentina’s pale-blue and white stripes are marked by a golden Sun of May.', category: 'visual', sources: [fotw('ar')] },
  { countryId: 'sc', hook: 'Seychelles is easy to spot by its five coloured bands fanning from one corner.', category: 'visual', sources: [fotw('sc')] },
  { countryId: 'fr', hook: 'France’s blue, white, and red stripes run vertically, with blue beside the flagstaff.', category: 'visual', sources: [fotw('fr')] },
  { countryId: 'de', hook: 'Germany stacks black, red, and gold in three equal horizontal bands.', category: 'visual', sources: [fotw('de')] },
  { countryId: 'it', hook: 'Italy’s green, white, and red stripes run vertically from the flagstaff.', category: 'visual', sources: [fotw('it')] },
  { countryId: 'es', hook: 'Spain’s wider yellow stripe sits between two red stripes, with its coat of arms near the flagstaff.', category: 'visual', sources: [fotw('es')] },
  { countryId: 'pt', hook: 'Portugal splits green and red vertically, with its armillary sphere and shield across the divide.', category: 'symbol', sources: [fotw('pt')] },
  { countryId: 'cz', hook: 'A blue triangle at the flagstaff cuts into Czechia’s white-over-red horizontal bands.', category: 'visual', sources: [fotw('cz')] },
  { countryId: 'no', hook: 'Norway’s blue Nordic cross, edged in white, sits on a red field.', category: 'visual', sources: [fotw('no')] },
  { countryId: 'se', hook: 'Look for Sweden’s yellow Nordic cross against a blue background.', category: 'visual', sources: [fotw('se')] },
  { countryId: 'dk', hook: 'Denmark’s white Nordic cross reaches the edges of its red flag.', category: 'visual', sources: [fotw('dk')] },
  { countryId: 'fi', hook: 'Finland’s blue Nordic cross stands out on a white field.', category: 'visual', sources: [fotw('fi')] },
  { countryId: 'pl', hook: 'Poland keeps it simple: white above red in two horizontal bands.', category: 'visual', sources: [fotw('pl')] },
  { countryId: 'ua', hook: 'Ukraine’s flag has just two horizontal bands: blue above yellow.', category: 'visual', sources: [fotw('ua')] },
  { countryId: 'cn', hook: 'China’s red field carries one large star and four smaller stars in its upper-left corner.', category: 'visual', sources: [fotw('cn')] },
  { countryId: 'pk', hook: 'Pakistan pairs a white stripe at the flagstaff with a green field, crescent, and star.', category: 'visual', sources: [fotw('pk')] },
  { countryId: 'bd', hook: 'Bangladesh places a red disc slightly towards the flagstaff on a green field.', category: 'visual', sources: [fotw('bd')] },
  { countryId: 'lk', hook: 'Sri Lanka’s golden lion holds a sword inside a maroon panel, beside green and orange stripes.', category: 'symbol', sources: [fotw('lk')] },
  { countryId: 'th', hook: 'Thailand’s wide blue centre stripe is bordered by paired white and red stripes.', category: 'visual', sources: [fotw('th')] },
  { countryId: 'vn', hook: 'Vietnam’s bright yellow five-pointed star sits in the centre of a red field.', category: 'visual', sources: [fotw('vn')] },
  { countryId: 'id', hook: 'Indonesia’s red-over-white flag resembles Monaco’s; Indonesia’s flag has a longer rectangular shape.', category: 'comparison', sources: [fotw('id'), fotw('mc')], relatedCountryIds: ['mc'] },
  { countryId: 'my', hook: 'Malaysia’s striped flag has a blue canton with a yellow crescent and multi-pointed star.', category: 'visual', sources: [fotw('my')] },
  { countryId: 'sg', hook: 'Singapore’s red-over-white flag has a white crescent and five stars in the upper-left corner.', category: 'visual', sources: [fotw('sg')] },
  { countryId: 'ph', hook: 'The Philippines’ white triangle holds a golden sun and three stars beside blue and red fields.', category: 'symbol', sources: [fotw('ph')] },
  { countryId: 'tr', hook: 'Türkiye’s white crescent and star sit together on a plain red field.', category: 'visual', sources: [fotw('tr')] },
  { countryId: 'ke', hook: 'Kenya centres a shield and crossed spears over black, red, and green bands edged in white.', category: 'symbol', sources: [fotw('ke')] },
  { countryId: 'ng', hook: 'Nigeria’s simple green-white-green vertical bands make a three-part design.', category: 'visual', sources: [fotw('ng')] },
  { countryId: 'gh', hook: 'Ghana’s black star sits in the middle of a red, gold, and green horizontal tricolour.', category: 'symbol', sources: [fotw('gh')] },
  { countryId: 'et', hook: 'Ethiopia’s green, yellow, and red bands frame a blue disc with a yellow star.', category: 'visual', sources: [fotw('et')] },
  { countryId: 'ma', hook: 'Morocco’s green interlaced star is centred on a plain red field.', category: 'visual', sources: [fotw('ma')] },
  { countryId: 'eg', hook: 'Egypt’s red, white, and black bands carry a golden eagle in the centre.', category: 'symbol', sources: [fotw('eg')] },
  { countryId: 'ug', hook: 'Uganda’s six black, yellow, and red bands meet at a grey crowned crane in a white disc.', category: 'symbol', sources: [fotw('ug')] },
  { countryId: 'tz', hook: 'Tanzania’s black diagonal band, edged in yellow, separates green and blue corners.', category: 'visual', sources: [fotw('tz')] },
  { countryId: 'us', hook: 'The United States flag pairs thirteen red-and-white stripes with a blue canton filled with stars.', category: 'visual', sources: [fotw('us')] },
  { countryId: 'cl', hook: 'Chile’s white star sits in a blue square above a white-and-red two-band field.', category: 'visual', sources: [fotw('cl')] },
  { countryId: 'co', hook: 'Colombia’s yellow upper band takes half the flag; blue and red fill the lower half.', category: 'visual', sources: [fotw('co')] },
  { countryId: 'pe', hook: 'Peru’s red-white-red vertical bands surround a detailed coat of arms on the central stripe.', category: 'symbol', sources: [fotw('pe')] },
  { countryId: 'uy', hook: 'Uruguay pairs blue stripes with a golden Sun of May in the upper-left white canton.', category: 'symbol', sources: [fotw('uy')] },
  { countryId: 'cu', hook: 'Cuba’s red triangle and white star point into alternating blue and white stripes.', category: 'visual', sources: [fotw('cu')] },
  { countryId: 'bb', hook: 'Barbados places a black broken trident between two blue panels on a gold centre.', category: 'symbol', sources: [fotw('bb')] },
  { countryId: 'bs', hook: 'The Bahamas combines aquamarine, gold, and aquamarine stripes with a black triangle at the flagstaff.', category: 'visual', sources: [fotw('bs')] },
  { countryId: 'ni', hook: 'Nicaragua’s blue-white-blue bands frame a detailed coat of arms at the centre.', category: 'symbol', sources: [fotw('ni')] },
  { countryId: 'au', hook: 'Australia’s blue flag combines the Union Jack, a large Commonwealth Star, and the Southern Cross.', category: 'symbol', sources: [fotw('au')] },
  { countryId: 'nz', hook: 'New Zealand and Australia both show the Union Jack; New Zealand’s four Southern Cross stars are red.', category: 'comparison', sources: [fotw('nz'), fotw('au')], relatedCountryIds: ['au'] },
  { countryId: 'pg', hook: 'Papua New Guinea’s diagonal red-and-black field shows a yellow bird-of-paradise opposite white Southern Cross stars.', category: 'symbol', sources: [fotw('pg')] },
  { countryId: 'ws', hook: 'Samoa’s red field has a blue upper-left canton containing five white stars.', category: 'visual', sources: [fotw('ws')] },
  { countryId: 'to', hook: 'Tonga’s red flag has a white canton at the flagstaff, marked with a red cross.', category: 'symbol', sources: [fotw('to')] },
  { countryId: 'bw', hook: 'Botswana’s black horizontal stripe is edged in white and set between two broad light-blue bands.', category: 'visual', sources: [fotw('bw')] },
  { countryId: 'na', hook: 'Namibia’s golden sun sits in the upper hoist corner above a diagonal red stripe edged in white.', category: 'visual', sources: [fotw('na')] },
  { countryId: 'ls', hook: 'Three broad blue, white, and green horizontal bands carry a black Basotho hat in the centre.', category: 'symbol', sources: [fotw('ls')] },
  { countryId: 'sz', hook: 'Eswatini’s large black-and-white shield and spears sit on a red band between blue bands.', category: 'symbol', sources: [fotw('sz')] },
  { countryId: 'mw', hook: 'Malawi’s black upper stripe carries a red rising sun, above red and green bands.', category: 'visual', sources: [fotw('mw')] },
  { countryId: 'mz', hook: 'Mozambique’s red hoist triangle carries a yellow star with a book, hoe, and rifle.', category: 'symbol', sources: [fotw('mz')] },
  { countryId: 'ao', hook: 'Angola divides red and black horizontally, with a yellow machete, half gear, and star at the centre.', category: 'symbol', sources: [fotw('ao')] },
  { countryId: 'dz', hook: 'Algeria’s green and white vertical halves meet beneath a red crescent and star.', category: 'visual', sources: [fotw('dz')] },
  { countryId: 'tn', hook: 'Tunisia places a white disc with a red crescent and star on a plain red field.', category: 'visual', sources: [fotw('tn')] },
  { countryId: 'sn', hook: 'Senegal’s green star sits in the yellow stripe between green and red vertical bands, unlike Mali’s plain tricolour.', category: 'comparison', sources: [fotw('sn'), fotw('ml')], relatedCountryIds: ['ml'] },
  { countryId: 'ml', hook: 'Mali’s plain green, yellow, and red vertical stripes distinguish it from Senegal’s green-starred tricolour.', category: 'comparison', sources: [fotw('ml'), fotw('sn')], relatedCountryIds: ['sn'] },
  { countryId: 'ne', hook: 'Niger’s orange-white-green bands echo India’s colours, but Niger has an orange disc instead of a blue wheel.', category: 'comparison', sources: [fotw('ne'), indiaGov], relatedCountryIds: ['in'] },
  { countryId: 'cm', hook: 'Cameroon’s green, red, and yellow vertical bands meet at a yellow star in the centre.', category: 'visual', sources: [fotw('cm')] },
  { countryId: 'ci', hook: 'Côte d’Ivoire’s orange, white, and green stripes run vertically, with orange beside the flagstaff.', category: 'visual', sources: [fotw('ci')] },
  { countryId: 'bf', hook: 'Burkina Faso’s red-over-green bands are marked by a yellow star at the centre.', category: 'visual', sources: [fotw('bf')] },
  { countryId: 'bj', hook: 'Benin’s green vertical panel at the flagstaff meets yellow above red on the fly side.', category: 'visual', sources: [fotw('bj')] },
  { countryId: 'tg', hook: 'Togo’s red canton holds a white star above five alternating green and yellow stripes.', category: 'visual', sources: [fotw('tg')] },
  { countryId: 'lr', hook: 'Liberia’s flag resembles the United States flag, but has eleven stripes and one white star.', category: 'comparison', sources: [fotw('lr'), fotw('us')], relatedCountryIds: ['us'] },
  { countryId: 'sl', hook: 'Sierra Leone’s three simple bands run green, white, and blue from top to bottom.', category: 'visual', sources: [fotw('sl')] },
  { countryId: 'rw', hook: 'Rwanda’s broad blue upper band carries a golden sun near the fly, above yellow and green.', category: 'visual', sources: [fotw('rw')] },
  { countryId: 'bi', hook: 'Burundi’s white diagonal cross separates red and green panels around three red stars.', category: 'visual', sources: [fotw('bi')] },
  { countryId: 'cd', hook: 'A red diagonal stripe edged in yellow cuts across the Democratic Republic of the Congo’s blue field.', category: 'visual', sources: [fotw('cd')] },
  { countryId: 'mg', hook: 'Madagascar pairs a white vertical stripe at the hoist with red above green on the fly.', category: 'visual', sources: [fotw('mg')] },
  { countryId: 'kh', hook: 'Cambodia’s white Angkor Wat temple stands out on a red centre stripe between blue bands.', category: 'symbol', sources: [fotw('kh')] },
  { countryId: 'la', hook: 'Laos places a large white disc on a broad blue band between two red stripes.', category: 'visual', sources: [fotw('la')] },
  { countryId: 'mn', hook: 'Mongolia’s red, blue, and red vertical bands place a golden Soyombo symbol beside the flagstaff.', category: 'symbol', sources: [fotw('mn')] },
  { countryId: 'mm', hook: 'Myanmar’s yellow, green, and red horizontal bands meet beneath one large white star.', category: 'visual', sources: [fotw('mm')] },
  { countryId: 'bn', hook: 'Brunei’s yellow field is crossed by diagonal black and white bands, with a red emblem at the centre.', category: 'symbol', sources: [fotw('bn')] },
  { countryId: 'ir', hook: 'Iran’s green, white, and red horizontal bands frame a red emblem in the centre.', category: 'symbol', sources: [fotw('ir')] },
  { countryId: 'iq', hook: 'Iraq’s green Arabic inscription runs across the white band between red and black stripes.', category: 'symbol', sources: [fotw('iq')] },
  { countryId: 'il', hook: 'Israel’s blue Star of David sits between two blue horizontal stripes on white.', category: 'symbol', sources: [fotw('il')] },
  { countryId: 'jo', hook: 'Jordan’s white seven-pointed star sits in a red hoist triangle beside black, white, and green bands.', category: 'visual', sources: [fotw('jo')] },
  { countryId: 'kw', hook: 'Kuwait’s black trapezoid joins green, white, and red bands; the UAE instead has a red hoist panel.', category: 'comparison', sources: [fotw('kw'), fotw('ae')], relatedCountryIds: ['ae'] },
  { countryId: 'lb', hook: 'Lebanon’s green cedar tree fills the centre of a white band between two red bands.', category: 'symbol', sources: [fotw('lb')] },
  { countryId: 'om', hook: 'Oman’s red hoist band carries a white emblem beside horizontal white, red, and green bands.', category: 'symbol', sources: [fotw('om')] },
  { countryId: 'qa', hook: 'Qatar’s white hoist band meets the maroon field in a distinctive jagged edge.', category: 'visual', sources: [fotw('qa')] },
  { countryId: 'ae', hook: 'The United Arab Emirates combines a red hoist panel with horizontal green, white, and black bands.', category: 'visual', sources: [fotw('ae')] },
  { countryId: 'ye', hook: 'Yemen’s plain red, white, and black horizontal bands have no emblem or star.', category: 'visual', sources: [fotw('ye')] },
  { countryId: 'mv', hook: 'The Maldives places a white crescent inside a green rectangle on a red field.', category: 'visual', sources: [fotw('mv')] },
  { countryId: 'kg', hook: 'Kyrgyzstan’s yellow sun has crossed lines in its centre, set against a plain red field.', category: 'visual', sources: [fotw('kg')] },
  { countryId: 'at', hook: 'Austria’s flag is a plain red-white-red horizontal triband, with no emblem in its centre.', category: 'visual', sources: [fotw('at')] },
  { countryId: 'is', hook: 'Iceland’s red Nordic cross, edged in white, sits on a blue field.', category: 'visual', sources: [fotw('is')] },
  { countryId: 'hr', hook: 'Croatia’s red-white-blue stripes carry a central red-and-white checkerboard shield topped by smaller shields.', category: 'symbol', sources: [fotw('hr')] },
  { countryId: 'ro', hook: 'Romania’s blue, yellow, and red vertical bands form a plain tricolour without an emblem.', category: 'visual', sources: [fotw('ro')] },
  { countryId: 'rs', hook: 'Serbia’s red, blue, and white horizontal bands carry a crowned coat of arms near the hoist.', category: 'symbol', sources: [fotw('rs')] },
  { countryId: 'ru', hook: 'Russia’s white-blue-red bands reverse the Netherlands’ red-white-blue order, so check which colour sits at the top.', category: 'comparison', sources: [fotw('ru'), fotw('nl')], relatedCountryIds: ['nl'] },
  { countryId: 'si', hook: 'Slovenia and Slovakia both have a shield near the hoist; Slovenia’s shows a mountain and three stars.', category: 'comparison', sources: [fotw('si'), fotw('sk')], relatedCountryIds: ['sk'] },
  { countryId: 'sk', hook: 'Slovakia and Slovenia share white, blue, and red stripes; Slovakia’s shield shows a double cross on three peaks.', category: 'comparison', sources: [fotw('sk'), fotw('si')], relatedCountryIds: ['si'] },
  { countryId: 'be', hook: 'Belgium’s black, yellow, and red bands run vertically, unlike many tricolours with horizontal stripes.', category: 'visual', sources: [fotw('be')] },
  { countryId: 'nl', hook: 'The Netherlands’ red, white, and blue bands run horizontally, with no emblem in the centre.', category: 'visual', sources: [fotw('nl')] },
  { countryId: 'bo', hook: 'Bolivia’s red, yellow, and green horizontal bands carry a detailed coat of arms in the centre.', category: 'symbol', sources: [fotw('bo')] },
  { countryId: 'ec', hook: 'Ecuador’s wide yellow upper band sits above blue and red, with the coat of arms centred.', category: 'symbol', sources: [fotw('ec')] },
  { countryId: 'pa', hook: 'Panama quarters its flag into red and blue blocks, with a blue star and red star in the white quarters.', category: 'visual', sources: [fotw('pa')] },
  { countryId: 'cr', hook: 'Costa Rica’s broad red centre band is bordered by white and blue stripes, with a coat of arms at the hoist.', category: 'symbol', sources: [fotw('cr')] },
  { countryId: 'hn', hook: 'Honduras places five blue stars in an X pattern across the white band between blue stripes.', category: 'visual', sources: [fotw('hn')] },
  { countryId: 'sv', hook: 'El Salvador’s blue-white-blue stripes carry a detailed coat of arms in the centre.', category: 'symbol', sources: [fotw('sv')] },
  { countryId: 'gt', hook: 'Guatemala’s pale-blue vertical sides frame a white centre with a quetzal and coat of arms.', category: 'symbol', sources: [fotw('gt')] },
  { countryId: 'py', hook: 'Paraguay’s red, white, and blue horizontal stripes carry a seal in the centre of the white band.', category: 'symbol', sources: [fotw('py')] },
  { countryId: 'tt', hook: 'Trinidad and Tobago’s black diagonal stripe, edged in white, crosses a red field.', category: 'visual', sources: [fotw('tt')] },
  { countryId: 'bz', hook: 'Belize’s blue field has narrow red borders and a detailed coat of arms in the centre.', category: 'symbol', sources: [fotw('bz')] },
  { countryId: 'ki', hook: 'Kiribati’s red upper half shows a golden frigatebird and sun above blue-and-white waves.', category: 'symbol', sources: [fotw('ki')] },
  { countryId: 'fm', hook: 'Micronesia’s four white stars form a diamond on a light-blue field.', category: 'visual', sources: [fotw('fm')] },
  { countryId: 'pw', hook: 'Palau’s golden disc sits just left of centre on a light-blue field.', category: 'visual', sources: [fotw('pw')] },
  { countryId: 'sb', hook: 'Solomon Islands divides blue and green diagonally with a yellow stripe and five white stars.', category: 'visual', sources: [fotw('sb')] },
  { countryId: 'vu', hook: 'Vanuatu’s black Y-shape, edged in yellow, frames a boar’s tusk and crossed fern leaves.', category: 'symbol', sources: [fotw('vu')] },
] satisfies readonly FlagMemoryHook[]

const countryIds = new Set(COUNTRIES.map(({ id }) => id))
const hooksByCountryId = new Map(FLAG_MEMORY_HOOKS.map((entry) => [entry.countryId, entry]))

/** Returns reviewed learning content for a country, or undefined when none exists. */
export const getFlagMemoryHook = (countryId: string): FlagMemoryHook | undefined =>
  countryIds.has(countryId) ? hooksByCountryId.get(countryId) : undefined
