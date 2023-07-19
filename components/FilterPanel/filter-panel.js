import { useState, useEffect } from "react";
import {
  parametersDefault,
  parametersNames,
} from "../../app/api/offer/route.ts";

function debounce(func, delay) {
  let debounceTimer;
  return function (...args) {
    const context = this;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

async function fetchOffers({
  uri,
  offset,
  limit,
  updateOffers,
  createMarkers,
}) {
  const url = new URL(uri);
  url.searchParams.append("offset", offset);

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      //updateOffers(data);
      // If data is empty, we don't need to do the next request
      // Première itération, clean les markers
      if (offset == 0) {
        updateOffers(createMarkers(data, offset), true);
      } else {
        updateOffers(createMarkers(data, offset), false);
      }
      fetchOffers({
        // Get the url string
        uri: uri,
        offset: offset + limit,
        limit: limit,
        updateOffers: updateOffers,
        createMarkers: createMarkers,
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

const debounceFetchOffers = debounce(fetchOffers, 500);
function FilterPanel({ updateOffers, createMarkers }) {
  const [filters, setFilters] = useState(parametersDefault);
  const [transportTypes, setTransportTypes] = useState([]);

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

  useEffect(() => {
    const url = new URL("/api/offer", window.location.origin);
    for (const key in filters) {
      if (filters[key] != parametersDefault[key]) {
        url.searchParams.append(key, filters[key]);
      }
    }

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

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        <form className="flex-grow card bg-base-100 shadow-xl overflow-auto">
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

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
