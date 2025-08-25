import React, { useEffect } from 'react';
import './App.css';
import OfflineMap from './components/OfflineMap';
import { registerServiceWorker, installPWA } from './utils/pwa';

function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
    
    // Initialize PWA install functionality
    installPWA();
  }, []);

  const handleFeatureClick = (feature: any) => {
    console.log('Feature clicked:', feature);
    // You can add custom logic here for feature interactions
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗺️ Offline Maps PWA</h1>
        <p>View maps offline with polygons and markers</p>
      </header>
      <main>
        <OfflineMap onFeatureClick={handleFeatureClick} />
      </main>
    </div>
  );
}

export default App;
