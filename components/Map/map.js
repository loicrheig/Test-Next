"use client";
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup, LayersControl } from "react-leaflet"

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';

import {OfferPanel} from "../Offer/offer-panel.js"

function getIcon() {
    return L.icon({
        iconUrl: icon.src,
        iconSize: [25, 40],
    });
}

function Map({offers}){
    const rows = [];
    for (let i = 0; i < offers.length; i++) {
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
            <Marker position={[offer.f1_, offer.f0_]} icon={getIcon()}>
                <Popup maxWidth={popupWidth}>
                    <OfferPanel offer={offer} />
                </Popup>
            </Marker>
        );
    }
    return (
        <MapContainer center={[46.519962, 6.633597]} zoom={13} scrollWheelZoom={true} style={{ height: "100vh", width: "100%" }}>
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
            <Circle center={[46.519962, 6.633597]} pathOptions={{ color: 'red' }} radius={2000}>
                <Popup>
                    <span>Popup in Circle</span>
                </Popup>
            </Circle>
            {rows}
        </MapContainer>
    )
}

export default Map