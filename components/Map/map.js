"use client";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  LayersControl,
  useMapEvents,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

import { OfferPanel } from "../Offer/offer.js";

import {
  FilterPanel,
  FilterButton,
  PanelWrapper,
} from "../FilterPanel/filter-panel.js";

import {
  parametersDefault,
  parametersNames,
} from "../../app/api/offer/route.ts";

import { useState, useEffect, use } from "react";

// Function to create a scrollable container
function contentScrollable(element, rightScroll, height = "h-full") {
  let containerClassName = "overflow-y-auto " + height + " mb-5 " + rightScroll;

  if (!rightScroll) {
    containerClassName += " direction-rtl";
  }

  return <div className={containerClassName}>{element}</div>;
}

// Function to get the icon of the marker depending on the precision of the address
function getIcon(url) {
  return L.icon({
    iconUrl: url,
    iconSize: [25, 40],
  });
}

function getOfferIcon(isAdressPrecise) {
  if (isAdressPrecise) {
    return getIcon("/detailsAddressMarker.png");
  } else {
    return getIcon("/approximateAddressMarker.png");
  }
}

function SimpleMarker({ element, type }) {
  let icon;

  if (type == "shop") {
    icon = getIcon("/shop.svg");
  } else if (type == "school") {
    icon = getIcon("/school.svg");
  } else if (type == "interest") {
    icon = getIcon("/like.svg");
  } else if (type == "transport") {
    icon = getIcon("/bus.svg");
  }
  return <Marker position={[element._field_2, element._field_1]} icon={icon} />;
}

// Composant pour créer un simple marqueur
function SimpleOfferMarker({ props, eventHandlers = {} }) {
  const [isHovered, setIsHovered] = useState(false);
  const tmpRows = [];
  for (let i = 0; i < props.offer.Shops.length; i++) {
    let shop = props.offer.Shops[i];
    if (shop._field_1 == null || shop._field_2 == null) {
      continue;
    }
    tmpRows.push(<SimpleMarker element={shop} type="shop" key={"shop " + i} />);
    tmpRows.push(
      <Polyline
        positions={[
          [props.offer.f1_, props.offer.f0_],
          [shop._field_2, shop._field_1],
        ]}
        color="red"
        key={"shop line " + i}
        opacity={0.5}
        dashArray="7, 7"
      />
    );
  }

  for (let i = 0; i < props.offer.Schools.length; i++) {
    let school = props.offer.Schools[i];
    if (school._field_1 == null || school._field_2 == null) {
      continue;
    }
    tmpRows.push(
      <SimpleMarker element={school} type="school" key={"school " + i} />
    );
    tmpRows.push(
      <Polyline
        positions={[
          [props.offer.f1_, props.offer.f0_],
          [school._field_2, school._field_1],
        ]}
        color="blue"
        key={"school line " + i}
        opacity={0.5}
        dashArray="8, 8"
      />
    );
  }

  for (let i = 0; i < props.offer.InterestPoints.length; i++) {
    let interestPoint = props.offer.InterestPoints[i];
    if (interestPoint._field_1 == null || interestPoint._field_2 == null) {
      continue;
    }
    tmpRows.push(
      <SimpleMarker
        element={interestPoint}
        type="interest"
        key={"interest " + i}
      />
    );
    tmpRows.push(
      <Polyline
        positions={[
          [props.offer.f1_, props.offer.f0_],
          [interestPoint._field_2, interestPoint._field_1],
        ]}
        color="green"
        key={"interest line " + i}
        opacity={0.5}
        dashArray="9, 9"
      />
    );
  }

  for (let i = 0; i < props.offer.PublicTransports.length; i++) {
    let publicTransport = props.offer.PublicTransports[i];
    if (publicTransport._field_1 == null || publicTransport._field_2 == null) {
      continue;
    }
    tmpRows.push(
      <SimpleMarker
        element={publicTransport}
        type="transport"
        key={"transport " + i}
      />
    );
    tmpRows.push(
      <Polyline
        positions={[
          [props.offer.f1_, props.offer.f0_],
          [publicTransport._field_2, publicTransport._field_1],
        ]}
        color="grey"
        key={"transport line " + i}
        opacity={0.5}
        dashArray="10, 10"
      />
    );
  }

  const [showAmenities, setshowAmenities] = useState(false);

  // Add mouse over to eventHandlers
  eventHandlers.mouseover = (event) => setshowAmenities(true);
  eventHandlers.mouseout = (event) => setshowAmenities(false);

  const popupWidth = Math.max((screen.width * 1) / 3, 300);

  return (
    <div>
      <Marker
        position={props.position}
        icon={getOfferIcon(props.offer.AddressPrecise)}
        eventHandlers={eventHandlers}
      >
        <Popup maxWidth={popupWidth}>
          <OfferPanel
            offer={props.offer}
            contentScrollable={contentScrollable}
          />
        </Popup>
      </Marker>
      {showAmenities && tmpRows}
    </div>
  );
}

