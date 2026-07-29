import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
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
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

const HERO_BG_PNG = '/hero-bg.png'

export function Hero() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = heroTabFromSlug(searchParams.get('tab'))
  const reduceMotion = useReducedMotion()
  const content = HERO_TAB_CONTENT[activeTab]

  function setActiveTab(tab: HeroTab) {
    setSearchParams({ tab: HERO_TAB_SLUGS[tab] }, { replace: true })
  }

  const motionProps = reduceMotion
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
      }

  return (
    <section className="relative flex min-h-[92svh] flex-col overflow-hidden bg-linear-to-br from-violet-50 via-background to-sky-50 dark:from-violet-950/40 dark:via-background dark:to-sky-950/35">
      <motion.div
        className="absolute inset-0"
        variants={reduceMotion ? undefined : heroBg}
        {...motionProps}
      >
        <picture className="block h-full w-full">
          <img
            className="h-full w-full object-cover object-center"
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
        <div className="absolute inset-0 bg-linear-to-r from-white/42 via-white/18 to-sky-100/6 dark:from-background/75 dark:via-background/52 dark:to-violet-950/35" aria-hidden="true" />
        <div className="absolute inset-y-0 left-0 w-[68%] bg-linear-to-r from-white/28 via-white/8 to-transparent dark:from-black/22 dark:via-black/8" aria-hidden="true" />
      </motion.div>
      <div className="pointer-events-none absolute -left-36 top-20 size-[28rem] rounded-full bg-violet-400/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[32rem] rounded-full bg-sky-400/15 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-10 pt-28 md:px-12 lg:px-16 lg:pb-14">
        <motion.div
          className="mx-auto flex w-full max-w-7xl items-end justify-between gap-6"
          variants={reduceMotion ? undefined : heroStagger}
          {...motionProps}
        >
          <motion.div className="min-w-0 flex-1" variants={reduceMotion ? undefined : heroItem}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                role="tabpanel"
                variants={reduceMotion ? undefined : tabPanel}
                initial={reduceMotion ? false : 'initial'}
                animate={reduceMotion ? undefined : 'animate'}
                exit={reduceMotion ? undefined : 'exit'}
              >
                <Badge variant="secondary" className="mb-3">
                  {content.eyebrow}
                </Badge>
                <h1 className="mb-4 max-w-4xl text-5xl font-bold uppercase leading-none text-slate-950 dark:bg-linear-to-r dark:from-violet-200 dark:via-white dark:to-sky-200 dark:bg-clip-text dark:text-transparent md:text-6xl lg:text-7xl">
                  {content.headingLines.map((line, index) => (
                    <span key={`${activeTab}-${line}`}>
                      {line}
                      {index < content.headingLines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="mb-6 max-w-lg text-sm leading-7 text-slate-800 dark:text-muted-foreground md:text-base">
                  {content.subheading}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              variants={reduceMotion ? undefined : heroItem}
              className="flex flex-wrap items-center gap-3"
            >
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HeroTab)}>
                <TabsList>
                  {HERO_TABS.map((tab) => (
                    <TabsTrigger key={tab} value={tab}>
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button asChild>
                <Link to="/booking">Đặt chỗ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
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
                className="hidden w-80 shrink-0 lg:block"
                aria-live="polite"
              >
                <Card className="border-violet-200/70 bg-card/80 shadow-xl shadow-violet-500/10 backdrop-blur-xl dark:border-violet-800/45">
                  <CardContent className="p-5">
                    <p className="text-sm leading-7 text-muted-foreground">
                      {content.card.body}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
