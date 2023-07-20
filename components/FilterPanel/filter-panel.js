import { useState, useEffect } from "react";
import {
  parametersDefault,
  parametersNames,
} from "../../app/api/offer/route.ts";

/**
 * Fonction qui permet de faire un debounce sur une fonction.
 * Cela afin d'éviter de faire trop de requêtes non-voulues au serveur.
 * @param {*} func La fonction à appeler
 * @param {*} delay Le délai en ms
 * @returns La fonction à appeler
 */
function debounce(func, delay) {
  let debounceTimer;
  return function (...args) {
    const context = this;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

// Id global pour éviter que les requêtes ne se chevauchent
let globalId = 0;
const getId = () => {
  globalId++;
  return globalId;
};

/**
 * Fonction allant récupérer les offres sur le serveur.
 * Et mettant à jour l'état des offres à afficher.
 * @param uri L'url de la requête
 * @param offset L'offset de la requête
 * @param limit Le nombre d'offres à récupérer
 * @param updateOffers La fonction pour mettre à jour les offres
 * @param createMarkers La fonction pour créer les markers
 * @param id L'id de la requête
 */
async function fetchOffers({
  uri,
  offset,
  limit,
  updateOffers,
  createMarkers,
  id = null,
}) {
  if (id == null) {
    id = getId();
  }
  // Si l'id de la requête est différent de l'id global, cela signifie que
  // cette requête est une ancienne requête qui n'avait pas été terminée
  else if (id != globalId) {
    console.log("id != globalId");
    console.log(id);
    console.log(globalId);
    return;
  }

  const url = new URL(uri);
  url.searchParams.append("offset", offset);

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      // Première itération, clean les anciens markers
      // Sinon, si la requête n'a pas retourné d'offres, la récursion s'arrête
      if (offset == 0) {
        updateOffers(createMarkers(data, offset), true);
      } else if (data.length > 0) {
        updateOffers(createMarkers(data, offset), false);
      } else {
        return;
      }
      fetchOffers({
        uri: uri,
        offset: offset + limit,
        limit: limit,
        updateOffers: updateOffers,
        createMarkers: createMarkers,
        id: id,
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

// Déclaration de la fonction fetchOffers avec un debounce de 500ms
const debounceFetchOffers = debounce(fetchOffers, 500);

/**
 * Panneau de filtres ressemblant à un formulaire.
 * @param updateOffers La fonction pour mettre à jour les offres (setter de l'état des offres)
 * @param createMarkers La fonction pour créer les markers
 * @returns Le panneau de filtres en JSX
 */
function FilterPanel({ updateOffers, createMarkers }) {
  const [filters, setFilters] = useState(parametersDefault);
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

  // A chaque changement des filtres, un nouvel url est créé
  // Et les offres sont récupérées
  useEffect(() => {
    const url = new URL("/api/offer", window.location.origin);
    for (const key in filters) {
      if (filters[key] != parametersDefault[key]) {
        url.searchParams.append(key, filters[key]);
      }
    }

    // Nombre d'offres à récupérer à chaque requête
    // Afin de ne pas surcharger le serveur
    const limit = 300;
    url.searchParams.append("limit", limit);

    debounceFetchOffers({
      uri: url.toString(),
      offset: 0,
      limit: limit,
      updateOffers: updateOffers,
      createMarkers: createMarkers,
    });
  }, [filters]);

  // Exécuté à chaque modification d'un input
  // Met à jour les filtres
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
