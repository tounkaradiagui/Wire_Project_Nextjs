import Announcements from "@/components/Announcements";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import UserCards from "@/components/UserCards";

const AdminPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row ">
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* Users Cards */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCards type="staff" />
          <UserCards type="student" />
          <UserCards type="teacher" />
          <UserCards type="parent" />
        </div>

        {/* Middle charts */}
        <div className="gap-4 mt-4 flex flex-col lg:flex-row">
          {/* Count Chart */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart />
          </div>

          {/* Attendance Chart */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart />
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
        <EventCalendar />
        {/* Announcements */}
        <Announcements />
      </div>
    </div>
  );
};
export default AdminPage;
