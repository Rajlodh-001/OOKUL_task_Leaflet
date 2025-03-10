import { useEffect, useRef } from "react";
import L from "leaflet";

export default function BasicMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      //  set view will set to max and minimum from the fileprocessor and some math operation will resealt in zoomlevel
      // ex 
      // mapRef.current = L.map("map").setView([maxLat, maxLog], ZoomLVL);
      mapRef.current = L.map("map").setView([51.505, -74.006], 8);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);

      // coords array form file Processor 
      const coordinatesArray = [
        [51.505, -0.09],
        [48.8566, 2.3522],
        [40.7128, -74.006],
      ]; 
//  marker will be added
      coordinatesArray.forEach(([lat, lng]) => {
        L.marker([lat, lng])
          .addTo(mapRef.current)
          .bindPopup(`Lat: ${lat}, Lng: ${lng}`)
          .openPopup();
      });
    }
  }, []);

  return <div id="map" style={{ height: "500px", width: "100%" }}></div>;
}
