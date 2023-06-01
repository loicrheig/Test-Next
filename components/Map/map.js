"use client";
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup } from "react-leaflet"

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';

function getIcon() {
    return L.icon({
        iconUrl: icon.src,
        iconSize: [25, 40],
    });
}

function setSwitzerlandMap() {
    var swissLayer = L.tileLayer.swiss(/* options */);
    return swissLayer;
}

function getLayerGroup() {
    return L.layerGroup();
}

function Map({offers}){
    const rows = [];
    for (let i = 0; i < offers.length; i++) {
        // note: we are adding a key prop here to allow react to uniquely identify each
        // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
        let offer = offers[i];
        let lat = offer.f1_;
        let lng = offer.f0_;
        rows.push(
            <Marker position={[lat, lng]} icon={getIcon()}>
                <Popup>
                    {offer.Title}
                </Popup>
            </Marker>
        );
    }
    return (
        <MapContainer center={[46.519962, 6.633597]} zoom={13} scrollWheelZoom={true} style={{ height: "100vh", width: "100%" }}>
            <LayerGroup
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle center={[46.519962, 6.633597]} pathOptions={{ color: 'red' }} radius={2000} />
            {rows}
        </MapContainer>
    )
}

export default Map