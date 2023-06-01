// Create map and attach id to element with id "mapid"
var map = L.map('mapid', {
    crs: L.CRS.EPSG4326,
  });
  
  // Add Swiss layer with default options
  L.tileLayer.swiss().addTo(map);
  
  // Center the map on Switzerland
  map.fitSwitzerland();
  
  // Add a marker with a popup in Bern
  L.marker(L.CRS.EPSG436.unproject(L.point(2600000, 1200000))).addTo(map)
    .bindPopup('Bern')
    .openPopup();