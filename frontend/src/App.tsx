// frontend/src/App.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Outlet } from 'react-router-dom';
import ChatIcon from './components/chat/ChatIcon';     // Import ChatIcon
import ChatWindow from './components/chat/ChatWindow'; // Import ChatWindow
import { AnimatePresence } from 'framer-motion'; 
const AppLayout: React.FC = observer(() => {
  // uiStore.theme is applied globally via UIStore's applyTheme method,
  // so no direct observation needed here just for applying the class to <html>.
  // The observer HOC is here in case AppLayout needs to react to other store changes in the future.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full relative z-[1]">
        <Outlet />
      </main>
      <Footer />

       {/* Chat Components */}
      <ChatIcon />
      <AnimatePresence> {/* Required for exit animations on ChatWindow */}
        <ChatWindow />
      </AnimatePresence>
    </div>
  );
});

export default AppLayout;
