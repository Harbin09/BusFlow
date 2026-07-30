# Notification Engine (`engines/notification-engine`)

```text
engines/notification-engine/
├── channels/                 # Multi-channel adapters (FCM, APNs, SMS, In-App)
│   ├── PushNotificationAdapter.ts
│   └── SmsAdapter.ts
├── templates/                # Standardized message templates
│   ├── RouteChangeTemplate.ts
│   ├── EtaAlertTemplate.ts
│   ├── MissedBusTemplate.ts
│   └── CapacityAlertTemplate.ts
└── dispatcher/               # Rate-limited dispatcher service
    └── NotificationDispatcher.ts
```
