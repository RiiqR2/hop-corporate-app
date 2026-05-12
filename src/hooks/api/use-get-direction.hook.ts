import axios from 'axios';
import * as Location from 'expo-location';
import { useState, useEffect, useRef, useCallback } from 'react';
import { EXPO_GOOGLE_MAPS_API_KEY, MAPBOX_ACCESS_TOKEN, PUBLIC_MAPBOX_API_URL } from '@/config';
import { DirectionsResponse, GoogleGeocodeResponse, GooglePlaceAutocompleteResponse, GooglePlaceDetailsResponse } from '@/src/utils/interfaces/geocode.address.interface';

const formatAddressParts = (parts: (string | null | undefined)[]) =>
  parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ');

const formatExpoAddress = (locationAddress: Location.LocationGeocodedAddress) => {
  if (locationAddress.formattedAddress?.trim()) {
    return locationAddress.formattedAddress.trim();
  }

  const street = formatAddressParts([locationAddress.street, locationAddress.streetNumber]).replace(', ', ' ');

  return formatAddressParts([
    locationAddress.name,
    street,
    locationAddress.district,
    locationAddress.city,
    locationAddress.region,
    locationAddress.country,
  ]);
};

const getAddressFromMapbox = async (latitude: number, longitude: number) => {
  if (!MAPBOX_ACCESS_TOKEN) return null;

  const queryParams = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    language: 'es',
    limit: '1',
  });
  const response = await fetch(`${PUBLIC_MAPBOX_API_URL}/${longitude},${latitude}.json?${queryParams.toString()}`);

  if (!response.ok) return null;

  const data = await response.json();
  const feature = data?.features?.[0];

  return feature?.place_name?.trim() || formatAddressParts([feature?.text, feature?.address]);
};

const getAddressFromGoogle = async (latitude: number, longitude: number) => {
  if (!EXPO_GOOGLE_MAPS_API_KEY) return null;

  const queryParams = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    language: 'es',
    region: 'cl',
    key: EXPO_GOOGLE_MAPS_API_KEY,
  });
  const response = await axios.get<GoogleGeocodeResponse>(`https://maps.googleapis.com/maps/api/geocode/json?${queryParams.toString()}`);
  const data = response.data;

  if (data.status !== 'OK') return null;

  return data.results[0]?.formatted_address?.trim() || null;
};

const getAddressFromDevice = async (latitude: number, longitude: number) => {
  const locations = await Location.reverseGeocodeAsync({ latitude, longitude });
  const locationAddress = locations[0];

  return locationAddress ? formatExpoAddress(locationAddress) : null;
};

export const useGetAddressFromCoordinates = () => {
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const getAddress = useCallback(async (latitude: number, longitude: number) => {
    setSelectedLocation({ latitude, longitude });
    setLoadingAddress(true);

    const reverseGeocoders = [getAddressFromMapbox, getAddressFromGoogle, getAddressFromDevice];

    try {
      for (const reverseGeocoder of reverseGeocoders) {
        try {
          const resolvedAddress = await reverseGeocoder(latitude, longitude);

          if (resolvedAddress) {
            setAddress(resolvedAddress);
            return;
          }
        } catch {
          continue;
        }
      }

      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  return {
    selectedLocation,
    address,
    loadingAddress,
    getAddress,
  };
};

export const useGetCoordinatesFromAddress = () => {
  const [locations, setLocations] = useState<
    { id: string; name: string; latitude: number; longitude: number }[]
  >([]);
  const [selectedLocation, setSelectedLocation] = useState<null | {
    latitude: number;
    longitude: number;
    name: "";
  }>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          throw new Error("Permiso de ubicación denegado");
        }

        await Location.getCurrentPositionAsync({});
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al obtener la ubicación actual");
      }
    };

    getCurrentLocation();
  }, []);

  const fetchPlaceDetail = async (placeId: string) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${EXPO_GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get<GooglePlaceDetailsResponse>(url);
      return response.data.result.geometry.location;
    } catch {
      throw new Error('Error fetching place details');
    }
  };

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) {
      setLocations([]);
      setError(null);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address.toLowerCase())}&components=country:CL&key=${EXPO_GOOGLE_MAPS_API_KEY}`;

      const response = await axios.get<GooglePlaceAutocompleteResponse>(url);

      const data = response.data;

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error('Google Places request denied or unavailable');
      }

      if (Array.isArray(data.predictions) && data.predictions.length > 0) {
        const options = await Promise.all(
          data.predictions.map(async (item, index) => {
            try {
              const location = await fetchPlaceDetail(item.place_id);
              return {
                id: item.place_id ?? `google-${index}`,
                name: item.description,
                latitude: location.lat,
                longitude: location.lng,
              };
            } catch {
              return null;
            }
          })
        );

        const filteredOptions = options.filter(Boolean) as unknown as { id: string; name: string; latitude: number; longitude: number }[];
        setLocations(filteredOptions);
        setError(null);
      } else {
        setLocations([]);
        setError('Address not found');
      }
    } catch (error: any) {
      setLocations([]);
      setError(error.message || 'Error fetching address');
    }
  };


  return {
    locations,
    selectedLocation,
    setSelectedLocation,
    error,
    geocodeAddress,
  };
};
export const useGetRouteTime = (origin: [number, number], destination: [number, number]) => {
  const [route, setRoute] = useState<{ distance: number; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const prevOrigin = useRef<[number, number] | null>(null);
  const prevDestination = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (
      prevOrigin.current &&
      prevDestination.current &&
      prevOrigin.current[0] === origin[0] &&
      prevOrigin.current[1] === origin[1] &&
      prevDestination.current[0] === destination[0] &&
      prevDestination.current[1] === destination[1]
    ) {
      return;
    }

    const getRoute = async () => {
      setLoading(true);

      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&key=${EXPO_GOOGLE_MAPS_API_KEY}`;

        const response = await axios.get<DirectionsResponse>(url);
        const data = response.data;

        if (data.routes.length > 0) {
          const firstLeg = data.routes[0].legs[0];

          const distanceKm = (firstLeg.distance.value / 1000).toFixed(2);

          const durationMin = (firstLeg.duration.value / 60).toFixed(2);

          setRoute({
            distance: parseFloat(distanceKm),
            duration: parseFloat(durationMin),
          });
        }
      } finally {
        setLoading(false);
      }
    };

    getRoute();

    prevOrigin.current = origin;
    prevDestination.current = destination;
  }, [origin, destination]);

  return { route, loading };
};

export const getGPSDirections = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [route, setRoute] = useState<any>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [instructions, setInstructions] = useState<string[]>([]);

  const handleGetDirections = async (origin: { latitude: number, longitude: number }, destination: { latitude: number, longitude: number }) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?steps=true&geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al obtener la ruta");
      }

      const data = await response.json();

      if (data.routes.length > 0) {
        setRoute(data.routes[0].geometry.coordinates);

        // Extraer instrucciones paso a paso
        const steps = data.routes[0].legs[0].steps.map(
          (step: any) => `${step.maneuver.instruction} en ${step.distance} metros`
        );

        setInstructions(steps);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error obteniendo la ruta:", error);
    }
  };



  return {
    route,
    instructions,
    handleGetDirections
  };
};
