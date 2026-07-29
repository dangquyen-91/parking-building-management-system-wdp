export const getFloatingTabScreenOptions = ({
  borderStrong,
  bottomInset = 0,
  fg,
  tabBar,
  tabInactive,
}: {
  borderStrong: string;
  bottomInset?: number;
  fg: string;
  tabBar: string;
  tabInactive: string;
}) => {
  const safeBottom = Math.max(bottomInset, 8);

  return {
  headerShown: false,
  tabBarActiveTintColor: fg,
  tabBarInactiveTintColor: tabInactive,
  tabBarStyle: {
    backgroundColor: tabBar,
    borderColor: borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    bottom: safeBottom + 8,
    elevation: 0,
    height: 64 + safeBottom,
    left: 12,
    paddingBottom: safeBottom,
    paddingTop: 8,
    position: "absolute" as const,
    right: 12,
  },
  tabBarItemStyle: {
    flex: 1,
  },
  tabBarIconStyle: {
    height: 28,
    width: 32,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  };
};
