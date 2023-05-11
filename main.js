/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup().addTo(map),
    temperature: L.featureGroup(),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`,
        maxZoom: 12,
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations,
    "Temperatur": themaLayer.temperature.addTo(map)
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function writeStationLayer(jsondata) {
    // Vienna Sightseeing Haltestellen ?? Wetterstationen

    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/icons.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            let pointInTime = new Date(prop.date);
            console.log(pointInTime)
            let mas = feature.geometry.coordinates[2]
            console.log(mas)
            layer.bindPopup(`
            <h1>${prop.name}, ${mas} m ü. NN. </h1>
            <ul>
                <li>Lufttemperatur (in °C): ${prop.LT || "Keine Messungen vorhanden"} </li>
                <li>relative Luftfeuchte (in %): ${prop.RH || "Keine Messungen vorhanden"} </li>
                <li>Windgeschwindigkeit (in km/h): ${(prop.WG * 3.6).toFixed(1) || "Keine Messungen vorhanden"}</li>
                <li>Schneehöhe (in cm): ${prop.HS || "Keine Messungen vorhanden"}</li>
            </ul>
            <span>${pointInTime.toLocaleString()} </span>
        `);
        }
    }).addTo(themaLayer.stations);
    //console.log(response, jsondata)
}

function writeTemperatureLayer(jsondata) {
    L.geoJSON(jsondata, {
        filter: function(feature){
            if (feature.properties.LT > -50 && feature.properties.LT <50) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.divIcon({
                    className:"aws-div-icon",
                    html: `<span>${feature.properties.LT}</span>`
                }),
                

            })
        }
    }).addTo(themaLayer.temperature)
}

//Wetterstationen
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json()
    writeStationLayer(jsondata);
    writeTemperatureLayer(jsondata);

    
}


// Wetterstationen mit Icons und Popups implementieren


loadStations("https://static.avalanche.report/weather_stations/stations.geojson");
