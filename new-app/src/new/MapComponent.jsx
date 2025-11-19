
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   WMSTileLayer,
//   GeoJSON,
//   useMapEvents,
//   Polyline
// } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import wellknown from 'wellknown';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import Header from './Header';
// import SidePanel from './SidePanel';
// import MapControls from './MapControls';
// import ShareMapPanel from './ShareMapPanel';
// import AddHouseForm from '../components/AddHouseForm';

// // Fix default marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // DEFINE URL CONSTANTS
// const GOVMAP_WMS_URL = 'https://www.govmap.gov.il/api/geoserver/ows/public/';
// const GOVMAP_API_URL = 'https://www.govmap.gov.il/api/layers-catalog/entitiesByPoint';

// // Helper function to convert WGS84 to ITM (Israeli Transverse Mercator)
// function wgs84ToITM(lat, lng) {
//   const itmX = (lng - 34.5) * 100000 + 170000;
//   const itmY = (lat - 31.0) * 110000 + 600000;
//   return [itmX, itmY];
// }

// // Helper function to format coordinates as GeoJSON
// function formatCoordinatesAsGeoJSON(coords) {
//   if (!coords || coords.length === 0) return null;
  
//   // Ensure the polygon is closed (first and last points are the same)
//   const firstPoint = coords[0];
//   const lastPoint = coords[coords.length - 1];
  
//   // If the polygon isn't closed, close it
//   if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
//     coords = [...coords, [...firstPoint]];
//   }
  
//   // Return as GeoJSON Polygon
//   return {
//     type: "Polygon",
//     coordinates: [coords]
//   };
// }

// // Map Event Handler Component
// const MapEventHandler = ({ onMapClick, onMapDoubleClick }) => {
//   useMapEvents({
//     click: (e) => {
//       onMapClick(e);
//     },
//     dblclick: () => {
//       onMapDoubleClick();
//     }
//   });
//   return null;
// };

// const MapComponent = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [selectedSearchResult, setSelectedSearchResult] = useState(null);
//   const [sidePanelOpen, setSidePanelOpen] = useState(false);
//   const [additionalLayersOpen, setAdditionalLayersOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState('Governmental');
//   const [categoryFilter, setCategoryFilter] = useState('All Categories');
//   const [mapType, setMapType] = useState('osm');
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [sharePanelOpen, setSharePanelOpen] = useState(false);
//   const [mapRotation, setMapRotation] = useState(0);
  
//   // Admin state
//   const [isAdmin, setIsAdmin] = useState(false);
  
//   // Parcels layer
//   const [parcelsVisible, setParcelsVisible] = useState(false);
//   const [parcelsOpacity, setParcelsOpacity] = useState(1.0);
  
//   // Blocks layer
//   const [blocksVisible, setBlocksVisible] = useState(false);
//   const [blocksOpacity, setBlocksOpacity] = useState(1.0);
  
//   // Migration Routes layer
//   const [retzefmigrashimVisible, setRetzefmigrashimVisible] = useState(false);
//   const [retzefmigrashimOpacity, setRetzefmigrashimOpacity] = useState(1.0);
  
//   // Parcel info state
//   const [selectedParcel, setSelectedParcel] = useState(null);
//   const [loadingParcel, setLoadingParcel] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Block info state
//   const [selectedBlock, setSelectedBlock] = useState(null);
//   const [loadingBlock, setLoadingBlock] = useState(false);
//   const [blockError, setBlockError] = useState(null);
  
//   // State for clicked location marker
//   const [clickedLocation, setClickedLocation] = useState(null);
  
//   // Drawing state
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [drawingPoints, setDrawingPoints] = useState([]);
//   const [showAddHouseForm, setShowAddHouseForm] = useState(false);
//   const [drawnPolygon, setDrawnPolygon] = useState(null);
  
//   // Parcel info for house form
//   const [selectedParcelForHouse, setSelectedParcelForHouse] = useState(null);
  
//   const position = [31.856, 35.204]; // Default center (Jerusalem)
//   const baseMapRef = useRef();
  
//   // Check if user is authenticated
//   useEffect(() => {
//     if (!user) {
//       navigate('/login', { state: { from: location } });
//     }
//   }, [user, navigate, location]);
  
//   // Set admin status based on user role
//   useEffect(() => {
//     setIsAdmin(user?.role === 'admin');
//   }, [user]);
  
//   // Effect to check if admin state was passed from navigation
//   useEffect(() => {
//     if (location.state && location.state.isAdmin) {
//       setIsAdmin(true);
//     }
//   }, [location.state]);
  
//   // Effect to handle any state passed from AdminPanel
//   useEffect(() => {
//     if (location.state) {
//       // Handle search query if passed
//       if (location.state.searchQuery) {
//         setSearchQuery(location.state.searchQuery);
//         // Trigger the search automatically
//         handleSearch(location.state.searchQuery);
//       }
      
//       // Set map view to initial coordinates if provided
//       if (location.state.initialCoords && baseMapRef.current) {
//         baseMapRef.current.flyTo(location.state.initialCoords, 16, { duration: 1.5 });
//       }
      
//       // Handle searched location if provided
//       if (location.state.searchedLocation) {
//         setSelectedSearchResult(location.state.searchedLocation);
        
//         // Set a marker at the location
//         if (location.state.searchedLocation.boundary_coords) {
//           const coords = location.state.searchedLocation.boundary_coords.coordinates[0].map(p => [p[1], p[0]]);
//           setClickedLocation(coords[0]); // Use first coordinate as center
//         } else if (location.state.initialCoords) {
//           setClickedLocation(location.state.initialCoords);
//         }
//       }
//     }
//   }, [location.state]);
  
//   // Effect to clear selected parcel when parcels layer visibility changes
//   useEffect(() => {
//     if (!parcelsVisible) {
//       setSelectedParcel(null);
//       setError(null);
//       setClickedLocation(null);
//     }
//   }, [parcelsVisible]);
  
//   // Effect to clear selected block when blocks layer visibility changes
//   useEffect(() => {
//     if (!blocksVisible) {
//       setSelectedBlock(null);
//       setBlockError(null);
//       setClickedLocation(null);
//     }
//   }, [blocksVisible]);
  
//   // Handle user menu
//   const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
//   const handleMenuItemClick = (item) => {
//     setShowUserMenu(false);
//     console.log(`Clicked on ${item}`);
//   };
  
//   // Toggle Share Panel
//   const toggleSharePanel = () => {
//     setSharePanelOpen(!sharePanelOpen);
//     if (!sharePanelOpen) setSidePanelOpen(false);
//   };
  
//   // Toggle Side Panel
//   const toggleSidePanel = () => {
//     setSidePanelOpen(!sidePanelOpen);
//     if (!sidePanelOpen) {
//       setAdditionalLayersOpen(false);
//       setActiveTab('Governmental');
//       setCategoryFilter('All Categories');
//       setSharePanelOpen(false);
//     }
//   };
  
//   // Toggle Additional Layers
//   const toggleAdditionalLayers = () => setAdditionalLayersOpen(true);
  
//   // Back to Initial Layers
//   const backToInitialLayers = () => {
//     setAdditionalLayersOpen(false);
//     setActiveTab('Governmental');
//     setCategoryFilter('All Categories');
//   };
  
//   // Toggle drawing mode (only for admin)
//   const toggleDrawing = useCallback(() => {
//     if (!isAdmin) return; // Only allow drawing for admin users
    
//     if (isDrawing) {
//       // Cancel drawing
//       setIsDrawing(false);
//       setDrawingPoints([]);
//     } else {
//       // Start drawing
//       setIsDrawing(true);
//       setDrawingPoints([]);
//       setDrawnPolygon(null);
//       setShowAddHouseForm(false);
//       setSelectedParcelForHouse(null);
//     }
//   }, [isDrawing, isAdmin]);
  
//   // Search (Govmap Autocomplete)
//   // const handleSearch = async (query) => {
//   //   setSearchQuery(query);
//   //   if (query.length > 2) {
//   //     try {
//   //       const response = await fetch(
//   //         'https://www.govmap.gov.il/api/search-service/autocomplete',
//   //         {
//   //           method: 'POST',
//   //           headers: {
//   //             'Content-Type': 'application/json',
//   //           },
//   //           body: JSON.stringify({
//   //             searchText: query,
//   //             types: ["settlement", "street", "address"],
//   //             limit: 10
//   //           }),
//   //         }
//   //       );
        
//   //       if (!response.ok) {
//   //         throw new Error(`HTTP error! status: ${response.status}`);
//   //       }
        
//   //       const data = await response.json();
//   //       console.log("Govmap Autocomplete Results:", data);
        
//   //       // Ensure we have results with shape data
//   //       const results = data.results || [];
//   //       setSearchResults(results.filter(result => result.shape));
        
//   //     } catch (error) {
//   //       console.error("Error fetching Govmap search results:", error);
//   //       setSearchResults([]);
//   //     }
//   //   } else {
//   //     setSearchResults([]);
//   //   }
//   // };
  
//   // const handleSelectSearchResult = (result) => {
//   //   setSelectedSearchResult(result);
//   //   setSearchQuery(result.text);
//   //   setSearchResults([]);
    
//   //   // Parse the WKT POINT string from the shape field
//   //   const wktPoint = result.shape;
//   //   const match = wktPoint.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    
//   //   if (match && match[1] && match[2]) {
//   //     const x = parseFloat(match[1]); // EPSG:3857 X coordinate
//   //     const y = parseFloat(match[2]); // EPSG:3857 Y coordinate
      
//   //     // Convert from Web Mercator (EPSG:3857) to WGS84 (lat/lng)
//   //     try {
//   //       const latLng = L.Projection.SphericalMercator.unproject({ x, y });
        
//   //       // Update the selected result with converted coordinates
//   //       setSelectedSearchResult(prev => ({
//   //         ...prev,
//   //         lat: latLng.lat,
//   //         lng: latLng.lng
//   //       }));
        
