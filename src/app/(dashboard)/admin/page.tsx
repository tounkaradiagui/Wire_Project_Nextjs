import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCards from "@/components/UserCards";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row ">
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* Users Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <UserCards type="admin" />
          <UserCards type="student" />
          <UserCards type="teacher" />
          <UserCards type="parent" />
        </div>

        {/* Middle charts */}
        <div className="gap-4 mt-4 flex flex-col lg:flex-row">
          {/* Count Chart */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>

          {/* Attendance Chart */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>

        {/* Bottom chart */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* Right */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        {/* Event Calendar */}
        <EventCalendarContainer searchParams={searchParams} />
        {/* Announcements */}
        <Announcements />
      </div>
    </div>
  );
};
export default AdminPage;
