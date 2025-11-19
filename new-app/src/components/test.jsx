
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
    MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, WMSTileLayer,
    GeoJSON, ZoomControl, Polyline, LayerGroup, useMap, useMapEvents, ImageOverlay
} from 'react-leaflet';
import {
    FaTimes, FaLayerGroup, FaMapMarkedAlt, FaCity, FaSatellite, FaMap, FaRoute,
    FaExclamationTriangle, FaCut, FaSave, FaTrash, FaPlus, FaFilter, FaSearch,
    FaHome, FaMapMarkerAlt as FaMapMarkerAltIcon, FaExpand, FaCompress, FaEye, FaEyeSlash, FaBell,
    FaUser, FaChartBar, FaSync, FaDownload, FaShare, FaCog, FaSignOutAlt,
    FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle,
    FaChevronDown, FaBolt, FaSun, FaMoon, FaUpload, FaFile, FaChevronUp, FaGlobe,
    FaBuilding, FaHashtag, FaEnvelope, FaPhone, FaUserTie, FaEdit,
    FaFlagCheckered, FaUserPlus, FaUserMinus, FaUndo, FaInfoCircle, FaQuestionCircle,
    FaArrowsAltH, FaArrowsAltV, FaImage, FaLock, FaRedo, FaMousePointer, FaBars, FaArrowRight, FaHistory 
} from 'react-icons/fa';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import logoDark from '../assets/noback2.png'; // The logo for dark mode
import logoLight from '../assets/noback.png'; // The logo for light mode
import EditLocationForm from './EditLocationForm';
import UserActionsPanel from './UserActionsPanel'; // Import the new component
import * as turf from '@turf/turf';

// Utility function to get file extension in browser environment
function getFileExtension(filename) {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts.pop().toLowerCase() : '';
}

// THEME AND STYLING
const themes = {
    dark: {
        primary: '#1e1b4b', primaryLight: '#3730a3', primaryDark: '#0f0b3d', secondary: '#7c3aed', secondaryLight: '#8b5cf6', accent: '#f59e0b', accentLight: '#fbbf24', gold: '#d97706', platinum: '#9ca3af',
        success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6',
        white: '#ffffff', gray50: '#f8fafc', gray100: '#f1f5f9', gray200: '#e2e8f0', gray300: '#cbd5e1', gray400: '#94a3b8', gray500: '#64748b', gray600: '#475569', gray700: '#334155', gray800: '#1e293b', gray900: '#0f172a',
        primaryGradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)', secondaryGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', goldGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', glassGradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        subtleShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', mediumShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', largeShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', premiumShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', glowShadow: '0 0 20px rgba(126, 34, 206, 0.3)',
        fontSans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    },
    light: {
        primary: '#f8fafc', primaryLight: '#e2e8f0', primaryDark: '#cbd5e1', secondary: '#7c3aed', secondaryLight: '#8b5cf6', accent: '#f59e0b', accentLight: '#fbbf24', gold: '#d97706', platinum: '#64748b',
        success: '#16a34a', warning: '#f59e0b', error: '#dc2626', info: '#2563eb',
        white: '#0f172a', gray50: '#f8fafc', gray100: '#f1f5f9', gray200: '#e2e8f0', gray300: '#cbd5e1', gray400: '#94a3b8', gray500: '#64748b', gray600: '#475569', gray700: '#334155', gray800: '#1e293b', gray900: '#0f172a',
        primaryGradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', secondaryGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', goldGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', glassGradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(240, 240, 240, 0.5) 100%)',
        subtleShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', mediumShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', largeShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', premiumShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', glowShadow: '0 0 20px rgba(126, 34, 206, 0.3)',
        fontSans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    }
};

const luxuryAnimations = (isRtl = false) => ({
    modal: {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.320, 1] } },
        exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.3, ease: [0.755, 0.05, 0.855, 0.06] } }
    },
    slideInRight: {
        initial: { x: 30, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.320, 1] } },
        exit: { x: 30, opacity: 0, transition: { duration: 0.3, ease: [0.755, 0.05, 0.855, 0.06] } }
    },
    slideInLeft: {
        initial: { x: isRtl ? 30 : -30, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.320, 1] } },
        exit: { x: isRtl ? 30 : -30, opacity: 0, transition: { duration: 0.3, ease: [0.755, 0.05, 0.855, 0.06] } }
    },
    fadeIn: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.320, 1] } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.2, ease: [0.755, 0.05, 0.855, 0.06] } }
    },
    staggerContainer: {
        animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
    },
    staggerChild: {
        initial: { y: 12, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.23, 1, 0.320, 1] } }
    }
});

const newMapStyles = (theme) => {
    const isDark = theme === 'dark';
    const accentColor = themes[theme].accent;
    return `
      .area-perimeter-tooltip { 
        background-color: ${isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)'} !important; 
        border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.2)'} !important; 
        color: ${isDark ? 'white' : 'black'} !important; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important; 
        padding: 8px 12px !important; 
        border-radius: 8px !important; 
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; 
      }
      .area-perimeter-tooltip .leaflet-tooltip-content { 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        gap: 4px; 
      }
      .area-perimeter-tooltip-line { 
        font-size: 14px; 
        font-weight: 500; 
      }
      .area-perimeter-tooltip-line span { 
        font-weight: 700; 
        color: ${accentColor}; 
      }
      .drawing-marker-icon { 
        background-color: ${accentColor}; 
        border-radius: 50%; 
        border: 1px solid white; 
        box-shadow: 0 0 5px rgba(0,0,0,0.5); 
      }
      .leaflet-marker-draggable { 
        cursor: move !important; 
      }
      .transform-handle { 
        background-color: ${accentColor}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.5); 
      }
      .move-handle { 
        cursor: move !important; 
        z-index: 1000 !important; 
      }
    `;
};


// DATA CONSTANTS
const apiKey = "IHBqkGpjbSDwunrIci1F";

export const BASE_LAYERS = [
    { id: 'osm', name: 'Street Map', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 22, maxNativeZoom: 19, icon: FaMap, default: true, description: 'Standard street map' },
    { id: 'esri-streets', name: 'Esri Streets', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community', maxZoom: 22, maxNativeZoom: 19, icon: FaMap, description: 'Esri Street Map' },
    { id: 'esri-topo', name: 'Esri Topographic', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community', maxZoom: 22, maxNativeZoom: 19, icon: FaMap, description: 'Esri Topographic Map' },
    { id: 'esri-imagery', name: 'Esri Imagery', type: 'group', layers: [{ url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' }, { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' }], maxZoom: 22, maxNativeZoom: 19, icon: FaSatellite, description: 'Esri Satellite Imagery with Labels' },
    { id: 'govmap-orthophoto', name: 'Satellite', url: 'https://govmap.gov.il/arcgis/rest/services/Orthophoto/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; <a href="https://www.govmap.gov.il">GovMap Israel</a>', maxZoom: 22, maxNativeZoom: 19, icon: FaSatellite, description: 'Satellite imagery' },
    { id: 'topo', name: 'Topographic', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: 'Map data: &copy; OpenStreetMap, SRTM | Style: © OpenTopoMap', maxZoom: 22, maxNativeZoom: 22, icon: FaMap, description: 'Terrain data' }
];

export const OVERLAY_LAYERS = [
    { id: 'parcels', name: 'Parcels', type: 'wms', url: 'https://www.govmap.gov.il/api/geoserver/ows/public/', layers: 'govmap:layer_parcel_all_eng', format: 'image/png', transparent: true, version: '1.3.0', crs: L.CRS.EPSG3857, styles: 'govmap:layer_parcel_all_eng', attribution: '© Survey of Israel', tileSize: 512, maxZoom: 22, opacity: 1.0, description: 'Property boundaries' },
    { id: 'blocks', name: 'Blocks', type: 'wms', url: 'https://www.govmap.gov.il/api/geoserver/ows/public/', layers: 'govmap:layer_sub_gush_all_eng', format: 'image/png', transparent: true, version: '1.3.0', crs: L.CRS.EPSG3857, styles: 'govmap:layer_sub_gush_all_eng', attribution: '© Survey of Israel - Sub Gush', tileSize: 512, maxZoom: 22, opacity: 1.0, description: 'Municipal blocks' },
    { id: 'retzefmigrashim', name: 'Migration Routes', type: 'wms', url: 'https://www.govmap.gov.il/api/geoserver/ows/public/', layers: 'govmap:layer_retzefmigrashim', format: 'image/png', transparent: true, version: '1.3.0', crs: L.CRS.EPSG3857, styles: 'govmap:layer_retzefmigrashim', attribution: '© Survey of Israel - Migration Routes', tileSize: 512, maxZoom: 22, params: { FEATUREVERSION: '23' }, opacity: 1.0, description: 'Historical routes' },
    { id: 'matzuva-detailed', name: 'Matzuva Detailed', type: 'wms', url: 'https://www.govmap.gov.il/api/geoserver/ows', layers: 'govmap:group_mmi', format: 'image/png', transparent: true, version: '1.3.0', crs: L.CRS.EPSG3857, styles: '', attribution: '© Survey of Israel - Matzuva Detailed', tileSize: 512, maxZoom: 22, params: { CQL_FILTER: "(mishasava IN ('2010417'))", TILED: "false" }, opacity: 0.3, description: 'Detailed municipal data' }
];

export const CITY_PRESETS = [
    { id: 'matzuva', name: 'Matzuva', center: [33.06333, 35.15833], zoom: 15, bounds: { north: 33.07, south: 33.06, east: 35.17, west: 35.15 }, preferredBasemap: 'esri-streets', description: 'Northern border village' },
    { id: 'jerusalem', name: 'Jerusalem', center: [31.7683, 35.2137], zoom: 13, bounds: { north: 31.85, south: 31.70, east: 35.25, west: 35.15 }, preferredBasemap: 'osm', description: 'Capital city' },
    { id: 'tel_aviv', name: 'Tel Aviv', center: [32.0853, 34.7818], zoom: 13, bounds: { north: 32.12, south: 32.05, east: 34.82, west: 34.75 }, preferredBasemap: 'osm', description: 'Economic center' },
    { id: 'haifa', name: 'Haifa', center: [32.7940, 34.9896], zoom: 13, bounds: { north: 32.85, south: 32.75, east: 35.05, west: 34.95 }, preferredBasemap: 'osm', description: 'Northern port city' },
    { id: 'beer_sheva', name: 'Beer Sheva', center: [31.2518, 34.7913], zoom: 13, bounds: { north: 31.30, south: 31.20, east: 34.85, west: 34.75 }, preferredBasemap: 'osm', description: 'Southern desert capital' }
];

export const LICENSE_STATUS_COLORS = {
    approved: { primary: themes.dark.success, background: '#00F700' },
    pending: { primary: themes.dark.info, background: '#dbeafe' },
    no_licence: { primary: themes.dark.error, background: '#fee2e2' }
};

export const getPolygonStyle = (licenseStatus, isSelected = false) => {
    const statusColor = LICENSE_STATUS_COLORS[licenseStatus] || LICENSE_STATUS_COLORS.no_licence;
    return {
        color: statusColor.primary,
        fillColor: statusColor.primary,
        weight: isSelected ? 3 : 2,
        fillOpacity: isSelected ? 0.9 : 0.9,
        dashArray: isSelected ? '8, 4' : null,
        className: isSelected ? 'polygon-selected' : 'polygon-normal'
    };
};

// UTILITY FUNCTIONS
export function wgs84ToITM(lat, lng) {
    const itmX = (lng - 34.5) * 100000 + 170000;
    const itmY = (lat - 31.0) * 110000 + 600000;
    return [itmX, itmY];
}

export function handleTileError(error, tile) {
    if (error && error.status === 404 && tile._z > 16) {
        const lowerZ = 16;
        const scale = Math.pow(2, tile._z - lowerZ);
        const x = Math.floor(tile._x / scale);
        const y = Math.floor(tile._y / scale);
        tile.src = tile._url.replace('{z}', lowerZ).replace('{x}', x).replace('{y}', y);
        tile.style.transform = `scale(${scale})`;
        tile.style.transformOrigin = '0 0';
        tile.style.width = `${256 * scale}px`;
        tile.style.height = `${256 * scale}px`;
        return true;
    }
    return false;
}

const fetchParcelInfoForPoint = async (latlng) => {
    const [lat, lng] = latlng;
    const GOVMAP_API_URL = 'https://www.govmap.gov.il/api/layers-catalog/entitiesByPoint';
    try {
        const x = lng * 20037508.34 / 180;
        const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
        const response = await fetch(GOVMAP_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ point: [x, y], layers: [{ layerId: 'parcel_all_eng' }], crs: 'EPSG:3857', tolerance: 100 }),
        });
        if (!response.ok) return null;
        const result = await response.json();
        if (result && result.data ?.[0] ?.entities ?.[0]) {
            const entity = result.data[0].entities[0];
            const fields = {};
            entity.fields ?.forEach(field => {
                fields[field.fieldName] = field.fieldValue !== null && field.fieldValue !== "" ? field.fieldValue : 'No data';
            });
            return {
                gush_num: fields.gush_num || 'No data',
                gush_suffix: fields.gush_suffix || 'No data',
                parcel_num: fields.parcel || 'No data',
                legal_area: fields.legal_area || fields.area || 'No data',
                latlng: [lat, lng],
            };
        }
        return null;
    } catch (err) {
        console.error("Failed to fetch parcel info:", err);
        return null;
    }
};

