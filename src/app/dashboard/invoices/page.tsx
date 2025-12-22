import InvoicesView from 'src/sections/main/invoices/view';

export const metadata = {
  title: 'Invoices',
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = ({ searchParams }: Readonly<Props>) => (
  <InvoicesView searchQuery={typeof searchParams?.search === 'string' ? searchParams.search : ''} />
);

export default Page;

