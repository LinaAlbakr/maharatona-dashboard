import { fetchNotifications } from 'src/actions/home';
import NotificationsView from 'src/sections/main/notifications/view';

export const metadata = {
  title: 'Dashboard | Notifications',
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ searchParams }: Readonly<Props>) {
  const notifications_page =
    typeof searchParams?.notifications_page === 'string'
      ? Number(searchParams?.notifications_page)
      : 1;
  const notifications_limit =
    typeof searchParams?.notifications_limit === 'string'
      ? Number(searchParams?.notifications_limit)
      : 6;
  const notification_type =
    typeof searchParams?.notification_type === 'string' ? searchParams?.notification_type : null;
  const select_date =
    typeof searchParams?.select_date === 'string' ? searchParams?.select_date : null;
  const notifications = await fetchNotifications({
    notifications_page,
    notifications_limit,
    notification_type,
    select_date,
  });

  return <NotificationsView notifications={notifications} />;
}
