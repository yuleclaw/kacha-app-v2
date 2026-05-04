import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AnniversaryPage from './pages/AnniversaryPage'
import FocusPage from './pages/FocusPage'
import PomodoroPage from './pages/PomodoroPage'
import TimerPage from './pages/TimerPage'
import StopwatchPage from './pages/StopwatchPage'
import FlashPage from './pages/FlashPage'
import ExpiryPage from './pages/ExpiryPage'
import WarrantyPage from './pages/WarrantyPage'
import CouponPage from './pages/CouponPage'
import ExpensePage from './pages/ExpensePage'
import ItemsPage from './pages/ItemsPage'
import SchedulePage from './pages/SchedulePage'
import TravelPage from './pages/TravelPage'
import TravelDetailPage from './pages/TravelDetailPage'
import ScanPage from './pages/ScanPage'
import SettingsPage from './pages/SettingsPage'
import StatsPage from './pages/StatsPage'
import AddPanel from './components/AddPanel'
import type { PageName } from './types'

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageName>('home')
  const [travelId, setTravelId] = useState('')
  const [scanMode, setScanMode] = useState('auto')
  const [showAddPanel, setShowAddPanel] = useState(false)

  const navigate = (page: PageName, opts?: { travelId?: string; scanMode?: string }) => {
    setCurrentPage(page)
    if (opts?.travelId) setTravelId(opts.travelId)
    if (opts?.scanMode) setScanMode(opts.scanMode)
    setShowAddPanel(false)
  }

  useEffect(() => {
    (window as any).kachaNavigate = (page: string, opts?: any) => {
      navigate(page as PageName, opts)
    }
  }, [])

  const handleBack = () => {
    if (['pomodoro', 'timer', 'stopwatch', 'flash'].includes(currentPage)) navigate('focus')
    else if (['expiry', 'warranty', 'coupon', 'expense'].includes(currentPage)) navigate('items')
    else if (currentPage === 'travel-detail') navigate('travel')
    else if (['scan', 'stats', 'settings', 'anniversary', 'schedule'].includes(currentPage)) navigate('home')
    else navigate('home')
  }

  const handleTabPress = (key: string) => {
    if (key === 'add') { setShowAddPanel(v => !v); return }
    if (key !== 'add') setShowAddPanel(false)
    navigate(key as PageName)
  }

  const showTabBar = ['home', 'focus', 'items', 'schedule', 'travel'].includes(currentPage)

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={(p) => navigate(p as PageName)} />
      case 'anniversary': return <AnniversaryPage onBack={handleBack} />
      case 'focus': return <FocusPage onNavigate={(p) => navigate(p as PageName)} />
      case 'pomodoro': return <PomodoroPage onBack={handleBack} />
      case 'timer': return <TimerPage onBack={handleBack} />
      case 'stopwatch': return <StopwatchPage onBack={handleBack} />
      case 'flash': return <FlashPage onBack={handleBack} />
      case 'expiry': return <ExpiryPage onBack={handleBack} />
      case 'warranty': return <WarrantyPage onBack={handleBack} />
      case 'coupon': return <CouponPage onBack={handleBack} />
      case 'expense': return <ExpensePage onBack={handleBack} />
      case 'items': return <ItemsPage onNavigate={(p) => navigate(p as PageName)} />
      case 'schedule': return <SchedulePage onBack={handleBack} />
      case 'travel': return <TravelPage onBack={handleBack} onNavigate={(p, tid) => navigate(p as PageName, { travelId: tid })} />
      case 'travel-detail': return <TravelDetailPage travelId={travelId} onBack={handleBack} />
      case 'scan': return <ScanPage mode={scanMode} onBack={handleBack} onRecognized={(type) => navigate(type as PageName)} />
      case 'settings': return <SettingsPage onBack={handleBack} />
      case 'stats': return <StatsPage onBack={handleBack} />
      default: return <HomePage onNavigate={(p) => navigate(p as PageName)} />
    }
  }

  return (
    <>
      {renderPage()}
      <AddPanel
        open={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        onNavigate={(p) => navigate(p)}
        onScan={() => navigate('scan', { scanMode: 'auto' })}
      />
      {showTabBar && (
        <TabBar currentPage={currentPage} onPress={handleTabPress} />
      )}
    </>
  )
}

function TabBar({ currentPage, onPress }: { currentPage: string; onPress: (key: string) => void }) {
  const tabs = [
    { key: 'home', label: '首页', icon: '🏠' },
    { key: 'focus', label: '专注', icon: '⏱️' },
    { key: 'add', label: '', icon: '➕' },
    { key: 'items', label: '物品', icon: '📦' },
    { key: 'schedule', label: '日程', icon: '📅' },
    { key: 'travel', label: '旅行', icon: '✈️' },
  ]

  const isActive = (key: string) => {
    if (key === 'home') return currentPage === 'home'
    if (key === 'focus') return ['focus', 'pomodoro', 'timer', 'stopwatch', 'flash'].includes(currentPage)
    if (key === 'items') return ['items', 'expiry', 'warranty', 'coupon', 'expense'].includes(currentPage)
    if (key === 'schedule') return currentPage === 'schedule'
    if (key === 'travel') return ['travel', 'travel-detail'].includes(currentPage)
    return false
  }

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div
          key={tab.key}
          className={`tab-item ${isActive(tab.key) ? 'active' : ''}`}
          onClick={() => onPress(tab.key)}
        >
          {tab.key === 'add' ? (
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--color-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 2,
            }}>
              {tab.icon}
            </div>
          ) : (
            <>
              <span className="tab-icon">{tab.icon}</span>
              <span style={{ fontSize: 10 }}>{tab.label}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
