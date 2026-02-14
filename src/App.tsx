import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import AnimalsList from './pages/AnimalsList';
import AnimalDetail from './pages/AnimalDetail';
import AnimalForm from './pages/AnimalForm';
import ReportsList from './pages/ReportsList';
import AddReport from './pages/AddReport';
import Settings from './pages/Settings';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/animals" element={<AnimalsList />} />
            <Route path="/animals/add" element={<AnimalForm />} />
            <Route path="/animals/edit/:id" element={<AnimalForm />} />
            <Route path="/animals/:id" element={<AnimalDetail />} />
            <Route path="/reports" element={<ReportsList />} />
            <Route path="/reports/add" element={<AddReport />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
