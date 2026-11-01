"use client";

/**
 * Workshop mode for an article: the body is split into modules shown one at
 * a time, with a chapter bar to move between them. Labs inside a module carry
 * missions ("try this") that tick themselves off; progress is kept in the
 * reader's browser and shown per module in the bar.
 *
 *   <Workshop id="derivatives" lang="de" modules={[{ id: "futures", label: "Futures" }, …]}>
 *     <Module id="futures">
 *       ## Futures
 *       …
 *     </Module>
 *   </Workshop>
 *
 * Deep links keep working: the address bar carries the id of the module's
 * `##` heading, and any `#id` inside a module opens that module.
 */
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n";

/* ------------------------------------------------------------ Types */

export type MissionView = { id: string; label: string; done: boolean; fresh?: boolean };

type ModuleInfo = { id: string; label: string };

type WorkshopState = {
  lang: Locale;
  modules: ModuleInfo[];
  active: string;
  go: (id: string) => void;
  done: Set<string>;
  /** Missions completed after the stored progress was loaded — these animate. */
  fresh: Set<string>;
  markDone: (id: string) => void;
  register: (module: string, ids: string[]) => void;
  missionsOf: Record<string, string[]>;
  reset: () => void;
};

const WorkshopContext = createContext<WorkshopState | null>(null);
const ModuleContext = createContext<string | null>(null);

export function useWorkshop() {
  return useContext(WorkshopContext);
}

const copy = {
  de: {
    nav: "Module",
    module: (n: number, total: number) => `Modul ${n} von ${total}`,
    missions: (done: number, total: number) => `${done} von ${total} Aufgaben`,
    next: "Weiter",
    back: "Zurück",
    complete: "Modul geschafft. Alle Aufgaben erledigt.",
    progress: "Fortschritt",
    reset: "Fortschritt zurücksetzen",
    total: (done: number, total: number) => `${done} von ${total} Aufgaben im ganzen Workshop`,
  },
  en: {
    nav: "Modules",
    module: (n: number, total: number) => `Module ${n} of ${total}`,
    missions: (done: number, total: number) => `${done} of ${total} missions`,
    next: "Next",
    back: "Back",
    complete: "Module complete. Every mission done.",
    progress: "Progress",
    reset: "Reset progress",
    total: (done: number, total: number) => `${done} of ${total} missions across the workshop`,
  },
} as const;

/* ------------------------------------------------------------ Missions */

/**
 * Missions of one lab. `defs[i].done` is the live condition; once it has been
 * true the mission stays ticked. Outside a workshop the state is local.
 */
