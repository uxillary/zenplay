import type { FlagMemoryHook } from '../model/memoryHooks'

type Props = {
  hook: FlagMemoryHook
  prominent?: boolean
  questionKey: string
}

export const FlagLearningFeedback = ({ hook, prominent = false, questionKey }: Props) => {
  const content = <>
    <h3 id="flags-learning-heading" className="flags-learning__heading">Remember this flag</h3>
    <p>{hook.hook}</p>
    {hook.explanation ? <p className="flags-learning__explanation">{hook.explanation}</p> : null}
  </>

  if (prominent) return (
    <section className="flags-learning flags-learning--prominent" aria-labelledby="flags-learning-heading">
      <span className="flags-learning__icon" aria-hidden="true">✦</span>
      <div className="flags-learning__content">{content}</div>
    </section>
  )

  return (
    <details className="flags-learning" key={questionKey}>
      <summary><span className="flags-learning__icon" aria-hidden="true">✦</span><span>Did you know?</span></summary>
      <div className="flags-learning__content">{content}</div>
    </details>
  )
}
