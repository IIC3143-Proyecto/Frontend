import { MOCK_NOTIFICATIONS } from "@/lib/msw/mocks/data/notifications";
import { NotificationCardV2 } from "@/components/common/cards/notification-card";

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-3">
      {MOCK_NOTIFICATIONS.map((n) => (
        <NotificationCardV2 key={n.id} notification={n} />
      ))}
    </div>
  );
}
