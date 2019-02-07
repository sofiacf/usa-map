var map;
var infowindow;

function initMap() {
	var markersArray = [];
	map = new google.maps.Map(document.getElementById('map'), {
		mapTypeControl: false,
		center: {lat: 39.397, lng: -97.644},
		zoom: 4.5,
		styles: mapStyle
	});
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;
	var distanceMatrixService = new google.maps.DistanceMatrixService();
	
	var originInput = document.getElementById('origin-input');
	var destinationInput = document.getElementById('destination-input');
	var jobTypeSelector = document.getElementById('job-type-selector');	
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  	map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
  	map.controls[google.maps.ControlPosition.TOP_LEFT].push(jobTypeSelector);

	directionsDisplay.setMap(map);
	infowindow = new google.maps.InfoWindow();
	var origin = originInput.innerHTML;
	var destination = destinationInput.innerHTML;
	var destinationIcon = 'https://chart.googleapis.com/chart?' +
            'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=O|FFFF00|000000';
  	function getMatrix(){
  		distanceMatrixService.getDistanceMatrix({
		origins: [origin],
		destinations: [destination],
		travelMode: 'DRIVING'
	}, function(response, status) {
		if (status !== 'OK') {
			alert('Error was: ' + status);
		} else {
			var originList = response.originAddresses;
			var destinationList = response.destinationAddresses;
			var outputDiv = document.getElementById('output');
			outputDiv.innerHTML = '';
			var geocoder = new google.maps.Geocoder;
			var showGeocodedAddressOnMap = function(asDestination) {
				var icon = asDestination ? destinationIcon : originIcon;
				return function(results, status) {
					if (status === 'OK') {
						alert(results[0]);
						markersArray.push(new google.maps.Marker({
							map: map,
							position: results[0].geometry.location,
							icon: icon
						}));
					} else {
						alert('Geocode failed due to ' + status);
					}
				};
			};
			for (var i = 0; i < originList.length; i++) {
				var results = response.rows[i].elements;
				geocoder.geocode({'address': originList[i]},
					showGeocodedAddressOnMap(false));
				for (var j = 0; j < results.length; j++) {
					geocoder.geocode({'address': destinationList[j]},
                    showGeocodedAddressOnMap(true));
                outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
                    ': ' + results[j].distance.text + ' in ' +
                    results[j].duration.text + '<br>';
				}
			}
		}
	});
	}
	map.data.setStyle(styleFeature);
}
function createMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	});
}
function styleFeature(feature) {
	var courierList = feature.getProperty('type');
	var name = feature.getProperty('Name');
	if (courierList == "preferred"){
		var icon = 'https://www.gstatic.com/mapspro/images/stock/995-biz-car-dealer.png';
	} else if (courierList == "other"){
		var icon = 'https://www.gstatic.com/mapspro/images/stock/1457-trans-taxi.png';
	};
	return {
		icon: {
			url: icon,
		},
			label: name
	};
}
var script = document.createElement('script');
script.src = 'https://smcf.io/couriers.js';
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