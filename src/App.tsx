import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Plus, X, ArrowLeft, ArrowRight, RotateCcw, Search, Home, Minus, Square, Cpu, MemoryStick } from 'lucide-react'

interface Tab {
  id: string
  title: string
  url: string
}

function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'https://www.google.com' }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [urlInput, setUrlInput] = useState('https://www.google.com')
  const [stats, setStats] = useState({ cpu: 0, mem: 0, totalMemGb: '0' })
  const webviewRefs = useRef<{ [key: string]: any }>({})

  const activeTab = tabs.find(t => t.id === activeTabId)

  // System stats listener
  useEffect(() => {
    if (window.electron?.onSystemStats) {
      window.electron.onSystemStats((newStats) => setStats(newStats))
    }
  }, [])

  // Update input when switching tabs
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url)
    }
  }, [activeTabId, tabs])


  const createTab = () => {
    const newId = Date.now().toString()
    setTabs([...tabs, { id: newId, title: 'New Tab', url: 'https://www.google.com' }])
    setActiveTabId(newId)
  }

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const newTabs = tabs.filter(t => t.id !== id)
    if (newTabs.length === 0) {
      createTab()
    } else {
      setTabs(newTabs)
      if (activeTabId === id) {
        setActiveTabId(newTabs[newTabs.length - 1].id)
      }
    }
  }

  const handleNavigate = () => {
    if (!activeTab || !activeTabId) return
    let url = urlInput
    if (!url.startsWith('http')) {
      if (url.includes('.')) {
        url = 'https://' + url
      } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url)
      }
    }

    // Update the tab's URL in state so it persists
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url } : t))

    // Also explicitly force the webview to navigate if needed (react binding should handle it via src prop primarily, but manual checks help)
    // Actually, simply updating state.url which is passed to webview src should work for navigation.
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleNavigate()
  }

  const goBack = () => {
    const wb = webviewRefs.current[activeTabId]
    if (wb && wb.canGoBack()) wb.goBack()
  }

  const goForward = () => {
    const wb = webviewRefs.current[activeTabId]
    if (wb && wb.canGoForward()) wb.goForward()
  }

  const reload = () => {
    const wb = webviewRefs.current[activeTabId]
    if (wb) wb.reload()
  }

  // Hook into webview events to update title/url
  const handleWebviewRef = (id: string, el: any) => {
    if (el && !webviewRefs.current[id]) {
      webviewRefs.current[id] = el

      el.addEventListener('did-start-loading', () => {
        // Optional: loading state
      })

      el.addEventListener('did-finish-load', () => {
        const title = el.getTitle()
        const url = el.getURL()
        setTabs(prev => prev.map(t => t.id === id ? { ...t, title, url } : t))
        if (id === activeTabId) {
          setUrlInput(url)
        }
      })
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Tab Bar Container */}
      <div className="flex bg-gray-900 pt-2 px-2 draggable select-none">

        {/* Tabs Scroll Area */}
        <div className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-right">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`
                group relative flex items-center min-w-[120px] max-w-[200px] h-9 px-3 rounded-t-lg cursor-pointer text-sm transition-colors no-drag
                ${activeTabId === tab.id ? 'bg-gray-800 text-gray-100' : 'bg-gray-900 text-gray-400 hover:bg-gray-800/50'}
                `}
            >
              <div className="truncate flex-1 mr-2">{tab.title}</div>
              <button
                onClick={(e) => closeTab(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={createTab}
            className="p-1.5 ml-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2 pl-2 mb-1 border-l border-gray-800 ml-2">
          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono select-none px-2">
            <div className="flex items-center gap-1" title="App CPU Usage">
              <Cpu size={12} />
              <span>{stats.cpu}%</span>
            </div>
            <div className="flex items-center gap-1" title="App Memory Usage">
              <MemoryStick size={12} />
              <span>{stats.mem} MB</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => window.electron.min()} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"><Minus size={14} /></button>
            <button onClick={() => window.electron.max()} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"><Square size={12} /></button>
            <button onClick={() => window.electron.close()} className="p-1.5 hover:bg-red-500 rounded text-gray-400 hover:text-white"><X size={14} /></button>
          </div>
        </div>

      </div>

      {/* Navigation Bar */}
      <div className="h-14 bg-gray-800 flex items-center px-4 gap-3 border-b border-gray-700 shadow-sm z-10">
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <button onClick={goForward} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors active:scale-95">
            <ArrowRight size={18} />
          </button>
          <button onClick={reload} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors active:scale-95">
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex-1 flex items-center bg-gray-900/50 rounded-full px-4 h-9 border border-transparent focus-within:border-blue-500/50 focus-within:bg-gray-900 transition-all">
          <Search size={14} className="text-gray-500 mr-3" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            placeholder="Search or enter website name"
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 w-full"
          />
        </div>
      </div>

      {/* Browser View Area */}
      <div className="flex-1 relative bg-white">
        {tabs.map(tab => (
          /* @ts-ignore: standard react types dont strictly support all webview props yet without detailed override */
          <webview
            key={tab.id}
            ref={(el: any) => handleWebviewRef(tab.id, el)}
            src={tab.url}
            className="absolute top-0 w-full h-full bg-white"
            style={{
              left: activeTabId === tab.id ? '0' : '-9999px',
              visibility: activeTabId === tab.id ? 'visible' : 'hidden'
            }}
            allowpopups="true"
            partition="persist:main"
          />
        ))}

        {tabs.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-gray-400">
            <div className="p-4 bg-gray-800 rounded-full mb-4">
              <Home size={32} />
            </div>
            <p>No tabs open</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
