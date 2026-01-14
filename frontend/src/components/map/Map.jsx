import { useState, useCallback, useRef, useEffect } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "../../css/map/Map.css";
import MapMarkers from "./MapMarkers";
import { getPostsInBounds } from "../../services/post.service";
import { useUIStore } from "../../store/useUIStore";
import { handleError } from "../../lib/errorHandler";
import { useSettingsStore } from "../../store/useSettingsStore";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export default function MapView() {
  const [posts, setPosts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const mapRef = useRef(null);
  const abortControllerRef = useRef(null);
  const { refreshTrigger } = useUIStore();

  const { mapStyle } = useSettingsStore();

  const getMapStyleUrl = () => {
    switch (mapStyle) {
      case "dark":
        return `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${MAPTILER_KEY}`;
      case "satellite":
        return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;
      case "basic":
      default:
        return `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`;
    }
  };

  const fetchPosts = useCallback(async () => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const bounds = map.getBounds();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const fetchedPosts = await getPostsInBounds(
        bounds,
        undefined,
        undefined,
        {
          signal: abortController.signal,
        }
      );
      setPosts(fetchedPosts);
    } catch (error) {
      if (error.name !== "CanceledError" && error.name !== "AbortError") {
        handleError(error, {
          context: "MapFetch",
          showToast: false
        });
      }
    }
  }, []);

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    fetchPosts();
  }, [fetchPosts]);

  const handleMapMove = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (isMapLoaded) {
      fetchPosts();
    }
  }, [refreshTrigger, fetchPosts, isMapLoaded]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          });
        },
        (error) => {
          handleError(error, {
            context: "MapGeolocation",
            showToast: false,
          });
        }
      );
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (isMapLoaded && userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 10,
        duration: 2000,
      });
    }
  }, [isMapLoaded, userLocation]);

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 28.9784,
          latitude: 41.0082,
          zoom: 2,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={getMapStyleUrl()}
        onLoad={handleMapLoad}
        onMoveEnd={handleMapMove}
      >
        <MapMarkers data={posts} />
      </Map>
    </div>
  );
}