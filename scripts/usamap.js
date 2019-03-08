//Cache route, DirectionsRenderers array
var map, c, infowindow;
document.getElementById("dispatch-panel").style.display = "none";
function initMap() {
    var mapOptions = {
        mapTypeControl: false,
        center: {lat: 39.397, lng: -97.644},
        zoom: 4,
        styles: mapStyle
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var quoteForm = document.getElementById("quote-form"),
    dispatchPanel = document.getElementById("dispatch-panel"),
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer(),
    infowindow = new google.maps.InfoWindow();

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(quoteForm);
    map.controls[google.maps.ControlPosition.LEFT].push(dispatchPanel);
    directionsDisplay.setMap(map);

    var file = "scripts/couriers.xml";
    downloadUrl(file, function(data) {
        console.log(file);
        var xml = data.responseXML;
        console.log(xml);
        var markers = xml.documentElement.getElementsByTagName("marker");
        Array.prototype.forEach.call(markers, function(markerElem) {
            var id = markerElem.getAttribute('id');
            var name = markerElem.getAttribute('name');
            var place_id= markerElem.getAttribute("place_id");
            var point = new google.maps.LatLng(parseFloat(markerElem.getAttribute('lat')), parseFloat(markerElem.getAttribute('lng')));
            var city = markerElem.getAttribute("city")
            var state = markerElem.getAttribute("state");
            var grade = parseInt(markerElem.getAttribute("grade"));
            var usa = markerElem.getAttribute("usa");
            var iac = markerElem.getAttribute("iac");
            var hm = markerElem.getAttribute("hm");
            var tsa = markerElem.getAttribute("tsa");
            var nfo = markerElem.getAttribute("tsa");
            var vehicles = markerElem.getAttribute("vehicles")
            var phone = markerElem.getAttribute("phone");
            var fax = markerElem.getAttribute("fax");
            var account = markerElem.getAttribute("account");
            var email = markerElem.getAttribute("email");
            var phone2 = markerElem.getAttribute("phone2");
            var notes = markerElem.getAttribute("notes");
            var contact = markerElem.getAttribute("contact");
            var infowincontent = document.createElement("div");
            var strong = document.createElement("strong");
            strong.textContent = name;
            infowincontent.appendChild(strong);
            var text = document.createElement('text');
            text.textContent = phone;
            infowincontent.appendChild(text);
            var preferredIcon = "images/preferred.png", otherIcon = "images/other.png";
            var icon = (grade>3) ? {url: preferredIcon, label: name} : {url: otherIcon, label: name};
            var marker = new google.maps.Marker({
                map: map,
                position: point,
                // label: "test"
                });
            // marker.addListener('click', function() {
            //     infoWindow.setContent(infowincontent);
            //     infoWindow.open(map, marker);
            // });
        });
    });

    var onChangeHandler = function() {
        if (document.getElementById("d-input").value) {
            dispatchPanel.style.display = "block";
            var job = new Delivery();
            job.showRouteAndQuote(directionsService, directionsDisplay);
        }
    }
    // map.data.addListener("click", function(event) {
    //     var f = event.feature;
    //     var name = f.getProperty("Name"),
    //     description = f.getProperty("description");
    //     if (!description) description = "Please add details";
    //     infowindow.setContent(`<div><p>${name}</p><p>${description}</p></div>`);
    //     infowindow.setPosition(f.getGeometry().get());
    //     infowindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
    //     infowindow.open(map);
    //     document.getElementById("courier").innerHTML = name;
    //     c = f.getGeometry().get();
    //     onChangeHandler();
    // });
    quoteForm.addEventListener("change", onChangeHandler);
    dispatchPanel.addEventListener("change", onChangeHandler);
}
function Delivery() {
    function getRequest() {
        var o, r, w
        p = document.getElementById("p-input").value,
        d = document.getElementById("d-input").value,
        direct = document.getElementById("setjobtype-direct"),
        hold = document.getElementById("setjobtype-hold"),
        rt = document.getElementById("setjobtype-rt");
        o = c ? c : p;
        dest = (rt.checked) ? p : d;
        if (!c && rt.checked) {
            w = [{"location": d, "stopover": true}];
            return {origin: o, waypoints: w, destination: dest, travelMode: "DRIVING"};
        } else if (!c) {
            return {origin: o, destination: dest, travelMode: "DRIVING"};
        }
        w = direct.checked ? [p] : hold.checked ? [p, c] : [p, d];
        for (var i = 0; i < w.length; i++) w[i] = {"location": w[i], "stopover": true};
        return {origin: o, destination: dest, travelMode: "DRIVING", waypoints: w};
    }
    function getQuote(mi, permile){
        var base = parseInt(document.getElementById("rate").value),
        add = parseInt(document.getElementById("add").value);
        return (mi>15) ? (mi - 15) * permile + base + add : base + add;
    }
    var request = getRequest();
    this.showRouteAndQuote = function(directionsService, directionsDisplay) {
        directionsService.route(request, function(result, status) {
            if (status !== "OK") return;
            directionsDisplay.setDirections(result);
            var mi = 0;
            var legs = result.routes[0].legs;
            for (var i=0; i<legs.length; i++) {
                mi += parseInt(legs[i].distance.value * 0.0006213712);
            } 
            var quote = getQuote(mi, 2.25);
            var higherQuote = getQuote(mi, 3);
            document.getElementById("mileage").innerHTML = mi + " mi";
            document.getElementById("quote").innerHTML = "$" + quote;
            document.getElementById("higher-quote").innerHTML = "$" + higherQuote;
        });
    }
}
function downloadUrl(url, callback) {
    var request = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest;

    request.onreadstatechange = function() {
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
        }
    };
    request.open('GET', url, true);
    request.send(null);
}
function doNothing() {}
// window.eqfeed_callback = function(data) {
//     map.data.addGeoJson(data);
// }
var mapStyle = [
    {
        "featureType": "all",
        "elementType": "all",
        "stylers": [{"visibility": "on"}]
    }, {
        "featureType": "landscape",
        "elementType": "geometry",
        "styler:": [{"visibility": "on"}]
    }
];
