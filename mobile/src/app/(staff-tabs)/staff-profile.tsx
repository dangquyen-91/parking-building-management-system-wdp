import { ProfileScreen } from "@/components/profile/profile-screen";

export default function StaffProfile() {
  return (
    <ProfileScreen
      showSubscriptionCard={false}
      showVehiclesCard={false}
      subtitle="Thông tin tài khoản nhân viên dùng cho các tác vụ vận hành tại bãi xe."
      titleFallback="Hồ sơ nhân viên"
    />
  );
}
