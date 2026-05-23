import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  )
}
export default App
