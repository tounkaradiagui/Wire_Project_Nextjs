"use server";

import Image from "next/image";
import CountChart from "@/components/CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });
  // Calculer le nombre de garçons et de filles à partir des données récupérées, en utilisant des valeurs par défaut de 0 si aucune donnée n'est trouvée pour un sexe donné
  const boysData = data.find((item) => item.sex === "MALE")?._count || 0;
  const girlsData = data.find((item) => item.sex === "FEMALE")?._count || 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full w-full">

      {/* Bar title */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Elèves</h2>
        <Image
          src="/moreDark.png"
          alt="Eleves"
          width={14}
          height={14}
          className="cursor-pointer"
        />
      </div>
      {/* My count chart */}
      <CountChart boys={boysData} girls={girlsData} />
      {/* Bottom */}
      <div className="flex justify-center gap-16">
        <div className=" flex flex-col gap-1">
          <div className="w-5 h-5 bg-green-500 rounded-full" />
          <h1 className="text-bold">{boysData}</h1>
          <h1 className="text-bold text-gray-600">
            Garçons {Math.round((boysData / (girlsData + boysData)) * 100)}%
          </h1>
        </div>

        <div className=" flex flex-col gap-1">
          <div className="w-5 h-5 bg-yellow-500 rounded-full" />
          <h1 className="text-bold">{girlsData}</h1>
          <h1 className="text-bold text-gray-700">
            Filles {Math.round((girlsData / (boysData + girlsData)) * 100)}%
          </h1>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
