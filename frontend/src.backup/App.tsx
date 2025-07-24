import React, { useState } from 'react'
import HomePage from './components/HomePage'
import BaziAnalysis from './components/BaziAnalysis'
import NFCBracelet from './components/NFCBracelet'
import SutraReading from './components/SutraReading'
import Divination from './components/Divination'
import BlessingCenter from './components/BlessingCenter'
import Settings from './components/Settings'
import './App.css'
import './components/HomePage.css'
import './components/BaziAnalysis.css'
import './components/NFCBracelet.css'

type AppPage = 'home' | 'bazi' | 'nfc' | 'sutra' | 'divination' | 'blessing' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home')

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />
      case 'bazi':
        return <BaziAnalysis />
      case 'nfc':
        return <NFCBracelet />
      case 'sutra':
        return <SutraReading />
      case 'divination':
        return <Divination />
      case 'blessing':
        return <BlessingCenter />
      case 'settings':
        return <Settings />
      default:
        return (
          <div className="page-container">
            <div className="page-content">
              <div className="page-icon">🏠</div>
              <h2 className="page-title">页面未找到</h2>
              <p className="page-desc">您访问的页面不存在</p>
              <button 
                onClick={() => handleNavigate('home')}
                className="btn btn-primary"
              >
                返回首页
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="App">
      {renderCurrentPage()}
      
      {/* 底部导航栏 */}
      {currentPage !== 'home' && (
        <nav className="bottom-nav">
          <div className="nav-items">
            {[
              { id: 'home', icon: '🏠', label: '首页' },
              { id: 'bazi', icon: '☯️', label: '八字' },
              { id: 'nfc', icon: '📿', label: '手串' },
              { id: 'sutra', icon: '📖', label: '诵经' },
              { id: 'blessing', icon: '🙏', label: '祝福' }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => handleNavigate(nav.id as AppPage)}
                className={`nav-item ${currentPage === nav.id ? 'active' : ''}`}
              >
                <div className="nav-icon">{nav.icon}</div>
                <div className="nav-label">{nav.label}</div>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}

export default App 