//   //       // Fly to the location on the map
//   //       if (baseMapRef.current) {
//   //         baseMapRef.current.flyTo([latLng.lat, latLng.lng], 16, { duration: 1.5 });
//   //       }
        
//   //       // Set a marker at the location
//   //       setClickedLocation([latLng.lat, latLng.lng]);
//   //     } catch (error) {
//   //       console.error("Error converting coordinates:", error);
//   //     }
//   //   } else {
//   //     console.error("Failed to parse shape for result:", result);
//   //   }
//   // };



// // In MapComponent, update the handleSearch function to include database search

// const handleSearch = async (query) => {
//   setSearchQuery(query);
//   if (query.length > 2) {
//     try {
//       // Govmap search
//       const govmapResponse = await fetch(
//         'https://www.govmap.gov.il/api/search-service/autocomplete',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             searchText: query,
//             types: ["settlement", "street", "address"],
//             limit: 10
//           }),
//         }
//       );
      
//       if (!govmapResponse.ok) {
//         throw new Error(`HTTP error! status: ${govmapResponse.status}`);
//       }
      
//       const govmapData = await govmapResponse.json();
//       const govmapResults = govmapData.results || [];
      
//       // Database search for house locations
//       let dbResults = [];
//       try {
//         const dbResponse = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
//         if (dbResponse.ok) {
//           dbResults = await dbResponse.json();
//         }
//       } catch (err) {
//         console.error("Error searching database:", err);
//       }
      
//       // Combine results with source identification
//       const combinedResults = [
//         ...govmapResults.map(result => ({ ...result, source: 'govmap' })),
//         ...dbResults.map(result => ({ ...result, source: 'database' }))
//       ];
      
//       setSearchResults(combinedResults);
//     } catch (error) {
//       console.error("Error fetching search results:", error);
//       setSearchResults([]);
//     }
//   } else {
//     setSearchResults([]);
//   }
// };

// // Update handleSelectSearchResult to handle database results

// const handleSelectSearchResult = (result) => {
//   setSelectedSearchResult(result);
//   setSearchResults([]);
  
//   if (result.source === 'govmap') {
//     // Handle Govmap result (existing logic)
//     setSearchQuery(result.text);
    
//     // Parse the WKT POINT string from the shape field
//     const wktPoint = result.shape;
//     const match = wktPoint.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    
//     if (match && match[1] && match[2]) {
//       const x = parseFloat(match[1]); // EPSG:3857 X coordinate
//       const y = parseFloat(match[2]); // EPSG:3857 Y coordinate
      
//       // Convert from Web Mercator (EPSG:3857) to WGS84 (lat/lng)
//       try {
//         const latLng = L.Projection.SphericalMercator.unproject({ x, y });
        
//         // Update the selected result with converted coordinates
//         setSelectedSearchResult(prev => ({
//           ...prev,
//           latlng: [latLng.lat, latLng.lng]
//         }));
        
//         // Fly to the location on the map
//         if (baseMapRef.current) {
//           baseMapRef.current.flyTo([latLng.lat, latLng.lng], 16, { duration: 1.5 });
//         }
        
//         // Set a marker at the location
//         setClickedLocation([latLng.lat, latLng.lng]);
//       } catch (error) {
//         console.error("Error converting coordinates:", error);
//       }
//     } else {
//       console.error("Failed to parse shape for result:", result);
//     }
//   } else if (result.source === 'database') {
//     // Handle database result (house location)
//     setSearchQuery(result.name || result.address || '');
    
//     // Try to get the center from boundary_coords
//     if (result.boundary_coords) {
//       try {
//         const geoJson = typeof result.boundary_coords === 'string' 
//           ? JSON.parse(result.boundary_coords) 
//           : result.boundary_coords;

//         let center;
//         if (geoJson.type === 'Polygon' && geoJson.coordinates && geoJson.coordinates[0]) {
//           // Calculate the center by averaging the points
//           const coords = geoJson.coordinates[0];
//           let totalLat = 0, totalLng = 0;
//           for (const point of coords) {
//             totalLng += point[0];
//             totalLat += point[1];
//           }
//           center = [totalLat / coords.length, totalLng / coords.length];
//         } else if (geoJson.type === 'Point') {
//           center = [geoJson.coordinates[1], geoJson.coordinates[0]];
//         }

//         if (center) {
//           // Update the selected result with the center
//           setSelectedSearchResult(prev => ({
//             ...prev,
//             latlng: center
//           }));
          
//           if (baseMapRef.current) {
//             baseMapRef.current.flyTo(center, 16, { duration: 1.5 });
//           }
//           setClickedLocation(center);
//         }
//       } catch (e) {
//         console.error("Error parsing boundary_coords for database result", e);
//       }
//     }
    
//     // Show the location details sidebar
//     setSelectedLocation(result);
//   }
// };

  
//   // Helper function to convert WKT POINT to WGS84 coordinates
//   const convertWktToLatLng = (wktString) => {
//     const match = wktString.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
//     if (!match || !match[1] || !match[2]) {
//       console.error("Invalid WKT format:", wktString);
//       return null;
//     }
    
//     const x = parseFloat(match[1]);
//     const y = parseFloat(match[2]);
    
//     try {
//       return L.Projection.SphericalMercator.unproject({ x, y });
//     } catch (error) {
//       console.error("Coordinate conversion error:", error);
//       return null;
//     }
//   };
  
//   // Map Controls
//   const handleZoomIn = () => {
//     if (baseMapRef.current) baseMapRef.current.zoomIn();
//   };
  
//   const handleZoomOut = () => {
//     if (baseMapRef.current) baseMapRef.current.zoomOut();
//   };
  
//   const handleRotate = () => setMapRotation((prev) => (prev + 45) % 360);
//   const handleResetRotation = () => setMapRotation(0);
  
//   const handleBackgroundChange = (option) => {
//     if (option === 'Streets and Buildings') setMapType('osm');
//     else if (option === 'Orthophoto') setMapType('satellite');
//   };
  
//   const getMapUrl = useCallback(() => {
//     if (mapType === 'satellite') {
//       return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
//     } else {
//       return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
//     }
//   }, [mapType]);
  
//   const getMapAttribution = useCallback(() => {
//     if (mapType === 'satellite') {
//       return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
//     } else {
//       return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
//     }
//   }, [mapType]);
  
//   // Function to fetch parcel info for a point
//   const fetchParcelInfoForPoint = async (latlng) => {
//     const [lat, lng] = latlng;
    
//     try {
//       // Convert lat/lng to EPSG:3857 (Web Mercator)
//       const epsg3857Point = L.Projection.SphericalMercator.project(L.latLng(lat, lng));
      
//       // Convert to ITM coordinates (Israeli Transverse Mercator)
//       const itmPoint = wgs84ToITM(lat, lng);
      
//       // Define request formats for parcels
//       const requestFormats = [
//         {
//           name: "EPSG:3857 (Parcels)",
//           body: {
//             point: [epsg3857Point.x, epsg3857Point.y],
//             layers: [{ layerId: 'parcel_all_eng' }],
//             crs: 'EPSG:3857',
//             tolerance: 100
//           }
//         },
//         {
//           name: "ITM (Parcels)",
//           body: {
//             point: itmPoint,
//             layers: [{ layerId: 'parcel_all_eng' }],
//             crs: 'EPSG:2039',
//             tolerance: 100
//           }
//         }
//       ];
      
//       let result = null;
      
//       // Try each format until one works
//       for (const format of requestFormats) {
//         try {
//           const response = await fetch(GOVMAP_API_URL, {
//             method: 'POST',
//             headers: { 
//               'Content-Type': 'application/json',
//               'Accept': 'application/json'
//             },
//             body: JSON.stringify(format.body),
//           });
          
//           if (response.ok) {
//             result = await response.json();
//             break;
//           }
//         } catch (err) {
//           console.error(`Format ${format.name} failed:`, err);
//         }
//       }
      
//       if (result && result.data && result.data.length > 0) {
//         const layerData = result.data[0];
        
//         if (layerData.entities && layerData.entities.length > 0) {
//           const entity = layerData.entities[0];
          
//           // Process fields
//           const fields = {};
//           if (entity.fields && Array.isArray(entity.fields)) {
//             entity.fields.forEach(field => {
//               fields[field.fieldName] = field.fieldValue !== null && field.fieldValue !== "" 
//                 ? field.fieldValue 
//                 : 'No data';
//             });
//           }
          
//           // Create parcel object
//           const parcel = {
//             gush_num: fields.gush_num || 'No data',
//             gush_suffix: fields.gush_suffix || 'No data',
//             parcel: fields.parcel || 'No data',
//             legal_area: fields.legal_area || 'No data',
//           };
          
//           setSelectedParcelForHouse(parcel);
//           return parcel;
//         }
//       }
      
//       return null;
//     } catch (err) {
//       console.error("Failed to fetch parcel info:", err);
//       return null;
//     }
//   };
  
//   // Handle double-click to finish drawing
//   // const handleMapDoubleClick = useCallback(async () => {
//   //   if (isDrawing && drawingPoints.length >= 3) {
//   //     // Close the polygon by adding the first point at the end
//   //     const closedPolygon = [...drawingPoints, drawingPoints[0]];
      
//   //     // Format as GeoJSON before setting state
//   //     const formattedPolygon = formatCoordinatesAsGeoJSON(closedPolygon);
      
//   //     setDrawnPolygon(formattedPolygon);
//   //     setIsDrawing(false);
      
//   //     // Fetch parcel info using the first point of the polygon
//   //     await fetchParcelInfoForPoint(drawingPoints[0]);
      
//   //     setShowAddHouseForm(true);
//   //   }
//   // }, [isDrawing, drawingPoints]);



//   const handleMapDoubleClick = useCallback(async () => {
//   if (isDrawing && drawingPoints.length >= 3) {
//     // Close the polygon by adding the first point at the end
//     const closedPolygon = [...drawingPoints, drawingPoints[0]];
    
