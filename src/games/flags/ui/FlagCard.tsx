type Props = { src: string }

export const FlagCard = ({ src }: Props) => (
  <div className="flags-flag-card" role="img" aria-label="An unlabeled national flag. Identify the country shown." lang="und">
    <img className="flags-flag-card__image" src={src} alt="" aria-hidden="true" />
  </div>
)
