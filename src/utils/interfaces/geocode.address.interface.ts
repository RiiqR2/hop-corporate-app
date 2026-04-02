export interface GoogleGeocodeResponse {
  results: GeocodeResult[];
  status: string;
}

export interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  navigation_points: NavigationPoint[];
  place_id: string;
  types: string[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Geometry {
  bounds: Bounds;
  location: LatLng;
  location_type: string;
  viewport: Bounds;
}

export interface Bounds {
  northeast: LatLng;
  southwest: LatLng;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NavigationPoint {
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface GooglePlaceAutocompleteResponse {
  predictions: Prediction[];
  status: string;
}

export interface Prediction {
  description: string;
  place_id: string;
  types: string[];
  structured_formatting: StructuredFormatting;
}

export interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
}

export interface GooglePlaceDetailsResponse {
  result: PlaceDetail;
  status: string;
}

export interface PlaceDetail {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface DirectionsResponse {
  geocoded_waypoints: GeocodedWaypoint[];
  routes: Route[];
  status: string;
}

export interface GeocodedWaypoint {
  geocoder_status: string;
  place_id: string;
  types: string[];
}

export interface Route {
  bounds: Bounds;
  copyrights: string;
  legs: Leg[];
  overview_polyline: Polyline;
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}
export interface Leg {
  distance: TextValue;
  duration: TextValue;
  end_address: string;
  end_location: LatLng;
  start_address: string;
  start_location: LatLng;
  steps: Step[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}

export interface TextValue {
  text: string;
  value: number;
}

export interface Step {
  distance: TextValue;
  duration: TextValue;
  end_location: LatLng;
  html_instructions: string;
  polyline: Polyline;
  start_location: LatLng;
  travel_mode: string;
  maneuver?: string;
}

export interface Polyline {
  points: string;
}