//     // Store just the array of points
//     setDrawnPolygon(closedPolygon);
//     setIsDrawing(false);
    
//     // Fetch parcel info using the first point of the polygon
//     await fetchParcelInfoForPoint(drawingPoints[0]);
    
//     setShowAddHouseForm(true);
//   }
// }, [isDrawing, drawingPoints]);
  
//   // Handle saving the house form
//   const handleSaveHouse = (houseData) => {
//     console.log('House saved:', houseData);
//     setShowAddHouseForm(false);
//     setDrawnPolygon(null);
//     setSelectedParcelForHouse(null);
//   };
  
//   // Handle canceling the house form
//   const handleCancelHouseForm = () => {
//     setShowAddHouseForm(false);
//     setDrawnPolygon(null);
//     setSelectedParcelForHouse(null);
//   };
  
//   // Click Handler for both parcels and blocks
//   const handleMapClick = useCallback(
//     async (e) => {
//       // If we're in drawing mode, add the point to our drawing
//       if (isDrawing) {
//         setDrawingPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
//         return;
//       }
      
//       console.log("=== MAP CLICK DETECTED ===");
//       const { lat, lng } = e.latlng;
//       const map = baseMapRef.current;
//       if (!map) {
//         console.log("🛑 Map ref is null");
//         return;
//       }
      
//       const currentZoom = map.getZoom();
//       console.log("🗺️ Zoom level:", currentZoom);
//       console.log("📍 Clicked coordinates (lat, lng):", { lat, lng });
      
//       if (currentZoom < 14) {
//         alert("🔍 Please zoom in closer (zoom 14+)");
//         return;
//       }
      
//       // Set clicked location marker immediately
//       setClickedLocation([lat, lng]);
      
//       // Handle parcel click
//       if (parcelsVisible) {
//         console.log("🔍 Handling parcel click");
//         setLoadingParcel(true);
//         setSelectedParcel(null);
//         setError(null);
        
//         try {
//           console.log("📡 Sending request to:", GOVMAP_API_URL);
          
//           // Convert lat/lng to EPSG:3857 (Web Mercator)
//           const epsg3857Point = L.Projection.SphericalMercator.project(L.latLng(lat, lng));
          
//           // Convert to ITM coordinates (Israeli Transverse Mercator)
//           const itmPoint = wgs84ToITM(lat, lng);
          
//           console.log("📍 EPSG:3857 coordinates:", { x: epsg3857Point.x, y: epsg3857Point.y });
//           console.log("📍 ITM coordinates:", { x: itmPoint[0], y: itmPoint[1] });
          
//           // Define request formats for parcels
//           const requestFormats = [
//             {
//               name: "EPSG:3857 (Parcels)",
//               body: {
//                 point: [epsg3857Point.x, epsg3857Point.y],
//                 layers: [{ layerId: 'parcel_all_eng' }],
//                 crs: 'EPSG:3857',
//                 tolerance: 100
//               }
//             },
//             {
//               name: "ITM (Parcels)",
//               body: {
//                 point: itmPoint,
//                 layers: [{ layerId: 'parcel_all_eng' }],
//                 crs: 'EPSG:2039',
//                 tolerance: 100
//               }
//             },
//             {
//               name: "EPSG:3857 (High Tolerance - Parcels)",
//               body: {
//                 point: [epsg3857Point.x, epsg3857Point.y],
//                 layers: [{ layerId: 'parcel_all_eng' }],
//                 crs: 'EPSG:3857',
//                 tolerance: 500
//               }
//             }
//           ];
          
//           let result = null;
//           let successfulFormat = null;
          
//           // Try each format until one works
//           for (const format of requestFormats) {
//             try {
//               console.log(`📡 Trying format: ${format.name}`);
//               console.log("📡 Request body:", JSON.stringify(format.body));
              
//               const response = await fetch(GOVMAP_API_URL, {
//                 method: 'POST',
//                 headers: { 
//                   'Content-Type': 'application/json',
//                   'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(format.body),
//               });
              
//               console.log("📡 Response status:", response.status);
              
//               if (response.ok) {
//                 result = await response.json();
//                 successfulFormat = format.name;
//                 console.log(`✅ Success with format: ${format.name}`);
//                 console.log("✅ Full Response:", result);
//                 break;
//               } else {
//                 const errorText = await response.text();
//                 console.error(`❌ Format ${format.name} failed with status ${response.status}:`, errorText);
//               }
//             } catch (err) {
//               console.error(`❌ Format ${format.name} threw an error:`, err);
//             }
//           }
          
//           if (!result) {
//             throw new Error("All request formats failed to return a successful response.");
//           }
          
//           // Check if the response contains data
//           if (result.data && Array.isArray(result.data) && result.data.length > 0) {
//             const layerData = result.data[0];
            
//             if (layerData.entities && Array.isArray(layerData.entities) && layerData.entities.length > 0) {
//               console.log("🎉 Parcel found!");
//               const entity = layerData.entities[0];
              
//               // Process fields
//               const fields = {};
//               if (entity.fields && Array.isArray(entity.fields)) {
//                 entity.fields.forEach(field => {
//                   fields[field.fieldName] = field.fieldValue !== null && field.fieldValue !== "" 
//                     ? field.fieldValue 
//                     : 'No data';
//                 });
//               }
              
//               let geoJsonGeometry = null;
//               if (entity.geom) {
//                 try {
//                   geoJsonGeometry = wellknown(entity.geom);
//                   console.log("📐 Geometry parsed:", geoJsonGeometry);
//                 } catch (geomErr) {
//                   console.warn('⚠️ Failed to parse geometry:', geomErr);
//                 }
//               }
              
//               // Create parcel object
//               const newParcel = {
//                 gush_num: fields.gush_num || 'No data',
//                 gush_suffix: fields.gush_suffix || 'No data',
//                 parcel: fields.parcel || 'No data',
//                 legal_area: fields.legal_area || 'No data',
//                 geometry: geoJsonGeometry,
//                 centroid: entity.centroid,
//                 objectId: entity.objectId,
//                 latlng: [lat, lng],
//               };
              
//               console.log("📄 Processed parcel data:", newParcel);
//               setSelectedParcel(newParcel);
//               map.flyTo([lat, lng], currentZoom + 1, { duration: 0.5 });
//             } else {
//               console.log("📭 No entities found in the response");
//               setError("No parcel found at this exact location. Please try clicking directly on a parcel boundary.");
//             }
//           } else {
//             console.log("📭 'data' array is empty in the response");
//             setError("No parcel data found. The server is reachable, but no parcel exists at this point. Try zooming in and clicking precisely on a parcel.");
//           }
//         } catch (err) {
//           console.error("💥 Fetch error:", err);
//           setError(`Failed to fetch parcel data: ${err.message}`);
//         } finally {
//           setLoadingParcel(false);
//         }
//       } 
//       // Handle block click
//       else if (blocksVisible) {
//         console.log("🔍 Handling block click");
//         setLoadingBlock(true);
//         setSelectedBlock(null);
//         setBlockError(null);
        
//         try {
//           console.log("📡 Sending request to:", GOVMAP_API_URL);
          
//           // Convert lat/lng to EPSG:3857 (Web Mercator)
//           const epsg3857Point = L.Projection.SphericalMercator.project(L.latLng(lat, lng));
          
//           // Convert to ITM coordinates (Israeli Transverse Mercator)
//           const itmPoint = wgs84ToITM(lat, lng);
          
//           console.log("📍 EPSG:3857 coordinates:", { x: epsg3857Point.x, y: epsg3857Point.y });
//           console.log("📍 ITM coordinates:", { x: itmPoint[0], y: itmPoint[1] });
          
//           // Define request formats for blocks
//           const requestFormats = [
//             {
//               name: "EPSG:3857 (Blocks)",
//               body: {
//                 point: [epsg3857Point.x, epsg3857Point.y],
//                 layers: [{ layerId: 'sub_gush_all_eng' }],
//                 crs: 'EPSG:3857',
//                 tolerance: 100
//               }
//             },
//             {
//               name: "ITM (Blocks)",
//               body: {
//                 point: itmPoint,
//                 layers: [{ layerId: 'sub_gush_all_eng' }],
//                 crs: 'EPSG:2039',
//                 tolerance: 100
//               }
//             },
//             {
//               name: "EPSG:3857 (High Tolerance - Blocks)",
//               body: {
//                 point: [epsg3857Point.x, epsg3857Point.y],
//                 layers: [{ layerId: 'sub_gush_all_eng' }],
//                 crs: 'EPSG:3857',
//                 tolerance: 500
//               }
//             }
//           ];
          
//           let result = null;
//           let successfulFormat = null;
          
//           // Try each format until one works
//           for (const format of requestFormats) {
//             try {
//               console.log(`📡 Trying format: ${format.name}`);
//               console.log("📡 Request body:", JSON.stringify(format.body));
              
//               const response = await fetch(GOVMAP_API_URL, {
//                 method: 'POST',
//                 headers: { 
//                   'Content-Type': 'application/json',
//                   'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(format.body),
//               });
              
//               console.log("📡 Response status:", response.status);
              
//               if (response.ok) {
//                 result = await response.json();
//                 successfulFormat = format.name;
//                 console.log(`✅ Success with format: ${format.name}`);
//                 console.log("✅ Full Response:", result);
//                 break;
//               } else {
//                 const errorText = await response.text();
//                 console.error(`❌ Format ${format.name} failed with status ${response.status}:`, errorText);
//               }
//             } catch (err) {
//               console.error(`❌ Format ${format.name} threw an error:`, err);
//             }
//           }
          
//           if (!result) {
//             throw new Error("All request formats failed to return a successful response.");
//           }
          
//           // Check if the response contains data
//           if (result.data && Array.isArray(result.data) && result.data.length > 0) {
//             const layerData = result.data[0];
            
//             if (layerData.entities && Array.isArray(layerData.entities) && layerData.entities.length > 0) {
//               console.log("🎉 Block found!");
//               const entity = layerData.entities[0];
              