export function useMissions(
  key: string,
  defs: { id: string; label: string; done: boolean }[],
): MissionView[] {
  const workshop = useContext(WorkshopContext);
  const module = useContext(ModuleContext);
  const [local, setLocal] = useState<Set<string>>(() => new Set());
  const ids = defs.map((d) => `${key}.${d.id}`);
  const idKey = ids.join("|");
  const register = workshop?.register;

  useEffect(() => {
    if (register && module) register(module, idKey.split("|"));
  }, [register, module, idKey]);

  const done = workshop?.done ?? local;
  const satisfied = defs.map((d) => d.done).join("");
  useEffect(() => {
    defs.forEach((d, i) => {
      if (!d.done || done.has(ids[i])) return;
      if (workshop) workshop.markDone(ids[i]);
      else setLocal((current) => new Set(current).add(ids[i]));
    });
    // `satisfied` captures every condition flip; the rest is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satisfied, done, idKey]);

  return defs.map((d, i) => ({
    id: ids[i],
    label: d.label,
    done: done.has(ids[i]),
    fresh: workshop ? workshop.fresh.has(ids[i]) : done.has(ids[i]),
  }));
}

/* ------------------------------------------------------------ Workshop */

type WorkshopProps = {
  /** Storage key for the reader's progress; keep it stable. */
  id: string;
  lang?: Locale;
  modules: ModuleInfo[];
  children: ReactNode;
};

function storageKey(id: string) {
  return `tqs-workshop:${id}`;
}

export function Workshop({ id, lang = "de", modules, children }: WorkshopProps) {
  const [active, setActive] = useState(modules[0]?.id ?? "");
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const [missionsOf, setMissionsOf] = useState<Record<string, string[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [rail, setRail] = useState<Element | null>(null);
  // Bumped on reset: every module remounts, so each lab drops its own state
  // (paths played, handles dragged, answers given) along with the ticks.
  // Otherwise missions whose condition still holds would tick again at once.
  const [epoch, setEpoch] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  /* Stored progress and the module named in the address bar. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(id));
      const stored = raw ? (JSON.parse(raw) as { done?: string[] }) : null;
      if (stored?.done?.length) setDone(new Set(stored.done));
    } catch {
      /* Private mode or blocked storage: progress just is not kept. */
    }
    setLoaded(true);
    setRail(document.querySelector(".article__rail"));
  }, [id]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey(id), JSON.stringify({ done: [...done] }));
    } catch {
      /* See above. */
    }
  }, [done, id, loaded]);

  const moduleOfHash = useCallback(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return null;
    const target = document.getElementById(hash);
    const owner = target?.closest<HTMLElement>("[data-module]");
    return owner ? { module: owner.dataset.module!, target } : null;
  }, []);

  const scrollTo = useCallback((element: Element | null | undefined) => {
    if (!element) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }, []);

  useEffect(() => {
    const open = () => {
      const found = moduleOfHash();
      if (!found) return;
      setActive(found.module);
      // Wait for the module to be shown before scrolling; a module heading
      // means "this module", so it lands on the chapter bar instead.
      requestAnimationFrame(() =>
        scrollTo(found.target?.tagName === "H2" ? root.current : found.target),
      );
    };
    open();
    const onHash = () => open();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [moduleOfHash, scrollTo]);

  const go = useCallback(
    (next: string) => {
      setActive(next);
      const section = root.current?.querySelector<HTMLElement>(`[data-module="${next}"]`);
      const heading = section?.querySelector("h2[id]");
      if (heading) window.history.replaceState(null, "", `#${heading.id}`);
      requestAnimationFrame(() => scrollTo(root.current));
    },
    [scrollTo],
  );

  const markDone = useCallback((mission: string) => {
    setDone((current) => (current.has(mission) ? current : new Set(current).add(mission)));
    setFresh((current) => new Set(current).add(mission));
  }, []);

  const register = useCallback((module: string, ids: string[]) => {
    setMissionsOf((current) => {
      const known = current[module] ?? [];
      const added = ids.filter((m) => !known.includes(m));
      return added.length ? { ...current, [module]: [...known, ...added] } : current;
    });
  }, []);

  const reset = useCallback(() => {
    setDone(new Set());
    setFresh(new Set());
    setMissionsOf({});
    setEpoch((n) => n + 1);
  }, []);

  const state = useMemo<WorkshopState>(
    () => ({ lang, modules, active, go, done, fresh, markDone, register, missionsOf, reset }),
    [lang, modules, active, go, done, fresh, markDone, register, missionsOf, reset],
  );

  return (
    <WorkshopContext.Provider value={state}>
      <div className="workshop" ref={root}>
        <WorkshopNav variant="bar" />
        <Fragment key={epoch}>{children}</Fragment>
      </div>
      {rail ? createPortal(<WorkshopNav variant="rail" />, rail) : null}
    </WorkshopContext.Provider>
  );
}

/* ------------------------------------------------------------ Navigation */

function progressOf(state: WorkshopState, module: string) {
  const ids = state.missionsOf[module] ?? [];
  const done = ids.filter((m) => state.done.has(m)).length;
  return { done, total: ids.length, ratio: ids.length ? done / ids.length : 0 };
}

/**
 * The chapter bar: one segment per module, filled by its missions. Above the
 * text on small screens, as the section list beside it on wide ones.
 */
