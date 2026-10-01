import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import AirdropApp from './airdrop/AirdropApp.tsx';
import './index.css';

const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';

const RootApp = hostname === 'admin.sysstreamer.asia'
  ? AdminApp
  : hostname === 'airdrop.sysstreamer.asia'
    ? AirdropApp
    : App;

createRoot(document.getElementById('root')!).render(<RootApp />);
