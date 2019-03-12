//Cache route, DirectionsRenderers array
var map, c, n, infowindow, service, phRequest;

document.getElementById("dispatch-panel").style.display = "none";
function initMap() {
    var mapOptions = {
        mapTypeControl: false,
        center: {lat: 39.397, lng: -97.644},
        zoom: 4
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

    service = new google.maps.places.PlacesService(map);
    
    var preferredIcon = "images/preferred.png", otherIcon = "images/other.png";
    downloadUrl("scripts/couriers.xml", function(data) {
        var xml = data.responseXML;
        var i = 0, j = 0;
        var markers = xml.documentElement.getElementsByTagName("marker");
        Array.prototype.forEach.call(markers, function(e) { 
            var getPlaceId = function(){
                j++;
                while (!place_id) {
                    var phRequest = {phoneNumber: ph, fields: ["place_id", "name"]};
                    service.findPlaceFromPhoneNumber(phRequest, function(results, status) {
                        if (status !== google.maps.places.PlacesServiceStatus.OK) {
                                setTimeout(function() {
                                getPlaceId();
                            }, 200);
                        }
                        if (!results) return;
                        j++;
                        console.log("Found from phone #: ", id, results[0].name, results[0].place_id);
                        place_id = results[0].place_id;
                    });
                    var qRequest = {query: (name + " " + city + " " + st), fields: ["place_id", "name"]}
                    service.findPlaceFromQuery(qRequest, function(results, status) {
                        if (status !== google.maps.places.PlacesServiceStatus.OK) {
                                setTimeout(function() {
                                    getPlaceId();
                            }, 200);
                        }
                        if (!results) return "";
                        console.log("Found from query:", id, results[0].name, results[0].place_id);
                        j++;
                        place_id = results[0].place_id;
                    });
                    break;
                }
                
            }
            var getPlaceDetails = function(request) {
                if (lat > 0) return;
                service.getDetails(request, function(place, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        setTimeout(function() {
                            getPlaceDetails(request);
                        }, 200);
                    }
                    if (!place) return;
                    console.log(id + " Place lookup returned: " + place.geometry.location + " original was: " + point);
                    point = place.geometry.location;
                    i++;
                });
            }
            var id = e.getAttribute("id"), name = e.getAttribute("name"), acc = e.getAttribute("account"),
            city = e.getAttribute("city"), st = e.getAttribute("state"),
            ph = e.getAttribute("phone"),  ph2 = e.getAttribute("phone2"), f = e.getAttribute("fax"),
            email = e.getAttribute("email"), con = e.getAttribute("contact"), x = e.getAttribute("notes"),
            gr = parseInt(e.getAttribute("grade")), v = e.getAttribute("vehicles"), usa = e.getAttribute("usa"),
            iac = e.getAttribute("iac"), hm = e.getAttribute("hm"),
            tsa = e.getAttribute("tsa"), nfo = e.getAttribute("nfo"),
            ico = {url: (gr>3) ? preferredIcon : otherIcon}, place_id;
            var point = new google.maps.LatLng(parseFloat(e.getAttribute("lat")), parseFloat(e.getAttribute("lng"))),
            lat = parseFloat(e.getAttribute("lat"));
            if (e.getAttribute("place_id") == "") getPlaceId();
            else place_id = e.getAttribute("place_id");
            if (place_id) getPlaceDetails({placeId: place_id, fields: ["name", "geometry.location"]});
            else ico = {url: "images/box_full.png"};
            var marker = new google.maps.Marker({
                map: map,
                position: point,
                icon: ico,
                label: name
            });
            marker.addListener("click", function() {
                infowindow.setContent(`<div><p>${name}</p><p>${ph}</p></div>`);
                infowindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
                infowindow.open(map, marker);
                document.getElementById("courier").innerHTML = name;
                document.getElementById("ph").innerHTML = ph;
                c = point;
                n = name;
                onChangeHandler();
            });
        });
    });
    var onChangeHandler = function() {
        if (!document.getElementById("d-input").value) return;
        dispatchPanel.style.display = "block";
        var job = new Delivery();
        job.showRouteAndQuote(directionsService, directionsDisplay);
    }
    quoteForm.addEventListener("change", onChangeHandler);
    dispatchPanel.addEventListener("change", onChangeHandler);
}
function Delivery() {
    function getRequest() {
        var o, r, w,
        p = document.getElementById("p-input").value,
        d = document.getElementById("d-input").value,
        direct = document.getElementById("setjobtype-direct").checked,
        hold = document.getElementById("setjobtype-hold").checked,
        rt = document.getElementById("setjobtype-rt").checked;
        o = c ? c : p;
        dest = (rt) ? p : d;
        if (!c && rt) {
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
            var mi = 0, legs = result.routes[0].legs;
            for (var i=0; i<legs.length; i++) mi += parseInt(legs[i].distance.value * 0.0006213712);
            var quote = getQuote(mi, 2.25), higherQuote = getQuote(mi, 3);
            document.getElementById("mileage").innerHTML = mi + " mi";
            document.getElementById("quote").innerHTML = "$" + quote;
            document.getElementById("higher-quote").innerHTML = "$" + higherQuote;
        });
    }
}
function downloadUrl(url, callback) {
    var request = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest;
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
        }
    };
    request.open('GET', url, true);
    request.send(null);
}
function doNothing() {}
