import type { ReactNode } from 'react'
import type { MahjongTile } from '../model/types'
import { getMahjongBambooPositions, getMahjongCirclePips, getMahjongTileCaption } from './mahjongFaceData'

type FaceProps = { tile: MahjongTile }

const FaceSvg = ({ children, className = '' }: { children: ReactNode; className?: string }) =>
  <svg aria-hidden="true" focusable="false" className={`mahjong-face__art ${className}`} viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">{children}</svg>

const CircleFace = ({ tile }: FaceProps) => {
  const value = Number(tile.value)
  return <FaceSvg className="mahjong-face__circles">{getMahjongCirclePips(value).map(([x, y], index) => {
    const radius = value === 1 ? 15 : value === 9 ? 7.5 : 9
    const color = ['#315f91', '#b44b45', '#3a765b'][(index + value) % 3]
    return <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={radius} fill={color} stroke="#274c68" strokeWidth="2" />
      <circle cx={x} cy={y} r={radius * .56} fill="none" stroke="#f8f5e8" strokeWidth="1.6" opacity=".9" />
      {value === 1 ? <circle cx={x} cy={y} r="3.2" fill="#f5e7ba" /> : <circle cx={x} cy={y} r="1.5" fill="#f5e7ba" />}
    </g>
  })}</FaceSvg>
}

const BambooStalk = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}>
  <path d="M0 -12 L0 12" stroke="#34734d" strokeWidth="8" strokeLinecap="round" />
  <path d="M-1 -10 L-1 10" stroke="#b8d28e" strokeWidth="1.5" strokeLinecap="round" />
  <path d="M-4 -2 Q0 0 4 -2 M-4 5 Q0 7 4 5" fill="none" stroke="#1f583c" strokeWidth="1.5" />
  <path d="M-2 -5 Q-10 -13 -13 -11 Q-11 -5 -2 -4 M2 2 Q10 -6 13 -4 Q11 2 2 3" fill="#6a9d5c" stroke="#3e7248" strokeWidth="1" />
</g>

const OneBambooFace = () => <FaceSvg className="mahjong-face__one-bamboo">
  <path d="M21 103 Q49 80 76 34" fill="none" stroke="#38734a" strokeWidth="5" strokeLinecap="round" />
  <path d="M34 91 Q16 82 17 69 Q31 72 39 84 M47 73 Q66 77 72 89 Q57 92 45 80 M57 55 Q41 45 44 32 Q58 38 63 49" fill="#719d5d" stroke="#3c7148" strokeWidth="2" />
  <path d="M35 53 Q44 37 61 43 Q71 47 68 55 Q64 61 51 59 L43 69 Z" fill="#315f91" stroke="#284b65" strokeWidth="2" />
  <circle cx="64" cy="39" r="6" fill="#315f91" stroke="#284b65" strokeWidth="2" />
  <path d="M69 39 L80 42 L69 45 Z" fill="#b44b45" />
  <path d="M59 33 Q62 24 69 29 Q66 34 62 35" fill="#b44b45" />
  <path d="M39 53 Q26 44 27 37 Q40 40 46 50" fill="#6a9d5c" stroke="#3c7148" strokeWidth="2" />
</FaceSvg>

const BambooFace = ({ tile }: FaceProps) => {
  if (Number(tile.value) === 1) return <OneBambooFace />
  return <FaceSvg className="mahjong-face__bamboo">{getMahjongBambooPositions(Number(tile.value)).map(([x, y]) => <BambooStalk key={`${x}-${y}`} x={x} y={y} />)}</FaceSvg>
}

const CharacterFace = ({ tile }: FaceProps) => {
  const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
  const numeral = chineseNumbers[Number(tile.value) - 1] ?? String(tile.value)
  return <FaceSvg className="mahjong-face__character">
    <text x="50" y="53" textAnchor="middle" className="mahjong-face__cjk mahjong-face__cjk--red">{numeral}</text>
    <text x="50" y="94" textAnchor="middle" className="mahjong-face__cjk mahjong-face__cjk--ink">萬</text>
  </FaceSvg>
}

