import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCards from "@/components/UserCards";

const SuperAdminPage = async () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <UserCards type="admin" />
          <UserCards type="student" />
          <UserCards type="teacher" />
          <UserCards type="parent" />
        </div>

        <div className="gap-4 mt-4 flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 min-h-112.5">
            <CountChartContainer />
          </div>

          <div className="w-full lg:w-2/3 min-h-112.5">
            <AttendanceChartContainer />
          </div>
        </div>

        <div className="w-full min-h-125">
          <FinanceChart />
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer />
        <Announcements />
      </div>
    </div>
  );
};

export default SuperAdminPage;