import type {Metadata} from 'next';
import './globals.css';
import './wizard.css';

export const metadata:Metadata={
  title:'Newneo AI Platform',
  description:'Build, govern, deploy and operate enterprise AI.'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