//               // Process fields
//               const fields = {};
//               if (entity.fields && Array.isArray(entity.fields)) {
//                 entity.fields.forEach(field => {
//                   fields[field.fieldName] = field.fieldValue !== null && field.fieldValue !== "" 
//                     ? field.fieldValue 
//                     : 'No data';
//                 });
//               }
              
//               let geoJsonGeometry = null;
//               if (entity.geom) {
//                 try {
//                   geoJsonGeometry = wellknown(entity.geom);
//                   console.log("📐 Geometry parsed:", geoJsonGeometry);
//                 } catch (geomErr) {
//                   console.warn('⚠️ Failed to parse geometry:', geomErr);
//                 }
//               }
              
//               // Create block object
//               const newBlock = {
//                 gush_num: fields.gush_num || 'No data',
//                 gush_suffix: fields.gush_suffix || 'No data',
//                 geometry: geoJsonGeometry,
//                 centroid: entity.centroid,
//                 objectId: entity.objectId,
//                 latlng: [lat, lng],
//               };
              
//               console.log("📄 Processed block data:", newBlock);
//               setSelectedBlock(newBlock);
//               map.flyTo([lat, lng], currentZoom + 1, { duration: 0.5 });
//             } else {
//               console.log("📭 No entities found in the response");
//               setBlockError("No block found at this exact location. Please try clicking directly on a block boundary.");
//             }
//           } else {
//             console.log("📭 'data' array is empty in the response");
//             setBlockError("No block data found. The server is reachable, but no block exists at this point. Try zooming in and clicking precisely on a block.");
//           }
//         } catch (err) {
//           console.error("💥 Fetch error:", err);
//           setBlockError(`Failed to fetch block data: ${err.message}`);
//         } finally {
//           setLoadingBlock(false);
//         }
//       }
//     },
//     [parcelsVisible, blocksVisible, isDrawing]
//   );
  
//   // If user is not authenticated, show loading or redirect
//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-900">
//         <div className="text-white text-xl">Loading...</div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="h-screen flex flex-col bg-white">
//       <Header
//         searchQuery={searchQuery}
//         setSearchQuery={handleSearch}
//         searchResults={searchResults}
//         setSearchResults={setSearchResults}
//         onSelectSearchResult={handleSelectSearchResult}
//         toggleSidePanel={toggleSidePanel}
//         sidePanelOpen={sidePanelOpen}
//         showUserMenu={showUserMenu}
//         toggleUserMenu={toggleUserMenu}
//         handleMenuItemClick={handleMenuItemClick}
//         toggleSharePanel={toggleSharePanel}
//         sharePanelOpen={sharePanelOpen}
//       />
//       <div className="flex-1 flex overflow-hidden relative">
//         <SidePanel
//           sidePanelOpen={sidePanelOpen}
//           toggleSidePanel={toggleSidePanel}
//           additionalLayersOpen={additionalLayersOpen}
//           setAdditionalLayersOpen={setAdditionalLayersOpen}
//           toggleAdditionalLayers={toggleAdditionalLayers}
//           backToInitialLayers={backToInitialLayers}
//           activeTab={activeTab}
//           setActiveTab={setActiveTab}
//           categoryFilter={categoryFilter}
//           setCategoryFilter={setCategoryFilter}
//           parcelsVisible={parcelsVisible}
//           setParcelsVisible={setParcelsVisible}
//           parcelsOpacity={parcelsOpacity}
//           setParcelsOpacity={setParcelsOpacity}
//           blocksVisible={blocksVisible}
//           setBlocksVisible={setBlocksVisible}
//           blocksOpacity={blocksOpacity}
//           setBlocksOpacity={setBlocksOpacity}
//           retzefmigrashimVisible={retzefmigrashimVisible}
//           setRetzefmigrashimVisible={setRetzefmigrashimVisible}
//           retzefmigrashimOpacity={retzefmigrashimOpacity}
//           setRetzefmigrashimOpacity={setRetzefmigrashimOpacity}
//         />
//         <ShareMapPanel
//           sharePanelOpen={sharePanelOpen}
//           toggleSharePanel={toggleSharePanel}
//         />
//         <div className="flex-1 relative overflow-hidden">
//           {/* Base Map */}
//           <div
//             className="absolute inset-0 transition-opacity duration-300"
//             style={{ zIndex: 1, transform: `rotate(${mapRotation}deg)` }}
//           >
//             <MapContainer
//               center={
//                 selectedSearchResult
//                   ? [parseFloat(selectedSearchResult.lat), parseFloat(selectedSearchResult.lng)]
//                   : position
//               }
//               zoom={selectedSearchResult ? 16 : 14}
//               style={{ height: '100%', width: '100%' }}
//               scrollWheelZoom={true}
//               zoomControl={false}
//               ref={baseMapRef}
//               worldCopyJump={true}
//             >
//               <MapEventHandler 
//                 onMapClick={handleMapClick} 
//                 onMapDoubleClick={handleMapDoubleClick} 
//               />
//               <TileLayer url={getMapUrl()} attribution={getMapAttribution()} />
              
//               {/* Parcels Layer */}
//               {parcelsVisible && (
//                 <WMSTileLayer
//                   url={GOVMAP_WMS_URL}
//                   layers="govmap:layer_parcel_all_eng"
//                   format="image/png"
//                   transparent={true}
//                   version="1.3.0"
//                   crs={L.CRS.EPSG3857}
//                   styles="govmap:layer_parcel_all_eng"
//                   opacity={parcelsOpacity}
//                   attribution="© Survey of Israel"
//                   tileSize={512}
//                   maxZoom={22}
//                 />
//               )}
              
//               {/* Blocks Layer */}
//               {blocksVisible && (
//                 <WMSTileLayer
//                   url={GOVMAP_WMS_URL}
//                   layers="govmap:layer_sub_gush_all_eng"
//                   format="image/png"
//                   transparent={true}
//                   version="1.3.0"
//                   crs={L.CRS.EPSG3857}
//                   styles="govmap:layer_sub_gush_all_eng"
//                   opacity={blocksOpacity}
//                   attribution="© Survey of Israel - Sub Gush"
//                   tileSize={512}
//                   maxZoom={22}
//                 />
//               )}
              
//               {/* Migration Routes Layer */}
//               {retzefmigrashimVisible && (
//                 <WMSTileLayer
//                   url={GOVMAP_WMS_URL}
//                   layers="govmap:layer_retzefmigrashim"
//                   format="image/png"
//                   transparent={true}
//                   version="1.3.0"
//                   crs={L.CRS.EPSG3857}
//                   styles="govmap:layer_retzefmigrashim"
//                   opacity={retzefmigrashimOpacity}
//                   attribution="© Survey of Israel - Migration Routes"
//                   tileSize={512}
//                   maxZoom={22}
//                   params={{ FEATUREVERSION: '23' }}
//                 />
//               )}
              
//               {/* Show the drawing polyline when in drawing mode */}
//               {isDrawing && drawingPoints.length > 0 && (
//                 <Polyline positions={drawingPoints} color="#3b82f6" />
//               )}
              
//               {/* Show the completed polygon */}
//               {/* {drawnPolygon && (
//                 <GeoJSON
//                   data={drawnPolygon}
//                   style={{
//                     color: '#10b981',
//                     weight: 3,
//                     fillOpacity: 0.2,
//                     fillColor: '#10b981',
//                   }}
//                 />
//               )} */}



//               {drawnPolygon && (
//   <GeoJSON
//     data={{
//       type: "Polygon",
//       coordinates: [drawnPolygon]
//     }}
//     style={{
//       color: '#10b981',
//       weight: 3,
//       fillOpacity: 0.2,
//       fillColor: '#10b981',
//     }}
//   />
// )}
              
//               {/* Highlight Selected Parcel */}
//               {selectedParcel && selectedParcel.geometry && (
//                 <GeoJSON
//                   data={selectedParcel.geometry}
//                   style={{
//                     color: '#e74c3c',
//                     weight: 3,
//                     fillOpacity: 0.15,
//                     fillColor: '#e74c3c',
//                   }}
//                 />
//               )}
              
//               {/* Highlight Selected Block */}
//               {selectedBlock && selectedBlock.geometry && (
//                 <GeoJSON
//                   data={selectedBlock.geometry}
//                   style={{
//                     color: '#3498db',
//                     weight: 3,
//                     fillOpacity: 0.15,
//                     fillColor: '#3498db',
//                   }}
//                 />
//               )}
              
//               {/* Marker at clicked location */}
//               {clickedLocation && (
//                 <Marker position={clickedLocation} />
//               )}
              
//               {selectedSearchResult && selectedSearchResult.lat && selectedSearchResult.lng && (
//                 <Marker position={[selectedSearchResult.lat, selectedSearchResult.lng]}>
//                   <Popup>
//                     <div>
//                       <strong>{selectedSearchResult.text}</strong>
//                       <br />
//                       Type: {selectedSearchResult.type}
//                     </div>
//                   </Popup>
//                 </Marker>
//               )}
//             </MapContainer>
//           </div>
          
//           <MapControls
//             handleZoomIn={handleZoomIn}
//             handleZoomOut={handleZoomOut}
//             handleRotate={handleRotate}
//             handleResetRotation={handleResetRotation}
//             onChangeBackground={handleBackgroundChange}
//             hideControls={showUserMenu || sharePanelOpen}
//             isDrawing={isDrawing}
//             toggleDrawing={toggleDrawing}
//             isAdmin={isAdmin}
//           />
//         </div>
//       </div>
      
