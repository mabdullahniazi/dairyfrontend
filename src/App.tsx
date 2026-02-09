import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Import sync service to enable auto-sync on page load
import './services/syncService';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import AnimalDetailsPage from './pages/AnimalDetailsPage';
import AnimalFormPage from './pages/AnimalFormPage';
import AddReportPage from './pages/AddReportPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="animals" element={<AnimalsPage />} />
          <Route path="animals/add" element={<AnimalFormPage />} />
          <Route path="animals/edit/:id" element={<AnimalFormPage />} />
          <Route path="animals/:id" element={<AnimalDetailsPage />} />
          <Route path="report/add" element={<AddReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
