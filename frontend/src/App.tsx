import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UserPage from './pages/UserPage'
import { ThemeProvider } from './hooks/useTheme'

/**
 * Корневой компонент приложения.
 * Настраивает роутинг и глобальный провайдер темы.
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Страница выбора пользователя */}
          <Route path="/" element={<HomePage />} />
          {/* Раздел лояльности конкретного пользователя */}
          <Route path="/users/:id" element={<UserPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App