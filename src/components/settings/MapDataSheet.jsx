import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { t } from '@/lib/i18n';

export default function MapDataSheet({ open, onClose, lang }) {
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between text-left">
          <DrawerTitle>{t(lang, 'settings.mapDataTitle')}</DrawerTitle>
          <button onClick={onClose} className="text-sm font-semibold text-primary touch-target no-tap-highlight">
            {t(lang, 'settings.done')}
          </button>
        </DrawerHeader>
        <div className="px-4 pb-8 overflow-y-auto space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>{t(lang, 'settings.mapDataP1')}</p>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{t(lang, 'settings.mapDataNE')}</h3>
            <p>{t(lang, 'settings.mapDataNEBody')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{t(lang, 'settings.mapDataOSM')}</h3>
            <p>{t(lang, 'settings.mapDataOSMBody')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{t(lang, 'settings.mapDataWiki')}</h3>
            <p>{t(lang, 'settings.mapDataWikiBody')}</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}