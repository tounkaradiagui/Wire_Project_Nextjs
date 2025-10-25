import Image from "next/image";

const TeacherDetailPage = () => {
  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
      {/* Left */}
      <div className="w-full xl:w-2/3">
        {/* Top */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* User card infos */}
          <div className="bg-blue-300 py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src="https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <h1 className="text-xl font-semibold">James Watt</h1>
              <p className="text-sm text-gray-500">
                Enseignant de mathématiques avec plus de 10 ans d'expérience
                dans l'enseignement secondaire. Passionné par la pédagogie et
                l'innovation éducative.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>O+</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>15 Mars 1980</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>jameswatt@gmail.com</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>76292270</span>
                </div>
              </div>
            </div>
          </div>
          {/* Small card */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* Card */}
            <div className="flex gap-4 bg-white p-4 rounded-md flex-1 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] min-w-[150px] ">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-600">Présence</span>
              </div>
            </div>
            {/* Card */}
            <div className="flex gap-4 bg-white p-4 rounded-md flex-1 min-w-[150px] ">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">12</h1>
                <span className="text-sm text-gray-600">
                  Matières enseignées
                </span>
              </div>
            </div>
            {/* Card */}
            <div className="flex gap-4 bg-white p-4 rounded-md flex-1 min-w-[150px] ">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">8</h1>
                <span className="text-sm text-gray-600">Leçons données</span>
              </div>
            </div>
            {/* Card */}
            <div className="flex gap-4 bg-white p-4 rounded-md flex-1 min-w-[150px] ">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">5</h1>
                <span className="text-sm text-gray-600">Classes assignées</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div>Programme de l'enseignant</div>
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3">R</div>
    </div>
  );
};

export default TeacherDetailPage;
