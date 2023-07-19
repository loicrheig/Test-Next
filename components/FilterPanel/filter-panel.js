import { useState, useEffect } from "react";

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
      if (data.length != 0) {
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
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

const debounceFetchOffers = debounce(fetchOffers, 500);

const defaultFilters = {
  minPrice: 0,
  maxPrice: 0,
  minSurface: 0,
  maxSurface: 0,
  nbRooms: 0,
  schoolDistance: 0,
  shopDistance: 0,
  transportType: "Tous",
  transportDistance: 0,
};

function FilterPanel({ updateOffers, createMarkers }) {
  const [filters, setFilters] = useState(defaultFilters);
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
      if (filters[key] !== defaultFilters[key]) {
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

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const formValues = Object.fromEntries(data.entries());
    setFilters((prev) => ({
      ...prev,
      ...formValues,
    }));
  };

  return (
    <div className="p-4 h-full bg-base-200 text-base-content w-full max-w-screen-sm">
      <div className="flex flex-col h-full">
        <div className="self-center">
          <img src="logo.svg" className="max-w-sm w-full p-4" />
        </div>
        <form
          className="flex-grow card bg-base-100 shadow-xl overflow-auto"
          onSubmit={onSubmit}
        >
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
                  onChange={handleMinSliderChange("minPrice", "maxPrice")}
                  className="range w-full input input-bordered"
                  type="range"
                  name="minPrice"
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
                  onChange={handleMaxSliderChange("minPrice", "maxPrice")}
                  className="range w-full input input-bordered"
                  type="range"
                  name="maxPrice"
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
                  onChange={handleMinSliderChange("minSurface", "maxSurface")}
                  className="range w-full input input-bordered"
                  type="range"
                  name="minSurface"
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
                  onChange={handleMaxSliderChange("minSurface", "maxSurface")}
                  className="range w-full input input-bordered"
                  type="range"
                  name="maxSurface"
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
                  name="nbRooms"
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
                  name="schoolDistance"
                  value={filters.schoolDistance}
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
                  name="shopDistance"
                  value={filters.shopDistance}
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
                  name="transportType"
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
                  name="transportDistance"
                  value={filters.transportDistance}
                  onChange={onChangeInput}
                />
              </div>
              <div className="card-actions justify-end">
                <input
                  type="submit"
                  value="Submit"
                  className="btn btn-primary"
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
