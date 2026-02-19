import { useLanguage } from '../context/LanguageContext';
import SecondaryButton from './SecondaryButton';

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  const isSpanish = language === 'es';

  return (
    <SecondaryButton onClick={toggleLanguage} style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}>
      {isSpanish ? 'Idioma: Español' : 'Language: English'}
    </SecondaryButton>
  );
}

export default LanguageToggle;