const WindFace = ({ tile }: FaceProps) => {
  const glyphs: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' }
  return <FaceSvg className="mahjong-face__wind"><text x="50" y="88" textAnchor="middle" className="mahjong-face__wind-glyph">{glyphs[String(tile.value)]}</text></FaceSvg>
}

const DragonFace = ({ tile }: FaceProps) => {
  if (tile.value === 'white') return <FaceSvg className="mahjong-face__white-dragon">
    <rect x="25" y="24" width="50" height="72" rx="5" fill="#f8f5e8" stroke="#73818a" strokeWidth="4" />
    <rect x="32" y="31" width="36" height="58" rx="2" fill="none" stroke="#b4c0bd" strokeWidth="2" />
    <path d="M40 51 H60 M40 60 H60 M40 69 H60" stroke="#7b8b8b" strokeWidth="3" strokeLinecap="round" />
  </FaceSvg>
  const glyph = tile.value === 'red' ? '中' : '發'
  const variant = tile.value === 'red' ? 'red' : 'green'
  return <FaceSvg className={`mahjong-face__dragon mahjong-face__dragon--${variant}`}><text x="50" y="87" textAnchor="middle">{glyph}</text></FaceSvg>
}

const Blossom = ({ x, y, color = '#c86c83', petals = 5, radius = 8 }: { x: number; y: number; color?: string; petals?: number; radius?: number }) => <g>
  {Array.from({ length: petals }, (_, index) => <ellipse key={index} cx={x} cy={y - radius * .55} rx={radius * .3} ry={radius * .58} fill={color} transform={`rotate(${index * 360 / petals} ${x} ${y})`} />)}
  <circle cx={x} cy={y} r={radius * .22} fill="#e3b75f" />
</g>

const FlowerFace = ({ tile }: FaceProps) => {
  if (tile.value === 'plum') return <FaceSvg className="mahjong-face__botanical">
    <path d="M24 99 Q48 68 78 25 M37 82 Q24 61 28 45 M53 61 Q71 60 81 49" fill="none" stroke="#71543f" strokeWidth="4" strokeLinecap="round" />
    <Blossom x={30} y={46} color="#d9869a" /><Blossom x={69} y={55} color="#e5a4ad" /><Blossom x={67} y={31} color="#d9869a" />
    <Blossom x={44} y={74} color="#e5a4ad" radius={6} />
  </FaceSvg>
  if (tile.value === 'orchid') return <FaceSvg className="mahjong-face__botanical">
    <path d="M49 107 Q48 75 28 35 M50 105 Q52 69 72 28 M50 104 Q32 83 20 70 M50 102 Q70 82 82 67" fill="none" stroke="#4b8054" strokeWidth="4" strokeLinecap="round" />
    <Blossom x={42} y={42} color="#9672ad" radius={8} /><Blossom x={65} y={36} color="#ae83be" radius={8} /><Blossom x={52} y={66} color="#9a73b0" radius={7} />
  </FaceSvg>
  if (tile.value === 'chrysanthemum') return <FaceSvg className="mahjong-face__botanical">
    <path d="M50 104 Q49 84 49 70 M49 91 Q33 78 27 83 M50 86 Q65 73 74 79" fill="none" stroke="#4b8054" strokeWidth="4" strokeLinecap="round" />
    <path d="M28 84 Q38 82 42 90 Q33 93 28 84 M62 79 Q71 73 78 78 Q71 86 62 79" fill="#739761" />
    <Blossom x={50} y={45} color="#d28a46" petals={11} radius={18} />
    <circle cx="50" cy="45" r="5" fill="#9c6740" />
  </FaceSvg>
  return <FaceSvg className="mahjong-face__botanical">
    <path d="M31 105 L31 38 M48 105 L48 25 M65 105 L65 42" stroke="#34734d" strokeWidth="5" strokeLinecap="round" />
    <path d="M31 57 Q19 45 17 50 Q20 61 31 62 M48 48 Q62 37 67 42 Q62 52 48 53 M65 68 Q77 58 82 64 Q77 74 65 73" fill="#78a15d" stroke="#477549" strokeWidth="2" />
    <Blossom x={30} y={31} color="#e0a0a5" radius={6} /><Blossom x={48} y={20} color="#d78092" radius={7} /><Blossom x={66} y={34} color="#e0a0a5" radius={6} />
  </FaceSvg>
}

