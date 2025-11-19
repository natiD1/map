import { useMapEvents } from 'react-leaflet';

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

export default MapEventHandler;