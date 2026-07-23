export const HERO_TABS = ['Tổng quan', 'Thông minh', 'Hiện đại hóa'] as const
export type HeroTab = (typeof HERO_TABS)[number]

export const HERO_TAB_SLUGS: Record<HeroTab, string> = {
  'Tổng quan': 'overview',
  'Thông minh': 'intelligence',
  'Hiện đại hóa': 'modernize',
}

export function heroTabFromSlug(slug: string | null): HeroTab {
  const match = (Object.entries(HERO_TAB_SLUGS) as [HeroTab, string][]).find(
    ([, s]) => s === slug,
  )
  return match?.[0] ?? 'Hiện đại hóa'
}

export type HeroTabContent = {
  eyebrow: string
  headingLines: string[]
  subheading: string
  card: {
    body: string
  } | null
}

export const HERO_TAB_CONTENT: Record<HeroTab, HeroTabContent> = {
  'Tổng quan': {
    eyebrow: 'Góc nhìn // Tổng quan',
    headingLines: ['Hệ thống', 'bãi đỗ cho', 'tòa nhà của bạn.'],
    subheading:
      'Một hệ thống thống nhất để giám sát, kiểm soát và tối ưu mọi điểm ra vào của phương tiện.',
    card: {
      body: 'Hợp nhất cổng an ninh, dữ liệu ra vào trực tiếp và trạng thái chỗ đỗ trong một giao diện rõ ràng, được thiết kế cho tòa nhà dân cư và thương mại cao cấp.',
    },
  },
  'Thông minh': {
    eyebrow: 'Góc nhìn // Thông minh',
    headingLines: ['Chấm dứt', 'cảnh hỗn loạn', 'ở bãi đỗ', 'tầng hầm.'],
    subheading:
      'Loại bỏ hàng chờ ùn tắc, vé giấy thất lạc và sự khó chịu khi tìm hướng di chuyển.',
    card: {
      body: 'Với xác thực video thời gian thực và bản đồ chỗ đỗ tự động, cư dân di chuyển mượt mà đến ô trống. Không cần máy in vé, không cần thẻ vật lý, chỉ còn một quy trình vận hành gọn gàng.',
    },
  },
  'Hiện đại hóa': {
    eyebrow: 'Góc nhìn // Hiện đại hóa',
    headingLines: ['Sẵn sàng', 'hiện đại hóa', 'bãi đỗ trong', 'tòa nhà?'],
    subheading:
      'Biến hạ tầng cũ thành một tài sản không gian thông minh, liền mạch và dễ vận hành.',
    card: {
      body: 'Kết nối dữ liệu camera thông minh và nhận diện biển số trực tiếp vào hệ thống lõi của tòa nhà. Đơn giản hóa xác thực khách và tối đa hóa hiệu quả sử dụng không gian.',
    },
  },
}
