import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { AnimalsList } from './pages/AnimalsList';
import { AnimalDetail } from './pages/AnimalDetail';
import { AnimalForm } from './pages/AnimalForm';
import { ReportsList } from './pages/ReportsList';
import { AddReport } from './pages/AddReport';
import { Settings } from './pages/Settings';
import { CropsList } from './pages/CropsList';
import { CropForm } from './pages/CropForm';
import { CropDetail } from './pages/CropDetail';
import { ExpenseForm } from './pages/ExpenseForm';
import { IncomeForm } from './pages/IncomeForm';
import { LandPlots } from './pages/LandPlots';
import { LandPlotForm } from './pages/LandPlotForm';
import { RemindersList } from './pages/RemindersList';
import { ReminderForm } from './pages/ReminderForm';
import { CropReports } from './pages/CropReports';

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
            {/* Crop Management */}
            <Route path="/crops" element={<CropsList />} />
            <Route path="/crops/add" element={<CropForm />} />
            <Route path="/crops/edit/:id" element={<CropForm />} />
            <Route path="/crops/:id" element={<CropDetail />} />
            <Route path="/expenses/add" element={<ExpenseForm />} />
            <Route path="/expenses/add/:cropId" element={<ExpenseForm />} />
            <Route path="/income/add" element={<IncomeForm />} />
            <Route path="/income/add/:cropId" element={<IncomeForm />} />
            <Route path="/land" element={<LandPlots />} />
            <Route path="/land/add" element={<LandPlotForm />} />
            <Route path="/land/edit/:id" element={<LandPlotForm />} />
            <Route path="/reminders" element={<RemindersList />} />
            <Route path="/reminders/add" element={<ReminderForm />} />
            <Route path="/crop-reports" element={<CropReports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
