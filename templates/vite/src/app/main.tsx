import { Logo } from '#/components/logo';
import { Tagline } from '#/components/tagline';
import { Title } from '#/components/title';

export function App() {
  return (
    <main className='flex h-screen bg-[#2f4858] text-[#daf7dc]'>
      <div className='m-auto'>
        <Title />
        <Tagline />
        <Logo />
      </div>
    </main>
  );
}
