import Sidebar from "@/components/Sidebar";
import DashboardWrapper from "./DashboardWrapper";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardWrapper>
      <Sidebar>{children}</Sidebar>
    </DashboardWrapper>
  );
}