function PreciseOfferMarker(props) {
  return <SimpleOfferMarker props={props} />;
}

// Composant pour créer un marqueur qui affiche un cercle autour de l'offre
function UnpreciseOfferMarker(props) {
  const [showCircle, setShowCircle] = useState(false);

  function activateCircle() {
    setShowCircle(!showCircle);
  }

  return (
    <div>
      <SimpleOfferMarker
        props={props}
        eventHandlers={{
          click: (event) => activateCircle(),
        }}
      />
      {showCircle && <Circle center={props.position} radius={1000} />}
    </div>
  );
}

// Fonction pour créer les marqueurs en fonction des offres
function createMarkers(offers, offsetKey = 0) {
  const tmpRows = [];

  for (let i = 0; i < offers.length; i++) {
    let offer = offers[i];

    if (offer.f1_ == null || offer.f0_ == null) {
      continue;
    }

    if (offer.AddressPrecise) {
      tmpRows.push(
        <PreciseOfferMarker
          position={[offer.f1_, offer.f0_]}
          offer={offer}
          key={i + offsetKey}
        />
      );
    } else {
      tmpRows.push(
        <UnpreciseOfferMarker
          position={[offer.f1_, offer.f0_]}
          offer={offer}
          key={i + offsetKey}
        />
      );
    }
  }
  return tmpRows;
}

function ZoomHandler({ onChangeInput }) {
  // set the zoom event without useMapEvents

  const mapEvents = useMapEvents({
    zoomend: () => {
      // Get screen bounds from zoom
      const bounds = mapEvents.getBounds();

      // Get the upper left corner and the lower right corner
      const upperLeft = bounds.getNorthWest();
      const lowerRight = bounds.getSouthEast();

      // format the coordinates to be a string lat,lng
      const upperLeftString = upperLeft.lat + "," + upperLeft.lng;
      const lowerRightString = lowerRight.lat + "," + lowerRight.lng;

      onChangeInput({
        target: {
          name: parametersNames[9],
          value: upperLeftString,
        },
      });

      onChangeInput({
        target: {
          name: parametersNames[10],
          value: lowerRightString,
        },
      });
    },
    dragend: () => {
      // Get screen bounds from zoom
      const bounds = mapEvents.getBounds();

      // Get the upper left corner and the lower right corner
      const upperLeft = bounds.getNorthWest();
      const lowerRight = bounds.getSouthEast();

      // format the coordinates to be a string lat,lng
      const upperLeftString = upperLeft.lat + "," + upperLeft.lng;
      const lowerRightString = lowerRight.lat + "," + lowerRight.lng;

      onChangeInput({
        target: {
          name: parametersNames[9],
          value: upperLeftString,
        },
      });

      onChangeInput({
        target: {
          name: parametersNames[10],
          value: lowerRightString,
        },
      });
    },
  });
}

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
 * Composant pour afficher la carte, le panneau de filtres et les offres
 * @returns
 */
function Map() {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState(parametersDefault);

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

  // Fonction pour mettre à jour les offres
  // Celle-ci est nécessaire pour les fetchs divisés en plusieurs parties
  function updateOffers(newOffers, clean = true) {
    if (clean) {
      setOffers([]);
    }
    setOffers((offers) => offers.concat(newOffers));
  }

  // Coordonnées géographiques des limites de la Suisse
  var bounds = [
    [44.5, 2], // Coin sud-ouest
    [49, 13], // Coin nord-est
  ];

  return (
    <PanelWrapper
      panel={
        <FilterPanel
          onChangeInput={onChangeInput}
          setFilters={setFilters}
          filters={filters}
        />
      }
    >
      <div id="map-container" className="w-full h-screen">
        <MapContainer
          center={[46.519962, 6.633597]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100vh", width: "100%" }}
          maxBounds={bounds}
          maxBoundsViscosity={1.0}
        >
          <ZoomHandler onChangeInput={onChangeInput} />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap Mapnik">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap.DE">
              <TileLayer
                url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap.France">
              <TileLayer
                url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap.CH">
              <TileLayer
                url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Dark">
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Ragnarok">
              <TileLayer
                url="https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=9333d9105aa443ac9500e5ef07137cc4"
                attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          {offers}
        </MapContainer>
      </div>
      <FilterButton />
    </PanelWrapper>
  );
}

export default Map;
