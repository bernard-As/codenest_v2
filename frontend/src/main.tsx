// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Tailwind CSS
import { configure } from 'mobx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage'; // Import the new page
import LoginPage from './pages/LoginPage';
import ProjectUploadPage from './pages/ProjectUploadPage'; // Import the new page
import ProjectListPage from './pages/ProjectListPage'; // Import the new page
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage'; // Import the new page
import ProjectEditPage from './pages/ProjectEditPage'; // Import the new page

// MobX configuration (optional but recommended for stricter mode)
configure({
  enforceActions: "observed",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="register" element={<RegisterPage />} /> {/* Add this route */}
          <Route path="login" element={<LoginPage />} /> {/* Add login route when created */}
          {/* <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} /> */}
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/create" element={<ProjectUploadPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} /> {/* Add this dynamic route */}
          <Route path="projects/:projectId/edit" element={<ProjectEditPage />} /> {/* Add edit route */}

          {/* ... other routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);