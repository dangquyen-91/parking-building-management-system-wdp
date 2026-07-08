import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
export default App
