var map, courier = null, n, infowindow;

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

    //initialize google maps javascript api services
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    infowindow = new google.maps.InfoWindow();

    //setup control elements
    var quoteForm = document.getElementById("quote-form");
    var dispatchPanel = document.getElementById("dispatch-panel");
    dispatchPanel.style.display = "none";
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(quoteForm);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(dispatchPanel);
    
    //main event listener (runs when job information updates)
    var onChangeHandler = function () {
        if (!document.getElementById("d-input")["value"]) return;
        dispatchPanel.style.display = "block";
        var job = new Delivery();
        job.showRouteAndQuote(directionsService, directionsDisplay);
    }
    quoteForm.addEventListener("change", onChangeHandler);
    dispatchPanel.addEventListener("change", onChangeHandler);

    //load couriers from database and add as map to markers
    var url = "https://smcf.nfshost.com/map/scripts/getcouriers.php";
    downloadUrl(url, function (data) {
        var preferredIcon = "images/preferred.png";
        var otherIcon = "images/other.png";
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
}
function getChecked(field) {
    return document.getElementById(field)["checked"];
}

class Delivery {
    pick = document.getElementById("p-input")["value"];
    drop = document.getElementById("d-input")["value"];
    rate = document.getElementById("rate")["value"];
    charges = document.getElementById("add")["value"];
    getRequest = () => {
        var stops = [this.pick], end, jobType;
        var rt = getChecked('setjob-rt');
        if (rt) stops.push(this.drop);
        else if (getChecked('setjob-hold') && courier) stops.push(courier);
        var request = {
            origin: courier || stops.shift(),
            destination: rt ? this.pick : this.drop,
            travelMode: "DRIVING"
        }
        if (stops.length) {
            request["waypoints"] = stops.map(stop => (
                {"location": stop, "stopover": true}));
        }
        return request;
    }
    getQuote = (mi, permile) => {
        var base = parseInt(this.rate);
        var add = parseInt(this.charges);
        var mileage = mi > 15 ? (mi - 15) * permile : 0;
        return add + base + mileage;
    }
    showRouteAndQuote = (directionsService, directionsDisplay) => {
        var request = this.getRequest();
        var getQuote = this.getQuote;
        directionsService.route(request, function (result, status) {
            if (status !== "OK") return;
            directionsDisplay.setDirections(result);
            var mi = 0;
            var legs = result.routes[0].legs;
            for (var i = 0; i < legs.length; i++) {
                mi += Math.floor(legs[i].distance.value * 0.0006213712);
            }
            var quote = getQuote(mi, 2.25);
            var higherQuote = getQuote(mi, 3);
            document.getElementById("mileage").innerHTML = mi + " mi";
            document.getElementById("quote").innerHTML = "$" + quote;
            document.getElementById("$3-quote").innerHTML = "$" + higherQuote;
        });
    }
}

function downloadUrl(url, callback) {
    var request = window["ActiveXObject"] ? new ActiveXObject("Microsoft.XMLHTTP")
    : new XMLHttpRequest;
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            request.onreadystatechange = {};
            callback(request, request.status);
        }
    };
    request.open("GET", url, true);
    request.send(null);
}
