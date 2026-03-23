import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/features/settings/store';
import { useTheme } from '@/app/providers/ThemeProvider';
import { ThemePicker } from '@/features/themes/components/ThemePicker';
import { Toggle } from '@/shared/components/ui/Toggle';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
import { APP_CONFIG } from '@/core/config/appConfig';
import styles from './SettingsPage.module.css';

const VIEW_MODE_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
];

const CARD_SIZE_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
];

function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const { toggleMode, themeMode } = useTheme();

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Settings</h1>

      {/* Theme */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme</h2>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Dark Mode</span>
            <span className={styles.settingHint}>Toggle between light and dark mode</span>
          </div>
          <div className={styles.settingControl}>
            <Toggle
              checked={themeMode === 'dark'}
              onChange={toggleMode}
            />
          </div>
        </div>
        <ThemePicker />
      </div>

      {/* Display */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Display</h2>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Default View</span>
            <span className={styles.settingHint}>Default layout for the collection</span>
          </div>
          <div className={styles.settingControl}>
            <SegmentedControl
              options={VIEW_MODE_OPTIONS}
              value={settings.collectionView}
              onChange={(v) => updateSettings({ collectionView: v as 'grid' | 'list' })}
            />
          </div>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Card Size</span>
            <span className={styles.settingHint}>Thumbnail size in grid view</span>
          </div>
          <div className={styles.settingControl}>
            <Select
              options={CARD_SIZE_OPTIONS}
              value={settings.cardSize}
              onChange={(e) =>
                updateSettings({ cardSize: e.target.value as 'compact' | 'normal' | 'large' })
              }
            />
          </div>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Compact Mode</span>
            <span className={styles.settingHint}>Reduce spacing for denser layouts</span>
          </div>
          <div className={styles.settingControl}>
            <Toggle
              checked={settings.compactMode}
              onChange={(v) => updateSettings({ compactMode: v })}
            />
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance</h2>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Animations</span>
            <span className={styles.settingHint}>Enable UI transitions and animations</span>
          </div>
          <div className={styles.settingControl}>
            <Toggle
              checked={settings.enableAnimations}
              onChange={(v) => updateSettings({ enableAnimations: v })}
            />
          </div>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Holo Effects</span>
            <span className={styles.settingHint}>Holographic shimmer on card images</span>
          </div>
          <div className={styles.settingControl}>
            <Toggle
              checked={settings.enableHoloFx}
              onChange={(v) => updateSettings({ enableHoloFx: v })}
            />
          </div>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Heavy Effects</span>
            <span className={styles.settingHint}>GPU-intensive visual effects (particles, etc.)</span>
          </div>
          <div className={styles.settingControl}>
            <Toggle
              checked={settings.enableHeavyEffects}
              onChange={(v) => updateSettings({ enableHeavyEffects: v })}
            />
          </div>
        </div>
      </div>

      {/* Data */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data</h2>
        <p className={styles.sectionDescription}>
          Manage your collection data with import and export tools.
        </p>
        <div className={styles.dataLinks}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/import-export')}
          >
            Import / Export
          </Button>
        </div>
      </div>

      {/* About */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>App Version</span>
          <span className={styles.aboutValue}>{APP_CONFIG.version}</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Schema Version</span>
          <span className={styles.aboutValue}>{APP_CONFIG.schemaVersion}</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>App Name</span>
          <span className={styles.aboutValue}>{APP_CONFIG.name}</span>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
