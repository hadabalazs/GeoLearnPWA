import { useMemo, useState } from 'react';
import { randomSeed, makeChallengeCode } from '@/lib/challenge';
import {
  CATEGORIES, DEFAULT_COUNT, DEFAULT_BULLSEYE, BUILDER_COUNTS, FRIEND_COUNTS,
  availableToggles, CAPITAL_FORMATS, deriveScope, hasVariant,
} from '@/lib/builderConfig';

// Shared builder state machine for all category builder screens.
// Gameplay default settings from Settings are applied as initial values.
export function useBuilder(category, {
  forFriend = false,
  defaultDisableHints = false,
  defaultExpertMode = false,
  defaultMixMajorCities = false,
  defaultOneChanceMode = false,
  defaultTimeTrialMode = false,
  capitalLocatorHideCountryNameDefault = false,
} = {}) {
  const cat = CATEGORIES[category];
  const initialScope = cat.scopes[0];
  const [scopeChoice, setScopeChoice] = useState(initialScope);
  const [continent, setContinent] = useState('europe');
  const [mode, setMode] = useState(cat.modes[initialScope][0]);
  const [count, setCount] = useState(DEFAULT_COUNT[initialScope]);
  const [variant, setVariant] = useState(() => {
    if (!hasVariant(category)) return 'normal';
    if (defaultOneChanceMode) return 'deathRun';
    if (defaultTimeTrialMode) return 'timeTrial';
    return 'normal';
  });
  const [expert, setExpert] = useState(defaultExpertMode);
  const [hints, setHints] = useState(() => !defaultDisableHints);
  const [majorCities, setMajorCities] = useState(defaultMixMajorCities);
  const [hideRegion, setHideRegion] = useState(capitalLocatorHideCountryNameDefault);
  const [bullseye, setBullseye] = useState(DEFAULT_BULLSEYE[initialScope]);
  const [format, setFormat] = useState('flagName');
  const [seed, setSeed] = useState(() => randomSeed());

  const countOptions = (forFriend ? FRIEND_COUNTS : BUILDER_COUNTS)[scopeChoice];
  const modeOptions = cat.modes[scopeChoice];
  const toggles = availableToggles(category, mode, scopeChoice);
  const worldLike = scopeChoice === 'global' || scopeChoice === 'continents';

  const changeScope = (sc) => {
    setScopeChoice(sc);
    const nm = cat.modes[sc];
    if (!nm.includes(mode)) setMode(nm[0]);
    const nco = (forFriend ? FRIEND_COUNTS : BUILDER_COUNTS)[sc];
    if (!nco.includes(count)) setCount(DEFAULT_COUNT[sc]);
    setBullseye(DEFAULT_BULLSEYE[sc]);
  };

  const buildConfig = () => {
    const scope = deriveScope(scopeChoice, continent);
    const cfg = { mode, scope, count, seed };
    if (category === 'capitalSearch') {
      if (worldLike) {
        const f = CAPITAL_FORMATS.find((x) => x.key === format);
        cfg.expert = f.expert;
        cfg.hints = f.hints;
      } else {
        cfg.expert = false;
        cfg.hints = true;
      }
    } else {
      cfg.expert = toggles.has('expert') ? expert : false;
      cfg.hints = (toggles.has('hints') && !expert) ? hints : false;
    }
    cfg.oneChance = variant === 'deathRun';
    cfg.timeTrial = variant === 'timeTrial';
    cfg.mixCities = toggles.has('majorCities') ? majorCities : false;
    cfg.hideRegionName = toggles.has('hideRegion') ? hideRegion : false;
    cfg.bullseyeRadiusKM = mode === 'findCapital' ? bullseye : undefined;
    return cfg;
  };

  const config = buildConfig();
  const liveCode = useMemo(
    () => makeChallengeCode(config),
    [mode, scopeChoice, continent, count, variant, expert, hints, majorCities, hideRegion, bullseye, format, seed]
  );

  return {
    category, cat, scopeChoice, continent, mode, count, variant, expert, hints,
    majorCities, hideRegion, bullseye, format, seed,
    countOptions, modeOptions, toggles, worldLike, config, liveCode,
    setScopeChoice: changeScope, setContinent, setMode, setCount, setVariant,
    setExpert, setHints, setMajorCities, setHideRegion, setBullseye, setFormat, setSeed,
  };
}