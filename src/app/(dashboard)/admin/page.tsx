import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCards from "@/components/UserCards";

type AdminPageProps = {
  searchParams?: { [key: string]: string | undefined };
};

const AdminPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; date?: string }>;
}) => {
  const params = (await searchParams) ?? {};

  const page = params.page ? Number(params.page) : 1;
  const date = params.date;

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
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
          <div className="w-full lg:w-1/3 h-112.5">
            <CountChartContainer />
          </div>

          <div className="w-full lg:w-2/3 h-112.5">
            <AttendanceChartContainer />
          </div>
        </div>

        {/* Bottom chart */}
        <div className="w-full h-125">
          <FinanceChart />
        </div>
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
