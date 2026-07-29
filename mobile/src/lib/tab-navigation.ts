export const getFloatingTabScreenOptions = ({
  borderStrong,
  fg,
  tabBar,
  tabInactive,
}: {
  borderStrong: string;
  fg: string;
  tabBar: string;
  tabInactive: string;
}) => {
  return {
  headerShown: false,
  tabBarActiveTintColor: fg,
  tabBarInactiveTintColor: tabInactive,
  tabBarStyle: {
    backgroundColor: tabBar,
    borderColor: borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    bottom: 16,
    elevation: 0,
    height: 72,
    left: 12,
    paddingBottom: 8,
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
