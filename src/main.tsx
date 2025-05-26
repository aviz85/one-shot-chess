import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Main app root
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Stagewise toolbar integration (development only)
if (process.env.NODE_ENV === 'development') {
  import('@stagewise/toolbar-react').then(({ StagewiseToolbar }) => {
    // Create a separate container for the toolbar
    const toolbarContainer = document.createElement('div')
    toolbarContainer.id = 'stagewise-toolbar-root'
    document.body.appendChild(toolbarContainer)

    // Stagewise configuration
    const stagewiseConfig = {
      plugins: []
    }

    // Create separate React root for toolbar
    const toolbarRoot = createRoot(toolbarContainer)
    toolbarRoot.render(<StagewiseToolbar config={stagewiseConfig} />)
  }).catch((error) => {
    console.warn('Failed to load stagewise toolbar:', error)
  })
}
