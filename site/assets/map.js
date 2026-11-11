(function () {
  var dataNode = document.getElementById("office-data");
  var mapNode = document.getElementById("map");
  if (!dataNode || !mapNode || typeof L === "undefined") return;

  var offices = JSON.parse(dataNode.textContent);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var map = L.map(mapNode, { scrollWheelZoom: true, worldCopyJump: true, minZoom: 2 });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var arcs = L.layerGroup().addTo(map);
  var markers = {};

  function pin(office, active) {
    return L.divIcon({
      className: "pin-wrap",
      html: '<span class="pin' + (office.hq ? " hq" : "") + (active ? " is-active" : "") + '"></span>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  }

  offices.forEach(function (office) {
    var marker = L.marker([office.lat, office.lng], { icon: pin(office, false), keyboard: true, title: office.name });
    marker.on("click", function () { select(office.id, false); });
    marker.addTo(map);
    markers[office.id] = marker;
  });

  function visible(area) {
    if (area === "all") return offices;
    if (area === "asia") return offices.filter(function (office) { return office.area === "asia"; });
    return offices.filter(function (office) { return office.region === area; });
  }

  function draw(list) {
    arcs.clearLayers();
    if (list.length < 2) return;
    var hub = list.find(function (office) { return office.hq; }) || list[0];
    list.forEach(function (office) {
      if (office.id === hub.id) return;
      L.polyline([[hub.lat, hub.lng], [office.lat, office.lng]], {
        color: "#0b8caf",
        weight: 2,
        opacity: 0.8,
        interactive: false
      }).addTo(arcs);
    });
  }

  function fit(list) {
    map.fitBounds(L.latLngBounds(list.map(function (office) { return [office.lat, office.lng]; })).pad(0.35), { animate: !reduce });
  }

  function select(id, pan) {
    var office = offices.find(function (item) { return item.id === id; });
    if (!office) return;
    document.querySelectorAll(".office-card").forEach(function (card) {
      card.classList.toggle("is-active", card.id === id);
    });
    offices.forEach(function (item) {
      markers[item.id].setIcon(pin(item, item.id === id));
    });
    if (pan !== false) {
      map.flyTo([office.lat, office.lng], Math.max(map.getZoom(), 4), { duration: reduce ? 0 : 0.6 });
    }
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    var card = document.getElementById(id);
    if (card) card.scrollIntoView({ block: "nearest" });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "office_click", office: id });
  }

  document.querySelectorAll(".office-card").forEach(function (card) {
    card.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      select(card.id);
    });
  });

  document.querySelectorAll("[data-region]").forEach(function (button) {
    button.addEventListener("click", function () {
      var area = button.dataset.region;
      document.querySelectorAll("[data-region]").forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      var list = visible(area);
      document.querySelectorAll(".office-card").forEach(function (card) {
        var show = area === "all" || (area === "asia" ? card.dataset.area === "asia" : card.dataset.region === area);
        card.hidden = !show;
      });
      fit(list);
      draw(list);
    });
  });

  var initial = visible("all");
  fit(initial);
  draw(initial);
  var hash = location.hash.replace("#", "");
  if (hash && markers[hash]) select(hash, true);
})();
