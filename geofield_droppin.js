(function ($) {
  Drupal.behaviors.geofieldDropPin = {
    attach: function(context, settings) {
      $('div.geofield-droppin-map', context).once('geofieldDropPin', function() {
        // Set-up variables here so they are always in scope
        var map, marker;
        var layers = {};
        var controls = {};
        var $container = $(this);
        var $geom = $('#' + $container.data('geom-id'));
        
        var markerStyle  = {
          "color": "#ff7800",
          "weight": 5,
          "opacity": 1
        };
                
        // Main initialization function. This runs once when the page loads
        // Bootstrap the map
        var bootstrap = function() {
          // Set the intial map center and zoon, this might change if we know the users location via their IP
          var initialCenter = [20,-25];
          var initialZoom = 2;
          
          // Get the users IP geolocation and override the initialCenter and initialZoom
          if ($geom.val()) {
            var centerJSON = jQuery.parseJSON($geom.val());
            initialCenter = [centerJSON.coordinates[1], centerJSON.coordinates[0]];
            initialZoom = 13;
          }
          else if (Drupal.settings.smart_ip.location.latitude) {
            //$('.rnm-map-geocoder').attr('placeholder', Drupal.settings.RNMMap.location.city + ', ' + Drupal.settings.RNMMap.location.country_name);
            
            // Set the map center and zoom
            initialCenter = [Drupal.settings.smart_ip.location.latitude, Drupal.settings.smart_ip.location.longitude];
            initialZoom = 12;
          }
          
          //Control to switch base layers
          layers['base'] = new L.Google('ROADMAP');
          
          // Create the map object
          map = L.map($container.attr('id'), {
            center: initialCenter,
            zoom: initialZoom,
            inertia: false,
            minZoom : 2
          });
          
          // Add the base layer
          map.addLayer(layers['base'],true);

          map.locate({setView: true, maxZoom: 14});
          
          // Create the overlay
          if ($geom.val()) {
            var json = jQuery.parseJSON($geom.val());
            marker = createMarker([json.coordinates[1], json.coordinates[0]]);
            marker.addTo(map);
          }
          else {
            marker = false;
          }
          
          // Create the click event
          map.on('click', function(e) {
            if (marker) {
              marker.setLatLng(e.latlng);
              $geom.val(getGejSON(marker));
            }
            else {
              marker = createMarker(e.latlng);
              marker.addTo(map);
            }
          });
        }
        
        function createMarker(latlng) {
          
          var LeafIcon = L.Icon.extend({
            options: {
              iconSize:     [49, 56], // size of the icon
              iconAnchor:   [11, 47], // point of the icon which will correspond to marker's location
            }
          });

          var greenIcon = new LeafIcon({iconUrl: '/sites/all/themes/ripenearme/images/map_pin.png'});

          var marker = L.marker(latlng, {
            style: markerStyle,
            draggable: true,
            icon: greenIcon,
          });
          
          marker.on('dragend', function() {
            $geom.val(getGejSON(marker));
          });
          
          $geom.val(getGejSON(marker));

          return marker;
        }
        
        function getGejSON(markerItem) {
          return '{"type":"Point", "coordinates": [' + markerItem.getLatLng().lng + ',' + markerItem.getLatLng().lat + ']}';
        }
      
        // Run the bootstrap initialization function
        bootstrap();

      });
    }
  };
})(jQuery);

