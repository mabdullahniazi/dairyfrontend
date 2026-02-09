import { db, getTodayDate } from '../db/database';

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Check if today's report is complete
export const hasTodayReport = async (): Promise<boolean> => {
  const today = getTodayDate();
  const animals = await db.animals.count();
  const reports = await db.dailyReports.where('date').equals(today).count();
  
  // All animals have reports
  return reports >= animals && animals > 0;
};

// Show notification if reports are missing
export const checkAndNotify = async (): Promise<void> => {
  const hasPermission = Notification.permission === 'granted';
  if (!hasPermission) return;

  const complete = await hasTodayReport();
  if (complete) return;

  const animals = await db.animals.count();
  const today = getTodayDate();
  const reports = await db.dailyReports.where('date').equals(today).count();
  const pending = animals - reports;

  if (pending > 0) {
    new Notification('🐄 Livestock Manager', {
      body: `${pending} animal${pending > 1 ? 's' : ''} need${pending === 1 ? 's' : ''} today's report`,
      icon: '/icons/icon-192.png',
      tag: 'daily-reminder',
      requireInteraction: false,
    });
  }
};

// Schedule daily check (simple version - runs when app is open)
export const scheduleDailyCheck = (): void => {
  // Check every hour while app is open
  setInterval(() => {
    const now = new Date();
    // Only check between 6 PM and 9 PM
    if (now.getHours() >= 18 && now.getHours() <= 21) {
      checkAndNotify();
    }
  }, 60 * 60 * 1000); // Every hour

  // Also check on initial load if it's evening
  const now = new Date();
  if (now.getHours() >= 18) {
    setTimeout(checkAndNotify, 5000); // Check after 5 seconds
  }
};

// Initialize notification service
export const initNotifications = async (): Promise<void> => {
  const granted = await requestNotificationPermission();
  if (granted) {
    scheduleDailyCheck();
    console.log('🔔 Notifications enabled');
  }
};
