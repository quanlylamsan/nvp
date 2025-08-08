// src/pages/MapPicker.js
import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

// Vị trí mặc định là Cao Lãnh, Đồng Tháp
const defaultCenter = {
  lat: 10.4632,
  lng: 105.6310
};

function MapPicker({ initialLat, initialLng, onLocationChange }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_Maps_API_KEY
  });

  const center = (initialLat && initialLng) 
    ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) } 
    : defaultCenter;
    
  const [markerPosition, setMarkerPosition] = useState(center);

  const handleMapClick = useCallback((event) => {
    const newPos = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarkerPosition(newPos);
    onLocationChange(newPos);
  }, [onLocationChange]);

  const handleMarkerDragEnd = useCallback((event) => {
    const newPos = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarkerPosition(newPos);
    onLocationChange(newPos);
  }, [onLocationChange]);

  if (!isLoaded) return <div>Đang tải bản đồ...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onClick={handleMapClick}
    >
      <Marker
        position={markerPosition}
        draggable={true}
        onDragEnd={handleMarkerDragEnd}
      />
    </GoogleMap>
  );
}

export default React.memo(MapPicker);