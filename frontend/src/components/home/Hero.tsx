import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import {
  heroBg,
  heroCard,
  heroItem,
  heroStagger,
  tabPanel,
} from '../../assets/motion/variants'

const HERO_BG_WEBP = '/hero-bg.webp'
const HERO_BG_PNG = '/hero-bg.png'

const TABS = ['Overview', 'Intelligence', 'Modernize'] as const
type Tab = (typeof TABS)[number]

type TabContent = {
  eyebrow: string
  headingLines: string[]
  subheading: string
  card: {
    body: string
    status: string
  } | null
}

const TAB_CONTENT: Record<Tab, TabContent> = {
  Overview: {
    eyebrow: 'Perspective // Overview',
    headingLines: [
      'Building parking,',
      'managed in one',
      'place.',
    ],
    subheading:
      'A unified system to monitor, control, and optimize all vehicular access points effortlessly.',
    card: {
      body: 'Consolidate your security gates, live clearance telemetry, and occupancy status in a single high-contrast interface designed specifically for premium residential and commercial facilities.',
      status: 'FLOW // ACTIVE',
    },
  },
  Intelligence: {
    eyebrow: 'Perspective / Intelligence',
    headingLines: [
      'End the',
      'basement',
      'parking',
      'chaos.',
    ],
    subheading:
      'Eliminate bottleneck queues, lost paper tickets, and directional frustration instantly.',
    card: {
      body: 'With real-time video validation and automated slot mapping, occupants flow seamlessly to open bays. No ticket machines, no physical access cards—just pure structural harmony.',
      status: 'FLOW // ACTIVE',
    },
  },
  Modernize: {
    eyebrow: 'Perspective // Modernize',
    headingLines: [
      'Ready to',
      'modernize',
      'parking in',
      'your building?',
    ],
    subheading:
      'Transform legacy infrastructure into a quiet, integrated spatial asset.',
    card: {
      body: "Connect our intelligent camera telemetry and license plate sensory nodes directly to your building's core setup. Simplify guest validation and maximize total space utilization seamlessly.",
      status: 'FLOW // ACTIVE',
    },
  },
}

export function Hero() {
  const [activeTab, setActiveTab] = useState<Tab>('Modernize')
  const reduceMotion = useReducedMotion()

  const content = TAB_CONTENT[activeTab]

  const motionProps = reduceMotion
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
      }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      <motion.div
        className="absolute inset-0"
        variants={reduceMotion ? undefined : heroBg}
        {...motionProps}
      >
        <picture className="block w-full h-full">
          <source srcSet={HERO_BG_WEBP} type="image/webp" />
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
                variants={reduceMotion ? undefined : tabPanel}
                initial={reduceMotion ? false : 'initial'}
                animate={reduceMotion ? undefined : 'animate'}
                exit={reduceMotion ? undefined : 'exit'}
              >
                <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mb-3 select-none">
                  {content.eyebrow}
                </p>
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase leading-none mb-4"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {content.headingLines.map((line, i) => (
                    <span key={`${activeTab}-${line}`}>
                      {line}
                      {i < content.headingLines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-sm text-gray-300 mb-6 max-w-sm">
                  {content.subheading}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              variants={reduceMotion ? undefined : heroItem}
              className="flex items-center gap-2 flex-wrap"
            >
              {TABS.map((tab) => (
                <motion.button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className={[
                    'text-xs font-medium rounded-full px-4 py-2 transition-colors duration-200',
                    activeTab === tab
                      ? 'bg-white text-black'
                      : 'liquid-glass text-gray-300 hover:text-white',
                  ].join(' ')}
                >
                  {tab}
                </motion.button>
              ))}
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
                className="liquid-glass rounded-2xl p-5 w-72 shrink-0 hidden lg:block"
              >
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {content.card.body}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-[10px] tracking-[0.15em] text-gray-400 uppercase">
                    System Render
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.1em] text-white uppercase bg-white/10 rounded-full px-2.5 py-1">
                    {content.card.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
