import { v4 as uuid } from 'uuid';


const initialNotifications = {
    alerts: [],
}


// remove/dismiss app notification
const removeAppNotification = (notifications, target) => {
    const index = notifications.findIndex(notification =>
        notification.id === target.id
    );

    if (index !== -1) {
        notifications.splice(index, 1);
    }

    return [...notifications];
}


const notificationReducer = (notifications = initialNotifications, action) => {
    switch (action.type) {
        case "ENQUEUE_APP_NOTIFICATION": {
            return {
                ...notifications,
                alerts: [...notifications.alerts,
                    {id: uuid(), type: action.payload.type, message: action.payload.message }]
            }
        }
        case "REMOVE_APP_NOTIFICATION": {
            return {
                ...notifications,
                alerts: removeAppNotification(notifications.alerts, action.payload)
            }
        }
        default:
            return notifications;
    }
}



export default notificationReducer;