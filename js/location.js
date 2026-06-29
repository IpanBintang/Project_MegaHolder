var bthLocationsMap,
    bthLocations,
    statesGeoJSON,
    locationMarkers = [],
    currentSelectedState = null,
    mapConfig;

// Initialize map configuration for BTH Locations
var bthMapConfig = {
  "title": "BTH® Locations Finder",
  "min_zoom": 5,
  "home": {
    "lat_lon": [4.5, 102.0],
    "zoom": 6
  },
  "zooms": [
    {
      "name": "West Malaysia",
      "id": "WM",
      "lat_lon": [4.5, 102.0],
      "zoom": 6
    },
    {
      "name": "East Malaysia",
      "id": "EM",
      "lat_lon": [2.5, 114.0],
      "zoom": 6
    }
  ],
  "states_url": "data/states.geojson",
  "locations_url": "data/bth-locations.json"
};

// Initialize Map on page load
function initBTHMap(statesData) {
  console.log("Initializing BTH Map...");

  statesGeoJSON = statesData;

  // Create Leaflet map
  bthLocationsMap = L.map('map', {
    center: bthMapConfig.home.lat_lon,
    zoom: bthMapConfig.home.zoom,
    minZoom: bthMapConfig.min_zoom
  });

  // Add OpenStreetMap tile layer (alternative to Mapbox)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(bthLocationsMap);

  // Add state boundaries (light styling)
  L.geoJson(statesGeoJSON, {
    style: {
      color: '#ccc',
      weight: 2,
      opacity: 0.5,
      fillOpacity: 0.1,
      fillColor: '#f0f0f0'
    },
    onEachFeature: function(feature, layer) {
      layer.on('click', function() {
        selectStateByName(feature.properties.Name);
      });
    }
  }).addTo(bthLocationsMap);

  // Load BTH locations
  loadBTHLocations();

  // Setup zoom buttons
  setupZoomButtons();

  // Setup state selector
  setupStateSelector();
}

// Load BTH locations from JSON
function loadBTHLocations() {
  $.ajax({
    dataType: 'json',
    url: bthMapConfig.locations_url,
    timeout: 20000,
    success: function(data) {
      bthLocations = data;
      addLocationMarkers();
      populateStateInfo();
    },
    error: function(jqxhr, estatus, ethrown) {
      console.error("Error loading locations: " + estatus + " , " + ethrown);
      alert("Could not load BTH locations. Please refresh the page.");
    }
  });
}

// Add marker clusters to map
function addLocationMarkers() {
  // Clear existing markers
  locationMarkers.forEach(function(marker) {
    bthLocationsMap.removeLayer(marker);
  });
  locationMarkers = [];

  // Add markers for each location
  bthLocations.forEach(function(location) {
    var marker = L.circleMarker([location.lat, location.lng], {
      radius: 8,
      fillColor: '#D62300',  // BTH red
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });

    var popupContent = '<div class="location-popup">' +
      '<h5>' + location.name + '</h5>' +
      '<p><strong>Address:</strong> ' + location.address + '</p>' +
      '<p><strong>Phone:</strong> ' + location.phone + '</p>' +
      '<p><strong>Hours:</strong> ' + location.hours + '</p>' +
      '<button class="btn-get-directions" onclick="getDirections(' + location.lat + ', ' + location.lng + ')">Get Directions</button>' +
      '</div>';

    marker.bindPopup(popupContent);
    marker.addTo(bthLocationsMap);
    locationMarkers.push(marker);

    // Add click listener for marker
    marker.on('click', function() {
      selectStateByName(location.state);
      showLocationDetail(location);
    });
  });
}

// Setup zoom buttons
function setupZoomButtons() {
  var zoomButtonsHtml = '';
  bthMapConfig.zooms.forEach(function(zoom) {
    zoomButtonsHtml += '<button type="button" class="btn btn-sm zoom-button" id="' + zoom.id + '">' + zoom.name + '</button> ';
  });

  $('#stat_buttons').html(zoomButtonsHtml);

  // Add click handlers
  bthMapConfig.zooms.forEach(function(zoom) {
    $('#' + zoom.id).click(function() {
      bthLocationsMap.setView(zoom.lat_lon, zoom.zoom);
    });
  });
}

