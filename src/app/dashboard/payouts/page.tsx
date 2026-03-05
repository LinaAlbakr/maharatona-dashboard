import PayoutsView from 'src/sections/main/payouts/view';

export const metadata = {
  title: 'Payouts',
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = ({ searchParams }: Readonly<Props>) => (
  <PayoutsView searchQuery={typeof searchParams?.search === 'string' ? searchParams.search : ''} />
);

export default Page;

