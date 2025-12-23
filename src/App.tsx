import { useState } from 'react';
import { TabBar, NavigationBar, BrowserView, SettingsDialog } from './components';
import { useTabs, useSystemStats, useCustomScripts, useExtensions } from './hooks';

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

  const {
    scripts,
    addScript,
    updateScript,
    deleteScript,
    toggleScript
  } = useCustomScripts();

  const {
    extensions,
    isLoading: extensionsLoading,
    error: extensionsError,
    loadExtension,
    installFromWebStore,
    unloadExtension,
    openPopup,
  } = useExtensions();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        onSettingsClick={() => setIsSettingsOpen(true)}
        extensions={extensions}
        onOpenExtensionPopup={openPopup}
      />

      <BrowserView
        tabs={tabs}
        activeTabId={activeTabId}
        onWebviewRef={handleWebviewRef}
        customScripts={scripts}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scripts={scripts}
        onAddScript={addScript}
        onUpdateScript={updateScript}
        onDeleteScript={deleteScript}
        onToggleScript={toggleScript}
        extensions={extensions}
        extensionsLoading={extensionsLoading}
        extensionsError={extensionsError}
        onLoadExtension={loadExtension}
        onInstallFromWebStore={installFromWebStore}
        onUnloadExtension={unloadExtension}
      />
    </div>
  );
}

export default App;
