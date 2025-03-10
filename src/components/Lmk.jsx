import { useState } from "react";

export default function KMLViewer() {
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        parseKML(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseKML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));

    const elements = placemarks.map((placemark) => {
      const lineString = placemark.getElementsByTagName("LineString")[0];
      if (lineString) {
        return { type: "LineString", coordinates: parseCoordinates(lineString.textContent) };
      }
      const multiGeometry = placemark.getElementsByTagName("MultiGeometry")[0];
      if (multiGeometry) {
        const multiLineString = multiGeometry.getElementsByTagName("LineString")[0];
        return { type: "MultiLineString", coordinates: parseCoordinates(multiLineString.textContent) };
      }
      return null;
    }).filter(Boolean);

    setCoordinates(elements.map(el => ({ type: el.type, coords: el.coordinates })));
    generateSummary(elements);
    generateDetails(elements);
  };

  const parseCoordinates = (coordString) => {
    return coordString.trim().split(/\s+/).map(coord => {
      const parts = coord.split(",");
      if (parts.length >= 2) {
        const [lng, lat] = parts.map(Number);
        return { lat, lng };
      }
      return null;
    }).filter(Boolean);
  };

  const generateSummary = (elements) => {
    const count = elements.reduce((acc, el) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    }, {});
    setSummary(count);
  };

  const generateDetails = (elements) => {
    const details = elements.map((el) => ({ type: el.type, length: calculateLength(el.coordinates) }));
    setDetails(details);
  };

  const calculateLength = (coordinates) => {
    if (!coordinates || coordinates.length < 2) return 0;
    let totalLength = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const { lat: lat1, lng: lng1 } = coordinates[i - 1];
      const { lat: lat2, lng: lng2 } = coordinates[i];
      totalLength += Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2);
    }
    return totalLength.toFixed(2);
  };

  return (
    <div>
      <input type="file" accept=".kml" onChange={handleFileUpload} />
      <button onClick={() => console.log(summary)}>Summary</button>
      <button onClick={() => console.log(details)}>Detailed</button>
      {summary && (
        <table border="1">
          <thead>
            <tr>
              <th>Element Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary).map(([type, count]) => (
              <tr key={type}>
                <td>{type}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {details && (
        <table border="1">
          <thead>
            <tr>
              <th>Element Type</th>
              <th>Total Length</th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, index) => (
              <tr key={index}>
                <td>{detail.type}</td>
                <td>{detail.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {coordinates.length > 0 && (
        <div>
          <h3>Coordinates</h3>
          <ul>
            {coordinates.map((el, index) => (
              <li key={index}>
                <strong>{el.type}:</strong> {el.coords.map(coord => `(${coord.lat}, ${coord.lng})`).join(" -> ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