function WorkshopNav({ variant }: { variant: "bar" | "rail" }) {
  const state = useContext(WorkshopContext)!;
  const t = copy[state.lang];
  const index = state.modules.findIndex((m) => m.id === state.active);

  return (
    <nav className={`workshop-nav workshop-nav--${variant}`} aria-label={t.nav}>
      {variant === "rail" ? <p className="workshop-nav__title">{t.nav}</p> : null}
      <ol className="workshop-nav__list" role="list">
        {state.modules.map((module, i) => {
          const progress = progressOf(state, module.id);
          const complete = progress.total > 0 && progress.done === progress.total;
          return (
            <li key={module.id}>
              <button
                type="button"
                className={`workshop-nav__item${complete ? " is-complete" : ""}`}
                aria-current={module.id === state.active ? "step" : undefined}
                onClick={() => state.go(module.id)}
                title={progress.total ? t.missions(progress.done, progress.total) : undefined}
              >
                <span className="workshop-nav__num tnum" aria-hidden="true">
                  {complete ? (
                    <svg viewBox="0 0 12 12">
                      <path d="M2.5 6.3l2.2 2.2L9.5 3.7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="workshop-nav__label">{module.label}</span>
                <span className="workshop-nav__meter" aria-hidden="true">
                  <span style={{ transform: `scaleX(${progress.ratio})` }} />
                </span>
                {progress.total ? (
                  <span className="sr-only">{`, ${t.missions(progress.done, progress.total)}`}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
      {variant === "bar" ? (
        <p className="workshop-nav__now" aria-hidden="true">
          <span className="tnum">
            {index + 1}/{state.modules.length}
          </span>{" "}
          {state.modules[index]?.label}
        </p>
      ) : null}
    </nav>
  );
}

/* ------------------------------------------------------------ Module */

export function Module({ id, children }: { id: string; children: ReactNode }) {
  const state = useContext(WorkshopContext);
  if (!state) return <ModuleContext.Provider value={id}>{children}</ModuleContext.Provider>;

  const t = copy[state.lang];
  const index = state.modules.findIndex((m) => m.id === id);
  const prev = state.modules[index - 1];
  const next = state.modules[index + 1];
  const progress = progressOf(state, id);
  const complete = progress.total > 0 && progress.done === progress.total;
  const active = state.active === id;

  return (
    <ModuleContext.Provider value={id}>
      <section className="workshop-module" data-module={id} hidden={!active}>
        <p className="workshop-module__kicker">
          <span>{t.module(index + 1, state.modules.length)}</span>
          {progress.total ? (
            <span className="tnum">{t.missions(progress.done, progress.total)}</span>
          ) : null}
        </p>
        {children}
        {complete ? (
          <p className="workshop-module__complete" role="status">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8.5" />
              <path d="M6 10.4l2.6 2.6L14 7.6" />
            </svg>
            {t.complete}
          </p>
        ) : null}
        <div className="workshop-module__pager">
          {prev ? (
            <button type="button" className="workshop-pager workshop-pager--back" onClick={() => state.go(prev.id)}>
              <span className="workshop-pager__dir">{t.back}</span>
              <span className="workshop-pager__label">{prev.label}</span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button type="button" className="workshop-pager workshop-pager--next" onClick={() => state.go(next.id)}>
              <span className="workshop-pager__dir">{t.next}</span>
              <span className="workshop-pager__label">{next.label}</span>
            </button>
          ) : null}
        </div>
      </section>
    </ModuleContext.Provider>
  );
}

/* ------------------------------------------------------------ Summary */

/** All modules with their missions, for the last module of a workshop. */
export function WorkshopSummary() {
  const state = useContext(WorkshopContext);
  if (!state) return null;
  const t = copy[state.lang];
  const totals = state.modules.map((m) => progressOf(state, m.id));
  const done = totals.reduce((sum, p) => sum + p.done, 0);
  const total = totals.reduce((sum, p) => sum + p.total, 0);

  return (
    <section className="workshop-summary" aria-label={t.progress}>
      <p className="workshop-summary__total tnum">{t.total(done, total)}</p>
      <ol className="workshop-summary__list" role="list">
        {state.modules.map((module, i) => {
          const p = totals[i];
          if (!p.total) return null;
          return (
            <li key={module.id}>
              <button type="button" onClick={() => state.go(module.id)} className="workshop-summary__row">
                <span className="workshop-summary__label">{module.label}</span>
                <span className="workshop-summary__bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${p.ratio})` }} />
                </span>
                <span className="tnum workshop-summary__count">
                  {p.done}/{p.total}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <button type="button" className="btn btn--secondary lab__button" onClick={state.reset}>
        {t.reset}
      </button>
    </section>
  );
}
