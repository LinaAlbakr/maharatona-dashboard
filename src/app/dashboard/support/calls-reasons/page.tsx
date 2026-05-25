import { redirect } from 'next/navigation';

import { paths } from 'src/routes/paths';

export default function CallsReasonsRedirectPage() {
  redirect(paths.dashboard.supportGroup.contact_reasons);
}