//       {/* Improved Parcel Info Panel */}
//       {selectedParcel && (
//         <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-xl z-50 border border-gray-200 max-w-xs animate-fadeIn">
//           <div className="flex justify-between items-start mb-3">
//             <h3 className="font-bold text-gray-800 text-lg">Parcel Information</h3>
//             <button
//               onClick={() => {
//                 setSelectedParcel(null);
//                 setClickedLocation(null);
//               }}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           {loadingParcel ? (
//             <div className="text-sm text-gray-500 flex items-center">
//               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Loading parcel information...
//             </div>
//           ) : error ? (
//             <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
//               {error}
//             </div>
//           ) : (
//             <div className="space-y-3">
//               <div className="flex justify-between border-b pb-2">
//                 <span className="text-sm font-medium text-gray-600">Gush Number:</span>
//                 <span className="text-sm font-semibold">{selectedParcel.gush_num}</span>
//               </div>
//               <div className="flex justify-between border-b pb-2">
//                 <span className="text-sm font-medium text-gray-600">Parcel:</span>
//                 <span className="text-sm font-semibold">{selectedParcel.parcel}</span>
//               </div>
//               <div className="flex justify-between border-b pb-2">
//                 <span className="text-sm font-medium text-gray-600">Legal Area:</span>
//                 <span className="text-sm font-semibold">{selectedParcel.legal_area} m²</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-600">Suffix:</span>
//                 <span className="text-sm font-semibold">{selectedParcel.gush_suffix}</span>
//               </div>
//               {selectedParcel.objectId && (
//                 <div className="flex justify-between">
//                   <span className="text-sm font-medium text-gray-600">Object ID:</span>
//                   <span className="text-sm font-semibold">{selectedParcel.objectId}</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Block Info Panel */}
//       {selectedBlock && (
//         <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-xl z-50 border border-gray-200 max-w-xs animate-fadeIn">
//           <div className="flex justify-between items-start mb-3">
//             <h3 className="font-bold text-gray-800 text-lg">Block Information</h3>
//             <button
//               onClick={() => {
//                 setSelectedBlock(null);
//                 setClickedLocation(null);
//               }}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           {loadingBlock ? (
//             <div className="text-sm text-gray-500 flex items-center">
//               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Loading block information...
//             </div>
//           ) : blockError ? (
//             <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
//               {blockError}
//             </div>
//           ) : (
//             <div className="space-y-3">
//               <div className="flex justify-between border-b pb-2">
//                 <span className="text-sm font-medium text-gray-600">Gush Number:</span>
//                 <span className="text-sm font-semibold">{selectedBlock.gush_num}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-600">Suffix:</span>
//                 <span className="text-sm font-semibold">{selectedBlock.gush_suffix}</span>
//               </div>
//               {selectedBlock.objectId && (
//                 <div className="flex justify-between">
//                   <span className="text-sm font-medium text-gray-600">Object ID:</span>
//                   <span className="text-sm font-semibold">{selectedBlock.objectId}</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Add House Form - shown when drawing is complete */}
//       {showAddHouseForm && (
//         <AddHouseForm
//           coords={drawnPolygon}
//           parcelInfo={selectedParcelForHouse}
//           onCancel={handleCancelHouseForm}
//           onSave={handleSaveHouse}
//         />
//       )}
      
//       {/* Drawing instructions */}
//       {isDrawing && (
//         <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
//           Click to add points. Double-click to finish drawing.
//         </div>
//       )}
      
//       {/* Information Box */}
//       <div className="fixed bottom-2 left-2 text-[0.65rem] text-gray-700 bg-white bg-opacity-90 px-1.5 py-0.5 rounded shadow-md z-50">
//         <div className="font-bold text-blue-600 text-xs">Govmap Clone</div>
//         <div className="text-[0.6rem]">Survey of Israel ©</div>
//         <div className="text-[0.6rem] mt-0.5">
//           1:150,000 &nbsp;&nbsp; lon: 34.952 &nbsp;&nbsp; lat: 32.090
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapComponent;


import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  WMSTileLayer,
  GeoJSON,
  useMapEvents,
  Polyline
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import wellknown from 'wellknown';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import SidePanel from './SidePanel';
import MapControls from './MapControls';
import ShareMapPanel from './ShareMapPanel';
import AddHouseForm from '../components/AddHouseForm';
import LocationDetailsSidebar from '../components/LocationDetailsSidebar';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// DEFINE URL CONSTANTS
const GOVMAP_WMS_URL = 'https://www.govmap.gov.il/api/geoserver/ows/public/';
const GOVMAP_API_URL = 'https://www.govmap.gov.il/api/layers-catalog/entitiesByPoint';

// Helper function to convert WGS84 to ITM (Israeli Transverse Mercator)
function wgs84ToITM(lat, lng) {
  const itmX = (lng - 34.5) * 100000 + 170000;
  const itmY = (lat - 31.0) * 110000 + 600000;
  return [itmX, itmY];
}

// Helper function to format coordinates as GeoJSON
function formatCoordinatesAsGeoJSON(coords) {
  if (!coords || coords.length === 0) return null;
  
  // Ensure the polygon is closed (first and last points are the same)
  const firstPoint = coords[0];
  const lastPoint = coords[coords.length - 1];
  
  // If the polygon isn't closed, close it
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    coords = [...coords, [...firstPoint]];
  }
  
  // Return as GeoJSON Polygon
  return {
    type: "Polygon",
    coordinates: [coords]
  };
}

// Map Event Handler Component
const MapEventHandler = ({ onMapClick, onMapDoubleClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
    dblclick: () => {
      onMapDoubleClick();
    }
  });
  return null;
};

const MapComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [additionalLayersOpen, setAdditionalLayersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Governmental');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [mapType, setMapType] = useState('osm');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [mapRotation, setMapRotation] = useState(0);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Parcels layer
  const [parcelsVisible, setParcelsVisible] = useState(false);
  const [parcelsOpacity, setParcelsOpacity] = useState(1.0);
  
  // Blocks layer
  const [blocksVisible, setBlocksVisible] = useState(false);
  const [blocksOpacity, setBlocksOpacity] = useState(1.0);
  
  // Migration Routes layer
  const [retzefmigrashimVisible, setRetzefmigrashimVisible] = useState(false);
  const [retzefmigrashimOpacity, setRetzefmigrashimOpacity] = useState(1.0);
  
  // Parcel info state
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loadingParcel, setLoadingParcel] = useState(false);
  const [error, setError] = useState(null);
  
  // Block info state
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [blockError, setBlockError] = useState(null);
  
  // State for clicked location marker
  const [clickedLocation, setClickedLocation] = useState(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [showAddHouseForm, setShowAddHouseForm] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  
  // Parcel info for house form
  const [selectedParcelForHouse, setSelectedParcelForHouse] = useState(null);
  
  // State for selected location (from database)
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const position = [31.856, 35.204]; // Default center (Jerusalem)
  const baseMapRef = useRef();
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location } });
    }
  }, [user, navigate, location]);
  
  // Set admin status based on user role
  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
  }, [user]);
  
  // Effect to check if admin state was passed from navigation
  useEffect(() => {
    if (location.state && location.state.isAdmin) {
      setIsAdmin(true);
    }
  }, [location.state]);
  
  // Effect to handle any state passed from AdminPanel
  useEffect(() => {
    if (location.state) {
      // Handle search query if passed
      if (location.state.searchQuery) {
        setSearchQuery(location.state.searchQuery);
        // Trigger the search automatically
        handleSearch(location.state.searchQuery);
      }
      
      // Set map view to initial coordinates if provided
      if (location.state.initialCoords && baseMapRef.current) {
        baseMapRef.current.flyTo(location.state.initialCoords, 16, { duration: 1.5 });
      }
      
      // Handle searched location if provided
      if (location.state.searchedLocation) {
        setSelectedSearchResult(location.state.searchedLocation);
        
        // Set a marker at the location
        if (location.state.searchedLocation.boundary_coords) {
          const coords = location.state.searchedLocation.boundary_coords.coordinates[0].map(p => [p[1], p[0]]);
          setClickedLocation(coords[0]); // Use first coordinate as center
        } else if (location.state.initialCoords) {
          setClickedLocation(location.state.initialCoords);
        }
      }
    }
  }, [location.state]);
  
  // Effect to clear selected parcel when parcels layer visibility changes
  useEffect(() => {
    if (!parcelsVisible) {
      setSelectedParcel(null);
      setError(null);
      setClickedLocation(null);
    }
  }, [parcelsVisible]);
  
  // Effect to clear selected block when blocks layer visibility changes
  useEffect(() => {
    if (!blocksVisible) {
      setSelectedBlock(null);
      setBlockError(null);
      setClickedLocation(null);
    }
  }, [blocksVisible]);
  
  // Handle user menu
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const handleMenuItemClick = (item) => {
    setShowUserMenu(false);
    console.log(`Clicked on ${item}`);
  };
  
  // Toggle Share Panel
  const toggleSharePanel = () => {
    setSharePanelOpen(!sharePanelOpen);
    if (!sharePanelOpen) setSidePanelOpen(false);
  };
  
  // Toggle Side Panel
  const toggleSidePanel = () => {
    setSidePanelOpen(!sidePanelOpen);
    if (!sidePanelOpen) {
      setAdditionalLayersOpen(false);
      setActiveTab('Governmental');
      setCategoryFilter('All Categories');
      setSharePanelOpen(false);
    }
  };
  
  // Toggle Additional Layers
  const toggleAdditionalLayers = () => setAdditionalLayersOpen(true);
  
  // Back to Initial Layers
  const backToInitialLayers = () => {
    setAdditionalLayersOpen(false);
    setActiveTab('Governmental');
    setCategoryFilter('All Categories');
  };
  
  // Toggle drawing mode (only for admin)
  const toggleDrawing = useCallback(() => {
    if (!isAdmin) return; // Only allow drawing for admin users
    
    if (isDrawing) {
      // Cancel drawing
      setIsDrawing(false);
      setDrawingPoints([]);
    } else {
      // Start drawing
      setIsDrawing(true);
      setDrawingPoints([]);
      setDrawnPolygon(null);
      setShowAddHouseForm(false);
      setSelectedParcelForHouse(null);
    }
  }, [isDrawing, isAdmin]);
  
  // Search (Govmap Autocomplete + Database)
  // const handleSearch = async (query) => {
  //   setSearchQuery(query);
  //   if (query.length > 2) {
  //     try {
  //       // Govmap search
  //       const govmapResponse = await fetch(
  //         'https://www.govmap.gov.il/api/search-service/autocomplete',
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             searchText: query,
  //             types: ["settlement", "street", "address"],
  //             limit: 10
  //           }),
  //         }
  //       );
        
  //       if (!govmapResponse.ok) {
  //         throw new Error(`HTTP error! status: ${govmapResponse.status}`);
  //       }
        
  //       const govmapData = await govmapResponse.json();
  //       const govmapResults = govmapData.results || [];
        
  //       // Database search for house locations
  //       let dbResults = [];
  //       try {
  //         const dbResponse = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`, {
  //           headers: {
  //             'Accept': 'application/json'
  //           }
  //         });
          
  //         if (dbResponse.ok) {
  //           const contentType = dbResponse.headers.get('content-type');
  //           if (contentType && contentType.includes('application/json')) {
  //             dbResults = await dbResponse.json();
  //           } else {
  //             console.error("Database search returned non-JSON response");
  //           }
  //         } else {
  //           console.error(`Database search failed with status: ${dbResponse.status}`);
  //         }
  //       } catch (err) {
  //         console.error("Error searching database:", err);
  //       }
        
  //       // Combine results with source identification
  //       const combinedResults = [
  //         ...govmapResults.map(result => ({ ...result, source: 'govmap' })),
  //         ...dbResults.map(result => ({ ...result, source: 'database' }))
  //       ];
        
  //       setSearchResults(combinedResults);
  //     } catch (error) {
  //       console.error("Error fetching search results:", error);
  //       setSearchResults([]);
  //     }
  //   } else {
  //     setSearchResults([]);
  //   }
  // };


  // In MapComponent, update the handleSearch function

