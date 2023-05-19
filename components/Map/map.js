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

function getLayerGroup() {
    return L.layerGroup();
}

function Map(){
    return (
        <MapContainer center={[46.519962, 6.633597]} zoom={13} scrollWheelZoom={true} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[46.519962, 6.633597]} icon={getIcon()}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
            <Marker position={[45.519962, 6.6653597]} icon={getIcon()}>
            </Marker>
            <Marker position={[46.619962, 6.6653597]} icon={getIcon()}>
            </Marker>
            <Marker position={[45.569962, 6.4653597]} icon={getIcon()}>
            </Marker>
            <Marker position={[45.919962, 6.69653597]} icon={getIcon()}>
            </Marker>
            <Circle center={[46.519962, 6.633597]} pathOptions={{ color: 'red' }} radius={2000} />
        </MapContainer>
    )
}

export default Map