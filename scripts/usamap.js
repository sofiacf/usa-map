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
	var placeService = new google.maps.places.PlacesService(map);
	var distanceMatrixService = new google.maps.DistanceMatrixService();
	directionsDisplay.setMap(map);
	var originInput = document.getElementById('origin-input');
	var destinationInput = document.getElementById('destination-input');
	var jobTypeSelector = document.getElementById('job-type-selector');
	var zipTest = '02111, USA';
	infowindow = new google.maps.InfoWindow();

	var request = {
		query: '02111',
		fields: ['name', 'geometry'],
	}
	
	placeService.findPlaceFromQuery(request, function(results, status) {
	    if (status === google.maps.places.PlacesServiceStatus.OK) {
	      for (var i = 0; i < results.length; i++) {
	        createMarker(results[i]);
	      }
	      map.setCenter(results[0].geometry.location);
	    }
	  });
	var origin = new google.maps.LatLng(42.3477835,-71.1937272);
	var destination = new google.maps.LatLng(42.3438975,-71.1958222);
	var destinationIcon = 'https://chart.googleapis.com/chart?' +
            'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=O|FFFF00|000000';	

	distanceMatrixService.getDistanceMatrix({
		origins: ['02111'],
		destinations: ['02459'],
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