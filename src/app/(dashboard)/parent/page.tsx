import Announcements from "@/components/Announcements";
import EventCalendar from "@/components/EventCalendar";
import BigCalendar from "@/components/BigCalendar";

const ParentPage = () => {
  return (
    <div className="h-full p-4 flex gap-4 flex-col xl:flex-row ">
      {/* Left */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8 teacher-calendar-container">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Emploi du temps (Mariam Djenepo)
          </h1>
          <BigCalendar />
        </div>
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        {/* Announcements */}
        <Announcements />
      </div>
    </div>
  );
};
export default ParentPage;
