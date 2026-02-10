import { useState, useEffect } from 'react';
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '../lib/notifications';
import { api } from '../lib/api';
import { db } from '../lib/db';
import { useToast } from '../components/Toast';

export function Settings() {
  const { showToast } = useToast();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ animals: 0, reports: 0, totalKB: '0' });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    isPushSubscribed().then(setPushEnabled);
    updateStorageInfo();
  }, []);

  const updateStorageInfo = async () => {
    const animalCount = await db.animals.count();
    const reportCount = await db.reports.count();
    let totalKB = '0';
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      totalKB = ((estimate.usage || 0) / 1024).toFixed(1);
    }
    setStorageUsage({ animals: animalCount, reports: reportCount, totalKB });
  };

  const togglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        showToast('Notifications disabled', 'info');
      } else {
        const ok = await subscribeToPush();
        setPushEnabled(ok);
        if (ok) {
          showToast('Notifications enabled!', 'success');
        } else {
          showToast('Could not enable notifications', 'error');
        }
      }
    } catch {
      showToast('Failed to change notification settings', 'error');
    } finally {
      setPushLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await api.sendTestNotification();
      showToast('Test notification sent!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send', 'error');
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const animals = await db.animals.toArray();
      const reports = await db.reports.toArray();

      // Export Animals CSV
      const animalCSV = [
        'Name,Tag Number,Type,Age,Synced,Created At',
        ...animals.map(a =>
          `"${a.name}","${a.tagNumber}","${a.type}",${a.age},${a.synced},"${a.createdAt}"`
        ),
      ].join('\n');

      // Export Reports CSV
      const reportRows = await Promise.all(
        reports.map(async r => {
          const animal = await db.animals.get(r.animalId);
          return `"${animal?.name || 'Unknown'}","${r.date}",${r.milk},${r.feed},"${r.notes}",${r.synced}`;
        })
      );
      const reportCSV = [
        'Animal,Date,Milk (L),Feed (kg),Notes,Synced',
        ...reportRows,
      ].join('\n');

      // Download animals
      downloadCSV(animalCSV, 'livestock-animals.csv');
      // Small delay then download reports
      setTimeout(() => downloadCSV(reportCSV, 'livestock-reports.csv'), 500);

      showToast('Data exported successfully!', 'success');
    } catch (err: any) {
      showToast('Export failed: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLocalData = async () => {
    if (!confirm('This will delete ALL local data. Data synced to the server will not be affected. Continue?')) return;
    await db.animals.clear();
    await db.reports.clear();
    await updateStorageInfo();
    showToast('Local data cleared', 'info');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8 animate-[fadeIn_0.3s_ease-out] max-w-2xl lg:mx-auto">
      {/* Notifications */}
      <section className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
          🔔 Notifications
        </h3>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-700">Daily Reminders</p>
            <p className="text-xs text-stone-400">Get notified about missing reports at 8 AM</p>
          </div>
          <button
            onClick={togglePush}
            disabled={pushLoading}
            className={`
              relative w-14 h-8 rounded-full transition-colors duration-300
              ${pushEnabled ? 'bg-emerald-500' : 'bg-stone-300'}
            `}
          >
            <span className={`
              absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
              ${pushEnabled ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>
        {pushEnabled && (
          <button
            onClick={sendTestNotification}
            className="w-full bg-stone-100 hover:bg-stone-200 rounded-xl py-2.5 text-sm font-semibold text-stone-600 transition-colors"
          >
            📤 Send Test Notification
          </button>
        )}
      </section>

      {/* Storage Usage */}
      <section className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
          💾 Data & Storage
        </h3>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-sm text-stone-500">Animals stored</span>
            <span className="text-sm font-bold text-stone-700">{storageUsage.animals}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-sm text-stone-500">Reports stored</span>
            <span className="text-sm font-bold text-stone-700">{storageUsage.reports}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-stone-500">Storage used</span>
            <span className="text-sm font-bold text-stone-700">{storageUsage.totalKB} KB</span>
          </div>
        </div>
      </section>

      {/* Export */}
      <section className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
          📊 Export Data
        </h3>
        <p className="text-xs text-stone-400 mb-4">Download all your livestock and report data as CSV files.</p>
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white rounded-xl py-3 font-semibold text-sm transition-colors shadow-lg shadow-amber-600/20"
        >
          {exporting ? 'Exporting...' : '⬇️ Export to CSV'}
        </button>
      </section>

      {/* Danger Zone */}
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-base font-bold text-red-600 mb-4 flex items-center gap-2">
          ⚠️ Danger Zone
        </h3>
        <p className="text-xs text-stone-400 mb-4">Clear all locally stored data. Synced data on the server will remain.</p>
        <button
          onClick={clearLocalData}
          className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl py-3 font-semibold text-sm transition-colors"
        >
          🗑️ Clear Local Data
        </button>
      </section>
    </div>
  );
}
