import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { AboutARPage } from './pages/AboutARPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-arch-50 text-arch-900 font-sans selection:bg-arch-200">
        <Navbar />
        <main className="flex-1" id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<CatalogPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/about-ar" element={<AboutARPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