const SeasonFace = ({ tile }: FaceProps) => {
  if (tile.value === 'spring') return <FaceSvg className="mahjong-face__seasonal">
    <path d="M24 103 Q48 77 75 27 M39 88 Q23 78 21 62 M53 66 Q71 69 81 57" fill="none" stroke="#775843" strokeWidth="4" />
    <path d="M35 85 Q22 70 27 62 Q42 71 40 84 M59 63 Q71 50 80 55 Q76 68 62 68" fill="#77a566" />
    <Blossom x={31} y={56} color="#d8869c" radius={6} /><Blossom x={67} y={40} color="#e6a1ab" radius={7} /><Blossom x={52} y={74} color="#d8869c" radius={6} />
  </FaceSvg>
  if (tile.value === 'summer') return <FaceSvg className="mahjong-face__seasonal">
    <circle cx="50" cy="42" r="18" fill="#e7bf69" />
    <path d="M50 11 V17 M50 67 V74 M19 42 H25 M75 42 H82 M28 20 L33 25 M68 60 L73 65 M72 20 L67 25 M32 60 L27 65" stroke="#c28c47" strokeWidth="4" strokeLinecap="round" />
    <path d="M27 105 Q45 78 73 69 M31 96 Q17 84 18 77 Q33 81 37 91 M50 82 Q58 62 66 61 Q67 76 56 87" fill="#72995b" stroke="#47754c" strokeWidth="3" />
  </FaceSvg>
  if (tile.value === 'autumn') return <FaceSvg className="mahjong-face__seasonal">
    <path d="M27 105 Q49 76 74 26 M40 85 L26 58 M55 67 L77 59" fill="none" stroke="#765744" strokeWidth="4" />
    <path d="M26 58 Q14 43 26 35 Q42 43 34 58 Q30 61 26 58 M77 59 Q89 45 80 34 Q64 43 70 57 Q73 61 77 59 M47 76 Q34 63 43 53 Q57 62 52 76 Z" fill="#c77d3e" stroke="#995f36" strokeWidth="2" />
    <path d="M26 37 L29 55 M79 37 L75 55 M44 57 L49 72" stroke="#f0c47c" strokeWidth="2" />
  </FaceSvg>
  return <FaceSvg className="mahjong-face__seasonal">
    <path d="M50 21 L24 59 H36 L20 82 H43 V105 H57 V82 H80 L64 59 H76 Z" fill="#568066" stroke="#3a634d" strokeWidth="3" strokeLinejoin="round" />
    <path d="M21 37 L21 49 M15 43 H27 M76 75 L76 89 M69 82 H83 M38 24 L38 31 M34 27.5 H42" stroke="#83a7bb" strokeWidth="3" strokeLinecap="round" />
  </FaceSvg>
}

const faceFor = (tile: MahjongTile) => {
  if (tile.family === 'characters') return <CharacterFace tile={tile} />
  if (tile.family === 'dots') return <CircleFace tile={tile} />
  if (tile.family === 'bamboo') return <BambooFace tile={tile} />
  if (tile.family === 'winds') return <WindFace tile={tile} />
  if (tile.family === 'dragons') return <DragonFace tile={tile} />
  if (tile.family === 'flowers') return <FlowerFace tile={tile} />
  return <SeasonFace tile={tile} />
}

export const MahjongTileFace = ({ tile, labels }: { tile: MahjongTile; labels: boolean }) => <span className={`mahjong-face ${labels ? 'mahjong-face--labelled' : ''}`} aria-hidden="true">
  {faceFor(tile)}
  {labels ? <>
    <span className="mahjong-face__label mahjong-face__label--full">{getMahjongTileCaption(tile, true)}</span>
    <span className="mahjong-face__label mahjong-face__label--compact">{getMahjongTileCaption(tile, true, true)}</span>
  </> : null}
</span>
