import { TabBar, NavigationBar, BrowserView } from './components';
import { useTabs, useSystemStats } from './hooks';

function App() {
  const stats = useSystemStats();
  const {
    tabs,
    activeTabId,
    urlInput,
    setActiveTabId,
    setUrlInput,
    createTab,
    closeTab,
    handleNavigate,
    goBack,
    goForward,
    reload,
    handleWebviewRef,
  } = useTabs();

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        stats={stats}
        onTabSelect={setActiveTabId}
        onTabClose={closeTab}
        onNewTab={createTab}
      />

      <NavigationBar
        urlInput={urlInput}
        onUrlChange={setUrlInput}
        onNavigate={handleNavigate}
        onBack={goBack}
        onForward={goForward}
        onReload={reload}
      />

      <BrowserView
        tabs={tabs}
        activeTabId={activeTabId}
        onWebviewRef={handleWebviewRef}
      />
    </div>
  );
}

export default App;
