import { useState, useEffect } from "react";
import { parametersNames } from "../../app/api/offer/route.ts";
import styles from "./filter-panel.module.css";

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

function FilterPanel({ updateOffers, createMarkers, contentScrollable }) {
  const priceMin = 0;
  const priceMax = 10000;

  // Check if the user is on mobile
  const isOnMobile = window.innerWidth <= 800;

  const nullFilter = {
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

  const [transportTypes, setTransportTypes] = useState([]);

  useEffect(() => {
    let url = new URL("/api/transport", window.location.origin);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let tmpArray = ["Tous"];
        for (let i = 0; i < data.length; i++) {
          tmpArray.push(data[i]["Type"]);
        }
        setTransportTypes(tmpArray);
      });
  }, []);

  const [filters, setFilters] = useState(nullFilter);

  useEffect(() => {
    if (filters != nullFilter) {
      const url = new URL("/api/offer", window.location.origin);

      if (filters.nbRooms != 0) {
        url.searchParams.append(parametersNames[0], filters.nbRooms);
      }
      if (filters.minSurface != 0) {
        url.searchParams.append(parametersNames[1], filters.minSurface);
      }
      if (filters.maxSurface != 0) {
        url.searchParams.append(parametersNames[2], filters.maxSurface);
      }
      if (filters.minPrice != 0) {
        url.searchParams.append(parametersNames[3], filters.minPrice);
      }
      if (filters.maxPrice != 0) {
        url.searchParams.append(parametersNames[4], filters.maxPrice);
      }
      if (filters.schoolDistance != 0) {
        url.searchParams.append(parametersNames[5], filters.schoolDistance);
      }
      if (filters.shopDistance != 0) {
        url.searchParams.append(parametersNames[6], filters.shopDistance);
      }
      if (filters.transportType != "Tous") {
        url.searchParams.append(parametersNames[7], filters.transportType);
      }
      if (filters.transportDistance != 0) {
        url.searchParams.append(parametersNames[8], filters.transportDistance);
      }

      // The goal is too create sub request to the API to get the offers
      // The first request get the first 100 offers
      // The second request get the next 100 offers
      // And so on...

      const limit = 300;
      url.searchParams.append("limit", limit);

      fetchOffers({
        // Get the url string
        uri: url.toString(),
        offset: 0,
        limit: limit,
        updateOffers: updateOffers,
        createMarkers: createMarkers,
      });
    }
  }, [filters]);

  // The value w-x for map-container need to be 1-X for slideover-container

  function toggleSlideover() {
    document
      .getElementById("slideover-container")
      .classList.toggle("invisible");
    document.getElementById("slideover").classList.toggle("translate-x-full");
    document.getElementById("map-container").classList.toggle("w-3/4");
    document.getElementById("map-container").classList.toggle("w-full");
  }

  function onSubmit(event) {
    toggleSlideover();
    event.preventDefault();
    const data = {
      minPrice: event.target.minPrice.value,
      maxPrice: event.target.maxPrice.value,
      minSurface: event.target.minSurface.value,
      maxSurface: event.target.maxSurface.value,
      nbRooms: event.target.nbRooms.value,
      schoolDistance: event.target.schoolDistance.value,
      shopDistance: event.target.shopDistance.value,
      transportType: event.target.transportType.value,
      transportDistance: event.target.transportDistance.value,
    };
    setFilters(data);
  }

  function changeMinSlider(setterMaxFunction, value, id) {
    updateSlider(id, setterMaxFunction, value, "min");
  }

  function changeMaxSlider(setterMinFunction, value, id) {
    updateSlider(id, setterMinFunction, value, "max");
  }

  function updateSlider(inputId, setterFunction, value, mode) {
    value = parseInt(value);
    var inputElement = document.getElementById(inputId);
    if (
      (mode === "min" && value > parseInt(inputElement.value)) ||
      (mode === "max" && value < parseInt(inputElement.value))
    ) {
      setterFunction(value);
      inputElement.value = value;
    }
  }

  function FilterForm() {
    const [minPrice, setMinPrice] = useState(filters.minPrice ?? priceMin);
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? priceMax);

    const surfaceMin = 0;
    const surfaceMax = 1000;
    const [minSurface, setMinSurface] = useState(
      filters.minSurface ?? surfaceMin
    );
    const [maxSurface, setMaxSurface] = useState(
      filters.maxSurface ?? surfaceMax
    );

    // return a form filtering the map offers
    return (
      <div className="mt-10 ml-4 mr-4">
        <img src="logo.svg" className="mb-4 p-2" />
        {contentScrollable(
          <form
            className="p-4 border-4 bg-gray-200 rounded-md"
            onSubmit={onSubmit}
          >
            <div className="grid gap-4 grid-cols-2 grid-rows-5">
              <label className="col-span-2 text-center">Prix</label>
              <label>Min {minPrice}.-</label>
              <div>
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full"
                  type="range"
                  name="minPrice"
                  min={priceMin}
                  max={priceMax}
                  step={5}
                  id="minPriceInput"
                  onMouseUp={(e) =>
                    changeMinSlider(
                      setMaxPrice,
                      e.target.value,
                      "maxPriceInput"
                    )
                  }
                />
              </div>
              <label>Max {maxPrice}.-</label>
              <div>
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full"
                  type="range"
                  name="maxPrice"
                  min={priceMin}
                  max={priceMax}
                  step={5}
                  id="maxPriceInput"
                  onMouseUp={(e) =>
                    changeMaxSlider(
                      setMinPrice,
                      e.target.value,
                      "minPriceInput"
                    )
                  }
                />
              </div>
              <label className="col-span-2 text-center">Surface</label>
              <label>Min {minSurface} m2</label>
              <div>
                <input
                  value={minSurface}
                  onChange={(e) => setMinSurface(e.target.value)}
                  className="w-full"
                  type="range"
                  name="minSurface"
                  min={surfaceMin}
                  max={surfaceMax}
                  step={5}
                  id="minSurfaceInput"
                  onMouseUp={(e) =>
                    changeMinSlider(
                      setMaxSurface,
                      e.target.value,
                      "maxSurfaceInput"
                    )
                  }
                />
              </div>
              <label>Max {maxSurface} m2</label>
              <div>
                <input
                  value={maxSurface}
                  onChange={(e) => setMaxSurface(e.target.value)}
                  className="w-full"
                  type="range"
                  name="maxSurface"
                  min={surfaceMin}
                  max={surfaceMax}
                  step={5}
                  id="maxSurfaceInput"
                  onMouseUp={(e) =>
                    changeMaxSlider(
                      setMinSurface,
                      e.target.value,
                      "minSurfaceInput"
                    )
                  }
                />
              </div>
              <label>Nombre de pièces</label>
              <input
                className="w-1/2 text-center"
                type="number"
                min="0"
                max="10"
                step={0.5}
                name="nbRooms"
                defaultValue={filters.nbRooms ?? 0}
              />
              <label className="col-span-2 text-center">Distance max</label>
              <label>école primaire</label>
              <input
                className="w-1/2 text-center"
                type="number"
                min="0"
                max="1000"
                step={5}
                name="schoolDistance"
                defaultValue={filters.schoolDistance ?? 0}
              />
              <label>supermarché</label>
              <input
                className="w-1/2 text-center"
                type="number"
                min="0"
                max="1000"
                step={5}
                name="shopDistance"
                defaultValue={filters.shopDistance ?? 0}
              />
              <label className="col-span-2 text-center">
                Distance max d&apos;un transport
              </label>
              <select name="transportType" defaultValue={filters.transportType}>
                {transportTypes.map((transport) => (
                  <option key={transport} value={transport}>
                    {transport}
                  </option>
                ))}
              </select>
              <input
                className="w-1/2 text-center"
                type="number"
                min="0"
                max="1000"
                step={5}
                name="transportDistance"
                defaultValue={filters.transportDistance ?? 0}
              />
              <input
                type="submit"
                value="Submit"
                className="col-span-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              />
            </div>
          </form>,
          true,
          styles.filterHeight
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={toggleSlideover}
        className="cursor-pointer h-9 px-5 py-2 text-sm border bg-gray-50 text-gray-500 hover:bg-gray-100 rounded border-gray-300 select-none"
      >
        Filtre
      </div>
      <div
        id="slideover-container"
        className={
          isOnMobile
            ? "w-full h-full fixed invisible inset-y-0 right-0"
            : "w-1/4 h-full fixed invisible inset-y-0 right-0"
        }
      >
        <div
          id="slideover"
          className="w-full bg-white h-full absolute right-0 duration-300 ease-out transition-all translate-x-full"
        >
          <div
            onClick={toggleSlideover}
            className="absolute cursor-pointer text-gray-600 top-0 w-8 h-8 flex items-center justify-center right-0 mt-2 mr-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <FilterForm />
        </div>
      </div>
    </div>
  );
}

function FilterButton({ children }) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar">{children}</div>
    </div>
  );
}

export { FilterPanel, FilterButton };
