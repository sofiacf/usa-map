//Fix quote (distance-15, $3/mi states)
//Add courier to route
//Save directions to server, display multiple routes using array of directionsRenderers
var map;
var infowindow;
var courier = false;
document.getElementById('dispatch-panel').style.display = 'none';
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
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('quote-form'));
  	map.controls[google.maps.ControlPosition.LEFT].push(document.getElementById('dispatch-panel'));
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
		geocoder.geocode({'location': f.getGeometry().get()}, function(results, status){
			if (status === 'OK') {
				document.getElementById('courier').innerHTML = name;
				courier = results[0].place_id;
			}
		});
	});
	var onChangeHandler = function() {
		var d = document.getElementById('destination-input').value;
		if (d) {
			document.getElementById('dispatch-panel').style.display = 'block';
			var testJob = new Delivery();
			testJob.calculateAndDisplayRoute(directionsService, directionsDisplay);
		}
	}
	document.getElementById('origin-input').addEventListener('change', onChangeHandler);
	document.getElementById('destination-input').addEventListener('change', onChangeHandler);
	document.getElementById('rate').addEventListener('change', onChangeHandler);
	document.getElementById('add').addEventListener('change', onChangeHandler);
}
function Delivery(){
	var pickup = document.getElementById('origin-input').value;
	var delivery = document.getElementById('destination-input').value;
	var request;
	var waypoint = Object({location: courier, stopover: true});
	if (!courier) {
		request = {origin: pickup, destination: delivery, optimizeWaypoints: false,	travelMode: 'DRIVING'}
	} else {
		request = {
			origin: pickup,
			destination: delivery,
			waypoints: [waypoint],
			optimizeWaypoints: false,
			travelMode: 'DRIVING'
		}
	}
	var base = parseInt(document.getElementById('rate').value);
	var add = parseInt(document.getElementById('add').value);
	function getQuote(distance){
		if (distance>15) {
			quote = (distance-15) * 2.25 + base + add;
		}
		else {
			quote = base + add;
		}
		return quote;
	}
	this.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {
		directionsService.route(request,
		function(result, status) {
			if (status == 'OK') {
				directionsDisplay.setDirections(result);
				var distance = 0;
				for (i=0; i<result.routes[0].legs.length; i++){
					distance += parseInt(result.routes[0].legs[i].distance.text);
				}
				quote = getQuote(distance);
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
	'styler:': [{'visibility': 'on'}]
}];
