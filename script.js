let map = L.map('map').setView([20,78],5);

let markers = [];

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);

function searchCity(){

let city=document.getElementById("city").value;

fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`)
.then(res=>res.json())
.then(data=>{

let lat=data[0].lat;
let lon=data[0].lon;

map.setView([lat,lon],14);

findCafes(lat,lon);

});

}

function getLocation(){

navigator.geolocation.getCurrentPosition(function(position){

let lat=position.coords.latitude;
let lon=position.coords.longitude;

map.setView([lat,lon],14);

findCafes(lat,lon);

});

}

function findCafes(lat,lon){

document.getElementById("cafeList").innerHTML="";

markers.forEach(m=>map.removeLayer(m));
markers=[];

let query=`
[out:json];
node["amenity"="cafe"](around:2000,${lat},${lon});
out;
`;

fetch("https://overpass-api.de/api/interpreter",{
method:"POST",
body:query
})
.then(res=>res.json())
.then(data=>{

data.elements.forEach((place,index)=>{

let name=place.tags.name || "Cafe";

let rating=(Math.random()*2+3).toFixed(1); 

let distance=calculateDistance(lat,lon,place.lat,place.lon);

let marker=L.marker([place.lat,place.lon]).addTo(map);

marker.bindPopup(`<b>${name}</b><br>⭐ ${rating}`);

markers.push(marker);

let li=document.createElement("li");

li.innerHTML=`<b>${name}</b><br>⭐ ${rating} | ${distance} km`;

li.onclick=()=>{

map.setView([place.lat,place.lon],16);
marker.openPopup();

};

document.getElementById("cafeList").appendChild(li);

});

});

}

function calculateDistance(lat1,lon1,lat2,lon2){

let R=6371;

let dLat=(lat2-lat1)*Math.PI/180;
let dLon=(lon2-lon1)*Math.PI/180;

let a=Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
Math.sin(dLon/2)*Math.sin(dLon/2);

let c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return (R*c).toFixed(2);

}