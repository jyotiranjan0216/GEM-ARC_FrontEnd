import { useState, useEffect } from 'react';
import { Bell, X, Check, ChevronDown } from 'lucide-react';
import React from 'react';

const NotificationDisplay = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) return;

                // In a production app, you would fetch from your API
                const response = await fetch('https://gem-arc-backend.onrender.com/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                setNotifications(data);

                setUnreadCount(data.filter(notif => !notif.read).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');

            // In a production app, you would update on your API
            await fetch(`https://gem-arc-backend.onrender.com/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === id ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');

            // In a production app, you would update on your API
            await fetch('https://gem-arc-backend.onrender.com/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'event':
                return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">🎪</div>;
            case 'coin':
                return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-500">🪙</div>;
            case 'comment':
                return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-500">💬</div>;
            default:
                return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">📣</div>;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-[28rem] bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-[32rem]">
                    <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[28rem]">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No notifications yet</div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-3 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-start">
                                        {getNotificationIcon(notification.type)}
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between">
                                                <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="mt-2 flex justify-end space-x-2">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification._id)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                                                    >
                                                        <Check size={12} className="mr-1" /> Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-2 text-center border-t bg-gray-50">
                        <button
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center w-full"
                            onClick={() => setIsOpen(false)}
                        >
                            Close <X size={14} className="ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>

    );
};

export default NotificationDisplay;