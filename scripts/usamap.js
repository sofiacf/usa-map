//Fix quote (distance-15, $3/mi states)
//Add courier to route
//Save directions to server, display multiple routes using array of directionsRenderers
var map;
var infowindow;
var needsCourier;
var courierPlaceId;
document.getElementById('info-panel').style.display = 'none';
function initMap() {
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var geocoder = new google.maps.Geocoder(); 
	var mapOptions = {
		mapTypeControl: false,
		center: {lat: 39.397, lng: -97.644},
		zoom: 4,
		styles: mapStyle
	}
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
	infowindow = new google.maps.InfoWindow();
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('control-panel'));
	var infoPanel = document.getElementById('info-panel');
  	map.controls[google.maps.ControlPosition.LEFT].push(infoPanel);
	directionsDisplay.setMap(map);
	map.data.setStyle(styleFeature);
	map.data.addListener('click', function(event) {
		var f = event.feature;
		var name = f.getProperty('Name');
		var description = f.getProperty('description');
		if (!description) {description = "Please add details";}
		infowindow.setContent(`<div><p>${name}</p><p>${description}</p></div>`);
		infowindow.setPosition(f.getGeometry().get());
		infowindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
		infowindow.open(map);
		if (needsCourier){
			geocoder.geocode({'location': f.getGeometry().get()}, function(results, status){
				if (status === 'OK') {
					needsCourier = false;
					document.getElementById('courier').innerHTML = name;
					courierPlaceId = results[0].place_id;
				}
			})
			
		}
	});
	var onChangeHandler = function() {
		var testJob = new Delivery();
		if (needsCourier) {
			testJob.calculateAndDisplayRoute(directionsService, directionsDisplay);
			document.getElementById('info-panel').style.display = "inline";
		}
		if (!needsCourier) {
			testJob.calculateAndDisplayRoute(directionsService, directionsDisplay);			
		}
	}
	document.getElementById('origin-input').addEventListener('change', onChangeHandler);
	document.getElementById('destination-input').addEventListener('change', onChangeHandler);
}
function Delivery(){
	needsCourier = true;
	var pickup = document.getElementById('origin-input').value;
	var delivery = document.getElementById('destination-input').value;
	var courier = courierPlaceId;
	var request = {
		origin: pickup,
		destination: delivery,
		optimizeWaypoints: false,
		travelMode: 'DRIVING'
	};
	var baseEnum = Object.freeze({
			BASE : 45,
			AFTER : 65,
			WEEKEND : 90,
			D : 95,
			DAFTER : 120,
			DHOLD : 180
		});
	var distance;
	function getQuote(distance){
		if (distance>15) {
			quote = (distance-15) * 2.25 + 45;
		}
		else {
			quote = 45;
		}
		return quote;
	}
	var hello;
	this.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {
		directionsService.route(request,
		function(result, status) {
			if (status == 'OK') {
				directionsDisplay.setDirections(result);
				hello = result;
				distance = parseInt(result.routes[0].legs[0].distance.text);
				quote = getQuote(distance);
				console.log(hello.geocoded_waypoints[0].place_id);
				document.getElementById('mileage').innerHTML = distance + " mi";
				document.getElementById('quote').innerHTML = "$" + quote;				
			};
		});
	}
}
function styleFeature(feature) {
	var type = feature.getProperty('type');
	var name = feature.getProperty('Name');
	if (type == "preferred"){
		var icon = 'https://www.gstatic.com/mapspro/images/stock/995-biz-car-dealer.png';
	} else if (type == "other"){
		var icon = 'https://www.gstatic.com/mapspro/images/stock/1457-trans-taxi.png';
	};
	return {
		icon: {
			url: icon
		}
	};
}
var script = document.createElement('script');
script.src = 'https://smcf.io/scripts/couriers.js';
document.getElementsByTagName('head')[0].appendChild(script);
window.eqfeed_callback = function(data) {
	map.data.addGeoJson(data);
}
var mapStyle = [{
	'featureType': 'all',
	'elementType': 'all',
	'stylers': [{'visibility': 'on'}]}, 
	{
	'featureType': 'landscape',
	'elementType': 'geometry',
	'styler:': [{'visibility': 'on'}]}];
