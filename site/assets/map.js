(function () {
  "use strict";

  var dataNode = document.getElementById("office-data");
  var svg = document.getElementById("office-map");
  var markerLayer = document.getElementById("office-markers");
  if (!dataNode || !svg || !markerLayer) return;

  var offices = JSON.parse(dataNode.textContent);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var namespace = "http://www.w3.org/2000/svg";
  var markers = {};
  var animationFrame = 0;
  var currentArea = "all";

  var views = {
    all: [0, 0, 1200, 600],
    asia: [280, 100, 460, 320],
    taiwan: [350, 145, 255, 155],
    japan: [410, 125, 260, 145],
    sea: [290, 190, 290, 175],
    na: [720, 120, 310, 180]
  };

  var labelLayouts = {
    all: {
      tyo: [560, 120], osa: [560, 170], tpe: [560, 220], txg: [560, 270],
      khh: [560, 320], hcmc: [560, 370], lax: [840, 150]
    },
    asia: {
      tyo: [560, 120], osa: [560, 170], tpe: [560, 220], txg: [560, 270],
      khh: [560, 320], hcmc: [560, 370]
    },
    taiwan: { tpe: [430, 175], txg: [430, 215], khh: [430, 255] },
    japan: { tyo: [490, 150], osa: [490, 195] },
    sea: { hcmc: [390, 245] },
    na: { lax: [835, 165] }
  };

  function element(name, attributes) {
    var node = document.createElementNS(namespace, name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, attributes[key]);
    });
    return node;
  }

  function project(office) {
    var longitude = office.lng < 0 ? office.lng + 360 : office.lng;
    return [longitude / 360 * 1200, (90 - office.lat) / 180 * 600];
  }

  function visible(area) {
    if (area === "all") return offices;
    if (area === "asia") return offices.filter(function (office) { return office.area === "asia"; });
    return offices.filter(function (office) { return office.region === area; });
  }

  function createMarker(office) {
    var point = project(office);
    var group = element("g", {
      "class": "office-marker" + (office.hq ? " is-hq" : ""),
      "data-office": office.id,
      "role": "button",
      "tabindex": "0",
      "aria-label": office.name,
      "transform": "translate(" + point[0].toFixed(2) + " " + point[1].toFixed(2) + ")"
    });
    var line = element("line", { "class": "marker-line" });
    var dot = element("circle", { "class": "marker-dot", r: "6" });
    var label = element("g", { "class": "marker-label" });
    var rect = element("rect", { rx: "7", ry: "7", height: "32" });
    var text = element("text", { y: "21" });
    text.textContent = office.name;
    label.appendChild(rect);
    label.appendChild(text);
    group.appendChild(line);
    group.appendChild(dot);
    group.appendChild(label);
    markerLayer.appendChild(group);

    group.addEventListener("click", function () { select(office.id, true); });
    group.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(office.id, true);
      }
    });
    markers[office.id] = { group: group, line: line, label: label, rect: rect, text: text, point: point };
  }

  function positionLabel(office, area) {
    var marker = markers[office.id];
    var layout = labelLayouts[area] || labelLayouts.all;
    var target = layout[office.id] || labelLayouts.all[office.id];
    var mapWidth = Math.max(svg.getBoundingClientRect().width, 1);
    var scale = Math.min(1.4, Math.max(0.18, 13 * views[area][2] / (15 * mapWidth)));
    var x = target[0] - marker.point[0];
    var y = target[1] - marker.point[1];
    var width = Math.max(94, marker.text.getComputedTextLength() + 28);
    marker.line.setAttribute("x1", "0");
    marker.line.setAttribute("y1", "0");
    marker.line.setAttribute("x2", x);
    marker.line.setAttribute("y2", y + 16 * scale);
    marker.label.setAttribute("transform", "translate(" + x + " " + y + ") scale(" + scale + ")");
    marker.group.querySelector(".marker-dot").setAttribute("r", 6 * scale);
    marker.rect.setAttribute("width", width.toFixed(1));
    marker.text.setAttribute("x", "14");
  }

  function animateViewBox(target) {
    cancelAnimationFrame(animationFrame);
    var current = svg.viewBox.baseVal;
    var start = [current.x, current.y, current.width, current.height];
    if (reduce) {
      svg.setAttribute("viewBox", target.join(" "));
      return;
    }
    var started = performance.now();
    function frame(now) {
      var progress = Math.min(1, (now - started) / 520);
      var eased = 1 - Math.pow(1 - progress, 3);
      var values = start.map(function (value, index) {
        return value + (target[index] - value) * eased;
      });
      svg.setAttribute("viewBox", values.join(" "));
      if (progress < 1) animationFrame = requestAnimationFrame(frame);
    }
    animationFrame = requestAnimationFrame(frame);
  }

  function select(id, scroll) {
    var office = offices.find(function (item) { return item.id === id; });
    if (!office || markers[id].group.hasAttribute("hidden")) return;
    document.querySelectorAll(".office-card").forEach(function (card) {
      card.classList.toggle("is-active", card.id === id);
    });
    Object.keys(markers).forEach(function (key) {
      markers[key].group.classList.toggle("is-active", key === id);
    });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    var card = document.getElementById(id);
    if (scroll && card) card.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "office_click", office: id });
  }

  function showRegion(area) {
    var list = visible(area);
    var ids = list.map(function (office) { return office.id; });
    currentArea = area;
    svg.dataset.region = area;
    offices.forEach(function (office) {
      var show = ids.indexOf(office.id) !== -1;
      markers[office.id].group.toggleAttribute("hidden", !show);
      var card = document.getElementById(office.id);
      if (card) card.hidden = !show;
      if (show) positionLabel(office, area);
    });
    document.querySelectorAll("[data-region]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.region === area ? "true" : "false");
    });
    animateViewBox(views[area]);
  }

  offices.forEach(createMarker);
  document.querySelectorAll(".office-card").forEach(function (card) {
    card.addEventListener("click", function (event) {
      if (!event.target.closest("a")) select(card.id, false);
    });
  });
  document.querySelectorAll("[data-region]").forEach(function (button) {
    button.addEventListener("click", function () { showRegion(button.dataset.region); });
  });
  window.addEventListener("resize", function () {
    visible(currentArea).forEach(function (office) { positionLabel(office, currentArea); });
  });

  showRegion("all");
  var hash = location.hash.replace("#", "");
  if (hash && markers[hash]) select(hash, false);
})();