const fetchAddressForPoint = async (latlng) => {
    const [lat, lng] = latlng;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const address = data.address || {};
        return {
            street: address.road || address.footway || '',
            house_number: address.house_number || '',
            suburb: address.suburb || address.village || address.town || address.hamlet || '',
            city: address.city || address.town || address.village || '',
            county: address.county || '',
            state: address.state || '',
            country: address.country || '',
            postcode: address.postcode || '',
            display_name: data.display_name || ''
        };
    } catch (error) {
        console.error("Failed to fetch address:", error);
        return { street: '', house_number: '', suburb: '', city: '', county: '', state: '', country: '', postcode: '', display_name: '' };
    }
};

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const secondsPast = (now.getTime() - new Date(timestamp).getTime()) / 1000;
    if (secondsPast < 60) return `${Math.round(secondsPast)}s ago`;
    if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
    if (secondsPast <= 86400) return `${Math.round(secondsPast / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// ====================================================================================
// ===== ALL SUB-COMPONENTS GO HERE
// ====================================================================================

// UPDATED ActionStatusModal Component
const ActionStatusModal = ({ isOpen, status, title, message, onClose, theme }) => {
    const { t } = useTranslation();
    const animations = luxuryAnimations();

    if (!isOpen) return null;

    // Define appearance based on status, matching the user's image
    const getStatusAppearance = () => {
        switch (status) {
            case 'success':
                return { icon: FaCheckCircle, color: '#27ae60', defaultTitle: t('status.success', 'Success!') };
            case 'error':
                return { icon: FaTimesCircle, color: '#e74c3c', defaultTitle: t('status.error', 'Error!') };
            case 'warning':
                return { icon: FaExclamationTriangle, color: '#f39c12', defaultTitle: t('status.warning', 'Warning!') };
            case 'loading':
                return { icon: FaSync, color: '#3498db', defaultTitle: t('status.loading', 'Processing...') };
            default: // Info and others
                return { icon: FaInfoCircle, color: '#3498db', defaultTitle: t('status.info', 'Notice') };
        }
    };

    const { icon: Icon, color, defaultTitle } = getStatusAppearance();
    const isDark = theme === 'dark';
    const modalBg = isDark ? 'rgba(52, 52, 52, 0.98)' : 'rgba(252, 252, 252, 0.98)';
    const textColor = isDark ? '#EAEAEA' : '#333333';

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75"
            variants={animations.fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.div
                className="rounded-lg max-w-sm w-full mx-4 p-6 shadow-2xl flex flex-col items-center"
                style={{ backgroundColor: modalBg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
                variants={animations.modal}
            >
                {/* Icon */}
                <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{ backgroundColor: color, boxShadow: `0 0 20px -5px ${color}` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                     <motion.div
                        animate={{ rotate: status === 'loading' ? 360 : 0 }}
                        transition={{ duration: 1.2, repeat: status === 'loading' ? Infinity : 0, ease: "linear" }}
                    >
                        <Icon className="text-4xl text-white" />
                     </motion.div>
                </motion.div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold mb-2" style={{ color: color }}>
                    {title || defaultTitle}
                </h3>
                
                {/* Message */}
                <p className="text-center mb-8" style={{ color: textColor }}>
                    {message}
                </p>
                
                {/* OK Button */}
                {status !== 'loading' && (
                    <motion.button
                        onClick={onClose}
                        className="w-full px-4 py-3 text-white rounded-md font-semibold text-lg"
                        style={{ backgroundColor: '#f39c12' }}
                        whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {t('buttons.ok', 'OK')}
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
};

const DeletionErrorModal = ({ isOpen, onClose, childLocations, theme, currentTheme }) => {
    const { t } = useTranslation();
    const animations = luxuryAnimations();
    const isDark = theme === 'dark';

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
            variants={animations.fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
        >
            <motion.div
                className={`rounded-xl max-w-md w-full mx-4 p-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{
                    background: currentTheme.glassGradient,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                }}
                variants={animations.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <FaExclamationTriangle className="text-5xl text-yellow-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t('confirmations.deletionBlockedTitle', 'Deletion Blocked')}</h3>
                    <p className={`${isDark ? 'text-white/80' : 'text-gray-700'} mb-4 text-sm`}>
                        {t('confirmations.deleteParentError', 'This property cannot be deleted because it has associated split parts. Please delete the following properties first:')}
                    </p>
                    <div className={`w-full max-h-40 overflow-y-auto rounded-lg p-3 space-y-2 mb-6 text-left ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                        {childLocations.map(loc => (
                            <div key={loc.id} className={`text-sm p-2 rounded ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'}`}>
                                <span className="font-bold">{loc.name}</span>
                                <span className="text-xs text-gray-400"> (ID: {loc.id})</span>
                            </div>
                        ))}
                    </div>
                    <motion.button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-white rounded-md font-medium"
                        style={{ background: currentTheme.goldGradient }}
                    >
                        {t('buttons.ok', 'OK')}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Section = ({ title, children, isOpen, onToggle, highlighted, theme }) => {
    const controls = useAnimation();
    const isDark = theme === 'dark';

    useEffect(() => {
        if (highlighted) {
            controls.start({
                scale: [1, 1.03, 1],
                backgroundColor: [
                    isDark ? "rgba(168, 85, 247, 0)" : "rgba(168, 85, 247, 0)",
                    isDark ? "rgba(168, 85, 247, 0.35)" : "rgba(168, 85, 247, 0.25)",
                    isDark ? "rgba(168, 85, 247, 0)" : "rgba(168, 85, 247, 0)"
                ],
                borderColor: [
                    isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
                    "rgba(192, 132, 252, 1)",
                    isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
                ],
                transition: { duration: 0.9, ease: "easeOut", times: [0, 0.2, 1] },
            });
        }
    }, [highlighted, controls, isDark]);

    const sectionClasses = `
        mb-4 rounded-xl shadow-lg p-4 backdrop-blur-sm 
        ${isDark ? 'bg-gradient-to-br from-gray-800/70 to-gray-900/50 border border-white/20' : 'bg-white/80 border border-black/10'}
    `;

    return (
        <motion.div animate={controls} className={sectionClasses}>
            <button
                onClick={onToggle}
                className="flex justify-between items-center w-full text-left mb-2 focus:outline-none group"
            >
                <h3 className="text-base font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider">
                    {title}
                </h3>
                <div className={`p-1 rounded-full transition-colors ${isDark ? 'bg-white bg-opacity-10 group-hover:bg-opacity-20' : 'bg-black bg-opacity-5 group-hover:bg-opacity-10'}`}>
                    {isOpen ? <FaChevronUp size={12} className="text-purple-400" /> : <FaChevronDown size={12} className="text-purple-400" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className={`space-y-4 mt-3 pt-3 border-t ${isDark ? 'border-white border-opacity-10' : 'border-black border-opacity-10'}`}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


const StatisticsDashboard = ({ allLocations }) => {
    const stats = React.useMemo(() => {
        const total = allLocations.length;
        const approved = allLocations.filter(loc => loc.license_status === 'approved').length;
        const pending = allLocations.filter(loc => loc.license_status === 'pending').length;
        const no_licence = allLocations.filter(loc => loc.license_status === 'no_licence').length;
        const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;
        return { total, approved, pending, no_licence, completionRate };
    }, [allLocations]);

    return null;
};

const InputField = ({ label, name, value, onChange, required, disabled, type = 'text', options, error, helperText, placeholder, isRtl, theme }) => {
    const [focused, setFocused] = useState(false);
    const isDark = theme === 'dark';

    const baseClasses = "w-full border rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
    const themeClasses = isDark ? 'bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50' : 'bg-gray-50 text-gray-900 placeholder-gray-400';
    const borderClasses = error ? 'border-red-500' : focused ? 'border-purple-400' : (isDark ? 'border-white border-opacity-30' : 'border-gray-300');

    return (
        <div className="relative">
            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>
                {label} {required && '*'}
            </label>
            {type === 'select' ? (
                <div className="relative">
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        className={`${baseClasses} ${themeClasses} ${borderClasses} ${isRtl ? 'pr-4 pl-10' : 'pl-4 pr-10'} appearance-none cursor-pointer`}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value} className={isDark ? 'text-gray-900' : 'text-gray-900'}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className={`pointer-events-none absolute inset-y-0 flex items-center px-3 ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'} ${isRtl ? 'left-0' : 'right-0'}`}>
                        <FaChevronDown size={12} />
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`${baseClasses} ${themeClasses} ${borderClasses}`}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            )}
            {error && (
                <motion.div
                    className="flex items-center mt-1 text-red-400 text-xs"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FaExclamationCircle className={isRtl ? 'ml-1' : 'mr-1'} />
                    {error}
                </motion.div>
            )}
            {helperText && !error && (
                <div className={`flex items-center mt-1 text-xs ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'}`}>
                    <FaInfoCircle className={isRtl ? 'ml-1' : 'mr-1'} />
                    {helperText}
                </div>
            )}
        </div>
    );
};

const TextAreaField = ({ label, name, value, onChange, disabled, rows = 3, error, helperText, isRtl, theme }) => {
    const [focused, setFocused] = useState(false);
    const isDark = theme === 'dark';

    const baseClasses = "w-full border rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
    const themeClasses = isDark ? 'bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50' : 'bg-gray-50 text-gray-900 placeholder-gray-400';
    const borderClasses = error ? 'border-red-500' : focused ? 'border-purple-400' : (isDark ? 'border-white border-opacity-30' : 'border-gray-300');

    return (
        <div className="relative">
            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>
                {label}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                disabled={disabled}
                className={`${baseClasses} ${themeClasses} ${borderClasses}`}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {error && (
                <motion.div
                    className="flex items-center mt-1 text-red-400 text-xs"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FaExclamationCircle className={isRtl ? 'ml-1' : 'mr-1'} />
                    {error}
                </motion.div>
            )}
            {helperText && !error && (
                <div className={`flex items-center mt-1 text-xs ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'}`}>
                    <FaInfoCircle className={isRtl ? 'ml-1' : 'mr-1'} />
                    {helperText}
                </div>
            )}
        </div>
    );
};

const FileUploadArea = ({ files, setFiles, fileTypes, multiple, label, isLoading, disabled, maxFileSize = 1000 * 1024 * 1024, theme }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragCounter, setDragCounter] = React.useState(0);
    const [uploadErrors, setUploadErrors] = React.useState([]);
    const fileInputRef = React.useRef(null);
    const isDark = theme === 'dark';

    const handleDragEnter = (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };
    const handleDragLeave = (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev - 1);
        if (dragCounter === 1) {
            setIsDragging(false);
        }
    };
    const handleDragOver = (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setDragCounter(0);
        setUploadErrors([]);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            processFiles(droppedFiles);
        }
    };
    const handleInputChange = (e) => {
        if (disabled) return;
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            processFiles(selectedFiles);
        }
    };
    const processFiles = (filesToProcess) => {
        const errors = [];
        const validFiles = [];
        filesToProcess.forEach(file => {
            const fileExtension = getFileExtension(file.name);
            const isValidType = fileTypes.includes(fileExtension.substring(1));
            const isValidSize = file.size <= maxFileSize;
            if (!isValidType) {
                errors.push({ name: file.name, error: t('fileUpload.error.invalidType', { types: fileTypes.map(ext => `.${ext.toUpperCase()}`).join(', ') }) });
            } else if (!isValidSize) {
                errors.push({ name: file.name, error: t('fileUpload.error.tooLarge', { maxSize: formatFileSize(maxFileSize) }) });
            } else {
                validFiles.push(file);
            }
        });
        setUploadErrors(errors);
        if (validFiles.length > 0) {
            setFiles(multiple ? [...(files || []), ...validFiles] : [validFiles[0]]);
        }
    };

    const handleBrowseClick = () => {
        if (!disabled && !isLoading) {
            fileInputRef.current ?.click();
        }
    };

    const removeFile = (index) => {
        const newFiles = Array.from(files).filter((_, i) => i !== index);
        setFiles(newFiles);
    };

    const fileTypeText = fileTypes.map(ext => {
        if (ext === 'dwg') return '.DWG (AutoCAD)';
        return `.${ext.toUpperCase()}`;
    }).join(', ');

    const dropzoneClasses = `
        flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl 
        transition-all duration-300 
        ${isDragging ?
            'border-purple-400 bg-purple-900/30 scale-[1.02]' :
            (isDark ?
                'border-white border-opacity-30 bg-white bg-opacity-5 hover:border-opacity-50 hover:bg-opacity-10' :
                'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            )
        } 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    return (
        <div className="mt-2">
            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>
                {label}
            </label>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={dropzoneClasses}
                onClick={handleBrowseClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleInputChange}
                    className="sr-only"
                    accept={fileTypes.map(ext => `.${ext}`).join(',')}
                    disabled={disabled || isLoading}
                    multiple={multiple}
                />
                <div className="text-center">
                    <motion.div
                        animate={{ scale: isDragging ? 1.2 : 1, rotate: isDragging ? 5 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FaUpload className={`mx-auto h-10 w-10 mb-3 ${isDragging ? 'text-purple-400' : (isDark ? 'text-white text-opacity-50' : 'text-gray-400')}`} />
                    </motion.div>
                    <div className={`flex text-sm ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>
                        <span className="font-medium text-purple-400 hover:text-purple-300">
                            {multiple ? t('fileUpload.selectFiles') : t('fileUpload.selectFile')}
                        </span>
                        <p className={isRtl ? 'pr-1' : 'pl-1'}>{t('fileUpload.dragAndDrop')}</p>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'}`}>{fileTypeText}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'}`}>
                        {t('fileUpload.maxSize')}: {formatFileSize(maxFileSize)}
                    </p>
                    {isDragging && (
                        <motion.p
                            className="text-xs text-purple-400 mt-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {t('fileUpload.releaseToUpload')}
                        </motion.p>
                    )}
                </div>

                {files && files.length > 0 && (
                    <div className="mt-4 space-y-2 w-full">
                        {Array.from(files).map((file, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center justify-between rounded-lg py-2 px-3 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'}`}
                            >
                                <div className="flex items-center text-purple-500 min-w-0 flex-1">
                                    <FaFile className={`flex-shrink-0 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                    <span className={`text-sm truncate ${isDark ? 'text-purple-400' : 'text-purple-700'}`} title={file.name}>
                                        {file.name}
                                    </span>
                                    <span className={`text-xs flex-shrink-0 ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'} ${isRtl ? 'mr-2' : 'ml-2'}`}>
                                        ({formatFileSize(file.size)})
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    className="text-red-400 hover:text-red-300 flex-shrink-0"
                                    disabled={disabled}
                                >
                                    <FaTrash size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {uploadErrors.length > 0 && (
                    <div className="mt-4 w-full">
                        <p className="text-xs text-red-400 mb-2">{t('fileUpload.errorsTitle')}:</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                            {uploadErrors.map((error, index) => (
                                <div key={index} className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                                    <div className="font-medium truncate">{error.name}</div>
                                    <div>{error.error}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ParcelInfoSection = ({ gush_num, parcel_num, gush_suffix, theme }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const isDark = theme === 'dark';

    const sectionClasses = `p-4 rounded-xl border mb-4 ${isDark ? 'bg-white bg-opacity-10 border-white border-opacity-20' : 'bg-gray-100 border-gray-200'}`;
    const fieldClasses = `border rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-white bg-opacity-5 border-white border-opacity-20 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
    const labelClasses = `block text-xs font-medium mb-1 ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`;

    return (
        <div className={sectionClasses}>
            <h3 className={`text-sm font-semibold mb-3 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <FaMapMarkerAltIcon className={`w-4 h-4 text-purple-400 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                {t('parcelInfo.title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={labelClasses}>{t('parcelInfo.gushNum')}</label>
                    <div className={fieldClasses}>{gush_num || t('common.notAvailable')}</div>
                </div>
                <div>
                    <label className={labelClasses}>{t('parcelInfo.parcelNum')}</label>
                    <div className={fieldClasses}>{parcel_num || t('common.notAvailable')}</div>
                </div>
                <div>
                    <label className={labelClasses}>{t('parcelInfo.gushSuffix')}</label>
                    <div className={fieldClasses}>{gush_suffix || t('common.notAvailable')}</div>
                </div>
            </div>
        </div>
    );
};

const LuxuryAddHouseForm = ({ activeFormState, onCancel, onSave, isSplitMode, onPointsUpdate, showActionStatus, theme, currentTheme, user }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const isDark = theme === 'dark';

    const editingHouse = activeFormState ?.type === 'edit' ? activeFormState.location : null;
    const parentLocation = activeFormState ?.parentLocation;
    const isNewProperty = activeFormState ?.type === 'add' && !parentLocation;

    const [houseName, setHouseName] = useState('');
    const [description, setDescription] = useState('');
    const [licenseStatus, setLicenseStatus] = useState('no_licence');
    const [owners, setOwners] = useState([{ first_name: '', last_name: '', id_number: '', phone: '', email: '' }]);
    const [propertyType, setPropertyType] = useState('residential');
    const [parcelData, setParcelData] = useState({ gush_num: '', parcel_num: '', gush_suffix: '' });
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [housePlans, setHousePlans] = useState([]);
    const [housePhotos, setHousePhotos] = useState([]);
    const [licenceFiles, setLicenceFiles] = useState([]);
    const [additionalFiles, setAdditionalFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [inheritedFiles, setInheritedFiles] = useState({ plans: [], photos: [], license_documents: [] });
    const [openSections, setOpenSections] = useState({ houseInfo: true, ownerInfo: true, files: true, parcelInfo: true });

    const validateForm = () => {
        const newErrors = {};
        if (!houseName.trim()) {
            newErrors.houseName = t('formErrors.houseNumberRequired');
        }
        const hasValidOwner = owners.some(owner => owner.first_name.trim() !== '');
        if (!hasValidOwner) {
            newErrors.owners = t('formErrors.ownerRequired');
        }
        const coords = activeFormState ?.drawnCoords;
        if (!editingHouse && (!coords || !coords.coordinates || coords.coordinates[0].length === 0)) {
            newErrors.boundary = t('formErrors.boundaryRequired');
        }
        owners.forEach((owner, index) => {
            if (owner.email && !/^\S+@\S+\.\S+$/.test(owner.email)) {
                newErrors[`ownerEmail_${index}`] = t('formErrors.invalidEmail');
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addOwner = () => setOwners([...owners, { first_name: '', last_name: '', id_number: '', phone: '', email: '' }]);
    const removeOwner = (index) => {
        if (owners.length > 1) setOwners(owners.filter((_, i) => i !== index));
    };
    const handleOwnerChange = (index, field, value) => {
        const newOwners = [...owners];
        newOwners[index][field] = value;
        setOwners(newOwners);
    };

    useEffect(() => {
        const resetForm = () => {
            setHouseName('');
            setDescription('');
            setLicenseStatus('no_licence');
            setOwners([{ first_name: '', last_name: '', id_number: '', phone: '', email: '' }]);
            setPropertyType('residential');
            setParcelData({ gush_num: '', parcel_num: '', gush_suffix: '' });
            setAddress('');
            setCity('');
            setCountry('');
            setHousePlans([]);
            setHousePhotos([]);
            setLicenceFiles([]);
            setAdditionalFiles([]);
            setInheritedFiles({ plans: [], photos: [], license_documents: [] });
            setErrors({});
        };

        if (editingHouse) {
            setHouseName(editingHouse.name || '');
            setDescription(editingHouse.description || '');
            setLicenseStatus(editingHouse.license_status || 'no_licence');
            setOwners(Array.isArray(editingHouse.owners) && editingHouse.owners.length > 0 ? editingHouse.owners : [{ first_name: '', last_name: '', id_number: '', phone: '', email: '' }]);
            setPropertyType(editingHouse.property_type || 'residential');
            setParcelData({ gush_num: editingHouse.gush_num || '', gush_suffix: editingHouse.gush_suffix || '', parcel_num: editingHouse.parcel_num || '' });
            setAddress(editingHouse.address || '');
            setCity(editingHouse.city || '');
            setCountry(editingHouse.country || '');
        } else if (parentLocation) {
            setHouseName(`${parentLocation.name}-Split`);
            setDescription(parentLocation.description || '');
            setLicenseStatus(parentLocation.license_status || 'no_licence');
            setOwners(Array.isArray(parentLocation.owners) && parentLocation.owners.length > 0 ? parentLocation.owners : [{ first_name: '', last_name: '', id_number: '', phone: '', email: '' }]);
            setPropertyType(parentLocation.property_type || 'residential');
            setParcelData({ gush_num: parentLocation.gush_num || '', parcel_num: parentLocation.parcel_num || '' });
            setAddress(parentLocation.address || '');
            setCity(parentLocation.city || '');
            setCountry(parentLocation.country || '');
            setInheritedFiles({
                plans: parentLocation.house_plans || [],
                photos: parentLocation.house_photos || [],
                license_documents: parentLocation.license_documents || [],
            });
        } else if (isNewProperty) {
            resetForm();
            if (activeFormState ?.addressData) {
                setAddress(activeFormState.addressData.display_name || '');
                setCity(activeFormState.addressData.city || '');
                setCountry(activeFormState.addressData.country || '');
            }
            if (activeFormState ?.parcelData) {
                setParcelData({
                    gush_num: activeFormState.parcelData.gush_num || '',
                    parcel_num: activeFormState.parcelData.parcel_num || '',
                    gush_suffix: activeFormState.parcelData.gush_suffix || ''
                });
            }
        }
    }, [activeFormState, parentLocation, editingHouse, isNewProperty]);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        showActionStatus('error', t('formErrors.fixErrors'), 'Please correct the highlighted fields before saving.');
        return;
    }
    setIsLoading(true);
    showActionStatus('loading', t('status.saving'), t('messages.submittingData'));

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('name', houseName);
    formDataToSubmit.append('description', description);
    formDataToSubmit.append('license_status', licenseStatus);
    formDataToSubmit.append('owners', JSON.stringify(owners));
    formDataToSubmit.append('property_type', propertyType);
    formDataToSubmit.append('gush_num', parcelData.gush_num || '');
    formDataToSubmit.append('gush_suffix', parcelData.gush_suffix || '');
    formDataToSubmit.append('parcel_num', parcelData.parcel_num || '');
    formDataToSubmit.append('address', address || '');
    formDataToSubmit.append('city', city || '');
    formDataToSubmit.append('country', country || '');

    if (activeFormState ?.drawnCoords) {
        formDataToSubmit.append('boundaryCoords', JSON.stringify(activeFormState.drawnCoords));
    }
    if (parentLocation) {
        formDataToSubmit.append('parent_house', parentLocation.id);
    }

    Array.from(housePlans).forEach(file => formDataToSubmit.append('house_plans', file));
    Array.from(housePhotos).forEach(file => formDataToSubmit.append('house_photos', file));
    Array.from(licenceFiles).forEach(file => formDataToSubmit.append('licence_files', file));
    Array.from(additionalFiles).forEach(file => formDataToSubmit.append('additional_documents', file));

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/locations', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataToSubmit
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'An error occurred.');
        }
        
        if (response.status === 201) { 
            showActionStatus('success', t('status.success'), result.message);
            onSave(result.location);
        } else if (response.status === 202) { 
            showActionStatus('info', t('status.pending'), result.message);
            onCancel(); 
        }

    } catch (error) {
        console.error('Failed to save location:', error);
        showActionStatus('error', t('errors.submissionFailed'), error.message || t('errors.generic'));
    } finally {
        setIsLoading(false);
    }
};

    const handleCancel = () => {
        if (window.confirm(t('confirmations.cancelChanges'))) {
            onCancel();
        }
    };

    const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

    if (!activeFormState) return null;

    const title = editingHouse ? t('forms.editProperty.title') : isSplitMode ? t('forms.splitProperty.title') : t('forms.addProperty.title');
    const saveButtonText = editingHouse ? t('buttons.updateProperty') : isSplitMode ? t('buttons.completeSplit') : t('buttons.saveProperty');
    const allInheritedFiles = [...inheritedFiles.plans, ...inheritedFiles.photos, ...inheritedFiles.license_documents];
    const propertyTypeOptions = [
        { value: 'residential', label: t('forms.propertyTypes.residential') },
        { value: 'commercial', label: t('forms.propertyTypes.commercial') }
    ];
    const licenseStatusOptions = [
        { value: 'no_licence', label: t('licenseStatuses.no_licence') },
        { value: 'pending', label: t('licenseStatuses.pending') },
        { value: 'approved', label: t('licenseStatuses.approved') }
    ];

    return (
        <div className={`h-full flex flex-col ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className={`flex-shrink-0 p-4 border-b ${isDark ? 'border-white/20' : 'border-black/10'}`}>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    {isSplitMode ? t('forms.splitProperty.description') : t('forms.addProperty.description')}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {errors.boundary && (
                    <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                        {errors.boundary}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <Section
                        title={t('forms.sections.houseInfo')}
                        isOpen={openSections.houseInfo}
                        onToggle={() => toggleSection('houseInfo')}
                        theme={theme}
                    >
                        <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.houseNumber')} name="name" value={houseName} onChange={(e) => setHouseName(e.target.value)} required disabled={isLoading} error={errors.houseName} />
                        <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.address')} name="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLoading} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.city')} name="city" value={city} onChange={(e) => setCity(e.target.value)} disabled={isLoading} />
                            <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.country')} name="country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={isLoading} />
                        </div>
                        <ParcelInfoSection {...parcelData} theme={theme} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.propertyType')} name="property_type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} type="select" options={propertyTypeOptions} disabled={isLoading} />
                            <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.licenseStatus')} name="license_status" value={licenseStatus} onChange={(e) => setLicenseStatus(e.target.value)} type="select" options={licenseStatusOptions} disabled={isLoading} />
                        </div>
                        <TextAreaField theme={theme} isRtl={isRtl} label={t('forms.labels.description')} name="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} />
                    </Section>

                    <Section
                        title={t('forms.sections.ownerInfo')}
                        isOpen={openSections.ownerInfo}
                        onToggle={() => toggleSection('ownerInfo')}
                        theme={theme}
                    >
                        {errors.owners && <div className="mb-3 p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">{errors.owners}</div>}
                        <div className="space-y-4">
                            {owners.map((owner, index) => (
                                <React.Fragment key={index}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.firstName')} name={`first_name_${index}`} value={owner.first_name} onChange={(e) => handleOwnerChange(index, 'first_name', e.target.value)} required={index === 0} disabled={isLoading || isSplitMode} error={errors[`ownerFirstName_${index}`]} />
                                        <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.lastName')} name={`last_name_${index}`} value={owner.last_name} onChange={(e) => handleOwnerChange(index, 'last_name', e.target.value)} disabled={isLoading || isSplitMode} />
                                        <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.idNumber')} name={`id_number_${index}`} value={owner.id_number} onChange={(e) => handleOwnerChange(index, 'id_number', e.target.value)} disabled={isLoading || isSplitMode} helperText={t('forms.helpers.idNumber')} />
                                        <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.phone')} name={`phone_${index}`} value={owner.phone} onChange={(e) => handleOwnerChange(index, 'phone', e.target.value)} type="tel" disabled={isLoading || isSplitMode} helperText={t('forms.helpers.phone')} />
                                        <InputField theme={theme} isRtl={isRtl} label={t('forms.labels.email')} name={`email_${index}`} value={owner.email} onChange={(e) => handleOwnerChange(index, 'email', e.target.value)} type="email" disabled={isLoading || isSplitMode} error={errors[`ownerEmail_${index}`]} helperText={t('forms.helpers.email')} />
                                        {owners.length > 1 && (
                                            <div className="sm:col-span-2 flex justify-end">
                                                <button type="button" onClick={() => removeOwner(index)} className="text-red-400 hover:text-red-300 flex items-center" disabled={isLoading || isSplitMode}>
                                                    <FaUserMinus size={14} className={isRtl ? 'ml-1' : 'mr-1'} /> {t('buttons.removeOwner', { index: index + 1 })}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {index < owners.length - 1 && (<div className={`border-t ${isDark ? 'border-white border-opacity-10' : 'border-black border-opacity-10'} my-4`}></div>)}
                                </React.Fragment>
                            ))}
                        </div>
                        <button type="button" onClick={addOwner} className="flex items-center text-purple-400 hover:text-purple-300 text-sm mt-4" disabled={isLoading || isSplitMode}>
                            <FaUserPlus className={isRtl ? 'ml-1' : 'mr-1'} /> {t('buttons.addOwner')}
                        </button>
                    </Section>

                    <Section
                        title={t('forms.sections.attachedFiles')}
                        isOpen={openSections.files}
                        onToggle={() => toggleSection('files')}
                        theme={theme}
                    >
                        {isSplitMode && (
                            <div className={`mb-4 p-3 rounded-lg border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                                <h4 className={`text-sm font-medium mb-2 flex items-center ${isDark ? 'text-white/80' : 'text-gray-800'}`}>
                                    <FaShare className={isRtl ? 'ml-2' : 'mr-2'} /> {t('forms.files.linkedParentFiles')}
                                </h4>
                                <p className={`text-xs mb-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{t('forms.files.linkedParentDescription')}</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {allInheritedFiles.length === 0 ? (
                                        <p className={`text-sm text-center py-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{t('forms.files.noLinkedFiles')}</p>
                                    ) : (
                                        allInheritedFiles.map((file, i) => (
                                            <div key={i} className={`flex items-center rounded-lg py-2 px-3 opacity-80 ${isDark ? 'bg-purple-900/10' : 'bg-purple-100'}`}>
                                                <FaFile className={`text-purple-400 flex-shrink-0 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                                <span className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={file.file_name}>{file.file_name}</span>
                                                <span className={`text-xs flex-shrink-0 ${isDark ? 'text-white/50' : 'text-gray-500'} ${isRtl ? 'mr-2' : 'ml-2'}`}>({formatFileSize(file.file_size)})</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        <FileUploadArea theme={theme} files={housePlans} setFiles={setHousePlans} fileTypes={['pdf', 'dwg', 'dws', 'dwf', 'zip']} multiple label={isSplitMode ? t('forms.fileUpload.plansOptional') : t('forms.fileUpload.plans')} isLoading={isLoading} disabled={isLoading} />
                        <FileUploadArea theme={theme} files={housePhotos} setFiles={setHousePhotos} fileTypes={['jpg', 'png']} multiple label={isSplitMode ? t('forms.fileUpload.photosOptional') : t('forms.fileUpload.photos')} isLoading={isLoading} disabled={isLoading} />
                        <FileUploadArea theme={theme} files={licenceFiles} setFiles={setLicenceFiles} fileTypes={['pdf']} multiple label={isSplitMode ? t('forms.fileUpload.licenseOptional') : t('forms.fileUpload.license')} isLoading={isLoading} disabled={isLoading} />
                        <FileUploadArea theme={theme} files={additionalFiles} setFiles={setAdditionalFiles} fileTypes={['pdf', 'docx', 'doc', 'txt']} multiple label={isSplitMode ? t('forms.fileUpload.additionalOptional') : t('forms.fileUpload.additional')} isLoading={isLoading} disabled={isLoading} />
                    </Section>
                </form>
            </div>
            
            <div className={`flex-shrink-0 flex space-x-3 p-4 border-t ${isDark ? 'border-white/20' : 'border-black/10'}`}>
                <button
                    type="button"
                    className={`flex-1 px-4 py-2 border rounded-md disabled:opacity-50 ${isDark ? 'border-white/30 bg-white/10' : 'border-gray-300 bg-gray-100'}`}
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    {t('buttons.cancel')}
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white rounded-md font-medium disabled:opacity-50"
                    style={{ background: currentTheme.goldGradient }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? t('buttons.saving') : <><FaSave className={`inline ${isRtl ? 'ml-2' : 'mr-2'}`} />{saveButtonText}</>}
                </button>
            </div>
        </div>
    );
};

const SecureImage = ({ src, alt, className }) => {
    const [imageUrl, setImageUrl] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        let isMounted = true;
        let objectUrl = null;

        const fetchImage = async () => {
            if (!src || !token) {
                return;
            }
            try {
                const response = await fetch(src, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.statusText}`);
                }
                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                if (isMounted) {
                    setImageUrl(objectUrl);
                }
            } catch (error) {
                console.error("Error fetching secure image:", src, error);
                if (isMounted) {
                    setImageUrl('');
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src, token]);

    if (!imageUrl) {
        return <div className={`w-full h-full bg-gray-800/50 animate-pulse ${className}`}></div>;
    }

    return <img src={imageUrl} alt={alt} className={className} />;
};

const LocationDetailsSidebar = ({ selectedLocation, onClose, onDelete, onEdit, ownersSectionRef, filesSectionRef, highlightedSection, theme, currentTheme }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const isDark = theme === 'dark';

    const [openSections, setOpenSections] = React.useState({ propertyInfo: true, historyInfo: true, ownerInfo: true, parcelInfo: true, photos: true, files: true });
    const [isImageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [history, setHistory] = React.useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

    React.useEffect(() => {
        if (selectedLocation?.id) {
            const fetchHistory = async () => {
                setIsLoadingHistory(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:5001/api/locations/${selectedLocation.id}/history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setHistory(data);
                    } else {
                        setHistory([]);
                    }
                } catch (error) {
                    console.error("Error fetching history:", error);
                    setHistory([]);
                } finally {
                    setIsLoadingHistory(false);
                }
            };
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [selectedLocation]);

    const renderFieldChanges = (changesObject) => {
        const formatValue = (val, key) => {
            if (val === null || val === undefined || val === '') {
                return <em className={isDark ? "text-gray-400" : "text-gray-500"}>{t('history.empty')}</em>;
            }
            if (typeof val === 'object') {
                return <pre className={`text-xs p-1 rounded max-h-24 overflow-auto ${isDark ? 'bg-gray-900/50' : 'bg-gray-100'}`}>{JSON.stringify(val, null, 2)}</pre>;
            }
            if (key === 'license_status') {
                 const statusKey = `licenseStatuses.${val}`;
                 return <strong className="text-purple-400">{t(statusKey, val.replace('_', ' '))}</strong>
            }
            return <strong className="text-purple-400">{String(val)}</strong>;
        };
        
        return Object.entries(changesObject).map(([key, value]) => {
            if (key === 'files') {
                return (
                    <React.Fragment key={key}>
                        {value.added?.length > 0 && (
                            <li className="text-sm">
                               {t('history.filesAddedPrefix', { count: value.added.length })}
                               <em>{value.added.join(', ')}</em>
                            </li>
                        )}
                        {Object.values(value.removed || {}).some(arr => arr.length > 0) && (
                            <li className="text-sm">{t('history.filesRemoved')}</li>
                        )}
                    </React.Fragment>
                );
            }
            
            return (
                <li key={key} className="text-sm">
                    {t('history.changedPrefix', 'Changed')}{' '}
                    <strong className="capitalize text-cyan-300">
                        {t(`history.fields.${key}`, key.replace(/_/g, ' '))}
                    </strong>{' '}
                    {t('history.fromPrefix', 'from')} {formatValue(value.old, key)} {t('history.toPrefix', 'to')} {formatValue(value.new, key)}.
                </li>
            );
        });
    };
    
    const renderChanges = (changeEntry) => {
        const { changes } = changeEntry;
        const requesterName = changes?.requested_by_user_name || 'a user';

        if (changeEntry.action_type === 'created_by_approval') {
            return <li className="text-sm text-green-400">Created by <strong>{requesterName}</strong> and approved by the admin.</li>;
        }
        
        if (changeEntry.action_type === 'updated_by_approval') {
            const fieldChanges = changes?.changes;
            return (
                <li className="text-sm">
                    <span className="text-blue-400">Update requested by <strong>{requesterName}</strong> was approved.</span>
                    {fieldChanges && Object.keys(fieldChanges).length > 0 && (
                         <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                            {renderFieldChanges(fieldChanges)}
                        </ul>
                    )}
                </li>
            );
        }

        if (changeEntry.action_type === 'deleted_by_approval') {
            return <li className="text-sm text-red-400">Deletion requested by <strong>{requesterName}</strong> was approved by the admin.</li>;
        }

        if (changeEntry.action_type === 'created') {
            return <li className="text-sm text-green-500">{t('history.created')}</li>;
        }

        if (changeEntry.action_type === 'deleted') {
            return <li className="text-sm text-red-500">{t('history.deleted')}</li>;
        }

        if (!changes || Object.keys(changes).length === 0) {
            return <li className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('history.generalUpdate')}</li>;
        }
        
        return renderFieldChanges(changes);
    };

    if (!selectedLocation) return null;

    const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    const statusInfo = LICENSE_STATUS_COLORS[selectedLocation.license_status] || LICENSE_STATUS_COLORS.no_licence;

    const InfoField = ({ label, value, children }) => (
        <div>
            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{label}</label>
            <div className={`w-full border rounded-xl p-3.5 text-sm ${isDark ? 'bg-white/10 border-white/30 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                {children || (value || t('common.notProvided'))}
            </div>
        </div>
    );

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const handleDownload = async (file) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/locations${file.file_url}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(t('errors.downloadFailed'));
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.file_name || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const FileListItem = ({ file }) => (
        <div className={`flex items-center justify-between rounded-lg py-2 px-3 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
            <div className="flex items-center min-w-0 flex-1">
                <FaFile className={`flex-shrink-0 text-purple-500 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                <span className={`text-sm truncate ${isDark ? 'text-purple-400' : 'text-purple-800'}`}>{file.file_name}</span>
                <span className={`text-xs flex-shrink-0 ${isDark ? 'text-white/50' : 'text-gray-500'} ${isRtl ? 'mr-2' : 'ml-2'}`}>
                    ({formatFileSize(file.file_size)})
                </span>
            </div>
            <button onClick={() => handleDownload(file)} className="text-purple-400 hover:text-purple-300">
                <FaDownload size={14} />
            </button>
        </div>
    );

    const allFiles = [...(selectedLocation.house_plans || []), ...(selectedLocation.license_documents || []), ...(selectedLocation.additional_documents || [])];
    const displayOwners = Array.isArray(selectedLocation.owners) ? selectedLocation.owners : selectedLocation.owners ? [selectedLocation.owners] : [];

    const openImageViewer = (index) => {
        setCurrentImageIndex(index);
        setImageViewerOpen(true);
    };
    const closeImageViewer = () => setImageViewerOpen(false);
    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % (selectedLocation.house_photos?.length || 1));
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + (selectedLocation.house_photos?.length || 1)) % (selectedLocation.house_photos?.length || 1));

    const statusKey = `licenseStatuses.${selectedLocation.license_status}`;
    const propertyTypeKey = `propertyTypes.${selectedLocation.property_type || 'residential'}`;

    return (
        <>
            <div className={`h-full flex flex-col ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`flex-shrink-0 p-4 border-b flex justify-between items-center ${isDark ? 'border-white/20' : 'border-black/10'}`}>
                    <div>
                        <h3 className="text-lg font-semibold truncate pr-4">{selectedLocation.name || t('details.title')}</h3>
                    </div>
                    <button
                        className={`p-2 rounded-full ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'}`}
                        onClick={onClose}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <Section theme={theme} title={t('details.sections.propertyInfo')} isOpen={openSections.propertyInfo} onToggle={() => toggleSection('propertyInfo')}>
                        <InfoField label={t('details.labels.licenseStatus')}>
                            <div className="flex items-center">
                                <span className={`h-2 w-2 rounded-full ${isRtl ? 'ml-2' : 'mr-2'}`} style={{ backgroundColor: statusInfo.primary }}></span>
                                <span className="capitalize">{t(statusKey, selectedLocation.license_status.replace('_', ' '))}</span>
                            </div>
                        </InfoField>
                        <InfoField label={t('details.labels.propertyType')} value={t(propertyTypeKey, selectedLocation.property_type || 'Residential')} />
                        <InfoField label={t('details.labels.address')} value={selectedLocation.address} />
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label={t('details.labels.city')} value={selectedLocation.city} />
                            <InfoField label={t('details.labels.country')} value={selectedLocation.country} />
                        </div>
                    </Section>

                    <Section theme={theme} title={t('details.sections.history')} isOpen={openSections.historyInfo} onToggle={() => toggleSection('historyInfo')}>
                        {isLoadingHistory ? (
                            <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('common.loadingHistory')}</div>
                        ) : history.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {history.map(entry => (
                                    <div key={entry.id} className={`p-3 border-l-2 border-cyan-500 rounded-r-lg ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm font-semibold flex items-center">
                                                <FaUser className={`text-cyan-400 ${isRtl ? 'ml-2' : 'mr-2'}`} /> {entry.user_name}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatTimestamp(entry.created_at)}</p>
                                        </div>
                                        <ul className={`list-disc list-inside space-y-1 pl-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {renderChanges(entry)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center text-sm py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('common.noHistory')}</div>
                        )}
                    </Section>

                    <div ref={ownersSectionRef}>
                        <Section theme={theme} title={t('details.sections.owners')} isOpen={openSections.ownerInfo} onToggle={() => toggleSection('ownerInfo')} highlighted={highlightedSection === 'owners'}>
                            {displayOwners.length > 0 ? (
                                <div className="space-y-4">
                                    {displayOwners.map((owner, index) => (
                                        <React.Fragment key={index}>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InfoField label={t('details.labels.firstName')} value={owner.first_name} />
                                                <InfoField label={t('details.labels.lastName')} value={owner.last_name} />
                                                <InfoField label={t('details.labels.idNumber')} value={owner.id_number} />
                                                <InfoField label={t('details.labels.phone')} value={owner.phone} />
                                                <InfoField label={t('details.labels.email')} value={owner.email} />
                                            </div>
                                            {index < displayOwners.length - 1 && (
                                                <div className={`border-t my-4 ${isDark ? 'border-white border-opacity-10' : 'border-black border-opacity-10'}`}></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-4 ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'}`}>
                                    {t('common.noOwnerInfo')}
                                </div>
                            )}
                        </Section>
                    </div>

                    <Section theme={theme} title={t('details.sections.parcelInfo')} isOpen={openSections.parcelInfo} onToggle={() => toggleSection('parcelInfo')}>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label={t('details.labels.gushNum')} value={selectedLocation.gush_num} />
                            <InfoField label={t('details.labels.parcelNum')} value={selectedLocation.parcel_num} />
                        </div>
                    </Section>

                    <Section theme={theme} title={t('details.sections.photos')} isOpen={openSections.photos} onToggle={() => toggleSection('photos')}>
                        {selectedLocation.house_photos && selectedLocation.house_photos.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {selectedLocation.house_photos.map((photo, index) => (
                                    <motion.div
                                        key={photo.id}
                                        className="relative aspect-square rounded-md overflow-hidden cursor-pointer group"
                                        onClick={() => openImageViewer(index)}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <SecureImage src={`http://localhost:5001/api/locations${photo.file_url}`} alt={photo.file_name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <FaEye className="text-white text-2xl" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-sm text-center py-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{t('common.noPhotos')}</p>
                        )}
                    </Section>

                    <div ref={filesSectionRef}>
                        <Section theme={theme} title={t('details.sections.attachedFiles')} isOpen={openSections.files} onToggle={() => toggleSection('files')} highlighted={highlightedSection === 'files'}>
                            {allFiles.length > 0 ? (
                                <div className="space-y-2">
                                    {allFiles.map((file, i) => <FileListItem key={i} file={file} />)}
                                </div>
                            ) : (
                                <p className={`text-sm text-center py-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{t('common.noFiles')}</p>
                            )}
                        </Section>
                    </div>
                </div>

                <div className={`flex-shrink-0 flex space-x-3 p-4 border-t ${isDark ? 'border-white/20' : 'border-black/10'}`}>
                    <button
                        type="button"
                        className="flex-1 px-4 py-2 border border-red-500/50 text-red-400 bg-red-500/10 rounded-md flex items-center justify-center space-x-2"
                        onClick={() => onDelete(selectedLocation)}
                    >
                        <FaTrash />
                        <span>{t('buttons.delete')}</span>
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-white rounded-md font-medium flex items-center justify-center space-x-2"
                        style={{ background: currentTheme.goldGradient }}
                        onClick={() => onEdit(selectedLocation)}
                    >
                        <FaEdit />
                        <span>{t('buttons.editProperty')}</span>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isImageViewerOpen && selectedLocation.house_photos && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeImageViewer}
                    >
                        <motion.div
                            className="relative w-full h-full max-w-4xl max-h-[80vh] flex flex-col"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 p-2 z-10 flex space-x-2">
                                <button
                                    onClick={() => handleDownload(selectedLocation.house_photos[currentImageIndex])}
                                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                                >
                                    <FaDownload />
                                </button>
                                <button
                                    onClick={closeImageViewer}
                                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <SecureImage
                                src={`http://localhost:5001/api/locations${selectedLocation.house_photos[currentImageIndex].file_url}`}
                                alt={selectedLocation.house_photos[currentImageIndex].file_name}
                                className="w-full h-full object-contain"
                            />
                            <div className="text-center text-white py-2 text-sm">
                                {selectedLocation.house_photos[currentImageIndex].file_name}
                            </div>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70"
                            >
                                &#10094;
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70"
                            >
                                &#10095;
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const LuxuryNotificationPanel = ({ notifications, user, onClose, onClear, onNotificationClick, theme }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const isDark = theme === 'dark';

    const getActionVerb = (actionType, tense = 'past') => {
        let verb = 'modified';
        if (actionType.includes('created')) verb = 'create';
        if (actionType.includes('updated')) verb = 'update';
        if (actionType.includes('deleted')) verb = 'delete';
        
        if (tense === 'past') {
            return t(`verbs.past.${verb}`, `${verb}d`);
        }
        return t(`verbs.base.${verb}`, verb);
    };

    return (
        <div className="h-full flex flex-col">
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white border-opacity-20 text-white' : 'border-black border-opacity-10 text-gray-900'}`}>
                <h3 className="text-lg font-semibold flex items-center">
                    <FaBell className={isRtl ? 'ml-2' : 'mr-2'} /> {t('notifications.title')}
                </h3>
                <button
                    className={`p-1 rounded-md transition-all duration-200 ${isDark ? 'text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10' : 'text-gray-600 hover:text-gray-900 hover:bg-black hover:bg-opacity-10'}`}
                    onClick={onClose}
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className={`text-center p-8 text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        {t('notifications.noActivity')}
                    </p>
                ) : (
                    <div className={`${isDark ? 'divide-y divide-white/10' : 'divide-y divide-black/10'}`}>
                        {notifications.map(notif => {
                            const isSeen = notif.isSeen;
                            
                            let message;
                            let byLine;

                            if (notif.isTargeted) {
                                const baseVerb = getActionVerb(notif.action_type, 'base');
                                message = `Your request to ${baseVerb} '${notif.location_name}' has been approved.`;
                                byLine = `Approved by: ${notif.actorName}`;
                            } else {
                                const pastTenseVerb = getActionVerb(notif.action_type, 'past');
                                const actorDisplayName = (user && user.id === notif.actor_user_id) 
                                    ? t('notifications.you', 'You') 
                                    : notif.actorName;
                                message = `${actorDisplayName} ${pastTenseVerb} '${notif.location_name}'.`;
                                byLine = null;
                            }

                            const notificationClasses = `
                                w-full text-left p-3 transition-colors 
                                ${notif.location_id ? (isDark ? 'cursor-pointer hover:bg-white/5' : 'cursor-pointer hover:bg-black/5') : 'cursor-default'} 
                                ${!isSeen && (isDark ? 'bg-purple-900/20' : 'bg-purple-100')}
                            `;

                            return (
                                <motion.button
                                    key={notif.id}
                                    onClick={() => notif.location_id && onNotificationClick(notif)}
                                    className={notificationClasses}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <p className={`text-sm ${isSeen ? (isDark ? 'text-white/70' : 'text-gray-600') : (isDark ? 'text-white' : 'text-gray-900')}`}>{message}</p>
                                    <div className={`text-xs mt-1 flex items-center ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                        {byLine && (
                                            <>
                                                <FaUserTie className={isRtl ? 'ml-1.5' : 'mr-1.5'} />
                                                <span>{byLine}</span>
                                                <span className="mx-1.5">&middot;</span>
                                            </>
                                        )}
                                        <FaClock className={isRtl ? 'ml-1.5' : 'mr-1.5'} />
                                        <span>{formatTimeAgo(notif.created_at)}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>
            {notifications.length > 0 && (
                <div className={`p-2 border-t ${isDark ? 'border-white/20' : 'border-black/10'}`}>
                    <button
                        onClick={onClear}
                        className={`w-full text-center text-sm py-2 rounded-md ${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-black/5'}`}
                    >
                        {t('buttons.clearAll')}
                    </button>
                </div>
            )}
        </div>
    );
};

const LuxuryMapHeader = ({ onClose, allLocations, onToggleNotifications, unreadNotifications, user, onLogout, selectedLocation, onOwnersClick, onFilesClick, theme, onToggleTheme, currentTheme }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const animations = luxuryAnimations(isRtl);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const isDark = theme === 'dark';

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'he' : 'en';
        i18n.changeLanguage(newLang);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setIsMobileMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const MenuItem = ({ icon, text, onClick }) => (
        <button
            onClick={onClick}
            className={`flex w-full items-center space-x-3 px-4 py-3 text-left text-sm transition-colors ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-800 hover:bg-black/5'}`}
        >
            {icon}
            <span>{text}</span>
        </button>
    );

    return (
        <motion.div
            className="relative z-10 mb-4"
            variants={animations.fadeIn}
            initial="initial"
            animate="animate"
        >
            <div
                className="rounded-xl p-4 md:p-6"
                style={{
                    boxShadow: currentTheme.premiumShadow,
                    background: currentTheme.glassGradient,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
            >
                {/* Main Header Content */}
                <div className="flex w-full flex-wrap items-center justify-between">
                    {/* Left Side / Centered Logo on small screens */}
                    <div className="flex flex-1 items-center sm:flex-none">
                        <motion.div
                            className="relative flex h-20 w-32 flex-shrink-0 items-center justify-center sm:justify-start"
                            whileHover={{ scale: 1.05, rotate: -2, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
                        >
                            <img src={isDark ? logoDark : logoLight} alt="BSD Logo" className="h-full w-full object-contain transition-all duration-300" />
                        </motion.div>
                        <div className="hidden sm:flex sm:flex-col sm:justify-center ml-4">
                            <h1
                                className={`text-lg font-bold leading-tight tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                            >
                                {t('header.title')}
                            </h1>
                        </div>
                    </div>

                    {/* Center Section (Buttons) - Visible on medium screens and up */}
                    <div className="hidden md:flex flex-1 items-center justify-center">
                        <AnimatePresence>
                            {selectedLocation && (
                                <motion.div
                                    className="flex items-center justify-center space-x-4"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    <motion.button
                                        onClick={onOwnersClick}
                                        className="relative flex items-center justify-center space-x-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold text-white"
                                        style={{ background: '#0D253F', border: '1px solid #1A3A5A' }}
                                        whileHover="hover"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to right, #085078, #85D8CE)' }} initial={{ opacity: 0 }} variants={{ hover: { opacity: 1 } }} />
                                        <div className="relative z-10 flex items-center justify-center space-x-2"><FaUserTie /> <span>{t('header.owners')}</span></div>
                                    </motion.button>
                                    <motion.button
                                        onClick={onFilesClick}
                                        className="relative flex items-center justify-center space-x-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold text-white"
                                        style={{ background: '#0D253F', border: '1px solid #1A3A5A' }}
                                        whileHover="hover"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to right, #085078, #85D8CE)' }} initial={{ opacity: 0 }} variants={{ hover: { opacity: 1 } }} />
                                        <div className="relative z-10 flex items-center justify-center space-x-2"><FaFile /> <span>{t('header.files')}</span></div>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-shrink-0 items-center">
                        <div className="hidden items-center space-x-1 sm:space-x-2 md:flex md:space-x-4">
                            <motion.button
                                onClick={toggleLanguage}
                                className={`flex items-center space-x-2 rounded-lg p-2 transition-colors ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
                                whileHover={{ scale: 1.05 }}
                                title={t('header.changeLanguage')}
                            >
                                <FaGlobe className="h-5 w-5 md:h-6 md:w-6" />
                                <span className="text-sm font-semibold">{i18n.language.toUpperCase()}</span>
                            </motion.button>
                            <motion.button
                                onClick={onToggleTheme}
                                className={`rounded-lg p-2 transition-colors ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
                                whileHover={{ scale: 1.05 }}
                                title={t('header.changeTheme')}
                            >
                                {isDark ? <FaSun className="h-5 w-5 md:h-6 md:w-6" /> : <FaMoon className="h-5 w-5 md:h-6 md:w-6" />}
                            </motion.button>
                            <motion.button
                                onClick={onToggleNotifications}
                                className={`relative rounded-lg p-2 transition-colors ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <FaBell className="h-5 w-5 md:h-6 md:w-6" />
                                {unreadNotifications > 0 && <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
                            </motion.button>
                            <div className="relative" ref={userMenuRef}>
                                <motion.button onClick={() => setIsUserMenuOpen(p => !p)} className="flex items-center space-x-2 rounded-lg p-1" whileHover={{ scale: 1.02 }}>
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? 'bg-white/20' : 'bg-black/5'}`}>
                                        {user?.avatar ? <img src={user.avatar} alt={user.fullName} className="h-8 w-8 rounded-full" /> : <FaUser className={`h-4 w-4 ${isDark ? 'text-white' : 'text-gray-800'}`} />}
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.fullName || 'User'}</span>
                                    <FaChevronDown className={`h-3 w-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </motion.button>
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            variants={animations.fadeIn}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg shadow-lg"
                                            style={{
                                                background: currentTheme.glassGradient,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                                            }}
                                        >
                                            <MenuItem icon={<FaSignOutAlt />} text={t('logout')} onClick={onLogout} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <motion.button
                                onClick={onClose}
                                className={`rounded-lg p-2 transition-colors ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <FaTimes className="h-5 w-5 md:h-6 md:w-6" />
                            </motion.button>
                        </div>
                        <div className="flex items-center md:hidden">
                            <motion.button
                                onClick={() => setIsMobileMenuOpen(p => !p)}
                                className={`rounded-lg p-2 transition-colors ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
                                whileTap={{ scale: 0.9 }}
                            >
                                {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Additional Buttons on Mobile when location is selected */}
                <div className="w-full flex justify-center md:hidden">
                    <AnimatePresence>
                        {selectedLocation && (
                            <motion.div
                                className="flex items-center justify-center space-x-4 mt-4"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            >
                                <motion.button
                                    onClick={onOwnersClick}
                                    className="relative flex items-center justify-center space-x-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold text-white"
                                    style={{ background: '#0D253F', border: '1px solid #1A3A5A' }}
                                    whileHover="hover"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to right, #085078, #85D8CE)' }} initial={{ opacity: 0 }} variants={{ hover: { opacity: 1 } }} />
                                    <div className="relative z-10 flex items-center justify-center space-x-2"><FaUserTie /> <span>{t('header.owners')}</span></div>
                                </motion.button>
                                <motion.button
                                    onClick={onFilesClick}
                                    className="relative flex items-center justify-center space-x-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold text-white"
                                    style={{ background: '#0D253F', border: '1px solid #1A3A5A' }}
                                    whileHover="hover"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to right, #085078, #85D8CE)' }} initial={{ opacity: 0 }} variants={{ hover: { opacity: 1 } }} />
                                    <div className="relative z-10 flex items-center justify-center space-x-2"><FaFile /> <span>{t('header.files')}</span></div>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        className="absolute top-full right-4 mt-2 w-64 origin-top-right rounded-lg shadow-lg md:hidden"
                        style={{
                            background: isDark ? 'rgba(30, 41, 59, 0.85)' : currentTheme.glassGradient,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                        }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <div className="py-2">
                                <MenuItem icon={<FaGlobe />} text={`${t('header.changeLanguage')} (${i18n.language.toUpperCase()})`} onClick={toggleLanguage} />
                                <MenuItem icon={isDark ? <FaSun /> : <FaMoon />} text={t('header.changeTheme')} onClick={() => { onToggleTheme(); setIsMobileMenuOpen(false); }} />
                                <MenuItem icon={<FaBell />} text={t('notifications.title')} onClick={() => { onToggleNotifications(); setIsMobileMenuOpen(false); }} />
                            </div>
                            <div className="py-2">
                                <MenuItem icon={<FaSignOutAlt />} text={t('logout')} onClick={onLogout} />
                                <MenuItem icon={<FaTimes />} text={t('buttons.close')} onClick={onClose} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <StatisticsDashboard allLocations={allLocations} />
        </motion.div>
    );
};

const LuxuryLayerControlPanel = ({ baseLayers, activeBaseLayer, onBaseLayerChange, overlayLayers, activeOverlays, onToggleOverlay, overlayOpacities, onOpacityChange, onClose, theme }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const animations = luxuryAnimations(isRtl);
    const isDark = theme === 'dark';

    return (
        <div className="h-full flex flex-col">
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white border-opacity-20 text-white' : 'border-black border-opacity-10 text-gray-900'}`}>
                <h3 className="text-lg font-semibold">{t('layers.title')}</h3>
                <button
                    className={`p-1 rounded-md transition-all duration-200 ${isDark ? 'text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10' : 'text-gray-600 hover:text-gray-900 hover:bg-black hover:bg-opacity-10'}`}
                    onClick={onClose}
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('layers.baseMaps')}</h4>
                    <motion.div
                        className="grid grid-cols-2 gap-2"
                        variants={animations.staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {baseLayers.map((layer) => {
                            const buttonClasses = `
                                p-3 rounded-md border text-left transition-all duration-200 
                                ${activeBaseLayer === layer.id ?
                                    'border-purple-500 bg-purple-500 bg-opacity-20 text-purple-300' :
                                    (isDark ?
                                        'border-white border-opacity-20 bg-white bg-opacity-10 text-white hover:bg-opacity-20' :
                                        'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                                    )
                                }
                            `;
                            return (
                                <motion.button
                                    key={layer.id}
                                    className={buttonClasses}
                                    onClick={() => onBaseLayerChange(layer.id)}
                                    variants={animations.staggerChild}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className={`flex items-center space-x-2 mb-1 ${activeBaseLayer === layer.id ? (isDark ? 'text-white' : 'text-purple-700') : ''}`}>
                                        <layer.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t(`baseLayers.${layer.id}.name`, layer.name)}</span>
                                    </div>
                                    <p className={`text-xs ${activeBaseLayer === layer.id ? (isDark ? 'text-white/80' : 'text-purple-600/90') : (isDark ? 'text-white/70' : 'text-gray-500')}`}>
                                        {t(`baseLayers.${layer.id}.description`, layer.description)}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
                <div>
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('layers.overlays')}</h4>
                    <motion.div
                        className="space-y-3"
                        variants={animations.staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {overlayLayers.map((layer) => {
                            const isActive = activeOverlays.has(layer.id);
                            const overlayClasses = `
                                p-3 rounded-md border transition-all duration-200 
                                ${isActive ?
                                    'border-purple-500 bg-purple-500 bg-opacity-20' :
                                    (isDark ?
                                        'border-white border-opacity-20 bg-white bg-opacity-10' :
                                        'border-gray-200 bg-white'
                                    )
                                }
                            `;
                            const checkboxClasses = `
                                w-5 h-5 rounded border-2 flex items-center justify-center 
                                transition-all duration-200 flex-shrink-0 
                                ${isActive ?
                                    'border-purple-500 bg-purple-500 text-white' :
                                    (isDark ?
                                        'border-white border-opacity-30 bg-transparent' :
                                        'border-gray-300 bg-transparent'
                                    )
                                }
                            `;

                            return (
                                <motion.div key={layer.id} className={overlayClasses} variants={animations.staggerChild}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <button className={checkboxClasses} onClick={() => onToggleOverlay(layer.id)}>
                                                {isActive && (
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                            <div>
                                                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {t(`overlayLayers.${layer.id}.name`, layer.name)}
                                                </div>
                                                <div className={`text-xs ${isDark ? 'text-white text-opacity-70' : 'text-gray-500'}`}>
                                                    {t(`overlayLayers.${layer.id}.description`, layer.description)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            className={`mt-3 pt-3 border-t ${isDark ? 'border-white border-opacity-20' : 'border-black border-opacity-10'}`}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className={`flex items-center space-x-3 ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>
                                                <span className="text-xs whitespace-nowrap">{t('layers.opacity')}:</span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={overlayOpacities[layer.id] || layer.opacity}
                                                    onChange={(e) => onOpacityChange(layer.id, parseFloat(e.target.value))}
                                                    className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-white bg-opacity-20' : 'bg-gray-300'}`}
                                                />
                                                <span className="text-xs w-8">{Math.round((overlayOpacities[layer.id] || layer.opacity) * 100)}%</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const LuxuryCityNavigationPanel = ({ cities, currentCity, onCitySelect, onClose, theme, currentTheme }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const animations = luxuryAnimations(isRtl);
    const isDark = theme === 'dark';

    return (
        <div className="h-full flex flex-col">
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white border-opacity-20 text-white' : 'border-black border-opacity-10 text-gray-900'}`}>
                <h3 className="text-lg font-semibold">{t('cities.title')}</h3>
                <button
                    className={`p-1 rounded-md transition-all duration-200 ${isDark ? 'text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10' : 'text-gray-600 hover:text-gray-900 hover:bg-black hover:bg-opacity-10'}`}
                    onClick={onClose}
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                <motion.div
                    className="space-y-2"
                    variants={animations.staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {cities.map((city) => {
                        const isCurrent = currentCity ?.id === city.id;
                        const buttonClasses = `
                            w-full p-4 rounded-md border text-left transition-all duration-200 
                            ${isCurrent ?
                                'border-purple-500 bg-purple-500 bg-opacity-20' :
                                (isDark ?
                                    'border-white border-opacity-20 bg-white bg-opacity-10 text-white hover:bg-opacity-20' :
                                    'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                                )
                            }
                        `;
                        return (
                            <motion.button
                                key={city.id}
                                className={buttonClasses}
                                onClick={() => onCitySelect(city)}
                                variants={animations.staggerChild}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className={`text-lg font-semibold ${isCurrent && (isDark ? 'text-white' : 'text-purple-800')}`}>
                                        {t(`cityPresets.${city.id}.name`, city.name)}
                                    </div>
                                    {isCurrent && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full text-white"
                                            style={{ background: currentTheme.goldGradient }}
                                        >
                                            {t('cities.current')}
                                        </span>
                                    )}
                                </div>
                                <div className={`text-sm mb-2 ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>
                                    {t(`cityPresets.${city.id}.description`, city.description)}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'}`}>
                                    {t('cities.zoomLevel')}: {city.zoom}
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

const LuxuryMapSearchSidebar = ({
    onSearch, searchInput, setSearchInput, recentSearches, onRecentSearchClick, isSearching, searchResults,
    onLocationSelect, onGlobalSelect, activeLicenseStatuses, toggleLicenseStatus, onAddProject, onTraceFromImage,
    onToggleCities, onToggleLayers, onToggleFullscreen, isDrawing, drawingPoints, onFinishDrawing, onUndoDrawing,
    isCityPanelOpen, isLayersPanelOpen, isFullscreen, onToggleNotifications, onToggleUserActions, isOrthogonalMode, onToggleOrthogonalMode,
    theme, currentTheme
}) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const animations = luxuryAnimations(isRtl);
    const [isFocused, setIsFocused] = React.useState(false);
    const traceImageInputRef = useRef(null);
    const isDark = theme === 'dark';

    const showDropdown = isFocused && (isSearching || searchResults.local.length > 0 || searchResults.global.length > 0);

    const handleInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearch = () => {
        if (searchInput.trim()) {
            onSearch(searchInput);
        }
    };

    const statuses = [
        { key: 'approved', label: t('licenseStatuses.approved'), color: currentTheme.success },
        { key: 'pending', label: t('licenseStatuses.pending'), color: currentTheme.info },
        { key: 'no_licence', label: t('licenseStatuses.no_licence'), color: currentTheme.error }
    ];

    const searchContainerClasses = `
        flex items-center rounded-lg border transition-all duration-200 ${isRtl ? 'flex-row-reverse' : ''} 
        ${isFocused ?
            'border-purple-500 bg-purple-500 bg-opacity-20' :
            (isDark ?
                'border-white border-opacity-30 bg-white bg-opacity-10' :
                'border-gray-300 bg-white'
            )
        }
    `;

    return (
        <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
            <div className="flex flex-col h-full space-y-6">
                <motion.div variants={animations.staggerChild}>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('search.title')}</h3>
                    <div className="relative">
                        <div className={searchContainerClasses} style={{ backdropFilter: 'blur(10px)' }}>
                            <div className={isRtl ? 'pr-3' : 'pl-3'}>
                                <FaSearch className={`w-4 h-4 ${isDark ? 'text-white text-opacity-70' : 'text-gray-400'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={searchInput}
                                onChange={handleInputChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className={`flex-1 p-3 bg-transparent outline-none ${isDark ? 'text-white placeholder-white placeholder-opacity-70' : 'text-gray-900 placeholder-gray-500'}`}
                            />
                        </div>
                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    className="absolute top-full left-0 right-0 mt-1 rounded-lg z-50 max-h-80 overflow-y-auto"
                                    style={{
                                        background: currentTheme.glassGradient,
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                                        boxShadow: currentTheme.mediumShadow
                                    }}
                                    variants={animations.fadeIn}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {isSearching ? (
                                        <div className={`p-4 text-center ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>{t('search.searching')}</div>
                                    ) : (
                                        <div>
                                            {searchResults.local.length > 0 && (
                                                <div className="p-2">
                                                    <div className={`text-xs p-2 border-b flex items-center ${isDark ? 'text-white text-opacity-50 border-white border-opacity-20' : 'text-gray-500 border-black border-opacity-10'}`}>
                                                        <FaMapMarkerAltIcon className={isRtl ? 'ml-2' : 'mr-2'} /> {t('search.myProperties')} ({searchResults.local.length})
                                                    </div>
                                                    {searchResults.local.map((location) => (
                                                        <motion.button
                                                            key={`local-${location.id}`}
                                                            className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${isDark ? 'text-white hover:bg-white hover:bg-opacity-10' : 'text-gray-900 hover:bg-black hover:bg-opacity-5'}`}
                                                            onClick={() => onLocationSelect(location)}
                                                            whileHover={{ x: 2 }}
                                                        >
                                                            <div className="font-medium">{location.name || t('common.unnamed')}</div>
                                                            <div className={`text-sm ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>{location.address || t('common.noAddress')}</div>
                                                            {location.city && (
                                                                <div className={`text-xs ${isDark ? 'text-white text-opacity-50' : 'text-gray-500'}`}>{location.city}, {location.country || ''}</div>
                                                            )}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults.global.length > 0 && (
                                                <div className="p-2">
                                                    <div className={`text-xs p-2 border-b flex items-center ${isDark ? 'text-white text-opacity-50 border-white border-opacity-20' : 'text-gray-500 border-black border-opacity-10'}`}>
                                                        <FaGlobe className={isRtl ? 'ml-2' : 'mr-2'} /> {t('search.globalPlaces')} ({searchResults.global.length})
                                                    </div>
                                                    {searchResults.global.map((place) => (
                                                        <motion.button
                                                            key={`global-${place.id}`}
                                                            className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${isDark ? 'text-white hover:bg-white hover:bg-opacity-10' : 'text-gray-900 hover:bg-black hover:bg-opacity-5'}`}
                                                            onClick={() => onGlobalSelect(place)}
                                                            whileHover={{ x: 2 }}
                                                        >
                                                            <div className="font-medium">{place.name}</div>
                                                            <div className={`text-sm ${isDark ? 'text-white text-opacity-70' : 'text-gray-600'}`}>{place.place_name}</div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
                <motion.div
                    className="flex-grow flex flex-col space-y-6 overflow-y-auto pb-4"
                    animate={{ opacity: showDropdown ? 0 : 1, y: showDropdown ? -10 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ pointerEvents: showDropdown ? 'none' : 'auto' }}
                >
                    <motion.div variants={animations.staggerChild}>
                        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('search.actions')}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm text-white ${isDrawing ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-purple-600 to-purple-700'}`}
                                onClick={onAddProject}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ boxShadow: currentTheme.glowShadow }}
                            >
                                <FaPlus className="w-4 h-4" />
                                <span>{isDrawing ? t('buttons.cancel') : t('buttons.add')}</span>
                            </motion.button>
                            <motion.button
                                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => traceImageInputRef.current ?.click()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaImage className="w-4 h-4" />
                                <span>{t('buttons.trace')}</span>
                                <input type="file" ref={traceImageInputRef} className="hidden" accept="image/png, image/jpeg, image/gif" onChange={onTraceFromImage} />
                            </motion.button>
                            <motion.button
                                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${isCityPanelOpen ? (isDark ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-800') : (isDark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700')}`}
                                onClick={onToggleCities}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaCity className="w-4 h-4" />
                                <span>{t('buttons.cities')}</span>
                            </motion.button>
                            <motion.button
                                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${isLayersPanelOpen ? (isDark ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-800') : (isDark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700')}`}
                                onClick={onToggleLayers}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaLayerGroup className="w-4 h-4" />
                                <span>{t('buttons.layers')}</span>
                            </motion.button>
                            <motion.button
                                className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${isFullscreen ? (isDark ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-800') : (isDark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700')}`}
                                onClick={onToggleFullscreen}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                title={isFullscreen ? t('buttons.exitFullscreen') : t('buttons.enterFullscreen')}
                            >
                                {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
                                <span>{isFullscreen ? t('buttons.exit') : t('buttons.full')}</span>
                            </motion.button>
                            {/* This is the new button you need to add */}
                            <motion.button
    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700'}`}
    onClick={onToggleUserActions}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    title={t('buttons.mySubmissions', 'My Submissions')}
>
    <FaHistory className="w-4 h-4" />
    <span>{t('buttons.mySubmissions', 'Submissions')}</span>
</motion.button>
                        </div>
                        {isDrawing && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <motion.button
                                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700'}`}
                                    onClick={onUndoDrawing}
                                    whileHover={{ scale: 1.02, ... (drawingPoints.length > 0 && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }) }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={drawingPoints.length === 0}
                                >
                                    <FaUndo className="w-4 h-4" />
                                    <span>{t('buttons.undo')}</span>
                                </motion.button>
                                <motion.button
                                    className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={onFinishDrawing}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ boxShadow: currentTheme.glowShadow }}
                                    disabled={drawingPoints.length < 3}
                                >
                                    <FaFlagCheckered className="w-4 h-4" />
                                    <span>{t('buttons.finish')}</span>
                                </motion.button>
                            </div>
                        )}
                        {isDrawing && (
                            <motion.div className="mt-3">
                                <motion.button
                                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${isOrthogonalMode ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : (isDark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700')}`}
                                    onClick={onToggleOrthogonalMode}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaRoute className="w-4 h-4" />
                                    <span>{isOrthogonalMode ? t('buttons.orthogonalOn') : t('buttons.orthogonalOff')}</span>
                                </motion.button>
                                {isOrthogonalMode && <div className="mt-2 text-xs text-blue-400 text-center">{t('search.orthogonalHint')}</div>}
                            </motion.div>
                        )}
                    </motion.div>
                    <motion.div variants={animations.staggerChild}>
                        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('search.licenseStatus')}</h4>
                        <motion.div
                            className="space-y-2"
                            variants={animations.staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {statuses.map((status) => {
                                const isActive = activeLicenseStatuses.has(status.key);
                                const buttonClasses = `
                                    w-full p-3 rounded-md border text-left transition-all duration-200 
                                    ${isActive ?
                                        'border-purple-500 bg-purple-500 bg-opacity-20' :
                                        (isDark ?
                                            'border-white border-opacity-20 bg-white bg-opacity-10' :
                                            'border-gray-200 bg-white'
                                        )
                                    }
                                `;

                                return (
                                    <motion.button
                                        key={status.key}
                                        className={buttonClasses}
                                        onClick={() => toggleLicenseStatus(status.key)}
                                        variants={animations.staggerChild}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{status.label}</span>
                                            </div>
                                            {isActive && (
                                                <div className="w-5 h-5 rounded border-2 border-purple-500 bg-purple-500 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                    {recentSearches.length > 0 && (
                        <motion.div className="flex-grow" variants={animations.staggerChild}>
                            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('search.recentSearches')}</h4>
                            <div className="space-y-1">
                                {recentSearches.slice(0, 5).map((search, index) => (
                                    <motion.button
                                        key={index}
                                        className={`w-full text-left p-2 rounded-md transition-all duration-200 ${isDark ? 'text-white hover:bg-white hover:bg-opacity-10' : 'text-gray-800 hover:bg-black hover:bg-opacity-5'}`}
                                        onClick={() => onRecentSearchClick(search)}
                                        whileHover={{ x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <FaSearch className={`w-3 h-3 ${isDark ? 'text-white text-opacity-50' : 'text-gray-400'}`} />
                                            <span className="text-sm truncate">{search}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

// MODIFIED AdjustableImageOverlay Component
const AdjustableImageOverlay = ({ imageUrl, imageTransform, onTransformChange, opacity, currentTheme, isInteractive }) => {
    const map = useMap();
    const { center, size, rotation } = imageTransform;
    const [activeHandle, setActiveHandle] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const startDataRef = useRef(null);

    const rotatePoint = (point, angleDegrees) => {
        const angleRad = angleDegrees * (Math.PI / 180);
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        const { x, y } = point;
        return L.point(x * cosA - y * sinA, x * sinA + y * cosA);
    };

    const getCorner = (center, width, height, angle, corner) => {
        const centerPoint = map.project(center);
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        let cornerVector;
        if (corner === 'tl') cornerVector = L.point(-halfWidth, -halfHeight);
        else if (corner === 'tr') cornerVector = L.point(halfWidth, -halfHeight);
        else if (corner === 'bl') cornerVector = L.point(-halfWidth, halfHeight);
        else if (corner === 'br') cornerVector = L.point(halfWidth, halfHeight);
        else return center;
        const rotatedVector = rotatePoint(cornerVector, angle);
        return map.unproject(centerPoint.add(rotatedVector));
    };

    const imageWidth = size[0];
    const imageHeight = size[1];

    const corners = useMemo(() => ({
        tl: getCorner(center, imageWidth, imageHeight, rotation, 'tl'),
        tr: getCorner(center, imageWidth, imageHeight, rotation, 'tr'),
        bl: getCorner(center, imageWidth, imageHeight, rotation, 'bl'),
        br: getCorner(center, imageWidth, imageHeight, rotation, 'br'),
    }), [center, imageWidth, imageHeight, rotation, map]);

    const rotationHandlePosition = useMemo(() => {
        const topMidPoint = map.project(L.latLng((corners.tr.lat + corners.tl.lat) / 2, (corners.tr.lng + corners.tl.lng) / 2));
        const offset = L.point(0, -30);
        return map.unproject(topMidPoint.add(offset));
    }, [corners, map]);

    const handleMouseDown = (handle, e) => {
        if (!isInteractive) return;
        e.originalEvent.stopPropagation();
        map.dragging.disable();
        setActiveHandle(handle);
        setIsDragging(true);
        startDataRef.current = {
            imageTransform: { ...imageTransform },
            centerPoint: map.project(imageTransform.center),
            startEventPoint: map.project(e.latlng),
        };
    };

    const handleMouseMove = (e) => {
        if (!isInteractive || !activeHandle || !isDragging) return;
        const { imageTransform: startTransform, centerPoint, startEventPoint } = startDataRef.current;
        const currentPoint = map.project(e.latlng);
        let newCenter = startTransform.center;
        let newSize = startTransform.size;
        let newRotation = startTransform.rotation;

        if (activeHandle === 'move') {
            const offset = currentPoint.subtract(startEventPoint);
            newCenter = map.unproject(centerPoint.add(offset));
        } else if (activeHandle === 'rotate') {
            const p1 = centerPoint;
            const p2 = currentPoint;
            newRotation = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI) + 90;
        } else {
            const fromCenterToStart = rotatePoint(startEventPoint.subtract(centerPoint), -startTransform.rotation);
            const fromCenterToCurrent = rotatePoint(currentPoint.subtract(centerPoint), -startTransform.rotation);
            let scaleX = fromCenterToStart.x ? fromCenterToCurrent.x / fromCenterToStart.x : 1;
            let scaleY = fromCenterToStart.y ? fromCenterToCurrent.y / fromCenterToStart.y : 1;
            if (e.originalEvent.shiftKey) {
                const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
                scaleX = avgScale * Math.sign(scaleX || 1);
                scaleY = avgScale * Math.sign(scaleY || 1);
            }
            newSize = [Math.abs(startTransform.size[0] * scaleX), Math.abs(startTransform.size[1] * scaleY)];
        }
        onTransformChange({ center: newCenter, size: newSize, rotation: newRotation });
    };

    const handleMouseUp = () => {
        if (!isInteractive || !activeHandle) return;
        map.dragging.enable();
        setActiveHandle(null);
        setIsDragging(false);
        startDataRef.current = null;
    };
    
    // Only listen to map events if in interactive mode
   useMapEvents(
    isInteractive ? {
        mousemove: handleMouseMove,
        mouseup: handleMouseUp,
    } : {} // Pass an empty object when not interactive
);

    const handleIcon = L.divIcon({ className: 'transform-handle', iconSize: [16, 16], iconAnchor: [8, 8] });
    const rotateHandleIcon = L.divIcon({ className: 'transform-handle', html: '<div style="background: rgba(59, 130, 246, 0.9); border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
    const moveIcon = L.divIcon({ className: 'move-handle', html: '<div style="background: rgba(34, 197, 94, 0.9); border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
    const imageIcon = L.divIcon({
        className: 'image-trace-icon',
        html: `<div style="position: relative; width: ${imageWidth}px; height: ${imageHeight}px;"><img src="${imageUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(${rotation}deg); transform-origin: center center; opacity: ${opacity}; pointer-events: none; border: 2px dashed ${isInteractive ? currentTheme.accent : 'transparent'}; box-shadow: 0 0 10px rgba(0,0,0,0.3);" /></div>`,
        iconSize: [imageWidth, imageHeight],
        iconAnchor: [imageWidth / 2, imageHeight / 2],
    });

    return (
        <LayerGroup>
            <Marker position={center} icon={imageIcon} zIndexOffset={400} />
            {/* Conditionally render handles based on the isInteractive prop */}
            {isInteractive && (
                <>
                    <Marker position={center} icon={moveIcon} eventHandlers={{ mousedown: (e) => handleMouseDown('move', e) }} />
                    {Object.entries(corners).map(([key, pos]) => (
                        <Marker key={key} position={pos} icon={handleIcon} eventHandlers={{ mousedown: (e) => handleMouseDown(key, e) }} />
                    ))}
                    <Marker position={rotationHandlePosition} icon={rotateHandleIcon} eventHandlers={{ mousedown: (e) => handleMouseDown('rotate', e) }} />
                </>
            )}
        </LayerGroup>
    );
};


// ====================================================================================
// ===== END: ALL SUB-COMPONENTS
// ====================================================================================

const LuxuryMapModal = ({ show, onClose, initialCoords, searchedLocation, onMapAction }) => {
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const currentTheme = useMemo(() => themes[theme], [theme]);

    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';
    const animations = luxuryAnimations(isRtl);
    const { user, logout } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const [actionStatus, setActionStatus] = useState({ isOpen: false, status: 'info', title: '', message: '' });
    const showActionStatus = (status, title, message) => {
        setActionStatus({ isOpen: true, status, title, message });
    };
    const hideActionStatus = () => {
        setActionStatus(prev => ({ ...prev, isOpen: false }));
    };

    const [allLocations, setAllLocations] = React.useState([]);
    const [selectedLocation, setSelectedLocation] = React.useState(null);
    const [selectedLocationCentroid, setSelectedLocationCentroid] = React.useState(null);
    const [activeFormState, setActiveFormState] = React.useState(null);
    const [activeBaseLayer, setActiveBaseLayer] = React.useState('esri-streets');
    const [activeOverlays, setActiveOverlays] = React.useState(new Set(['matzuva-detailed']));
    const [activePanel, setActivePanel] = React.useState(null);
    const [overlayOpacities, setOverlayOpacities] = React.useState({ 'matzuva-detailed': 0.3 });
    const [currentCity, setCurrentCity] = React.useState(null);
    const [activeLicenseStatuses, setActiveLicenseStatuses] = React.useState(new Set(['approved', 'pending', 'no_licence']));
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [drawingPoints, setDrawingPoints] = React.useState([]);
    const [showDrawingPrompt, setShowDrawingPrompt] = React.useState(false);
    const [isSplitMode, setIsSplitMode] = React.useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [recentSearches, setRecentSearches] = React.useState([]);
    const [highlightedSection, setHighlightedSection] = React.useState(null);
    const [hoveredLocation, setHoveredLocation] = React.useState(null);
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState({ local: [], global: [] });
    const [isSearching, setIsSearching] = React.useState(false);
    const [editingLocation, setEditingLocation] = React.useState(null);
    const [mousePosition, setMousePosition] = React.useState(null);
    const [isOrthogonalMode, setIsOrthogonalMode] = React.useState(false);
    const [orthogonalDirection, setOrthogonalDirection] = React.useState(null);
    const [tracingImage, setTracingImage] = useState(null);
    const [tracingImageOpacity, setTracingImageOpacity] = useState(0.7);
    const [isImageTransformMode, setIsImageTransformMode] = useState(false);
    const [imageTransform, setImageTransform] = useState({ center: null, size: [400, 300], rotation: 0 });
    const [deletionError, setDeletionError] = useState({ isOpen: false, children: [] });

    const mapRef = React.useRef(null);
    const matzuvaPreset = CITY_PRESETS.find(city => city.id === 'matzuva');
    const ownersSectionRef = React.useRef(null);
    const filesSectionRef = React.useRef(null);
    const pendingPolygonRef = React.useRef(null);
  const rotatePoint = (point, angleDegrees) => {
        const angleRad = angleDegrees * (Math.PI / 180);
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        const { x, y } = point;
        return L.point(x * cosA - y * sinA, x * sinA + y * cosA);
    };

    const getCorner = useCallback((center, width, height, angle, corner) => {
        const map = mapRef.current;
        if (!map) return center; // Return center if map is not ready

        const centerPoint = map.project(center);
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        let cornerVector;
        if (corner === 'tl') cornerVector = L.point(-halfWidth, -halfHeight);
        else if (corner === 'tr') cornerVector = L.point(halfWidth, -halfHeight);
        else if (corner === 'bl') cornerVector = L.point(-halfWidth, halfHeight);
        else if (corner === 'br') cornerVector = L.point(halfWidth, halfHeight);
        else return center;

        const rotatedVector = rotatePoint(cornerVector, angle);
        return map.unproject(centerPoint.add(rotatedVector));
    }, [mapRef]);
    const pendingLocationCenter = useMemo(() => {
        if (!searchedLocation?.isPending) return null;
        const coordsData = searchedLocation.boundary_coords || searchedLocation.boundaryCoords;
        if (coordsData?.coordinates?.[0]?.length) {
            const flippedCoords = coordsData.coordinates[0].map(p => [p[1], p[0]]);
            const bounds = L.polygon(flippedCoords).getBounds();
            return bounds.getCenter();
        }
        return null;
    }, [searchedLocation]);

    useEffect(() => {
        if (show && searchedLocation && mapRef.current) {
            const map = mapRef.current;
            setTimeout(() => {
                map.invalidateSize();
                const coordsData = searchedLocation.boundary_coords || searchedLocation.boundaryCoords;
                if (coordsData?.coordinates?.[0]?.length) {
                    const coords = coordsData.coordinates[0].map(p => [p[1], p[0]]);
                    const bounds = L.polygon(coords).getBounds();
                    if (bounds.isValid()) {
                        map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5, maxZoom: 18 });
                    }
                }
            }, 250);
        }
    }, [show, searchedLocation]);

    const currentBaseLayer = React.useMemo(() => {
        return BASE_LAYERS.find(layer => layer.id === activeBaseLayer) || BASE_LAYERS[0];
    }, [activeBaseLayer]);

    const drawingMarkerIcon = L.divIcon({ className: 'drawing-marker-icon', iconSize: [8, 8], iconAnchor: [4, 4] });
    const draggableMarkerIcon = L.divIcon({ className: 'drawing-marker-icon leaflet-marker-draggable', iconSize: [12, 12], iconAnchor: [6, 6] });

    React.useEffect(() => {
        if (mapRef.current) {
            mapRef.current.getContainer().style.cursor = isDrawing ? 'crosshair' : '';
        }
    }, [isDrawing]);

    const handleScrollAndHighlight = (ref, sectionName) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setHighlightedSection(sectionName);
            setTimeout(() => setHighlightedSection(null), 1000);
        }
    };

    const fetchAllLocations = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/locations/all', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setAllLocations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch locations:", error);
            showActionStatus('error', t('toasts.loadError'), error.message);
        }
    }, [t]);

    const fetchInitialNotifications = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            } else {
                throw new Error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, []);

    useEffect(() => {
        if (socket) {
            const handleNewNotification = (newNotification) => {
                setNotifications(prev => [newNotification, ...prev].slice(0, 30));
            };
            socket.on('new_notification', handleNewNotification);
            return () => {
                socket.off('new_notification', handleNewNotification);
            };
        }
    }, [socket]);

    useEffect(() => {
        const count = notifications.filter(n => !n.isSeen).length;
        setUnreadCount(count);
    }, [notifications]);

    const clearAllNotifications = React.useCallback(async () => {
        setNotifications([]);
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5001/api/notifications/clear', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
            showActionStatus('success', 'Cleared!', t('toasts.notificationsCleared'));
        } catch (error) {
            console.error("Failed to clear notifications on server:", error);
            showActionStatus('error', t('errors.generic'), 'Could not clear notifications on the server.');
            fetchInitialNotifications();
        }
    }, [t, fetchInitialNotifications]);

    const handleTogglePanel = async (panel) => {
        if (panel === 'notifications' && activePanel !== 'notifications') {
            const unseenIds = notifications.filter(n => !n.isSeen).map(n => n.id);
            if (unseenIds.length > 0) {
                setNotifications(prev => prev.map(n => (unseenIds.includes(n.id) ? { ...n, isSeen: true } : n)));
                try {
                    const token = localStorage.getItem('token');
                    await fetch('http://localhost:5001/api/notifications/seen', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ notificationIds: unseenIds })
                    });
                } catch (error) {
                    console.error("Failed to mark notifications as seen on server:", error);
                }
            }
        }
        setActivePanel(activePanel === panel ? null : panel);
    };

    const computeCentroid = React.useCallback((coords) => {
        if (!coords || coords.length === 0) return null;
        let lat = 0, lng = 0;
        coords.forEach(point => {
            lat += point[0];
            lng += point[1];
        });
        return [lat / coords.length, lng / coords.length];
    }, []);

    const setSelectedLocationAndCentroid = React.useCallback((location) => {
        setSelectedLocation(location);
        if (location && location.boundary_coords ?.coordinates ?.[0]) {
            const polygonPoints = location.boundary_coords.coordinates[0].map(p => [p[1], p[0]]);
            const centroid = computeCentroid(polygonPoints);
            setSelectedLocationCentroid(centroid);
        } else {
            setSelectedLocationCentroid(null);
        }
    }, [computeCentroid]);

    const panToLocation = React.useCallback((location) => {
        if (!mapRef.current || !location.boundary_coords ?.coordinates ?.[0] ?.length) return;
        const flipped = location.boundary_coords.coordinates[0].map(p => [p[1], p[0]]);
        mapRef.current.flyToBounds(L.polygon(flipped).getBounds(), { padding: [50, 50], duration: 1.2, easeLinearity: 0.5 });
    }, []);

    const panToCoords = React.useCallback((coords, zoom = 14) => {
        if (mapRef.current && coords) {
            mapRef.current.flyTo(coords, zoom, { duration: 1.5 });
        }
    }, []);

    const isDrawingRef = React.useRef(isDrawing);
    React.useEffect(() => {
        isDrawingRef.current = isDrawing;
    }, [isDrawing]);

    const handleMapClick = React.useCallback((e) => {
        if (isDrawing) {
            const newPoint = [e.latlng.lat, e.latlng.lng];
            if (isOrthogonalMode && drawingPoints.length > 0) {
                const lastPoint = drawingPoints[drawingPoints.length - 1];
                const latDiff = Math.abs(newPoint[0] - lastPoint[0]);
                const lngDiff = Math.abs(newPoint[1] - lastPoint[1]);
                if (latDiff > lngDiff) {
                    setOrthogonalDirection('vertical');
                    setDrawingPoints(prev => [...prev, [newPoint[0], lastPoint[1]]]);
                } else {
                    setOrthogonalDirection('horizontal');
                    setDrawingPoints(prev => [...prev, [lastPoint[0], newPoint[1]]]);
                }
            } else {
                setDrawingPoints(prev => [...prev, newPoint]);
            }
        }
    }, [isDrawing, isOrthogonalMode, drawingPoints]);

    const handleMouseMove = React.useCallback((e) => {
        setMousePosition(e.latlng);
        if (isDrawing && isOrthogonalMode && drawingPoints.length > 0) {
            const lastPoint = drawingPoints[drawingPoints.length - 1];
            const latDiff = Math.abs(e.latlng.lat - lastPoint[0]);
            const lngDiff = Math.abs(e.latlng.lng - lastPoint[1]);
            if (latDiff > lngDiff) {
                setOrthogonalDirection('vertical');
            } else {
                setOrthogonalDirection('horizontal');
            }
        }
    }, [isDrawing, isOrthogonalMode, drawingPoints]);

    const handleUndoDrawingPoint = React.useCallback(() => setDrawingPoints(prev => prev.slice(0, -1)), []);

    const toggleDrawing = React.useCallback(() => {
        if (!isDrawing) {
            setShowDrawingPrompt(true);
            setActiveFormState(null);
            setIsOrthogonalMode(false);
            setOrthogonalDirection(null);
        } else {
            setIsDrawing(false);
            setIsOrthogonalMode(false);
            setOrthogonalDirection(null);
            setDrawingPoints([]);
            if (tracingImage) {
                URL.revokeObjectURL(tracingImage);
                setTracingImage(null);
                setIsImageTransformMode(false);
            }
        }
    }, [isDrawing, tracingImage]);

    const toggleOrthogonalMode = React.useCallback(() => {
        setIsOrthogonalMode(prev => !prev);
    }, []);

    const finishDrawing = React.useCallback(async () => {
        if (drawingPoints.length < 3) {
            showActionStatus('warning', t('drawPrompt.invalidShape'), t('toasts.need3Points'));
            return;
        }
        let finalPolygonPoints = [...drawingPoints];
        if (isOrthogonalMode) {
            const firstPoint = drawingPoints[0];
            const lastPoint = drawingPoints[drawingPoints.length - 1];
            const latDiff = Math.abs(firstPoint[0] - lastPoint[0]);
            const lngDiff = Math.abs(firstPoint[1] - lastPoint[1]);
            if (latDiff > lngDiff) {
                finalPolygonPoints[0] = [firstPoint[0], lastPoint[1]];
            } else {
                finalPolygonPoints[0] = [lastPoint[0], firstPoint[1]];
            }
        }
        setIsDrawing(false);
        setIsOrthogonalMode(false);
        setOrthogonalDirection(null);
        setDrawingPoints([]);

        let foundParentLocation = null;
        const newPolygonGeoJSON = turf.polygon([[...finalPolygonPoints.map(p => [p[1], p[0]]), [finalPolygonPoints[0][1], finalPolygonPoints[0][0]]]]);

        for (const loc of allLocations) {
            if (!loc.boundary_coords ?.coordinates ?.[0] ?.length) continue;
            let existingPolygonGeoJSON;
            try {
                existingPolygonGeoJSON = turf.polygon(loc.boundary_coords.coordinates);
            } catch (e) {
                console.warn(`Skipping invalid geometry for location ID: ${loc.id}. Error: ${e.message}`);
                continue;
            }
            if (!existingPolygonGeoJSON) continue;
            if (turf.booleanContains(existingPolygonGeoJSON, newPolygonGeoJSON) || newPolygonGeoJSON.geometry.coordinates[0].filter(v => turf.booleanPointInPolygon(v, existingPolygonGeoJSON)).length >= 2) {
                foundParentLocation = loc;
                break;
            }
        }
        
        let finalParentLocation = null;
        if (foundParentLocation) {
            setIsSplitMode(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/locations/${foundParentLocation.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) {
                    finalParentLocation = await response.json();
                } else {
                    finalParentLocation = foundParentLocation;
                }
            } catch (error) {
                console.error("Failed to fetch full parent location details:", error);
                finalParentLocation = foundParentLocation;
            }
        }

        const centroid = computeCentroid(finalPolygonPoints);
        let addressData = null;
        let parcelInfo = null;
        if (centroid) {
            try {
                const [fetchedAddress, fetchedParcelInfo] = await Promise.all([
                    fetchAddressForPoint(centroid),
                    fetchParcelInfoForPoint(centroid)
                ]);
                addressData = fetchedAddress;
                parcelInfo = fetchedParcelInfo;
            } catch (error) {
                console.error("Failed to fetch address or parcel info:", error);
            }
        }

        setTracingImage(null);
        setIsImageTransformMode(false);
        setActiveFormState({
            type: 'add',
            points: finalPolygonPoints,
            drawnCoords: { type: "Polygon", coordinates: [[...finalPolygonPoints.map(p => [p[1], p[0]]), [finalPolygonPoints[0][1], finalPolygonPoints[0][0]]]] },
            parentLocation: finalParentLocation,
            addressData,
            parcelData: parcelInfo
        });
    }, [drawingPoints, isOrthogonalMode, allLocations, computeCentroid, t]);

    const updateActiveFormPoints = (newPoints) => {
        if (!activeFormState || activeFormState.type !== 'add') return;
        const closedCoords = [...newPoints.map(p => [p[1], p[0]]), [newPoints[0][1], newPoints[0][0]]];
        setActiveFormState(prev => ({ ...prev, points: newPoints, drawnCoords: { type: "Polygon", coordinates: [closedCoords] } }));
    };

    const performSearch = React.useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults({ local: [], global: [] });
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
        try {
            const token = localStorage.getItem('token');
            const localSearchUrl = `http://localhost:5001/api/locations/search?q=${encodeURIComponent(query)}`;
            const globalSearchUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}&language=en&limit=5&types=place,address,poi`;

            const [localResponse, globalResponse] = await Promise.all([
                fetch(localSearchUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(globalSearchUrl)
            ]);

            const localData = localResponse.ok ? await localResponse.json() : [];
            const globalData = globalResponse.ok ? await globalResponse.json() : { features: [] };
            const enhancedLocalResults = localData.map(location => ({ ...location, address: location.address || t('common.noAddress') }));
            const globalResults = globalData.features.map(feature => ({ id: feature.id, name: feature.text, place_name: feature.place_name, center: [feature.center[1], feature.center[0]] }));

            setSearchResults({ local: enhancedLocalResults, global: globalResults });
        } catch (error) {
            console.error("Search failed:", error);
            showActionStatus('error', t('toasts.searchFailed'), error.message);
            setSearchResults({ local: [], global: [] });
        } finally {
            setIsSearching(false);
        }
    }, [apiKey, t]);

    const debouncedSearch = React.useMemo(() => debounce(performSearch, 400), [performSearch]);

    const handleSearchInputChange = (query) => {
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleLocationSelect = React.useCallback(async (location) => {
        if (isDrawingRef.current) {
            showActionStatus('warning', 'Action Required', t('toasts.finishDrawingFirst'));
            return;
        }
        if (!location.house_plans) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/locations/${location.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) {
                    const completeLocation = await response.json();
                    setSelectedLocationAndCentroid(completeLocation);
                } else {
                    setSelectedLocationAndCentroid(location);
                }
            } catch (error) {
                console.error("Error fetching complete location data:", error);
                setSelectedLocationAndCentroid(location);
                showActionStatus('error', t('errors.fetchError'), t('toasts.loadError'));
            }
        } else {
            setSelectedLocationAndCentroid(location);
        }
        setActivePanel(null);
        panToLocation(location);
    }, [setSelectedLocationAndCentroid, panToLocation, t]);

    const handleCloseLocationDetails = React.useCallback(() => {
        setSelectedLocation(null);
        setSelectedLocationCentroid(null);
    }, []);

   const handleDeleteLocation = useCallback(async (location) => {
    const isPrivilegedUser = user ?.role ?.toLowerCase() === 'supervisor' || user ?.role ?.toLowerCase() === 'admin';
    const confirmationMessage = isPrivilegedUser
        ? t('confirmations.deleteImmediate')
        : t('confirmations.deleteRequest');

    if (window.confirm(confirmationMessage)) {
        showActionStatus('loading', 'Deleting...', `Processing request to delete '${location.name}'.`);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/locations/${location.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409 && data.children) {
                    hideActionStatus(); 
                    setDeletionError({ isOpen: true, children: data.children });
                } else {
                    throw new Error(data.message || 'Failed to process request');
                }
                return;
            }

            if (response.status === 202) {
                showActionStatus('info', 'Request Sent', data.message);
                handleCloseLocationDetails();
            } else {
                showActionStatus('success', 'Success!', data.message);
                setAllLocations(prev => prev.filter(loc => loc.id !== location.id));
                handleCloseLocationDetails();
            }
        } catch (error) {
            showActionStatus('error', 'Deletion Failed', error.message);
        }
    }
}, [user, handleCloseLocationDetails, t]);

useEffect(() => {
    if (socket) {
        const handleLocationCreated = (newLocation) => {
            setAllLocations(prev => {
                const exists = prev.some(loc => loc.id === newLocation.id);
                return exists ? prev.map(loc => loc.id === newLocation.id ? newLocation : loc) : [newLocation, ...prev];
            });
        };

        const handleLocationUpdated = (updatedLocation) => {
            setAllLocations(prev => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
            if (selectedLocation?.id === updatedLocation.id) {
                setSelectedLocation(updatedLocation);
            }
        };

        const handleLocationDeleted = (deletedInfo) => {
            setAllLocations(prev => prev.filter(loc => loc.id !== deletedInfo.id));
            if (selectedLocation?.id === deletedInfo.id) {
                handleCloseLocationDetails();
            }
        };
        
        socket.on('location_created', handleLocationCreated);
        socket.on('location_updated', handleLocationUpdated);
        socket.on('location_deleted', handleLocationDeleted);
        
        const handleNewNotification = (newNotification) => {
            setNotifications(prev => [newNotification, ...prev.slice(0, 29)]);
        };
        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('location_created', handleLocationCreated);
            socket.off('location_updated', handleLocationUpdated);
            socket.off('location_deleted', handleLocationDeleted);
            socket.off('new_notification', handleNewNotification);
        };
    }
}, [socket, selectedLocation, handleCloseLocationDetails]);

    const handleEditLocation = React.useCallback((location) => {
        setEditingLocation(location);
    }, []);

    const handleSaveLocation = React.useCallback((savedLocation) => {
        const isEditing = allLocations.some(loc => loc.id === savedLocation.id);
        setAllLocations(prev => isEditing ? prev.map(loc => loc.id === savedLocation.id ? savedLocation : loc) : [savedLocation, ...prev]);
        setActiveFormState(null);
        setSelectedLocationAndCentroid(savedLocation);
    }, [allLocations, setSelectedLocationAndCentroid]);

    const handleEditSave = React.useCallback((updatedLocation) => {
        setAllLocations(prev => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
        setEditingLocation(null);
        setSelectedLocationAndCentroid(updatedLocation);
    }, [setSelectedLocationAndCentroid]);

    const startImageTrace = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showActionStatus('warning', 'Invalid File', t('toasts.invalidImage'));
            return;
        }
        const imageUrl = URL.createObjectURL(file);
        const map = mapRef.current;
        if (!map) return;

        setIsDrawing(false);
        setActiveFormState(null);
        setSelectedLocation(null);
        setImageTransform({ center: map.getCenter(), size: [200, 150], rotation: 0 });
        setTracingImage(imageUrl);
        setIsImageTransformMode(true);
    };

    const handleTraceImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            startImageTrace(e.target.files[0]);
        }
        e.target.value = null;
    };

    const handlePaste = useCallback((event) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                startImageTrace(file);
                event.preventDefault();
                return;
            }
        }
    }, [startImageTrace]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [handlePaste]);

    const cancelImageTrace = () => {
        if (tracingImage) {
            URL.revokeObjectURL(tracingImage);
        }
        setTracingImage(null);
        setIsImageTransformMode(false);
    };

    const lockImageAndStartDrawing = () => {
        setIsImageTransformMode(false);
        setIsDrawing(true);
        setDrawingPoints([]);
    };

    React.useEffect(() => {
        if (show) {
            setCurrentCity(matzuvaPreset);
            setActiveOverlays(new Set(['matzuva-detailed']));
            fetchAllLocations();
            fetchInitialNotifications();
        }
    }, [show, fetchAllLocations, matzuvaPreset, fetchInitialNotifications]);

    React.useEffect(() => {
        if (mapRef.current && show) {
            const map = mapRef.current;
            map.on('click', handleMapClick);
            return () => {
                map.off('click', handleMapClick);
            };
        }
    }, [show, handleMapClick]);

    const toggleOverlay = (overlayId) => setActiveOverlays(prev => {
        const newSet = new Set(prev);
        newSet.has(overlayId) ? newSet.delete(overlayId) : newSet.add(overlayId);
        return newSet;
    });

    const adjustOverlayOpacity = (overlayId, opacity) => setOverlayOpacities(prev => ({ ...prev, [overlayId]: opacity }));

    const toggleLicenseStatus = (status) => setActiveLicenseStatuses(prev => {
        const newSet = new Set(prev);
        newSet.has(status) ? newSet.delete(status) : newSet.add(status);
        return newSet;
    });

    const navigateToCity = React.useCallback((city) => {
        if (mapRef.current) {
            mapRef.current.flyTo(city.center, city.zoom, { duration: 1.5 });
            if (city.preferredBasemap) setActiveBaseLayer(city.preferredBasemap);
            setCurrentCity(city);
        }
    }, []);

    const handleCloseModal = React.useCallback(() => {
        if (searchedLocation?.isPending) {
             onClose();
        } else if (activeFormState || isDrawing || editingLocation || tracingImage) {
            if (window.confirm(t('confirmations.unsavedChanges'))) onClose();
        } else {
            onClose();
        }
    }, [onClose, activeFormState, isDrawing, editingLocation, tracingImage, searchedLocation, t]);

    const handleToggleFullscreen = React.useCallback(() => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationClick = React.useCallback((notification) => {
        if (!notification.location_id) return;
        const location = allLocations.find(loc => loc.id === notification.location_id);
        if (location) {
            setSelectedLocationAndCentroid(location);
            panToLocation(location);
            setActivePanel(null);
        }
    }, [allLocations, setSelectedLocationAndCentroid, panToLocation]);

    const MapEvents = () => {
        useMapEvents({ mousemove: handleMouseMove, click: handleMapClick });
        return null;
    };

    if (!show) return null;
    
    const getInitialCenter = () => {
        if (initialCoords) return initialCoords;
        if (searchedLocation?.center) return searchedLocation.center;
        return matzuvaPreset?.center || [31.5, 34.75];
    };
    
    const getInitialZoom = () => {
        if (initialCoords) return matzuvaPreset?.zoom || 15;
        if (searchedLocation) return 15;
        return matzuvaPreset?.zoom || 8;
    };

     const uniqueLocations = useMemo(() => {
        // Use a Map to ensure each location ID is unique. The last one seen wins.
        const locationMap = new Map(allLocations.map(loc => [loc.id, loc]));
        return Array.from(locationMap.values());
    }, [allLocations]);

    return (
        <AnimatePresence>
            <motion.div
                key="luxury-map-modal"
                className={`fixed inset-0 z-30 flex flex-col p-2 md:p-6 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-200/50'}`}
                variants={animations.modal}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ backdropFilter: 'blur(10px)' }}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                <style>{newMapStyles(theme)}</style>
                <div className="flex flex-col h-full w-full" onClick={(e) => e.stopPropagation()}>
                    <LuxuryMapHeader
                        onClose={handleCloseModal}
                        allLocations={allLocations}
                        unreadNotifications={unreadCount}
                        user={user}
                        onLogout={handleLogout}
                        onToggleNotifications={() => handleTogglePanel('notifications')}
                        selectedLocation={selectedLocation}
                        onOwnersClick={() => handleScrollAndHighlight(ownersSectionRef, 'owners')}
                        onFilesClick={() => handleScrollAndHighlight(filesSectionRef, 'files')}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        currentTheme={currentTheme}
                    />
                    <div className={`flex flex-1 min-h-0 flex-col space-y-4 lg:space-y-0 ${isRtl ? 'lg:space-x-reverse lg:space-x-6' : 'lg:space-x-6'} ${isRtl ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                        <div className="flex-1 relative h-[50vh] lg:h-auto">
                            <motion.div
                                className="w-full h-full rounded-lg overflow-hidden relative"
                                style={{
                                    background: currentTheme.glassGradient,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                                    boxShadow: currentTheme.premiumShadow
                                }}
                                initial={{ scale: 0.98, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
                            >
                                <MapContainer
                                    key={show ? 'map-visible' : 'map-hidden'}
                                    center={getInitialCenter()}
                                    zoom={getInitialZoom()}
                                    maxZoom={22}
                                    scrollWheelZoom
                                    className={`w-full h-full rounded-lg ${isDrawing ? 'cursor-crosshair' : ''}`}
                                    ref={mapRef}
                                    zoomControl={false}
                                >
                                    <MapEvents />
                                    <ZoomControl position="topright" />
                                    {currentBaseLayer.type === 'group' ? (
                                        <LayerGroup>
                                            {currentBaseLayer.layers.map((layer, index) => (
                                                <TileLayer key={index} url={layer.url} attribution={layer.attribution} maxZoom={currentBaseLayer.maxZoom} maxNativeZoom={currentBaseLayer.maxNativeZoom} />
                                            ))}
                                        </LayerGroup>
                                    ) : (
                                        <TileLayer key={currentBaseLayer.id} {...currentBaseLayer} />
                                    )}
                                    {OVERLAY_LAYERS.map(overlay => {
                                        if (!activeOverlays.has(overlay.id)) return null;
                                        const opacity = overlayOpacities[overlay.id] || overlay.opacity;
                                        return <WMSTileLayer key={overlay.id} {...overlay} opacity={opacity} />;
                                    })}

                                    {/* RESTORED: Drawing and Tracing Logic */}
                                   // ===== THIS IS THE NEW, CORRECTED CODE =====
{tracingImage && imageTransform.center && (
    <AdjustableImageOverlay
        imageUrl={tracingImage}
        imageTransform={imageTransform}
        onTransformChange={setImageTransform}
        opacity={tracingImageOpacity}
        currentTheme={currentTheme}
        isInteractive={isImageTransformMode}
    />
)}
                                    {isDrawing && (
                                        <>
                                            {drawingPoints.length >= 2 && mousePosition && (
                                                <Polygon
                                                    positions={
                                                        isOrthogonalMode && drawingPoints.length > 0 ?
                                                            (() => {
                                                                const lastPoint = drawingPoints[drawingPoints.length - 1];
                                                                let previewPoint;
                                                                if (orthogonalDirection === 'horizontal') {
                                                                    previewPoint = [lastPoint[0], mousePosition.lng];
                                                                } else {
                                                                    previewPoint = [mousePosition.lat, lastPoint[1]];
                                                                }
                                                                return [...drawingPoints, previewPoint];
                                                            })() :
                                                            [...drawingPoints, [mousePosition.lat, mousePosition.lng]]
                                                    }
                                                    pathOptions={{ color: currentTheme.accent, weight: 0, fillOpacity: 0.1 }}
                                                />
                                            )}
                                            {drawingPoints.length > 1 && <Polyline positions={drawingPoints} color={currentTheme.accent} weight={3} />}
                                            {mousePosition && drawingPoints.length > 0 && (
                                                <>
                                                    <Polyline
                                                        positions={
                                                            isOrthogonalMode && drawingPoints.length > 0 ?
                                                                (() => {
                                                                    const lastPoint = drawingPoints[drawingPoints.length - 1];
                                                                    if (orthogonalDirection === 'horizontal') {
                                                                        return [lastPoint, [lastPoint[0], mousePosition.lng]];
                                                                    } else {
                                                                        return [lastPoint, [mousePosition.lat, lastPoint[1]]];
                                                                    }
                                                                })() :
                                                                [drawingPoints[drawingPoints.length - 1], mousePosition]
                                                        }
                                                        color={currentTheme.accent}
                                                        weight={2}
                                                        dashArray="8, 8"
                                                    />
                                                    {drawingPoints.length >= 2 && (
                                                        <Polyline
                                                            positions={
                                                                isOrthogonalMode && drawingPoints.length > 0 ?
                                                                    (() => {
                                                                        const firstPoint = drawingPoints[0];
                                                                        if (orthogonalDirection === 'horizontal') {
                                                                            return [[firstPoint[0], mousePosition.lng], firstPoint];
                                                                        } else {
                                                                            return [[mousePosition.lat, firstPoint[1]], firstPoint];
                                                                        }
                                                                    })() :
                                                                    [mousePosition, drawingPoints[0]]
                                                            }
                                                            color={currentTheme.accentLight}
                                                            weight={2}
                                                            dashArray="8, 8"
                                                        />
                                                    )}
                                                </>
                                            )}
                                            {drawingPoints.map((point, index) => (
                                                <Marker key={index} position={point} icon={drawingMarkerIcon}>
                                                    <Tooltip>{t('map.drawingPoint', { index: index + 1 })}</Tooltip>
                                                </Marker>
                                            ))}
                                        </>
                                    )}
                                    {activeFormState?.type === 'add' && activeFormState.points && (
                                        <>
                                            <Polygon positions={activeFormState.points} color={currentTheme.accent} weight={3} fillOpacity={0.2} />
                                            {activeFormState.points.map((point, index) => (
                                                <Marker
                                                    key={index}
                                                    position={point}
                                                    icon={draggableMarkerIcon}
                                                    draggable={true}
                                                    eventHandlers={{
                                                        drag: (e) => {
                                                            const newPoints = [...activeFormState.points];
                                                            newPoints[index] = [e.latlng.lat, e.latlng.lng];
                                                            updateActiveFormPoints(newPoints);
                                                        },
                                                    }}
                                                >
                                                    <Tooltip>{t('map.drawingPoint', { index: index + 1 })}</Tooltip>
                                                </Marker>
                                            ))}
                                        </>
                                    )}
                                    {uniqueLocations // <--- THIS IS THE ONLY CHANGE IN THIS BLOCK
    .filter(loc => loc && loc.boundary_coords?.coordinates?.[0]?.length && activeLicenseStatuses.has(loc.license_status || 'no_licence'))
    .map(loc => {
                                            const flipped = loc.boundary_coords.coordinates[0].map(p => [p[1], p[0]]);
                                            const isSelected = selectedLocation?.id === loc.id;
                                            const licenseStatus = loc.license_status || 'no_licence';
                                            return (
                                                <Polygon
                                                    key={loc.id}
                                                    positions={flipped}
                                                    pathOptions={getPolygonStyle(licenseStatus, isSelected)}
                                                    eventHandlers={{
                                                        click: () => handleLocationSelect(loc),
                                                        mouseover: (e) => {
                                                            e.target.setStyle({ fillOpacity: 0.4, weight: 3 });
                                                            setHoveredLocation(loc);
                                                        },
                                                        mouseout: (e) => {
                                                            e.target.setStyle(getPolygonStyle(licenseStatus, isSelected));
                                                            setHoveredLocation(null);
                                                        }
                                                    }}
                                                >
                                                    <Tooltip sticky>
                                                        <div className="text-center p-1">
                                                            <div className="font-semibold text-base mb-1">{loc.name || t('common.unnamed')}</div>
                                                        </div>
                                                    </Tooltip>
                                                </Polygon>
                                            );
                                        })}
                                    {selectedLocationCentroid && (
                                        <Marker position={selectedLocationCentroid}>
                                            <Popup>
                                                <div className="text-center p-2">
                                                    <div className="font-semibold text-lg mb-1">{selectedLocation?.name || t('map.selectedLocation')}</div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}
                                    {searchedLocation?.isPending && (searchedLocation.boundary_coords || searchedLocation.boundaryCoords) && (
                                        <Polygon
                                            ref={pendingPolygonRef}
                                            positions={(searchedLocation.boundary_coords || searchedLocation.boundaryCoords).coordinates[0].map(p => [p[1], p[0]])}
                                            pathOptions={{
                                                color: searchedLocation.pendingType === 'DELETE' ? '#ef4444' : (searchedLocation.pendingType === 'EDIT' ? '#3b82f6' : '#facc15'),
                                                weight: 4, fillOpacity: 0.5, dashArray: '10, 10',
                                                fillColor: searchedLocation.pendingType === 'DELETE' ? '#ef4444' : (searchedLocation.pendingType === 'EDIT' ? '#3b82f6' : '#facc15'),
                                            }}
                                        />
                                    )}
                                    {searchedLocation?.isPending && pendingLocationCenter && (
                                        <Marker position={pendingLocationCenter} ref={(marker) => marker && marker.openPopup()}>
                                            <Popup>
                                                <div className="p-3 text-white rounded-lg" style={{ minWidth: '320px', backgroundColor: 'rgba(30, 41, 59, 0.95)', border: `1px solid ${searchedLocation.pendingType === 'DELETE' ? '#991b1b' : '#475569'}`, backdropFilter: 'blur(5px)' }}>
                                                    <h3 className={`text-lg font-bold mb-2 border-b pb-2 ${searchedLocation.pendingType === 'DELETE' ? 'border-red-800 text-red-400' : searchedLocation.pendingType === 'EDIT' ? 'border-blue-800 text-blue-400' : 'border-gray-600 text-yellow-400'}`}>
                                                        {searchedLocation.pendingType === 'DELETE' ? 'Pending Deletion' : searchedLocation.pendingType === 'EDIT' ? 'Pending Edit' : 'Pending Addition'}
                                                    </h3>
                                                    <div className="space-y-1.5 text-sm text-gray-300 mb-3">
                                                        <p><strong>Name:</strong> {searchedLocation.locationData.name || 'N/A'}</p>
                                                        <p><strong>Requested by:</strong> {searchedLocation.requestedBy.username}</p>
                                                        <hr className="border-gray-700 my-2" />
                                                        <p><strong>Address:</strong> {searchedLocation.locationData.address || 'N/A'}</p>
                                                        <p><strong>Gush/Parcel:</strong> {searchedLocation.locationData.gush_num || 'N/A'} / {searchedLocation.locationData.parcel_num || 'N/A'}</p>
                                                        {searchedLocation.locationData.owners?.[0] && (<p><strong>Owner:</strong> {searchedLocation.locationData.owners[0].first_name} {searchedLocation.locationData.owners[0].last_name}</p>)}
                                                        {searchedLocation.locationData.description && (<p><strong>Description:</strong> {searchedLocation.locationData.description}</p>)}
                                                    </div>
                                                    {searchedLocation.pendingType === 'EDIT' && searchedLocation.changes && (
                                                        <div className="mt-3 pt-3 border-t border-gray-600">
                                                            <h4 className="text-sm font-semibold text-blue-300 mb-2">Proposed Changes:</h4>
                                                            <ul className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-2">
                                                                {Object.entries(searchedLocation.changes).map(([key, value]) => {
                                                                    const formatDisplay = (val) => val === null || val === undefined || val === '' ? <em className="text-gray-500">empty</em> : <span className="text-gray-300">{String(val)}</span>;
                                                                    return (
                                                                        <li key={key} className="p-1.5 bg-gray-700/50 rounded-md">
                                                                            <div className="capitalize text-gray-400 font-semibold">{key.replace(/_/g, ' ')}</div>
                                                                            <div className="pl-2 flex items-center gap-x-2">
                                                                                <span className="text-red-400/80 line-through">{formatDisplay(value.old)}</span>
                                                                                <FaArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                                                                <span className="text-green-400 font-semibold">{formatDisplay(value.new)}</span>
                                                                            </div>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-around mt-4 pt-3 border-t border-gray-600">
                                                        <button onClick={() => onMapAction(searchedLocation.id, 'approve')} className="px-5 py-1.5 bg-green-500/20 text-green-300 border border-green-500/40 rounded-md hover:bg-green-500/40 transition-colors font-semibold">
                                                            {searchedLocation.pendingType === 'DELETE' ? 'Confirm Deletion' : 'Approve'}
                                                        </button>
                                                        <button onClick={() => onMapAction(searchedLocation.id, 'reject')} className="px-5 py-1.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-md hover:bg-red-500/40 transition-colors font-semibold">
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                                {tracingImage && (
                                    <div className={`absolute top-4 left-4 z-[1000] p-3 rounded-xl shadow-lg w-64 ${theme === 'dark' ? 'bg-black/80 text-white' : 'bg-white/90 text-black border border-gray-200'}`}>
                                        <h4 className="text-sm font-bold mb-2">{t('trace.title')}</h4>
                                        <div className="mb-3">
                                            <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('trace.opacity')}</label>
                                            <input type="range" min="0" max="1" step="0.05" value={tracingImageOpacity} onChange={(e) => setTracingImageOpacity(parseFloat(e.target.value))} className="w-full" />
                                        </div>
                                        {isImageTransformMode ? (
                                            <div className="space-y-2">
                                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('trace.adjustHint')}</p>
                                                <button onClick={lockImageAndStartDrawing} className="w-full text-sm text-white bg-green-600 hover:bg-green-500 rounded-md py-2 flex items-center justify-center space-x-2 transition-colors">
                                                    <FaLock /> <span>{t('buttons.lockAndTrace')}</span>
                                                </button>
                                                <button onClick={cancelImageTrace} className="w-full text-sm text-white bg-red-600 hover:bg-red-500 rounded-md py-2 transition-colors">
                                                    {t('buttons.cancel')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('trace.lockedHint')}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {isSidebarOpen && (
                            <motion.div
                                className="w-full lg:w-96 lg:flex-shrink-0 rounded-lg flex flex-col h-[45vh] lg:h-auto"
                                style={{
                                    background: currentTheme.glassGradient,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                                    boxShadow: currentTheme.largeShadow
                                }}
                                variants={animations.slideInRight} initial="initial" animate="animate"
                            >
                                <AnimatePresence mode="wait">
                                     {activePanel === 'userActions' ? ( // <-- ADD THIS BLOCK
        <motion.div key="userActions" variants={animations.fadeIn} initial="initial" animate="animate" exit="exit" className="h-full">
            <UserActionsPanel theme={theme} onClose={() => setActivePanel(null)} />
        </motion.div>
    ) : activePanel === 'layers' ? (
                                        <motion.div key="layers" variants={animations.fadeIn} initial="initial" animate="animate" exit="exit" className="h-full">
                                            <LuxuryLayerControlPanel theme={theme} baseLayers={BASE_LAYERS} activeBaseLayer={activeBaseLayer} onBaseLayerChange={setActiveBaseLayer} overlayLayers={OVERLAY_LAYERS} activeOverlays={activeOverlays} onToggleOverlay={toggleOverlay} overlayOpacities={overlayOpacities} onOpacityChange={adjustOverlayOpacity} onClose={() => setActivePanel(null)} />
                                        </motion.div>
                                    ) : activePanel === 'cities' ? (
                                        <motion.div key="cities" variants={animations.fadeIn} initial="initial" animate="animate" exit="exit" className="h-full">
                                            <LuxuryCityNavigationPanel theme={theme} currentTheme={currentTheme} cities={CITY_PRESETS} currentCity={currentCity} onCitySelect={(city) => { navigateToCity(city); setActivePanel(null); }} onClose={() => setActivePanel(null)} />
                                        </motion.div>
                                    ) : activePanel === 'notifications' ? (
                                        <motion.div key="notifications" variants={animations.fadeIn} initial="initial" animate="animate" exit="exit" className="h-full">
                                            <LuxuryNotificationPanel theme={theme} notifications={notifications} user={user} onClose={() => setActivePanel(null)} onClear={clearAllNotifications} onNotificationClick={handleNotificationClick} />
                                        </motion.div>
                                    ) : activeFormState ? (
                                        <motion.div key="form" variants={animations.fadeIn} initial="initial" animate="animate" exit="exit" className="h-full">
                                            <LuxuryAddHouseForm theme={theme} currentTheme={currentTheme} activeFormState={activeFormState} onCancel={() => { setActiveFormState(null); setIsSplitMode(false); }} onSave={handleSaveLocation} isSplitMode={isSplitMode} onPointsUpdate={updateActiveFormPoints} showActionStatus={showActionStatus} user={user} />
                                        </motion.div>
                                    ) : selectedLocation ? (
                                        <motion.div key="details" variants={animations.fadeIn} initial="initial" animate="animate" exit="exit" className="h-full">
                                            <LocationDetailsSidebar theme={theme} currentTheme={currentTheme} selectedLocation={selectedLocation} onClose={handleCloseLocationDetails} onDelete={handleDeleteLocation} onEdit={handleEditLocation} ownersSectionRef={ownersSectionRef} filesSectionRef={filesSectionRef} highlightedSection={highlightedSection} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="search" variants={animations.fadeIn} initial="initial" animate="animate" exit="exit" className="h-full">
                                            <LuxuryMapSearchSidebar theme={theme} currentTheme={currentTheme} onSearch={performSearch} searchInput={searchQuery} setSearchInput={handleSearchInputChange} recentSearches={recentSearches} onRecentSearchClick={handleSearchInputChange} isSearching={isSearching} searchResults={searchResults}
                                                onLocationSelect={async (loc) => {
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const response = await fetch(`http://localhost:5001/api/locations/${loc.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                        if (response.ok) {
                                                            const completeLocation = await response.json();
                                                            setSelectedLocationAndCentroid(completeLocation);
                                                            panToLocation(completeLocation);
                                                        } else {
                                                            setSelectedLocationAndCentroid(loc);
                                                            panToLocation(loc);
                                                        }
                                                    } catch (error) {
                                                        console.error("Error fetching complete location data:", error);
                                                        setSelectedLocationAndCentroid(loc);
                                                        panToLocation(loc);
                                                        showActionStatus('error', t('errors.fetchError'), t('toasts.loadError'));
                                                    }
                                                    setSearchResults({ local: [], global: [] });
                                                    setSearchQuery(loc.name || '');
                                                }}
                                                onGlobalSelect={(place) => { panToCoords(place.center); setSearchResults({ local: [], global: [] }); setSearchQuery(place.name || ''); }}
                                                 activeLicenseStatuses={activeLicenseStatuses} toggleLicenseStatus={toggleLicenseStatus} onAddProject={toggleDrawing} onToggleCities={() => handleTogglePanel('cities')} onToggleLayers={() => handleTogglePanel('layers')} onToggleFullscreen={handleToggleFullscreen} onToggleNotifications={() => handleTogglePanel('notifications')} onToggleUserActions={() => handleTogglePanel('userActions')} onTraceFromImage={handleTraceImageUpload} isDrawing={isDrawing} drawingPoints={drawingPoints} onFinishDrawing={finishDrawing} onUndoDrawing={handleUndoDrawingPoint} isCityPanelOpen={activePanel === 'cities'} isLayersPanelOpen={activePanel === 'layers'} isFullscreen={isFullscreen} isOrthogonalMode={isOrthogonalMode} onToggleOrthogonalMode={toggleOrthogonalMode}
/>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
                <AnimatePresence>
                    {editingLocation && (
                        <EditLocationForm
                            location={editingLocation}
                            onSave={handleEditSave}
                            onCancel={() => setEditingLocation(null)}
                            onGeometryUpdate={updateActiveFormPoints}
                            showActionStatus={showActionStatus}
                            theme={theme}
                            user={user}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showDrawingPrompt && (
                        <motion.div
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
                            variants={animations.fadeIn} initial="initial" animate="animate" exit="exit"
                            onClick={() => setShowDrawingPrompt(false)}
                        >
                            <motion.div
                                className={`rounded-lg max-w-md mx-4 p-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                style={{
                                    background: currentTheme.glassGradient,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                                }}
                                variants={animations.modal} onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold mb-2">{t('drawPrompt.title')}</h3>
                                <p className={`${theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-6`}>{t('drawPrompt.description')}</p>
                                <motion.button
                                    onClick={() => { setShowDrawingPrompt(false); setIsDrawing(true); setDrawingPoints([]); }}
                                    className="w-full px-4 py-2 text-white rounded-md font-medium"
                                    style={{ background: currentTheme.goldGradient }}
                                >
                                    {t('buttons.startDrawing')}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <DeletionErrorModal
                    isOpen={deletionError.isOpen}
                    onClose={() => setDeletionError({ isOpen: false, children: [] })}
                    childLocations={deletionError.children}
                    theme={theme}
                    currentTheme={currentTheme}
                />
                <ActionStatusModal
                    isOpen={actionStatus.isOpen}
                    status={actionStatus.status}
                    title={actionStatus.title}
                    message={actionStatus.message}
                    onClose={hideActionStatus}
                    theme={theme}
                />
            </motion.div>
        </AnimatePresence>
    );
};

export default LuxuryMapModal;
 i want to add it next to 