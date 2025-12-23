import { useState } from 'react';
import { TabBar, NavigationBar, BrowserView, SettingsDialog, Toast } from './components';
import { useTabs, useSystemStats, useCustomScripts, useExtensions, useSecuritySettings } from './hooks';

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
    reloadIgnoringCache,
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

  const { ignoreCertErrors, setIgnoreCertErrors } = useSecuritySettings();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({ message: '', isVisible: false });

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const handleClearCache = () => {
    reloadIgnoringCache();
    showToast('Cache cleared for this page');
  };

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
        onClearCache={handleClearCache}
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

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
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
        ignoreCertErrors={ignoreCertErrors}
        onToggleIgnoreCertErrors={() => setIgnoreCertErrors(!ignoreCertErrors)}
      />
    </div>
  );
}

export default App;
