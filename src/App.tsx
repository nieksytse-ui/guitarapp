import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import ChordsPage from '@/pages/ChordsPage'
import StrummingPage from '@/pages/StrummingPage'
import ChordChangePage from '@/pages/ChordChangePage'
import TheoryPage from '@/pages/TheoryPage'
import EarTrainingPage from '@/pages/EarTrainingPage'
import SongsPage from '@/pages/SongsPage'
import SessionsPage from '@/pages/SessionsPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/akkoorden" element={<ChordsPage />} />
        <Route path="/strumming" element={<StrummingPage />} />
        <Route path="/wissels" element={<ChordChangePage />} />
        <Route path="/theorie" element={<TheoryPage />} />
        <Route path="/gehoor" element={<EarTrainingPage />} />
        <Route path="/liedjes" element={<SongsPage />} />
        <Route path="/sessies" element={<SessionsPage />} />
        <Route path="/instellingen" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