const handleSearch = async (query) => {
  setSearchQuery(query);
  if (query.length > 2) {
    try {
      // Govmap search
      const govmapResponse = await fetch(
        'https://www.govmap.gov.il/api/search-service/autocomplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchText: query,
            types: ["settlement", "street", "address"],
            limit: 10
          }),
        }
      );
      
      if (!govmapResponse.ok) {
        throw new Error(`HTTP error! status: ${govmapResponse.status}`);
      }
      
      const govmapData = await govmapResponse.json();
      const govmapResults = govmapData.results || [];
      
      // Database search for house locations
      let dbResults = [];
      try {
        // Use the proxy path
        const dbResponse = await fetch(`http://localhost:5001/api/locations/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Accept': 'application/json'
          }
          
        });
        
        if (dbResponse.ok) {
          const contentType = dbResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            dbResults = await dbResponse.json();
          } else {
            console.error("Database search returned non-JSON response");
          }
        } else {
          console.error(`Database search failed with status: ${dbResponse.status}`);
        }
      } catch (err) {
        console.error("Error searching database:", err);
      }
      
      // Combine results with source identification
      const combinedResults = [
        ...govmapResults.map(result => ({ ...result, source: 'govmap' })),
        ...dbResults.map(result => ({ ...result, source: 'database' }))
      ];
      
      setSearchResults(combinedResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  } else {
    setSearchResults([]);
  }
};
  
  // Handle selecting a search result
  const handleSelectSearchResult = (result) => {
    setSelectedSearchResult(result);
    setSearchResults([]);
    
    if (result.source === 'govmap') {
      // Handle Govmap result (existing logic)
      setSearchQuery(result.text);
      
      // Parse the WKT POINT string from the shape field
      const wktPoint = result.shape;
      const match = wktPoint.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
      
      if (match && match[1] && match[2]) {
        const x = parseFloat(match[1]); // EPSG:3857 X coordinate
        const y = parseFloat(match[2]); // EPSG:3857 Y coordinate
        
        // Convert from Web Mercator (EPSG:3857) to WGS84 (lat/lng)
        try {
          const latLng = L.Projection.SphericalMercator.unproject({ x, y });
          
          // Update the selected result with converted coordinates
          setSelectedSearchResult(prev => ({
            ...prev,
            latlng: [latLng.lat, latLng.lng]
          }));
          
          // Fly to the location on the map
          if (baseMapRef.current) {
            baseMapRef.current.flyTo([latLng.lat, latLng.lng], 16, { duration: 1.5 });
          }
          
          // Set a marker at the location
          setClickedLocation([latLng.lat, latLng.lng]);
        } catch (error) {
          console.error("Error converting coordinates:", error);
        }
      } else {
        console.error("Failed to parse shape for result:", result);
      }
    } else if (result.source === 'database') {
      // Handle database result (house location)
      setSearchQuery(result.name || result.address || '');
      
      // Try to get the center from boundary_coords
      if (result.boundary_coords) {
        try {
          const geoJson = typeof result.boundary_coords === 'string' 
            ? JSON.parse(result.boundary_coords) 
            : result.boundary_coords;
          
          let center;
          if (geoJson.type === 'Polygon' && geoJson.coordinates && geoJson.coordinates[0]) {
            // Calculate the center by averaging the points
            const coords = geoJson.coordinates[0];
            let totalLat = 0, totalLng = 0;
            for (const point of coords) {
              totalLng += point[0];
              totalLat += point[1];
            }
            center = [totalLat / coords.length, totalLng / coords.length];
          } else if (geoJson.type === 'Point') {
            center = [geoJson.coordinates[1], geoJson.coordinates[0]];
          }
          
          if (center) {
            // Update the selected result with the center
            setSelectedSearchResult(prev => ({
              ...prev,
              latlng: center
            }));
            
            if (baseMapRef.current) {
              baseMapRef.current.flyTo(center, 16, { duration: 1.5 });
            }
            setClickedLocation(center);
          }
        } catch (e) {
          console.error("Error parsing boundary_coords for database result", e);
        }
      }
      
      // Show the location details sidebar
      setSelectedLocation(result);
    }
  };
  
  // Helper function to convert WKT POINT to WGS84 coordinates
  const convertWktToLatLng = (wktString) => {
    const match = wktString.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (!match || !match[1] || !match[2]) {
      console.error("Invalid WKT format:", wktString);
      return null;
    }
    
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    
    try {
      return L.Projection.SphericalMercator.unproject({ x, y });
    } catch (error) {
      console.error("Coordinate conversion error:", error);
      return null;
    }
  };
  
  // Map Controls
  const handleZoomIn = () => {
    if (baseMapRef.current) baseMapRef.current.zoomIn();
  };
  
  const handleZoomOut = () => {
    if (baseMapRef.current) baseMapRef.current.zoomOut();
  };
  
  const handleRotate = () => setMapRotation((prev) => (prev + 45) % 360);
  const handleResetRotation = () => setMapRotation(0);
  
  const handleBackgroundChange = (option) => {
    if (option === 'Streets and Buildings') setMapType('osm');
    else if (option === 'Orthophoto') setMapType('satellite');
  };
  
  const getMapUrl = useCallback(() => {
    if (mapType === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  }, [mapType]);
  
  const getMapAttribution = useCallback(() => {
    if (mapType === 'satellite') {
      return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else {
      return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  }, [mapType]);
  
  // Function to fetch parcel info for a point
  const fetchParcelInfoForPoint = async (latlng) => {
    const [lat, lng] = latlng;
    
    try {
      // Convert lat/lng to EPSG:3857 (Web Mercator)
      const epsg3857Point = L.Projection.SphericalMercator.project(L.latLng(lat, lng));
      
      // Convert to ITM coordinates (Israeli Transverse Mercator)
      const itmPoint = wgs84ToITM(lat, lng);
      
      // Define request formats for parcels
      const requestFormats = [
        {
          name: "EPSG:3857 (Parcels)",
          body: {
            point: [epsg3857Point.x, epsg3857Point.y],
            layers: [{ layerId: 'parcel_all_eng' }],
            crs: 'EPSG:3857',
            tolerance: 100
          }
        },
        {
          name: "ITM (Parcels)",
          body: {
            point: itmPoint,
            layers: [{ layerId: 'parcel_all_eng' }],
            crs: 'EPSG:2039',
            tolerance: 100
          }
        }
      ];
      
      let result = null;
      
      // Try each format until one works
      for (const format of requestFormats) {
        try {
          const response = await fetch(GOVMAP_API_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(format.body),
          });
          
          if (response.ok) {
            result = await response.json();
            break;
          }
        } catch (err) {
          console.error(`Format ${format.name} failed:`, err);
        }
      }
      
      if (result && result.data && result.data.length > 0) {
        const layerData = result.data[0];
        
        if (layerData.entities && layerData.entities.length > 0) {
          const entity = layerData.entities[0];
          
          // Process fields
          const fields = {};
          if (entity.fields && Array.isArray(entity.fields)) {
            entity.fields.forEach(field => {
              fields[field.fieldName] = field.fieldValue !== null && field.fieldValue !== "" 
                ? field.fieldValue 
                : 'No data';
            });
          }
          
          // Create parcel object
          const parcel = {
            gush_num: fields.gush_num || 'No data',
            gush_suffix: fields.gush_suffix || 'No data',
            parcel: fields.parcel || 'No data',
            legal_area: fields.legal_area || 'No data',
          };
          
          setSelectedParcelForHouse(parcel);
          return parcel;
        }
      }
      
      return null;
    } catch (err) {
      console.error("Failed to fetch parcel info:", err);
      return null;
    }
  };
  
  // Handle double-click to finish drawing
  const handleMapDoubleClick = useCallback(async () => {
    if (isDrawing && drawingPoints.length >= 3) {
      // Close the polygon by adding the first point at the end
      const closedPolygon = [...drawingPoints, drawingPoints[0]];
      
      // Store just the array of points
      setDrawnPolygon(closedPolygon);
      setIsDrawing(false);
      
      // Fetch parcel info using the first point of the polygon
      await fetchParcelInfoForPoint(drawingPoints[0]);
      
      setShowAddHouseForm(true);
    }
  }, [isDrawing, drawingPoints]);
  
  // Handle saving the house form
  const handleSaveHouse = (houseData) => {
    console.log('House saved:', houseData);
    setShowAddHouseForm(false);
    setDrawnPolygon(null);
    setSelectedParcelForHouse(null);
  };
  
  // Handle canceling the house form
  const handleCancelHouseForm = () => {
    setShowAddHouseForm(false);
    setDrawnPolygon(null);
    setSelectedParcelForHouse(null);
  };
  
  // Click Handler for both parcels and blocks
  const handleMapClick = useCallback(
    async (e) => {
      // If we're in drawing mode, add the point to our drawing
      if (isDrawing) {
        setDrawingPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
        return;
      }
      
      console.log("=== MAP CLICK DETECTED ===");
      const { lat, lng } = e.latlng;
      const map = baseMapRef.current;
      if (!map) {
        console.log("🛑 Map ref is null");
        return;
      }
      
      const currentZoom = map.getZoom();
      console.log("🗺️ Zoom level:", currentZoom);
      console.log("📍 Clicked coordinates (lat, lng):", { lat, lng });
      
      if (currentZoom < 14) {
        alert("🔍 Please zoom in closer (zoom 14+)");
        return;
      }
      
      // Set clicked location marker immediately
      setClickedLocation([lat, lng]);
      
      // Handle parcel click
      if (parcelsVisible) {
        console.log("🔍 Handling parcel click");
        setLoadingParcel(true);
        setSelectedParcel(null);
        setError(null);
        
        try {
          console.log("📡 Sending request to:", GOVMAP_API_URL);
          
          // Convert lat/lng to EPSG:3857 (Web Mercator)
          const epsg3857Point = L.Projection.SphericalMercator.project(L.latLng(lat, lng));
          
          // Convert to ITM coordinates (Israeli Transverse Mercator)
          const itmPoint = wgs84ToITM(lat, lng);
          
          console.log("📍 EPSG:3857 coordinates:", { x: epsg3857Point.x, y: epsg3857Point.y });
          console.log("📍 ITM coordinates:", { x: itmPoint[0], y: itmPoint[1] });
          
          // Define request formats for parcels
          const requestFormats = [
            {
              name: "EPSG:3857 (Parcels)",
              body: {
                point: [epsg3857Point.x, epsg3857Point.y],
                layers: [{ layerId: 'parcel_all_eng' }],
                crs: 'EPSG:3857',
                tolerance: 100
              }
            },
            {
              name: "ITM (Parcels)",
              body: {
                point: itmPoint,
                layers: [{ layerId: 'parcel_all_eng' }],
                crs: 'EPSG:2039',
                tolerance: 100
              }
            },
            {
              name: "EPSG:3857 (High Tolerance - Parcels)",
              body: {
                point: [epsg3857Point.x, epsg3857Point.y],
                layers: [{ layerId: 'parcel_all_eng' }],
                crs: 'EPSG:3857',
                tolerance: 500
              }
            }
          ];
          
          let result = null;
          let successfulFormat = null;
          
          // Try each format until one works
          for (const format of requestFormats) {
            try {
              console.log(`📡 Trying format: ${format.name}`);
              console.log("📡 Request body:", JSON.stringify(format.body));
              
              const response = await fetch(GOVMAP_API_URL, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(format.body),
              });
              
              console.log("📡 Response status:", response.status);
              
              if (response.ok) {
                result = await response.json();
                successfulFormat = format.name;
                console.log(`✅ Success with format: ${format.name}`);
                console.log("✅ Full Response:", result);
                break;
              } else {
                const errorText = await response.text();
                console.error(`❌ Format ${format.name} failed with status ${response.status}:`, errorText);
              }
            } catch (err) {
              console.error(`❌ Format ${format.name} threw an error:`, err);
            }
          }
          
          if (!result) {
            throw new Error("All request formats failed to return a successful response.");
          }
          
          // Check if the response contains data
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const layerData = result.data[0];
            
            if (layerData.entities && Array.isArray(layerData.entities) && layerData.entities.length > 0) {
              console.log("🎉 Parcel found!");
              const entity = layerData.entities[0];
              
              // Process fields
              const fields = {};
              if (entity.fields && Array.isArray(entity.fields)) {
                entity.fields.forEach(field => {
                  fields[field.fieldName] = field.fieldValue !== null && field.fieldValue !== "" 
                    ? field.fieldValue 
                    : 'No data';
                });
              }
              
              let geoJsonGeometry = null;
              if (entity.geom) {
                try {
                  geoJsonGeometry = wellknown(entity.geom);
                  console.log("📐 Geometry parsed:", geoJsonGeometry);
                } catch (geomErr) {
                  console.warn('⚠️ Failed to parse geometry:', geomErr);
                }
              }
              
              // Create parcel object
              const newParcel = {
                gush_num: fields.gush_num || 'No data',
                gush_suffix: fields.gush_suffix || 'No data',
                parcel: fields.parcel || 'No data',
                legal_area: fields.legal_area || 'No data',
                geometry: geoJsonGeometry,
                centroid: entity.centroid,
                objectId: entity.objectId,
                latlng: [lat, lng],
              };
              
              console.log("📄 Processed parcel data:", newParcel);
              setSelectedParcel(newParcel);
              map.flyTo([lat, lng], currentZoom + 1, { duration: 0.5 });
            } else {
              console.log("📭 No entities found in the response");
              setError("No parcel found at this exact location. Please try clicking directly on a parcel boundary.");
            }
          } else {
            console.log("📭 'data' array is empty in the response");
            setError("No parcel data found. The server is reachable, but no parcel exists at this point. Try zooming in and clicking precisely on a parcel.");
          }
        } catch (err) {
          console.error("💥 Fetch error:", err);
          setError(`Failed to fetch parcel data: ${err.message}`);
        } finally {
          setLoadingParcel(false);
        }
      } 
      // Handle block click
      else if (blocksVisible) {
        console.log("🔍 Handling block click");
        setLoadingBlock(true);
        setSelectedBlock(null);
        setBlockError(null);
        
        try {
          console.log("📡 Sending request to:", GOVMAP_API_URL);
          
          // Convert lat/lng to EPSG:3857 (Web Mercator)
          const epsg3857Point = L.Projection.SphericalMercator.project(L.latLng(lat, lng));
          
          // Convert to ITM coordinates (Israeli Transverse Mercator)
          const itmPoint = wgs84ToITM(lat, lng);
          
          console.log("📍 EPSG:3857 coordinates:", { x: epsg3857Point.x, y: epsg3857Point.y });
          console.log("📍 ITM coordinates:", { x: itmPoint[0], y: itmPoint[1] });
          
          // Define request formats for blocks
          const requestFormats = [
            {
              name: "EPSG:3857 (Blocks)",
              body: {
                point: [epsg3857Point.x, epsg3857Point.y],
                layers: [{ layerId: 'sub_gush_all_eng' }],
                crs: 'EPSG:3857',
                tolerance: 100
              }
            },
            {
              name: "ITM (Blocks)",
              body: {
                point: itmPoint,
                layers: [{ layerId: 'sub_gush_all_eng' }],
                crs: 'EPSG:2039',
                tolerance: 100
              }
            },
            {
              name: "EPSG:3857 (High Tolerance - Blocks)",
              body: {
                point: [epsg3857Point.x, epsg3857Point.y],
                layers: [{ layerId: 'sub_gush_all_eng' }],
                crs: 'EPSG:3857',
                tolerance: 500
              }
            }
          ];
          
          let result = null;
          let successfulFormat = null;
          
          // Try each format until one works
          for (const format of requestFormats) {
            try {
              console.log(`📡 Trying format: ${format.name}`);
              console.log("📡 Request body:", JSON.stringify(format.body));
              
              const response = await fetch(GOVMAP_API_URL, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(format.body),
              });
              
              console.log("📡 Response status:", response.status);
              
              if (response.ok) {
                result = await response.json();
                successfulFormat = format.name;
                console.log(`✅ Success with format: ${format.name}`);
                console.log("✅ Full Response:", result);
                break;
              } else {
                const errorText = await response.text();
                console.error(`❌ Format ${format.name} failed with status ${response.status}:`, errorText);
              }
            } catch (err) {
              console.error(`❌ Format ${format.name} threw an error:`, err);
            }
          }
          
          if (!result) {
            throw new Error("All request formats failed to return a successful response.");
          }
          
          // Check if the response contains data
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const layerData = result.data[0];
            
            if (layerData.entities && Array.isArray(layerData.entities) && layerData.entities.length > 0) {
              console.log("🎉 Block found!");
              const entity = layerData.entities[0];
              
              // Process fields
              const fields = {};
              if (entity.fields && Array.isArray(entity.fields)) {
                entity.fields.forEach(field => {
                  fields[field.fieldName] = field.fieldValue !== null && field.fieldValue !== "" 
                    ? field.fieldValue 
                    : 'No data';
                });
              }
              
              let geoJsonGeometry = null;
              if (entity.geom) {
                try {
                  geoJsonGeometry = wellknown(entity.geom);
                  console.log("📐 Geometry parsed:", geoJsonGeometry);
                } catch (geomErr) {
                  console.warn('⚠️ Failed to parse geometry:', geomErr);
                }
              }
              
              // Create block object
              const newBlock = {
                gush_num: fields.gush_num || 'No data',
                gush_suffix: fields.gush_suffix || 'No data',
                geometry: geoJsonGeometry,
                centroid: entity.centroid,
                objectId: entity.objectId,
                latlng: [lat, lng],
              };
              
              console.log("📄 Processed block data:", newBlock);
              setSelectedBlock(newBlock);
              map.flyTo([lat, lng], currentZoom + 1, { duration: 0.5 });
            } else {
              console.log("📭 No entities found in the response");
              setBlockError("No block found at this exact location. Please try clicking directly on a block boundary.");
            }
          } else {
            console.log("📭 'data' array is empty in the response");
            setBlockError("No block data found. The server is reachable, but no block exists at this point. Try zooming in and clicking precisely on a block.");
          }
        } catch (err) {
          console.error("💥 Fetch error:", err);
          setBlockError(`Failed to fetch block data: ${err.message}`);
        } finally {
          setLoadingBlock(false);
        }
      }
    },
    [parcelsVisible, blocksVisible, isDrawing]
  );
  
  // If user is not authenticated, show loading or redirect
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        onSelectSearchResult={handleSelectSearchResult}
        toggleSidePanel={toggleSidePanel}
        sidePanelOpen={sidePanelOpen}
        showUserMenu={showUserMenu}
        toggleUserMenu={toggleUserMenu}
        handleMenuItemClick={handleMenuItemClick}
        toggleSharePanel={toggleSharePanel}
        sharePanelOpen={sharePanelOpen}
      />
      <div className="flex-1 flex overflow-hidden relative">
        <SidePanel
          sidePanelOpen={sidePanelOpen}
          toggleSidePanel={toggleSidePanel}
          additionalLayersOpen={additionalLayersOpen}
          setAdditionalLayersOpen={setAdditionalLayersOpen}
          toggleAdditionalLayers={toggleAdditionalLayers}
          backToInitialLayers={backToInitialLayers}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          parcelsVisible={parcelsVisible}
          setParcelsVisible={setParcelsVisible}
          parcelsOpacity={parcelsOpacity}
          setParcelsOpacity={setParcelsOpacity}
          blocksVisible={blocksVisible}
          setBlocksVisible={setBlocksVisible}
          blocksOpacity={blocksOpacity}
          setBlocksOpacity={setBlocksOpacity}
          retzefmigrashimVisible={retzefmigrashimVisible}
          setRetzefmigrashimVisible={setRetzefmigrashimVisible}
          retzefmigrashimOpacity={retzefmigrashimOpacity}
          setRetzefmigrashimOpacity={setRetzefmigrashimOpacity}
        />
        <ShareMapPanel
          sharePanelOpen={sharePanelOpen}
          toggleSharePanel={toggleSharePanel}
        />
        <div className="flex-1 relative overflow-hidden">
          {/* Base Map */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ zIndex: 1, transform: `rotate(${mapRotation}deg)` }}
          >
            <MapContainer
              center={
                selectedSearchResult && selectedSearchResult.latlng
                  ? selectedSearchResult.latlng
                  : position
              }
              zoom={selectedSearchResult ? 16 : 14}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              zoomControl={false}
              ref={baseMapRef}
              worldCopyJump={true}
            >
              <MapEventHandler 
                onMapClick={handleMapClick} 
                onMapDoubleClick={handleMapDoubleClick} 
              />
              <TileLayer url={getMapUrl()} attribution={getMapAttribution()} />
              
              {/* Parcels Layer */}
              {parcelsVisible && (
                <WMSTileLayer
                  url={GOVMAP_WMS_URL}
                  layers="govmap:layer_parcel_all_eng"
                  format="image/png"
                  transparent={true}
                  version="1.3.0"
                  crs={L.CRS.EPSG3857}
                  styles="govmap:layer_parcel_all_eng"
                  opacity={parcelsOpacity}
                  attribution="© Survey of Israel"
                  tileSize={512}
                  maxZoom={22}
                />
              )}
              
              {/* Blocks Layer */}
              {blocksVisible && (
                <WMSTileLayer
                  url={GOVMAP_WMS_URL}
                  layers="govmap:layer_sub_gush_all_eng"
                  format="image/png"
                  transparent={true}
                  version="1.3.0"
                  crs={L.CRS.EPSG3857}
                  styles="govmap:layer_sub_gush_all_eng"
                  opacity={blocksOpacity}
                  attribution="© Survey of Israel - Sub Gush"
                  tileSize={512}
                  maxZoom={22}
                />
              )}
              
              {/* Migration Routes Layer */}
              {retzefmigrashimVisible && (
                <WMSTileLayer
                  url={GOVMAP_WMS_URL}
                  layers="govmap:layer_retzefmigrashim"
                  format="image/png"
                  transparent={true}
                  version="1.3.0"
                  crs={L.CRS.EPSG3857}
                  styles="govmap:layer_retzefmigrashim"
                  opacity={retzefmigrashimOpacity}
                  attribution="© Survey of Israel - Migration Routes"
                  tileSize={512}
                  maxZoom={22}
                  params={{ FEATUREVERSION: '23' }}
                />
              )}
              
              {/* Show the drawing polyline when in drawing mode */}
              {isDrawing && drawingPoints.length > 0 && (
                <Polyline positions={drawingPoints} color="#3b82f6" />
              )}
              
              {/* Show the completed polygon */}
              {drawnPolygon && (
                <GeoJSON
                  data={{
                    type: "Polygon",
                    coordinates: [drawnPolygon]
                  }}
                  style={{
                    color: '#10b981',
                    weight: 3,
                    fillOpacity: 0.2,
                    fillColor: '#10b981',
                  }}
                />
              )}
              
              {/* Highlight Selected Parcel */}
              {selectedParcel && selectedParcel.geometry && (
                <GeoJSON
                  data={selectedParcel.geometry}
                  style={{
                    color: '#e74c3c',
                    weight: 3,
                    fillOpacity: 0.15,
                    fillColor: '#e74c3c',
                  }}
                />
              )}
              
              {/* Highlight Selected Block */}
              {selectedBlock && selectedBlock.geometry && (
                <GeoJSON
                  data={selectedBlock.geometry}
                  style={{
                    color: '#3498db',
                    weight: 3,
                    fillOpacity: 0.15,
                    fillColor: '#3498db',
                  }}
                />
              )}
              
              {/* Marker at clicked location */}
              {clickedLocation && (
                <Marker position={clickedLocation} />
              )}
              
              {/* Marker for selected search result */}
              {selectedSearchResult && selectedSearchResult.latlng && (
                <Marker position={selectedSearchResult.latlng}>
                  <Popup>
                    <div>
                      <strong>{selectedSearchResult.name || selectedSearchResult.text}</strong>
                      <br />
                      {selectedSearchResult.address && <span>Address: {selectedSearchResult.address}</span>}
                      {selectedSearchResult.type && <span>Type: {selectedSearchResult.type}</span>}
                      {selectedSearchResult.source === 'database' && (
                        <div className="mt-2 text-xs text-blue-500">House Location</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          
          <MapControls
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            handleRotate={handleRotate}
            handleResetRotation={handleResetRotation}
            onChangeBackground={handleBackgroundChange}
            hideControls={showUserMenu || sharePanelOpen}
            isDrawing={isDrawing}
            toggleDrawing={toggleDrawing}
            isAdmin={isAdmin}
          />
        </div>
      </div>
      
      {/* Improved Parcel Info Panel */}
      {selectedParcel && (
        <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-xl z-50 border border-gray-200 max-w-xs animate-fadeIn">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-800 text-lg">Parcel Information</h3>
            <button
              onClick={() => {
                setSelectedParcel(null);
                setClickedLocation(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {loadingParcel ? (
            <div className="text-sm text-gray-500 flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading parcel information...
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-gray-600">Gush Number:</span>
                <span className="text-sm font-semibold">{selectedParcel.gush_num}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-gray-600">Parcel:</span>
                <span className="text-sm font-semibold">{selectedParcel.parcel}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-gray-600">Legal Area:</span>
                <span className="text-sm font-semibold">{selectedParcel.legal_area} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Suffix:</span>
                <span className="text-sm font-semibold">{selectedParcel.gush_suffix}</span>
              </div>
              {selectedParcel.objectId && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Object ID:</span>
                  <span className="text-sm font-semibold">{selectedParcel.objectId}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Block Info Panel */}
      {selectedBlock && (
        <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-xl z-50 border border-gray-200 max-w-xs animate-fadeIn">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-800 text-lg">Block Information</h3>
            <button
              onClick={() => {
                setSelectedBlock(null);
                setClickedLocation(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {loadingBlock ? (
            <div className="text-sm text-gray-500 flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading block information...
            </div>
          ) : blockError ? (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {blockError}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-gray-600">Gush Number:</span>
                <span className="text-sm font-semibold">{selectedBlock.gush_num}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Suffix:</span>
                <span className="text-sm font-semibold">{selectedBlock.gush_suffix}</span>
              </div>
              {selectedBlock.objectId && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Object ID:</span>
                  <span className="text-sm font-semibold">{selectedBlock.objectId}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Add House Form - shown when drawing is complete */}
      {showAddHouseForm && (
        <AddHouseForm
          coords={drawnPolygon}
          parcelInfo={selectedParcelForHouse}
          onCancel={handleCancelHouseForm}
          onSave={handleSaveHouse}
        />
      )}
      
      {/* Drawing instructions */}
      {isDrawing && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Click to add points. Double-click to finish drawing.
        </div>
      )}
      
      {/* Information Box */}
      <div className="fixed bottom-2 left-2 text-[0.65rem] text-gray-700 bg-white bg-opacity-90 px-1.5 py-0.5 rounded shadow-md z-50">
        <div className="font-bold text-blue-600 text-xs">Govmap Clone</div>
        <div className="text-[0.6rem]">Survey of Israel ©</div>
        <div className="text-[0.6rem] mt-0.5">
          1:150,000 &nbsp;&nbsp; lon: 34.952 &nbsp;&nbsp; lat: 32.090
        </div>
      </div>
      
      {/* Location Details Sidebar */}
      {selectedLocation && (
        <LocationDetailsSidebar
          selectedLocation={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onEdit={() => {
            // Handle edit functionality
            console.log("Edit location:", selectedLocation);
          }}
          onDelete={() => {
            // Handle delete functionality
            console.log("Delete location:", selectedLocation);
          }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default MapComponent;