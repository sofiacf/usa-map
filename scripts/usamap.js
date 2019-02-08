//Add infowindow for route, display distance
//Save directions to server, display multiple routes using array of directionsRenderers

var map;
var infowindow;
document.getElementById('info-panel').style.display = 'none';
function initMap() {
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var mapOptions = {
		mapTypeControl: false,
		center: {lat: 39.397, lng: -97.644},
		zoom: 4.5,
		styles: mapStyle
	}
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
	infowindow = new google.maps.InfoWindow();
	var originInput = document.getElementById('origin-input');
	var destinationInput = document.getElementById('destination-input');
	var jobTypeSelector = document.getElementById('job-type-selector');
	var infoPanel = document.getElementById('info-panel');
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  	map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
  	map.controls[google.maps.ControlPosition.TOP_LEFT].push(jobTypeSelector);
  	map.controls[google.maps.ControlPosition.RIGHT].push(infoPanel);
	directionsDisplay.setMap(map);
	map.data.setStyle(styleFeature);
	map.data.addListener('click', function(event) {
		var f = event.feature;
		var name = f.getProperty('Name');
		var description = f.getProperty('description');
		if (!description) {
			description = "Please add details";
		}
		infowindow.setContent(`<div><p>${name}</p><p>${description}</p></div>`);
		infowindow.setPosition(f.getGeometry().get());
		infowindow.setOptions({
			pixelOffset: new google.maps.Size(0, -30)
		});
		infowindow.open(map);
	});
	var onChangeHandler = function() {
		calculateAndDisplayRoute(directionsService, directionsDisplay);
	}
	document.getElementById('origin-input').addEventListener('change', onChangeHandler);
	document.getElementById('destination-input').addEventListener('change', onChangeHandler);
}
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  	var pickup = document.getElementById('origin-input').value;
  	var delivery = document.getElementById('destination-input').value;
  	var request = {
  		origin: pickup,
  		destination: delivery,
  		travelMode: 'DRIVING'
  	};
  	directionsService.route(request, function(result, status) {
  		if (status == 'OK') {
  			document.getElementById('info-panel').style.display = "inline";
  			directionsDisplay.setDirections(result);
  			var distance = parseInt(result.routes[0].legs[0].distance.text);
  			document.getElementById('mileage').innerHTML = distance + " mi";
  			document.getElementById('quote').innerHTML = 45 + (distance * 2.25);
  			
  		}
  	})
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
