"use client";
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup, LayersControl } from "react-leaflet"

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';

import {OfferPanel} from "../Offer/offer-panel.js"
import { useState } from "react";

function getIcon() {
    return L.icon({
        iconUrl: icon.src,
        iconSize: [25, 40],
    });
}

// Component showing a circle or nothing depending on the state of the marker
function CircleMarkerWithState(props) {
    const [showCircle, setShowCircle] = useState(false);

    function activateCircle() {
        setShowCircle(!showCircle);
    }


    return (
        <Marker position={props.position} icon={getIcon()} riseOnHover={true} eventHandlers={{ click: activateCircle }}>
            <Popup>
                <OfferPanel offer={props.offer} />
            </Popup>
            { showCircle && <Circle center={props.position} radius={1000} /> }
        </Marker>
    );
}

function Map({offers}){

    const rows = [];
    let showCircles = [];

    function onMarkerClick(i) {
        showCircles[i] = !showCircles[i];
    }

    for (let i = 0; i < offers.length; i++) {
        showCircles.push(false);

        // note: we are adding a key prop here to allow react to uniquely identify each
        // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
        let offer = offers[i];

        let popupWidth = 200;

        if (offer.f1_ == null || offer.f0_ == null) {
            continue;
        }

        if(Object.values(offer.ImageUrls).length > 0){
            popupWidth = 400;
        }

        rows.push(
            <CircleMarkerWithState position={[offer.f1_, offer.f0_]} offer={offer} />
        );
    }
    // Coordonnées géographiques des limites de la Suisse
    var bounds = [
        [44.5, 2], // Coin sud-ouest
        [49, 13] // Coin nord-est
    ];
    return (
        <MapContainer center={[46.519962, 6.633597]} zoom={13} scrollWheelZoom={true} style={{ height: "100vh", width: "100%" }} maxBounds={bounds} maxBoundsViscosity={1.0}>
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
                        url='https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=9333d9105aa443ac9500e5ef07137cc4'
                        attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            {rows}
        </MapContainer>
    )
}

export default Map