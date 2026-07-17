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
}) => ({
  headerShown: false,
  tabBarActiveTintColor: fg,
  tabBarInactiveTintColor: tabInactive,
  tabBarStyle: {
    backgroundColor: tabBar,
    borderColor: borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    bottom: 15,
    elevation: 0,
    height: 68,
    left: 12,
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
});