// Setup state selector dropdown
function setupStateSelector() {
  var stateOptions = '<select id="state-selector" class="form-control">';
  stateOptions += '<option value="">-- Select a State --</option>';

  var uniqueStates = [...new Set(bthLocations.map(loc => loc.state))].sort();
  uniqueStates.forEach(function(state) {
    stateOptions += '<option value="' + state + '">' + state + '</option>';
  });

  stateOptions += '</select>';

  var wrapper = $('<div class="state-selector-wrapper"></div>');
  wrapper.html(stateOptions);
  
  // Insert after the map or in the detail section
  if ($('#state-detail').length) {
    $('#state-detail').prepend(wrapper);
  }

  // Add change listener
  $(document).on('change', '#state-selector', function() {
    var selectedState = $(this).val();
    if (selectedState) {
      selectStateByName(selectedState);
    }
  });
}

// Select state and display locations
function selectStateByName(stateName) {
  currentSelectedState = stateName;
  
  // Update dropdown
  $('#state-selector').val(stateName);

  // Get locations for this state
  var stateLocations = bthLocations.filter(function(loc) {
    return loc.state === stateName;
  });

  // Display locations
  showStateLocations(stateName, stateLocations);

  // Zoom to state (roughly)
  if (stateLocations.length > 0) {
    var bounds = L.latLngBounds(
      stateLocations.map(function(loc) {
        return [loc.lat, loc.lng];
      })
    );
    bthLocationsMap.fitBounds(bounds, { padding: [50, 50] });
  }
}

// Display locations for selected state
function showStateLocations(stateName, locations) {
  var html = '<div class="locations-detail">';
  html += '<h3>' + stateName + '</h3>';
  html += '<div class="locations-list">';

  if (locations.length === 0) {
    html += '<p class="no-locations">Coming soon to ' + stateName + '!</p>';
  } else {
    locations.forEach(function(location) {
      html += '<div class="location-card">';
      html += '<h5>' + location.name + '</h5>';
      html += '<p><i class="icon-location"></i> ' + location.address + '</p>';
      html += '<p><i class="icon-phone"></i> ' + location.phone + '</p>';
      html += '<p><i class="icon-clock"></i> ' + location.hours + '</p>';
      html += '<button class="btn btn-red" onclick="getDirections(' + location.lat + ', ' + location.lng + ')">Get Directions</button>';
      html += '</div>';
    });
  }

  html += '</div></div>';

  $('#location-list').html(html);
}

// Show single location detail
function showLocationDetail(location) {
  var html = '<div class="location-detail-view">';
  html += '<h4>' + location.name + '</h4>';
  html += '<p><strong>Address:</strong><br>' + location.address + '</p>';
  html += '<p><strong>Phone:</strong> <a href="tel:' + location.phone + '">' + location.phone + '</a></p>';
  html += '<p><strong>Hours:</strong> ' + location.hours + '</p>';
  html += '<button class="btn btn-red" onclick="getDirections(' + location.lat + ', ' + location.lng + ')">Get Directions</button>';
  html += '</div>';

  $('#location-list').html(html);
}

// Populate basic state info
function populateStateInfo() {
  var uniqueStates = [...new Set(bthLocations.map(loc => loc.state))].sort();
  var html = '<div class="locations-summary">';
  html += '<p><strong>' + uniqueStates.length + ' BTH® Locations</strong> across Malaysia</p>';
  html += '<p>Click on a state or marker to see details</p>';
  html += '</div>';

  $('#state-info').html(html);
}

// Get directions function
function getDirections(lat, lng) {
  // Google Maps URL
  var mapsUrl = 'https://maps.google.com/maps?q=' + lat + ',' + lng + '&z=15';
  window.open(mapsUrl, '_blank');
}

// Page load - fetch states data and initialize
$(document).ready(function() {
  $.ajax({
    dataType: 'json',
    url: bthMapConfig.states_url,
    timeout: 20000,
    success: function(data) {
      initBTHMap(data);
    },
    error: function(jqxhr, estatus, ethrown) {
      console.error("Error loading states: " + estatus + " , " + ethrown);
      alert("Could not load map data. Please refresh the page.");
    }
  });
});