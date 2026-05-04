/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import SwipeView from './components/SwipeView';
import AIConcierge from './components/AIConcierge';
import Library from './components/Library';
import ImportSocial from './components/ImportSocial';
import CineCombo from './components/CineCombo';
import MoodSearch from './components/MoodSearch';
import StreamingSettings from './components/StreamingSettings';
import { ToastProvider } from './context/ToastContext';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('swipe');
  const [showSettings, setShowSettings] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'swipe':
        return <SwipeView />;
      case 'mood':
        return <MoodSearch />;
      case 'ai':
        return <AIConcierge />;
      case 'combo':
        return <CineCombo />;
      case 'library':
        return <Library />;
      case 'import':
        return <ImportSocial />;
      default:
        return <SwipeView />;
    }
  };

  return (
    <ToastProvider>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenSettings={() => setShowSettings(true)}
      >
        {renderContent()}
      </Layout>

      <AnimatePresence>
        {showSettings && (
          <StreamingSettings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </ToastProvider>
  );
}

