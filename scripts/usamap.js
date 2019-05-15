var map, c, n, infowindow, service;

document.getElementById("dispatch-panel").style.display = "none";

function initMap() {
    var mapOptions = {
        mapTypeControl: false,
        center: {lat: 39.397, lng: -97.644},
        zoom: 4
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var quoteForm = document.getElementById("quote-form");
    var dispatchPanel = document.getElementById("dispatch-panel");
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    infowindow = new google.maps.InfoWindow();

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(quoteForm);
    map.controls[google.maps.ControlPosition.LEFT].push(dispatchPanel);
    directionsDisplay.setMap(map);

    service = new google.maps.places.PlacesService(map);
    var preferredIcon = "images/preferred.png";
    var otherIcon = "images/other.png";
    downloadUrl("https://smcf.nfshost.com/map/scripts/getcouriers.php", function (data) {
        var xml = data.responseXML;
        var markers = xml.documentElement.getElementsByTagName("marker");
        Array.prototype.forEach.call(markers, function (e) {
            var addMarker = function () {
                marker = new google.maps.Marker({
                    map: map,
                    position: point,
                    icon: ico,
                    // label: name
                });
                marker.addListener("click", function () {
                    infowindow.setContent(`<div><p>${name}</p><p>${phone}</p></div>`);
                    infowindow.setOptions({
                        pixelOffset: new google.maps.Size(0, -30)
                    });
                    infowindow.open(map, marker);
                    document.getElementById("courier").innerHTML = name;
                    document.getElementById("ph").innerHTML = phone;
                    c = point;
                    n = name;
                    onChangeHandler();
                });
            }
            var id = e.getAttribute("id"),
                name = e.getAttribute("name"),
                account = e.getAttribute("account"),
                city = e.getAttribute("city"),
                state = e.getAttribute("state"),
                phone = e.getAttribute("phone"),
                phone2 = e.getAttribute("phone2"),
                fax = e.getAttribute("fax"),
                email = e.getAttribute("email"),
                contact = e.getAttribute("contact"),
                notes = e.getAttribute("notes"),
                grade = parseInt(e.getAttribute("grade")),
                vehicles = e.getAttribute("vehicles"),
                usa = e.getAttribute("usa"),
                iac = e.getAttribute("iac"),
                hm = e.getAttribute("hm"),
                tsa = e.getAttribute("tsa"),
                nfo = e.getAttribute("nfo"),
                marker,
                ico = {
                    url: (grade > 3) ? preferredIcon : otherIcon
                },
                place_id = e.getAttribute("place_id"),
                point = new google.maps.LatLng(parseFloat(e.getAttribute("lat")), parseFloat(e.getAttribute("lng")));
            if (point.lat() > 1 && point.lng() < -1) addMarker();
        });
    });
    var onChangeHandler = function () {
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
        var o, r, w, dest,
            p = document.getElementById("p-input").value,
            d = document.getElementById("d-input").value,
            direct = document.getElementById("setjobtype-direct"),
            hold = document.getElementById("setjobtype-hold"),
            rt = document.getElementById("setjobtype-rt").checked;
        o = c ? c : p;
        dest = (rt) ? p : d;
        if (!c && rt) {
            w = [{
                "location": d,
                "stopover": true
            }];
            return {
                origin: o,
                waypoints: w,
                destination: dest,
                travelMode: "DRIVING"
            };
        } else if (!c) {
            return {
                origin: o,
                destination: dest,
                travelMode: "DRIVING"
            };
        }
        w = direct.checked ? [p] : hold.checked ? [p, c] : [p, d];
        for (var i = 0; i < w.length; i++) w[i] = {
            "location": w[i],
            "stopover": true
        };
        return {
            origin: o,
            destination: dest,
            travelMode: "DRIVING",
            waypoints: w
        };
    }

    function getQuote(mi, permile) {
        var base = parseInt(document.getElementById("rate").value),
            add = parseInt(document.getElementById("add").value);
        return (mi > 15) ? (mi - 15) * permile + base + add : base + add;
    }
    var request = getRequest();
    this.showRouteAndQuote = function (directionsService, directionsDisplay) {
        directionsService.route(request, function (result, status) {
            if (status !== "OK") return;
            directionsDisplay.setDirections(result);
            var mi = 0,
                legs = result.routes[0].legs;
            for (var i = 0; i < legs.length; i++) mi += parseInt(legs[i].distance.value * 0.0006213712);
            var quote = getQuote(mi, 2.25),
                higherQuote = getQuote(mi, 3);
            document.getElementById("mileage").innerHTML = mi + " mi";
            document.getElementById("quote").innerHTML = "$" + quote;
            document.getElementById("higher-quote").innerHTML = "$" + higherQuote;
        });
    }
}

function downloadUrl(url, callback) {
    var request = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest;
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
        }
    };
    request.open("GET", url, true);
    request.send(null);
}

function doNothing() {}