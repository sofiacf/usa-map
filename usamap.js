var map;
var infowindow;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		mapTypeControl: false,
		center: {lat: 39.397, lng: -97.644},
		zoom: 4.5,
		styles: mapStyle
	});

	infowindow = new google.maps.InfoWindow();

	var request = {
		query: '02111',
		fields: ['postal_code', 'geometry'],
	}
	var service = new google.maps.places.PlacesService(map);
	service.findPlaceFromQuery(request, function(results, status) {
	    if (status === google.maps.places.PlacesServiceStatus.OK) {
	      for (var i = 0; i < results.length; i++) {
	        createMarker(results[i]);
	      }
	      map.setCenter(results[0].geometry.location);
	    }
	  });
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
	var origin = new google.maps.LatLng(42.3477835,-71.1937272);
	var destination = new google.maps.LatLng(42.3438975,-71.1958222);

	// var service = new google.maps.DistanceMatrixService();
	// service.getDistanceMatrix(
	// {
	// 	origin: 
	// }
	// 	);

	map.data.setStyle(styleFeature);

	var script = document.createElement('script');
	script.src = 'https://smcf.io/couriers.js';
	document.getElementsByTagName('head')[0].appendChild(script);
}
///42.3477835,-71.1937272 Work? 42.3438975,-71.1958222 Home?

window.eqfeed_callback = function(data) {
	map.data.addGeoJson(data);
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

var mapStyle = [{
	'featureType': 'all',
	'elementType': 'all',
	'stylers': [{'visibility': 'on'}]}, 
	{
	'featureType': 'landscape',
	'elementType': 'geometry',
	'styler:': [{'visibility': 'on'}]}];