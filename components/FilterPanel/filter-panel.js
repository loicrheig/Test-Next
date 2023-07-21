import { useState, useEffect } from "react";
import { parametersNames } from "../../app/api/offer/route.ts";

/**
 * Panneau de filtres ressemblant à un formulaire.
 * @param updateOffers La fonction pour mettre à jour les offres (setter de l'état des offres)
 * @param createMarkers La fonction pour créer les markers
 * @returns Le panneau de filtres en JSX
 */
function FilterPanel({ onChangeInput, setFilters, filters }) {
  const [transportTypes, setTransportTypes] = useState([]);

  // Au moment du chargement du composant, récupère les types de transports
  useEffect(() => {
    let url = new URL("/api/transport", window.location.origin);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let tmpArray = ["Tous"];
        for (const element of data) {
          tmpArray.push(element["Type"]);
        }
        setTransportTypes(tmpArray);
      });
  }, []);

  // Fonctions permettant d'éviter que le min soit supérieur au max et vice-versa
  const handleMaxSliderChange = (minField, maxField) => (e) => {
    const value = +e.target.value;
    setFilters((prev) => ({
      ...prev,
      [minField]: Math.min(prev[minField], value),
      [maxField]: value,
    }));
  };
  const handleMinSliderChange = (minField, maxField) => (e) => {
    const value = +e.target.value;
    setFilters((prev) => ({
      ...prev,
      [minField]: value,
      [maxField]: Math.max(prev[maxField], value),
    }));
  };

  return (
    <div className="p-4 h-full bg-base-200 text-base-content w-full max-w-screen-sm">
      <div className="flex flex-col h-full">
        <div className="self-center">
          <img src="logo.svg" className="max-w-sm w-full p-4" />
        </div>
        <div className="flex-grow card bg-base-100 shadow-xl overflow-auto">
          <div className="card-body">
            <h2 className="card-title">Filtres</h2>
            <div className="grid gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Prix</span>
                </label>
                <label className="label">
                  <span className="label-text-alt">
                    Min {filters.minPrice}.-
                  </span>
                </label>
                <input
                  value={filters.minPrice}
                  onChange={handleMinSliderChange(
                    parametersNames[1],
                    parametersNames[2]
                  )}
                  className="range w-full input input-bordered"
                  type="range"
                  name={parametersNames[1]}
                  min="0"
                  max="10000"
                  step="5"
                />
                <label className="label">
                  <span className="label-text-alt">
                    Max {filters.maxPrice}.-
                  </span>
                </label>
                <input
                  value={filters.maxPrice}
                  onChange={handleMaxSliderChange(
                    parametersNames[1],
                    parametersNames[2]
                  )}
                  className="range w-full input input-bordered"
                  type="range"
                  name={parametersNames[2]}
                  min="0"
                  max="10000"
                  step="5"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Surface</span>
                </label>
                <label className="label">
                  <span className="label-text-alt">
                    Min {filters.minSurface} m2
                  </span>
                </label>
                <input
                  value={filters.minSurface}
                  onChange={handleMinSliderChange(
                    parametersNames[3],
                    parametersNames[4]
                  )}
                  className="range w-full input input-bordered"
                  type="range"
                  name={parametersNames[3]}
                  min="0"
                  max="1000"
                  step="5"
                />
                <label className="label">
                  <span className="label-text-alt">
                    Max {filters.maxSurface} m2
                  </span>
                </label>
                <input
                  value={filters.maxSurface}
                  onChange={handleMaxSliderChange(
                    parametersNames[3],
                    parametersNames[4]
                  )}
                  className="range w-full input input-bordered"
                  type="range"
                  name={parametersNames[4]}
                  min="0"
                  max="1000"
                  step="5"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nombre de pièces</span>
                </label>
                <input
                  className="input input-bordered w-full text-center"
                  type="number"
                  min="0"
                  max="10"
                  step={0.5}
                  name={parametersNames[0]}
                  value={filters.nbRooms}
                  onChange={onChangeInput}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Distance max</span>
                </label>
                <label className="label">
                  <span className="label-text-alt">école primaire</span>
                </label>
                <input
                  className="input input-bordered w-full text-center"
                  type="number"
                  min="0"
                  max="1000"
                  step="5"
                  name={parametersNames[5]}
                  value={filters.maxSchoolDistance}
                  onChange={onChangeInput}
                />
                <label className="label">
                  <span className="label-text-alt">supermarché</span>
                </label>
                <input
                  className="input input-bordered w-full text-center"
                  type="number"
                  min="0"
                  max="1000"
                  step="5"
                  name={parametersNames[6]}
                  value={filters.maxShopDistance}
                  onChange={onChangeInput}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Distance max d&apos;un transport
                  </span>
                </label>
                <label className="label">
                  <span className="label-text-alt">Type</span>
                </label>
                <select
                  name={parametersNames[7]}
                  value={filters.transportType}
                  onChange={onChangeInput}
                  className="select select-bordered w-full"
                >
                  {transportTypes.map((transport) => (
                    <option key={transport} value={transport}>
                      {transport}
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt">Distance</span>
                </label>
                <input
                  className="input input-bordered w-full text-center"
                  type="number"
                  min="0"
                  max="1000"
                  step="5"
                  name={parametersNames[8]}
                  value={filters.transportDistance}
                  onChange={onChangeInput}
                />
              </div>
              <div className="form-control">
                <label htmlFor="my-drawer" className="btn btn-primary">
                  Fermer
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bouton pour ouvrir le panneau de filtres
function FilterButton() {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control">
        <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
          Filtres
        </label>
      </div>
    </div>
  );
}

// Wrapper pour le panneau de filtres
function PanelWrapper({ children, panel }) {
  return (
    <div className="drawer drawer-end">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        {children}
      </div>
      <div className="drawer-side z-[1000]">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        {panel}
      </div>
    </div>
  );
}

export { PanelWrapper, FilterButton, FilterPanel };
