import type { PairFaceId } from '../model/types'

export const PairFaceIcon = ({ face }: { face: PairFaceId }) => {
  const drawing = {
    sun: <><circle cx="32" cy="32" r="13" /><path d="M32 5v10M32 49v10M5 32h10M49 32h10M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7" fill="none" strokeWidth="4" /></>,
    star: <polygon points="32,5 39,24 59,24 43,36 49,56 32,44 15,56 21,36 5,24 25,24" />,
    heart: <path d="M32 55 9 32C-1 18 18 4 32 20 46 4 65 18 55 32Z" />,
    leaf: <><path d="M54 9C25 9 9 20 9 39c0 10 8 16 17 16 19 0 28-17 28-46Z" /><path d="M14 52c9-13 19-23 34-35" fill="none" stroke="var(--pairs-face-bg)" strokeWidth="3" /></>,
    house: <><path d="m6 30 26-22 26 22v27H6Z" /><path d="M25 57V38h14v19M13 31l19-16 19 16" fill="none" stroke="var(--pairs-face-bg)" strokeWidth="3" /></>,
    key: <><circle cx="20" cy="28" r="13" fill="none" strokeWidth="6" /><path d="M31 34 57 57M42 45l7-7M49 52l7-7" fill="none" strokeWidth="7" /></>,
    flower: <><circle cx="32" cy="15" r="10" /><circle cx="47" cy="27" r="10" /><circle cx="42" cy="45" r="10" /><circle cx="22" cy="45" r="10" /><circle cx="17" cy="27" r="10" /><circle cx="32" cy="31" r="8" fill="var(--pairs-face-bg)" /></>,
    umbrella: <><path d="M7 31a25 25 0 0 1 50 0H7Z" /><path d="M32 31v20c0 9 15 9 15 0" fill="none" strokeWidth="5" /></>,
    bell: <><path d="M13 46h38l-5-7V27a14 14 0 0 0-28 0v12Z" /><path d="M26 52a6 6 0 0 0 12 0" fill="none" strokeWidth="4" /></>,
    boat: <><path d="M8 40h48L45 56H20Z" /><path d="M31 8v30H13Z" /><path d="M36 13 53 35H36Z" /></>,
    apple: <><path d="M32 19c-14-12-29 1-25 19 3 15 12 23 25 16 13 7 22-1 25-16 4-18-11-31-25-19Z" /><path d="M32 18c0-9 6-14 15-14-1 8-6 13-15 14Z" /></>,
    tree: <><path d="M32 5 13 30h11L9 48h19v12h8V48h19L40 30h11Z" /></>,
  }[face]

  return <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className="pairs-face-icon">{drawing}</svg>
}
