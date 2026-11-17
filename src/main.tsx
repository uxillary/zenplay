import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/tailwind.css'
import { Bootstrap } from './seo/Bootstrap'
import { notFoundNavigation, parseAppPath } from './app/navigation'

const root = document.getElementById('root')!
const navigation = parseAppPath(root.dataset.page ?? window.location.pathname) ?? notFoundNavigation
const application = (
  <StrictMode>
    <Bootstrap navigation={navigation} />
  </StrictMode>
)

if (root.dataset.page) hydrateRoot(root, application)
else createRoot(root).render(application)
