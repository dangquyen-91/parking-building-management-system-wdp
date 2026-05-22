export const HERO_TABS = ['Overview', 'Intelligence', 'Modernize'] as const
export type HeroTab = (typeof HERO_TABS)[number]

export type HeroTabContent = {
  eyebrow: string
  headingLines: string[]
  subheading: string
  card: {
    body: string
  } | null
}

export const HERO_TAB_CONTENT: Record<HeroTab, HeroTabContent> = {
  Overview: {
    eyebrow: 'Perspective // Overview',
    headingLines: [
      'Parking system ,',
      'for your building.',
    ],
    subheading:
      'A unified system to monitor, control, and optimize all vehicular access points effortlessly.',
    card: {
      body: 'Consolidate your security gates, live clearance telemetry, and occupancy status in a single high-contrast interface designed specifically for premium residential and commercial facilities.',
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
    },
  },
}
