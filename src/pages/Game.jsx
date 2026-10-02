import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { scopeItems, localizedName, getFact } from '@/lib/data';
import { preloadFlagsTiered, flagWidthsForMode } from '@/lib/preload';
import { loadBoundaries, boundaryScopeForGameScope } from '@/lib/boundaries';
import { selectSwiftTargets, makeChallengeCode, canShareCode, randomSeed } from '@/lib/challenge';
import { scoreServicePoints, capitalLocationScorePoints, capitalLocationParams, isBullseye } from '@/lib/scoring';
import { buildOptions } from '@/lib/options';
import { TIMING } from '@/lib/animation';
import { hapticCorrect, hapticIncorrect } from '@/lib/haptics';
import { t } from '@/lib/i18n';
import { shouldAutoAdvanceMapMiss, shouldEndExploreAfterResult } from '@/lib/gameRules';
import GameHeader from '@/components/GameHeader';
import ResultsScreen from '@/components/ResultsScreen';
import MapLoader from '@/components/MapLoader';
import FindQuestion from '@/components/game/FindQuestion';
import FindCapitalQuestion from '@/components/game/FindCapitalQuestion';
import QuizQuestion from '@/components/game/QuizQuestion';
import ExploreQuestion from '@/components/game/ExploreQuestion';

const MODE_COMP = {
  find: FindQuestion, explore: ExploreQuestion,
  flagMatch: QuizQuestion, flagReverse: QuizQuestion,
  capital: QuizQuestion, findCapital: FindCapitalQuestion,
};
const MAP_MODES = new Set(['find', 'explore', 'findCapital']);
const PRIORITY_ROUNDS = 3;

function familyOf(config) {
  const { mode, scope } = config;
  if (mode === 'find') return (scope === 'hungary' || scope === 'us') ? 'findRegion' : 'findWorld';
  if (mode === 'explore') return (scope === 'hungary' || scope === 'us') ? 'exploreRegion' : 'exploreWorld';
  if (mode === 'flagMatch' || mode === 'flagReverse') return 'flag';
  if (mode === 'capital') return 'capital';
  if (mode === 'findCapital') return 'capitalLocation';
  return 'findWorld';
}

// Flag codes the first few rounds will actually render, so the blocking part
// of the preload is small. Mirrors the seeding in QuizQuestion/ExploreQuestion.
function earlyFlagCodes(config, targets, items) {
  const codes = [];
  for (let r = 0; r < Math.min(PRIORITY_ROUNDS, targets.length); r++) {
    const tgt = targets[r];
    if (config.mode === 'flagReverse' || config.mode === 'explore') {
      buildOptions(tgt, items, config.seed + r * 13, 4, 'id').forEach((o) => codes.push(o.flagCode));
    } else {
      codes.push(tgt.flagCode);
    }
  }
  return codes;
}

