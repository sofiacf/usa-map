var map, courier = null, n, infowindow, service;

document.getElementById("dispatch-panel").style.display = "none";

function initMap() {
    var mapOptions = {
        mapTypeControl: false,
        center: {
            lat: 39.397,
            lng: -97.644
        },
        zoom: 4
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    service = new google.maps.places.PlacesService(map);
    infowindow = new google.maps.InfoWindow();

    var quoteForm = document.getElementById("quote-form");
    var dispatchPanel = document.getElementById("dispatch-panel");
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(quoteForm, dispatchPanel);
    
    var onChangeHandler = function () {
        if (!document.getElementById("d-input")["value"]) return;
        dispatchPanel.style.display = "block";
        var job = new Delivery();
        job.showRouteAndQuote(directionsService, directionsDisplay);
    }

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
                    icon: {
                        url: (grade > 3) ? preferredIcon : otherIcon
                    }
                });
                marker.addListener("click", function () {
                    infowindow.setContent(`<div>${name}<br>${phone}<br></div>`);
                    infowindow.setOptions({
                        pixelOffset: new google.maps.Size(0, -30)
                    });
                    infowindow.open(map, marker);
                    document.getElementById("courier").innerHTML = name;
                    document.getElementById("ph").innerHTML = phone;
                    courier = point;
                    n = name;
                    onChangeHandler();
                });
            }
            var lat = parseFloat(e.getAttribute("lat"));
            var lng = parseFloat(e.getAttribute("lng"));
            if (lat < 1 || lng > -1) return;
            var point = new google.maps.LatLng(lat, lng);
            var grade = parseInt(e.getAttribute("grade"));

            var name = e.getAttribute("name");
            var account = e.getAttribute("account"),
                city = e.getAttribute("city"),
                state = e.getAttribute("state"),
                phone = e.getAttribute("phone"),
                phone2 = e.getAttribute("phone2"),
                fax = e.getAttribute("fax"),
                email = e.getAttribute("email"),
                contact = e.getAttribute("contact"),
                notes = e.getAttribute("notes"),
                vehicles = e.getAttribute("vehicles"),
                usa = e.getAttribute("usa"),
                iac = e.getAttribute("iac"),
                hm = e.getAttribute("hm"),
                tsa = e.getAttribute("tsa"),
                nfo = e.getAttribute("nfo"),
                marker;
            addMarker();
        });
    });
    quoteForm.addEventListener("change", onChangeHandler);
    dispatchPanel.addEventListener("change", onChangeHandler);
}

function Delivery() {
    function getJobType(types){
        for (let type in types){
            if (document.getElementById(types[type])["checked"]) return type;
        }
    }
    function getPickup(){
        return document.getElementById("p-input")["value"];
    }
    function getDrop(){
        return document.getElementById("d-input")["value"];
    }
    function getRequest(pick, drop) {
        var jobTypes = {
            DIRECT: 'setjob-direct',
            HOLD: 'setjob-hold',
            ROUNDTRIP: 'setjob-rt'
        }
        var jobType = getJobType(jobTypes);
        var stops = [pick];
        var end = drop;
        switch (jobType) {
            case jobTypes.ROUNDTRIP:
                if (courier) stops.push(drop);
                else stops = [drop];
                end = pick;
                break;
            case jobTypes.HOLD:
                if (courier) stops.push(courier);
                break;
        }
        var request = {
            origin: courier || stops.shift(),
            destination: end,
            travelMode: "DRIVING"
        }
        if (stops.length) {
            request["waypoints"] = stops.map(stop => (
                {"location": stop, "stopover": true}));
        }
        return request;
    }

    function getQuote(mi, permile) {
        var rate = <HTMLInputElement>document.getElementById("rate");
        var charges = <HTMLInputElement>document.getElementById("add");
        var base = parseInt(rate.value);
        var add = parseInt(charges.value);
        return (mi > 15) ? (mi - 15) * permile + base + add : base + add;
    }
    var request = getRequest(getPickup(), getDrop());
    this.showRouteAndQuote = function (directionsService, directionsDisplay) {
        directionsService.route(request, function (result, status) {
            if (status !== "OK") return;
            directionsDisplay.setDirections(result);
            var mi = 0,
                legs = result.routes[0].legs;
            for (var i = 0; i < legs.length; i++) mi += Math.floor(legs[i].distance.value * 0.0006213712);
            var quote = getQuote(mi, 2.25),
                higherQuote = getQuote(mi, 3);
            document.getElementById("mileage").innerHTML = mi + " mi";
            document.getElementById("quote").innerHTML = "$" + quote;
            document.getElementById("$3-quote").innerHTML = "$" + higherQuote;
        });
    }
}

function downloadUrl(url, callback) {
    var request = window["ActiveXObject"] ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest;
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