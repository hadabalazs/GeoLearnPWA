import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import ConfigBuilder from '@/components/ConfigBuilder';

export default function Play() {
  const { lang } = useApp();
  const navigate = useNavigate();
  return <ConfigBuilder lang={lang} onLaunch={(cfg) => navigate('/game', { state: { config: cfg } })} />;
}