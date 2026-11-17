import { useEffect, useState, type ComponentType } from 'react'
import { appPathForNavigation, type AppNavigation } from '../app/navigation'
import { PublicShell } from './PublicShell'

export const Bootstrap = ({ navigation }: { navigation: AppNavigation }) => {
  const [runtime, setRuntime] = useState<{ App: ComponentType } | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  useEffect(() => {
    let active = true
    void import('../app/App').then((module) => {
      if (active) setRuntime(module)
    }).catch(() => { if (active) setLoadFailed(true) })
    return () => { active = false }
  }, [])
  // First browser render matches build output, independent of stored state.
  const ClientApp = runtime?.App
  return ClientApp ? <ClientApp /> : <>
    <PublicShell navigation={navigation} />
    {loadFailed ? <p role="alert" className="p-4">ZenPlay could not load. <a href={navigation.screen === 'not-found' ? '/' : appPathForNavigation(navigation)} className="underline">Reload ZenPlay</a></p> : null}
  </>
}
