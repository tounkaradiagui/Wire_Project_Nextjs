"use client";

const Announcements = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold mb-4">Annonces</h2>
        <span className="font-semibold text-xs cursor-pointer text-gray-600">
          Voir Plus
        </span>
      </div>
      {/* Announcement Item */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-blue-500/10 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              Réunion du personnel le 15 Juin 2025
            </h3>
            <span className="text-xs text-gray-500 bg-white rounded-md px-2 py-1">
              10 Juin 2025
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            N'oubliez pas la réunion du personnel prévue le 15 Juin 2025 à 14h00
            dans la salle de conférence principale.
          </p>
        </div>
        <div className="bg-green-500/10 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-green-700 mb-2">
              Mise à jour du système
            </h3>
            <span className="text-gray-500 bg-white rounded-md px-2 py-1 text-xs">
              8 Juin 2025
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Le système sera mis à jour ce week-end. Attendez-vous à une
            interruption de service de 22h00 le samedi à 6h00 le dimanche.
          </p>
        </div>
        <div className="bg-yellow-500/10 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-yellow-700 mb-2">
              Nouvelle politique de congés
            </h3>
            <span className="text-gray-500 text-xs bg-white rounded-md px-2 py-1">
              5 Juin 2025
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Veuillez noter que la nouvelle politique de congés entrera en
            vigueur à partir du 1er juillet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