export default function Game() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { datasets: ds, dataReady, lang, recordResult, recordDailyRatio, settings } = useApp();
  const config = state?.config;

  const targets = useMemo(() => {
    if (!ds || !config) return [];
    const items = scopeItems(config.scope, ds);
    if (config.targets) {
      const map = Object.fromEntries(items.map((i) => [i.id, i]));
      return config.targets.map((id) => map[id]).filter(Boolean);
    }
    return selectSwiftTargets(items, config.count, config.seed);
  }, [ds, config]);

  const itemsMap = useMemo(() => {
    if (!ds || !config) return {};
    return Object.fromEntries(scopeItems(config.scope, ds).map((i) => [i.id, i]));
  }, [ds, config]);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAsked, setTotalAsked] = useState(0);
  const [misses, setMisses] = useState([]);
  const [phase, setPhase] = useState('playing');
  const [lastCorrect, setLastCorrect] = useState(null);
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [lastResultWasMapMiss, setLastResultWasMapMiss] = useState(false);
  const [endAfterFeedback, setEndAfterFeedback] = useState(false);
  const [result, setResult] = useState(null);
  const [bonusSeconds, setBonusSeconds] = useState(0);
  const [explore, setExplore] = useState({ correctFinds: 0, correctCapitals: 0, correctFlags: 0, totalPlayed: 0 });
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completedRounds, setCompletedRounds] = useState([]);
  const [assetsReady, setAssetsReady] = useState(false);
  const [revealed, setRevealed] = useState(false); // loader fully faded out
  const startRef = useRef(Date.now());
  const roundStartRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const nextRef = useRef(null);
  const finishRef = useRef(null);

  const family = config ? familyOf(config) : 'findWorld';
  const variant = config ? (config.oneChance ? 'deathRun' : config.timeTrial ? 'timeTrial' : 'normal') : 'normal';

  useEffect(() => { if (!config) navigate('/', { replace: true }); }, [config, navigate]);
  useEffect(() => { if (phase === 'playing') roundStartRef.current = Date.now(); }, [round, phase]);
  // Game clock (and first-round timer) start when the loader has actually
  // gone, not when the route mounted — otherwise load time counts as play time.
  useEffect(() => { if (revealed) { startRef.current = Date.now(); roundStartRef.current = Date.now(); } }, [revealed]);

  // Preload the assets this game needs before revealing the first round.
  // Flags: block only on the sizes/codes the first rounds show, warm the rest
  // in the background. Boundaries: only for map modes.
  const preloadedKeyRef = useRef(null);
  useEffect(() => {
    if (!dataReady || !config || !ds) return;
    const key = `${config.scope}:${config.mode}:${config.seed}`;
    if (preloadedKeyRef.current === key) { setAssetsReady(true); return; }
    setAssetsReady(false);
    preloadedKeyRef.current = key;
    const items = scopeItems(config.scope, ds);
    const widths = flagWidthsForMode(config.mode, config);
    const jobs = [];
    if (widths.length) {
      const all = items.map((i) => i.flagCode).filter(Boolean);
      jobs.push(preloadFlagsTiered(earlyFlagCodes(config, targets, items), all, widths));
    }
    if (MAP_MODES.has(config.mode)) jobs.push(loadBoundaries(boundaryScopeForGameScope(config.scope)));
    Promise.all(jobs).then(() => setAssetsReady(true), () => setAssetsReady(true));
  }, [dataReady, config, ds, targets]);

  // Single auto-advance path for every mode (replaces the ad-hoc setTimeouts
  // that captured stale closures and were never cleared on unmount).
  // Time trial: always advance after a short beat. Otherwise: advance only on
  // a correct answer when the "Next button on correct answers" setting is off,
  // waiting long enough for the mode's feedback animation to finish.
  useEffect(() => {
    if (phase !== 'feedback') return;
    let delay;
    if (config?.timeTrial) delay = TIMING.autoAdvanceTimeTrial;
    else if (!lastCorrect) {
      if (!shouldAutoAdvanceMapMiss({ family, showMissedCountryInfo: settings?.showMissedCountryInfo, wasMapMiss: lastResultWasMapMiss })) return;
      delay = TIMING.incorrectFeedbackDuration;
    } else if (settings?.nextButtonOnCorrect) return;
    else if (family === 'findWorld' || family === 'findRegion') delay = TIMING.autoAdvanceMap;
    else if (family === 'capitalLocation' || family === 'exploreWorld' || family === 'exploreRegion') delay = TIMING.autoAdvanceReveal;
    else delay = TIMING.autoAdvanceQuiz;
    const tm = setTimeout(() => nextRef.current?.(), delay);
    return () => clearTimeout(tm);
  }, [phase, lastCorrect, lastResultWasMapMiss, config?.timeTrial, settings?.nextButtonOnCorrect, settings?.showMissedCountryInfo, family]);

  if (!config) return null;

  const showLoader = !dataReady || !assetsReady;
  const target = targets[round];

  const pushMiss = (tgt) => {
    const fact = getFact(tgt.id, tgt.type, lang, ds);
    const answer = family === 'capitalLocation'
      ? (tgt.capital || localizedName(tgt, lang))
      : (tgt.capital || tgt.seat || localizedName(tgt, lang));
    setMisses((m) => [...m, { id: tgt.id, name: localizedName(tgt, lang), answer, fact: fact || null }]);
  };

  const handleResult = (isCorrect, payload) => {
    if (phase !== 'playing') return;
    const elapsed = (Date.now() - roundStartRef.current) / 1000;
    setTotalAsked((n) => n + 1);
    setLastSelectedId(payload?.selectedId ?? null);
    setLastResultWasMapMiss(Boolean(payload?.wasMapMiss));
    if (isCorrect) hapticCorrect(); else hapticIncorrect();

    if (family === 'exploreWorld' || family === 'exploreRegion') {
      const { findCorrect, flagCorrect, capCorrect, hintsUsed: roundHints } = payload;
      const allCorrect = isCorrect;
      const roundScore = (findCorrect ? 100 : 0)
        + (family === 'exploreWorld' ? (flagCorrect ? 100 : 0) : 0)
        + (capCorrect ? 100 : 0)
        + (findCorrect && (family === 'exploreWorld' ? flagCorrect : true) && capCorrect ? 10 : 0);
      setScore((s) => s + roundScore);
      setExplore((e) => ({
        correctFinds: e.correctFinds + (findCorrect ? 1 : 0),
        correctFlags: e.correctFlags + (family === 'exploreWorld' && flagCorrect ? 1 : 0),
        correctCapitals: e.correctCapitals + (capCorrect ? 1 : 0),
        totalPlayed: e.totalPlayed + 1,
      }));
      if (!findCorrect) pushMiss(target);
      setHintsUsed((h) => h + (roundHints || 0));
      if (shouldEndExploreAfterResult({ oneChance: config.oneChance, allCorrect })) {
        setEndAfterFeedback(true);
      }
      setLastCorrect(allCorrect);
      setPhase('feedback');
      return;
    }

    if (family === 'capitalLocation') {
      const distance = payload.distance;
      const params = capitalLocationParams(config.scope);
      const radius = config.bullseyeRadiusKM ?? params.defaultBullseyeRadiusKM;
      const points = capitalLocationScorePoints({
        distanceKm: distance, bullseyeRadiusKM: radius,
        maxPoints: params.maxPoints, fullDistancePenalty: params.fullDistancePenalty,
        maxScoringDistanceKM: params.maxScoringDistanceKM,
      });
      const bull = isBullseye(distance, radius);
      setScore((s) => s + points);
      setCompletedRounds((r) => [...r, { distanceKM: distance, points, isBullseye: bull }]);
      if (bull) {
        const ns = streak + 1;
        setStreak(ns);
        setBestStreak((b) => Math.max(b, ns));
        setCorrectCount((c) => c + 1);
        if (variant === 'timeTrial') setBonusSeconds((b) => b + 15);
      } else {
        setStreak(0);
        pushMiss(target);
        if (config.oneChance) setEndAfterFeedback(true);
      }
      setLastCorrect(bull);
      setPhase('feedback');
      return;
    }

    // findWorld, findRegion, flag, capital — ScoreService
    if (isCorrect) {
      if (family === 'findRegion') {
        const nc = correctCount + 1;
        setCorrectCount(nc);
        setScore((s) => s + scoreServicePoints({ variant: 'normal', streak: nc, timeElapsedSeconds: elapsed }));
      } else {
        const ns = streak + 1;
        setStreak(ns);
        setBestStreak((b) => Math.max(b, ns));
        setCorrectCount((c) => c + 1);
        setScore((s) => s + scoreServicePoints({ variant, streak: ns, timeElapsedSeconds: elapsed }));
      }
    } else {
      if (family !== 'findRegion') setStreak(0);
      pushMiss(target);
      if (variant === 'deathRun' || (family === 'findRegion' && config.oneChance)) setEndAfterFeedback(true);
    }
    setLastCorrect(isCorrect);
    setPhase('feedback');
  };

  const next = () => {
    if (endAfterFeedback || round + 1 >= targets.length) { finish(); return; }
    setRound((r) => r + 1);
    setPhase('playing');
    setLastCorrect(null);
    setLastSelectedId(null);
    setLastResultWasMapMiss(false);
  };
  nextRef.current = next;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const total = targets.length;
    const timeMs = Date.now() - startRef.current;
    const shareCode = canShareCode(config.mode, config.scope) ? makeChallengeCode(config) : null;

    let res;
    if (family === 'exploreWorld' || family === 'exploreRegion') {
      const phasesPerRound = family === 'exploreWorld' ? 3 : 2;
      const correctPieces = explore.correctFinds + explore.correctCapitals + (family === 'exploreWorld' ? explore.correctFlags : 0);
      const possibleTotal = explore.totalPlayed * phasesPerRound;
      const acc = possibleTotal ? Math.round((correctPieces / possibleTotal) * 100) : 0;
      res = { mode: config.mode, scope: config.scope, score, correct: correctPieces, missed: possibleTotal - correctPieces, total: possibleTotal, bestStreak: 0, accuracy: acc, timeMs, misses, isDaily: !!config.isDaily, dailyKey: config.dailyKey || null, variant, code: shareCode, count: total, hintsUsed };
    } else if (family === 'capitalLocation') {
      const params = capitalLocationParams(config.scope);
      const maxScore = totalAsked * params.maxPoints;
      const scorePct = maxScore > 0 ? Math.min(score / maxScore, 1.0) : 0;
      const avgDist = completedRounds.length ? completedRounds.reduce((s, r) => s + r.distanceKM, 0) / completedRounds.length : 0;
      const acc = totalAsked ? Math.round((correctCount / totalAsked) * 100) : 0;
      res = { mode: config.mode, scope: config.scope, score, correct: correctCount, missed: totalAsked - correctCount, total: totalAsked, bestStreak, accuracy: acc, timeMs, misses, isDaily: !!config.isDaily, dailyKey: config.dailyKey || null, variant, code: shareCode, count: total, maxScore, scorePercentage: scorePct, averageDistance: avgDist };
    } else {
      const acc = totalAsked ? Math.round((correctCount / totalAsked) * 100) : 0;
      res = { mode: config.mode, scope: config.scope, score, correct: correctCount, missed: totalAsked - correctCount, total: totalAsked, bestStreak, accuracy: acc, timeMs, misses, isDaily: !!config.isDaily, dailyKey: config.dailyKey || null, variant, code: shareCode, count: total };
    }
    recordResult(res);
    if (config.isDaily && config.dailyKey) {
      let ratio = 0;
      if (family === 'capitalLocation' && res.maxScore > 0) ratio = res.score / res.maxScore;
      else if (res.total > 0) ratio = res.correct / res.total;
      recordDailyRatio(config.dailyKey, ratio);
    }
    setResult({ ...res });
    setPhase('done');
  };
  finishRef.current = finish;

  if (phase === 'done' && result) {
    return (
      <ResultsScreen result={result} config={config} code={result.code || null}
        onRetry={() => navigate('/game', { state: { config: { ...config, seed: randomSeed() } } })}
        onHome={() => navigate('/')} lang={lang} />
    );
  }

  if (!showLoader && targets.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">No data for this scope.</div>;
  }

  const ModeComp = MODE_COMP[config.mode];
  const isFlagMode = config.mode === 'flagMatch' || config.mode === 'flagReverse';
  const isFindMode = family === 'findWorld' || family === 'findRegion';
  const isBigNext = family === 'capitalLocation' || isFlagMode;
  const hideMissedMapInfo = !lastCorrect && settings?.showMissedCountryInfo === false && (isFindMode || lastResultWasMapMiss);
  const selectedItem = lastSelectedId ? itemsMap[lastSelectedId] : null;
  const selectedName = selectedItem ? localizedName(selectedItem, lang) : null;
  const answerText = target
    ? (family === 'capitalLocation' ? (target.capital || localizedName(target, lang)) : localizedName(target, lang))
    : '';

  return (
    <>
      {/* Overlay loader: the map initialises underneath while this is up, then
          it fades out (minimum display + fade handled inside MapLoader). */}
      <MapLoader lang={lang} show={showLoader} onHidden={() => setRevealed(true)} />
      {!showLoader && target && (
        <div className="flex flex-col h-[calc(100dvh-5rem)] md:h-[100dvh]">
          <GameHeader round={round} total={targets.length} score={score} streak={streak} config={config} lang={lang}
            timerRunning={revealed && phase !== 'done'} bonusSeconds={bonusSeconds} onTimeUp={() => finishRef.current?.()} />
          <div className="flex-1 min-h-0">
            <ModeComp target={target} ds={ds} lang={lang} config={config} status={phase} onResult={handleResult} roundIndex={round} mode={config.mode} showMissedCountryInfo={settings?.showMissedCountryInfo !== false} />
          </div>
          {phase === 'feedback' && !config.timeTrial && (isFindMode || !lastCorrect || settings?.nextButtonOnCorrect) && (
            <div className="feedback-bar mx-3 mb-3 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg px-4 py-3 flex items-center gap-3">
              {isFindMode && settings?.showMissedCountryInfo !== false && (
                <div className={`flex items-center gap-1.5 font-bold ${lastCorrect ? 'text-correct' : 'text-incorrect'}`}>
                  {lastCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  {lastCorrect
                    ? t(lang, 'game.correct')
                    : `${t(lang, 'game.youClicked')} ${selectedName ? `${selectedName} · ${t(lang, 'game.answer')} ` : ''}${answerText}`}
                </div>
              )}
              {(!lastCorrect || settings?.nextButtonOnCorrect) && !hideMissedMapInfo && (
                <button onClick={next} className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold touch-target ${isBigNext ? 'w-full' : 'ml-auto'}`}>
                  {round + 1 >= targets.length || endAfterFeedback ? t(lang, 'game.finish') : t(lang, 'game.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
