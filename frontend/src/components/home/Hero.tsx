import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  heroBg,
  heroCard,
  heroItem,
  heroStagger,
  tabPanel,
} from '../../assets/motion/variants'
import {
  HERO_TAB_CONTENT,
  HERO_TAB_SLUGS,
  HERO_TABS,
  heroTabFromSlug,
  type HeroTab,
} from '../../data/homeData'

const HERO_BG_PNG = '/hero-bg.png'

export function Hero() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = heroTabFromSlug(searchParams.get('tab'))
  const reduceMotion = useReducedMotion()

  const content = HERO_TAB_CONTENT[activeTab]

  const setActiveTab = useCallback(
    (tab: HeroTab) => {
      setSearchParams({ tab: HERO_TAB_SLUGS[tab] }, { replace: true })
    },
    [setSearchParams],
  )

  const motionProps = reduceMotion
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
      }

  const tabPanelId = (tab: HeroTab) => `hero-panel-${HERO_TAB_SLUGS[tab]}`

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-hero-base">
      <motion.div
        className="absolute inset-0"
        variants={reduceMotion ? undefined : heroBg}
        {...motionProps}
      >
        <picture className="block w-full h-full">
          <img
            className="w-full h-full object-cover object-center"
            src={HERO_BG_PNG}
            alt=""
            width={3840}
            height={3840}
            decoding="async"
            fetchPriority="high"
            aria-hidden="true"
            draggable={false}
          />
        </picture>
        <div className="absolute inset-0 hero-scrim pointer-events-none" aria-hidden="true" />
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col justify-end pb-10 lg:pb-14">
        <motion.div
          className="flex items-end justify-between gap-6 px-6 md:px-12 lg:px-16"
          variants={reduceMotion ? undefined : heroStagger}
          {...motionProps}
        >
          <motion.div className="flex-1 min-w-0" variants={reduceMotion ? undefined : heroItem}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                id={tabPanelId(activeTab)}
                role="tabpanel"
                aria-labelledby={`hero-tab-${HERO_TAB_SLUGS[activeTab]}`}
                variants={reduceMotion ? undefined : tabPanel}
                initial={reduceMotion ? false : 'initial'}
                animate={reduceMotion ? undefined : 'animate'}
                exit={reduceMotion ? undefined : 'exit'}
              >
                <p className="text-[10px] tracking-[0.2em] text-hero-subtle uppercase mb-3 select-none">
                  {content.eyebrow}
                </p>
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-hero-fg uppercase leading-none mb-4 text-balance"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {content.headingLines.map((line, i) => (
                    <span key={`${activeTab}-${line}`}>
                      {line}
                      {i < content.headingLines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-sm text-hero-muted mb-6 max-w-sm">
                  {content.subheading}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              variants={reduceMotion ? undefined : heroItem}
              role="tablist"
              aria-label="Góc nhìn phần giới thiệu"
              className="flex items-center gap-2 flex-wrap"
            >
              {HERO_TABS.map((tab) => {
                const selected = activeTab === tab
                return (
                  <motion.button
                    key={tab}
                    id={`hero-tab-${HERO_TAB_SLUGS[tab]}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={tabPanelId(tab)}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveTab(tab)}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    className={[
                      'text-xs font-medium rounded-full px-4 py-2 transition-colors duration-200',
                      selected
                        ? 'bg-hero-tab-active text-hero-tab-active-fg'
                        : 'liquid-glass-hero text-hero-muted hover:text-hero-fg',
                    ].join(' ')}
                  >
                    {tab}
                  </motion.button>
                )
              })}
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {content.card && (
              <motion.div
                key={`card-${activeTab}`}
                variants={reduceMotion ? undefined : heroCard}
                initial={reduceMotion ? false : 'initial'}
                animate={reduceMotion ? undefined : 'animate'}
                exit={reduceMotion ? undefined : 'exit'}
                className="liquid-glass-hero rounded-2xl p-5 w-72 shrink-0 hidden lg:block"
                aria-live="polite"
              >
                <p className="text-xs text-hero-muted leading-relaxed mb-4">
                  {content.card.body}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
