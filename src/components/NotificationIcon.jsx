import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

function NotificationIcon() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/users/notifications', { withCredentials: true });
        setNotifications(res.data);
      } catch (err) {
        console.error('Notification error:', err);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell className="text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-64 max-h-60 overflow-y-auto z-10">
          <ul>
            {notifications.map((note, i) => (
              <li key={i} className="p-2 text-sm hover:bg-gray-100">
                {note.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationIcon;
