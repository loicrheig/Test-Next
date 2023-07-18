"use client";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  LayersControl,
} from "react-leaflet";

import L from "leaflet";

import { OfferPanel } from "../Offer/offer-panel.js";
import { FilterPanel, FilterButton } from "../FilterPanel/filter-panel.js";
import { useState } from "react";

function getIcon(isAdressPrecise) {
  if (isAdressPrecise) {
    return L.icon({
      iconUrl: "/detailsAddressMarker.png",
      iconSize: [25, 40],
    });
  } else {
    return L.icon({
      iconUrl: "/approximateAddressMarker.png",
      iconSize: [25, 40],
    });
  }
}

// Component showing a circle or nothing depending on the state of the marker
function CircleMarkerWithState(props) {
  const [showCircle, setShowCircle] = useState(false);

  function activateCircle() {
    setShowCircle(!showCircle);
  }

  const popupWidth = Math.max((screen.width * 1) / 3, 300);

  return (
    <Marker
      position={props.position}
      icon={getIcon(props.offer.AddressPrecise)}
      riseOnHover={true}
      eventHandlers={{ click: activateCircle }}
    >
      <Popup maxWidth={popupWidth}>
        <OfferPanel offer={props.offer} />
      </Popup>
      {showCircle && <Circle center={props.position} radius={1000} />}
    </Marker>
  );
}

function SimpleMarker(props) {
  const popupWidth = Math.max((screen.width * 1) / 3, 300);
  return (
    <Marker
      position={props.position}
      icon={getIcon(props.offer.AddressPrecise)}
    >
      <Popup maxWidth={popupWidth}>
        <OfferPanel offer={props.offer} />
      </Popup>
    </Marker>
  );
}

function createMarkers(offers, offsetKey = 0) {
  const tmpRows = [];
  for (let i = 0; i < offers.length; i++) {
    // note: we are adding a key prop here to allow react to uniquely identify each
    // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
    let offer = offers[i];

    if (offer.f1_ == null || offer.f0_ == null) {
      continue;
    }

    if (offer.AddressPrecise) {
      tmpRows.push(
        <SimpleMarker
          position={[offer.f1_, offer.f0_]}
          offer={offer}
          key={i + offsetKey}
        />
      );
    } else {
      tmpRows.push(
        <CircleMarkerWithState
          position={[offer.f1_, offer.f0_]}
          offer={offer}
          key={i + offsetKey}
        />
      );
    }
  }
  return tmpRows;
}

function Map() {
  const [offers, setOffers] = useState([]);

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
    <div>
      <div id="map-container" className="w-full">
        <MapContainer
          center={[46.519962, 6.633597]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100vh", width: "100%" }}
          maxBounds={bounds}
          maxBoundsViscosity={1.0}
        >
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
      <FilterButton>
        <FilterPanel
          updateOffers={updateOffers}
          createMarkers={createMarkers}
        />
      </FilterButton>
    </div>
  );
}

export default Map;
