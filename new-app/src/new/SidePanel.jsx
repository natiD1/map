
// import React, { useState } from 'react';
// import { FaSearch, FaTimes, FaLayerGroup, FaMap, FaArrowLeft, FaEllipsisV, FaInfoCircle, FaAdjust, FaFilter, FaTrashAlt, FaMapMarkedAlt, FaChevronDown, FaBuilding } from 'react-icons/fa';
// import LayerOptionsMenu from './LayerOptionsMenu';

// const SidePanel = ({
//   sidePanelOpen,
//   toggleSidePanel,
//   additionalLayersOpen,
//   setAdditionalLayersOpen,
//   toggleAdditionalLayers,
//   backToInitialLayers,
//   activeTab,
//   setActiveTab,
//   categoryFilter,
//   setCategoryFilter,
//   showOverlay,
//   setShowOverlay,
//   overlayOpacity,
//   setOverlayOpacity,
//   parcelsVisible,
//   setParcelsVisible,
//   parcelsOpacity,
//   setParcelsOpacity,
//   blocksVisible,
//   setBlocksVisible,
//   blocksOpacity,
//   setBlocksOpacity,
//   // NEW: Migration Routes layer props
//   retzefmigrashimVisible,
//   setRetzefmigrashimVisible,
//   retzefmigrashimOpacity,
//   setRetzefmigrashimOpacity
// }) => {
//   const [activeMenuLayerId, setActiveMenuLayerId] = useState(null);
//   const [previousMenuState, setPreviousMenuState] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
//   const [selectedAuthority, setSelectedAuthority] = useState(null);

//   const toggleLayerMenu = (layerId) => {
//     setPreviousMenuState({
//       additionalLayersOpen,
//       activeTab,
//       categoryFilter
//     });
//     setActiveMenuLayerId(layerId);
//   };

//   const handleBackToPreviousState = () => {
//     if (previousMenuState) {
//       setActiveTab(previousMenuState.activeTab);
//       setCategoryFilter(previousMenuState.categoryFilter);
//       setAdditionalLayersOpen(previousMenuState.additionalLayersOpen);
//     }
//     setActiveMenuLayerId(null);
//   };

//   const handleOverlayToggle = () => {
//     setShowOverlay(!showOverlay);
//   };

//   const handleLayerOpacityChange = (layerId, opacity) => {
//     if (layerId === 'local-map') {
//       setOverlayOpacity(opacity);
//     } else if (layerId === 'parcels') {
//       setParcelsOpacity(opacity);
//     } else if (layerId === 'blocks') {
//       setBlocksOpacity(opacity);
//     } else if (layerId === 'retzefmigrashim') {
//       setRetzefmigrashimOpacity(opacity);
//     }
//   };

//   const mainLayers = [
//     { id: 'parcels', label: 'Parcels', defaultChecked: false },
//     { id: 'blocks', label: 'Blocks', defaultChecked: false },
//     {
//       id: 'local-map',
//       label: 'Local Map',
//       defaultChecked: false,
//       icon: <FaMapMarkedAlt className="text-blue-600" />,
//       isLocalMap: true
//     },
//     // NEW: Migration Routes layer
//     { id: 'retzefmigrashim', label: 'Migration Routes', defaultChecked: false },
//   ];

//   const tabs = [
//     { id: 'Governmental', label: 'Governmental' },
//     { id: 'Local Authorities', label: 'Local Authorities' },
//     { id: 'Shared with me', label: 'Shared with me' }
//   ];

//   const localAuthorities = [
//     { id: 'all-local', label: 'All Local Authorities' },
//     { id: 'ness-ziona', label: 'Ness Ziona' },
//     { id: 'tel-aviv', label: 'Tel Aviv' },
//     { id: 'jerusalem', label: 'Jerusalem' },
//     { id: 'haifa', label: 'Haifa' },
//     { id: 'rishon-lezion', label: 'Rishon LeZion' },
//     { id: 'petah-tikva', label: 'Petah Tikva' },
//     { id: 'ashdod', label: 'Ashdod' },
//     { id: 'netanya', label: 'Netanya' },
//     { id: 'beer-sheva', label: 'Beer Sheva' },
//     { id: 'holon', label: 'Holon' },
//     { id: 'bnei-brak', label: 'Bnei Brak' }
//   ];

//   const mappingLayers = [
//     { id: 'coast-line-075', label: 'Coast Line 075', color: 'red' },
//     { id: 'coastal-zone-limit', label: 'Coastal Zone Limit (Line 100 m.)', color: 'purple' },
//     { id: 'contour-line', label: 'Contour line', color: 'brown' },
//     { id: 'depth-contour', label: 'Depth contour', color: 'blue' },
//     // NEW: Migration Routes layer
//     { id: 'retzefmigrashim', label: 'Migration Routes', color: 'green' },
//   ];

//   const tourismLayers = [
//     { id: 'field-school', label: 'Field school' },
//     { id: 'gas-stations', label: 'Gas Stations' },
//     { id: 'hotels', label: 'Hotels' },
//     { id: 'parking-lot', label: 'Parking lot' },
//     { id: 'arrival-ways', label: 'Arrival ways' },
//     { id: 'atm', label: 'ATM' },
//     { id: 'border-checkpoints', label: 'Border Checkpoints' },
//     { id: 'cultural-recreation', label: 'Cultural and recreation' },
//     { id: 'convention-centers', label: 'Convention centers' },
//     { id: 'guesthouses', label: 'Guesthouses / B&B' },
//     { id: 'hostels', label: 'Hostels' },
//     { id: 'information-centers', label: 'Information centers' },
//     { id: 'kibbutzim-moshavim', label: 'Kibbutzim and Moshavim' },
//     { id: 'lakes-springs', label: 'Lakes and springs' },
//     { id: 'lookouts', label: 'Lookouts' },
//     { id: 'memorial-sites', label: 'Memorial sites' },
//     { id: 'museums', label: 'Museums' },
//     { id: 'national-parks', label: 'National parks' },
//     { id: 'nature-reserves', label: 'Nature Reserves' },
//     { id: 'picnic-areas', label: 'Picnic areas' },
//     { id: 'post-offices', label: 'Post offices' },
//     { id: 'public-parks', label: 'Public parks' },
//     { id: 'restaurants', label: 'Restaurants' },
//     { id: 'shopping-centers', label: 'Shopping centers' },
//     { id: 'sites', label: 'Sites' },
//     { id: 'sports-centers', label: 'Sports centers' },
//     { id: 'synagogues', label: 'Synagogues' },
//     { id: 'tents', label: 'Tents' },
//     { id: 'tourist-farms', label: 'Tourist farms' },
//     { id: 'viewpoints', label: 'Viewpoints' },
//     { id: 'visitor-centers', label: 'Visitor centers' },
//     { id: 'walking-routes', label: 'Walking routes' },
//     { id: 'waterfalls', label: 'Waterfalls' },
//     { id: 'wineries', label: 'Wineries' },
//     { id: 'zoos', label: 'Zoos' },
//     { id: 'tourism-video-links', label: 'Tourism video links' },
//     { id: 'vat-refund-businesses', label: 'VAT refund businesses' },
//   ];

//   const cadasterLayers = [
//     { id: 'housing-for-rent', label: 'Housing for rent' },
//     { id: 'real-estate-tender', label: 'Real Estate tender plot - ILA' },
//     { id: 'population-density-1967', label: 'Population density 1967' },
//   ];

//   const resourcesLayers = [
//     { id: 'geo-200-contacts', label: 'Geo 200 - Contacts', color: 'purple' },
//     { id: 'geo-200-plutonics', label: 'Geo 200 - Plutonics', color: 'red' },
//     { id: 'geo-200-polygons', label: 'Geo 200 - Polygons', color: 'pink' },
//     { id: 'oil-gas-drilling', label: 'Oil and Gas drilling' },
//     { id: 'oil-rights', label: 'Oil rights' },
//     { id: 'gas-pipeline-sector', label: 'Gas pipeline sector' },
//     { id: 'iec-districts', label: 'IEC Districts' },
//   ];

//   const transportationLayers = [
//     { id: 'motorcycle-rental', label: 'Motorcycle Rental' },
//   ];

//   const statisticalDataLayers = [
//     { id: 'statistical-data', label: 'Statistical data' },
//   ];

//   const publicInstitutionsLayers = [
//     { id: 'public-institutions', label: 'Public institutions and services' },
//   ];

//   const environmentLayers = [
//     { id: 'coast-sensitivity-oil', label: "Coast's sensitivity to oil pollution" },
//     { id: 'accident-prone-roads', label: 'Accident prone roads' },
//     { id: 'emergency-security', label: 'Emergency, security and rescue operations' },
//   ];

//   const allLayers = [
//     ...mappingLayers,
//     ...tourismLayers,
//     ...cadasterLayers,
//     ...resourcesLayers,
//     ...transportationLayers,
//     ...statisticalDataLayers,
//     ...publicInstitutionsLayers,
//     ...environmentLayers
//   ];

//   const categoryOptions = [
//     { id: 'All Categories', label: 'All Categories', icon: <FaLayerGroup className="h-4 w-4" /> },
//     { id: 'Mapping, enclosures and boundaries', label: 'Mapping, enclosures and boundaries', icon: <FaMap className="h-4 w-4" /> },
//     { id: 'Tourism, nature, leisure and sports', label: 'Tourism, nature, leisure and sports', icon: <img src="https://www.flaticon.com/svg/v2/svg/684/684869.svg" className="h-4 w-4" alt="Tourism icon" /> },
//     { id: 'Cadaster, real estate and planning', label: 'Cadaster, real estate and planning', icon: <img src="https://www.flaticon.com/svg/v2/svg/1057/1057207.svg" className="h-4 w-4" alt="Cadaster icon" /> },
//     { id: 'Resources, infrastructure and energy', label: 'Resources, infrastructure and energy', icon: <img src="https://www.flaticon.com/svg/v2/svg/2593/2593884.svg" className="h-4 w-4" alt="Resources icon" /> },
//     { id: 'Transportation', label: 'Transportation', icon: <img src="https://www.flaticon.com/svg/v2/svg/2838/2838694.svg" className="h-4 w-4" alt="Transportation icon" /> },
//     { id: 'Statistical data', label: 'Statistical data', icon: <img src="https://www.flaticon.com/svg/v2/svg/2919/2919605.svg" className="h-4 w-4" alt="Statistics icon" /> },
//     { id: 'Public institutions and services', label: 'Public institutions and services', icon: <img src="https://www.flaticon.com/svg/v2/svg/2656/2656568.svg" className="h-4 w-4" alt="Public institutions icon" /> },
//     { id: 'Environment and waste', label: 'Environment and waste', icon: <img src="https://www.flaticon.com/svg/v2/svg/2776/2776067.svg" className="h-4 w-4" alt="Environment icon" /> },
//   ];

//   const localAuthorityCategories = [
//     { id: 'all-local', label: 'All Local Authorities', icon: <FaBuilding className="h-4 w-4" /> },
//     { id: 'northern', label: 'Northern District', icon: <FaBuilding className="h-4 w-4" /> },
//     { id: 'haifa', label: 'Haifa District', icon: <FaBuilding className="h-4 w-4" /> },
//     { id: 'central', label: 'Central District', icon: <FaBuilding className="h-4 w-4" /> },
//     { id: 'tel-aviv', label: 'Tel Aviv District', icon: <FaBuilding className="h-4 w-4" /> },
//     { id: 'jerusalem', label: 'Jerusalem District', icon: <FaBuilding className="h-4 w-4" /> },
//     { id: 'southern', label: 'Southern District', icon: <FaBuilding className="h-4 w-4" /> },
//     { id: 'judea', label: 'Judea and Samaria', icon: <FaBuilding className="h-4 w-4" /> },
//   ];

//   const getLayerNameById = (id) => {
//     const mainLayer = mainLayers.find(layer => layer.id === id);
//     if (mainLayer) return mainLayer.label;
    
//     const allLayerLists = [
//       allLayers,
//       mappingLayers,
//       tourismLayers,
//       cadasterLayers,
//       resourcesLayers,
//       transportationLayers,
//       statisticalDataLayers,
//       publicInstitutionsLayers,
//       environmentLayers
//     ];
    
//     for (const layerList of allLayerLists) {
//       const layer = layerList.find(layer => layer.id === id);
//       if (layer) return layer.label;
//     }
    
//     return 'Layer Options';
//   };

//   const getLayerOpacity = (id) => {
//     if (id === 'local-map') return overlayOpacity;
//     if (id === 'parcels') return parcelsOpacity;
//     if (id === 'blocks') return blocksOpacity;
//     if (id === 'retzefmigrashim') return retzefmigrashimOpacity;
//     return 1;
//   };

//   const isLayerLocalMap = (id) => {
//     return id === 'local-map';
//   };

//   const filterLayers = (layers) => {
//     return layers.filter(layer =>
//       layer.label.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const filterLocalAuthorities = () => {
//     return localAuthorities.filter(authority =>
//       authority.label.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const getLayersToDisplay = () => {
//     switch (categoryFilter) {
//       case 'All Categories':
//         return filterLayers(allLayers);
//       case 'Mapping, enclosures and boundaries':
//         return filterLayers(mappingLayers);
//       case 'Tourism, nature, leisure and sports':
//         return filterLayers(tourismLayers);
//       case 'Cadaster, real estate and planning':
//         return filterLayers(cadasterLayers);
//       case 'Resources, infrastructure and energy':
//         return filterLayers(resourcesLayers);
//       case 'Transportation':
//         return filterLayers(transportationLayers);
//       case 'Statistical data':
//         return filterLayers(statisticalDataLayers);
//       case 'Public institutions and services':
//         return filterLayers(publicInstitutionsLayers);
//       case 'Environment and waste':
//         return filterLayers(environmentLayers);
//       default:
//         return [];
//     }
//   };

//   const handleTabChange = (tabId) => {
//     setActiveTab(tabId);
//     setSelectedAuthority(null);
//     setCategoryFilter('All Categories');
//     setCategoryDropdownOpen(false);
//   };

//   return (
//     <div
//       className={`bg-white shadow-lg z-40 transition-all duration-300 ease-in-out ${sidePanelOpen ? (additionalLayersOpen ? 'w-[500px]' : 'w-[320px]') : 'w-0'} overflow-hidden flex flex-col border-r border-gray-200`}
//     >
//       <div className="p-3 h-full flex flex-col">
//         {!activeMenuLayerId ? (
//           <>
//             {!additionalLayersOpen ? (
//               <>
//                 <div className="flex justify-between items-center mb-3">
//                   <h2 className="text-base font-bold text-gray-800">Data Layers</h2>
//                   <button
//                     onClick={toggleSidePanel}
//                     className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
//                   >
//                     <FaTimes className="text-sm" />
//                   </button>
//                 </div>
//                 <div className="flex-1 overflow-y-auto pr-1">
//                   <div className="space-y-1">
//                     {mainLayers.map((layer) => (
//                       <div
//                         key={layer.id}
//                         className={`flex items-center p-1.5 rounded-md border relative ${layer.isLocalMap ? (showOverlay ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200') : 'bg-blue-50 border-blue-200'}`}
//                       >
//                         <input
//                           type="checkbox"
//                           id={layer.id}
//                           className="h-3.5 w-3.5 text-blue-600 rounded"
//                           checked={
//                             layer.id === 'parcels' ? parcelsVisible :
//                             layer.id === 'blocks' ? blocksVisible :
//                             layer.id === 'retzefmigrashim' ? retzefmigrashimVisible :
//                             (layer.isLocalMap ? showOverlay : layer.defaultChecked)
//                           }
//                           onChange={(e) => {
//                             if (layer.id === 'parcels') {
//                               setParcelsVisible(e.target.checked);
//                             } else if (layer.id === 'blocks') {
//                               setBlocksVisible(e.target.checked);
//                             } else if (layer.id === 'retzefmigrashim') {
//                               setRetzefmigrashimVisible(e.target.checked);
//                             } else if (layer.isLocalMap) {
//                               handleOverlayToggle();
//                             }
//                           }}
//                         />
//                         <label htmlFor={layer.id} className="ml-2 text-xs font-medium text-gray-700 flex-1 flex items-center">
//                           {layer.icon && <span className="mr-2">{layer.icon}</span>}
//                           {layer.label}
//                         </label>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             toggleLayerMenu(layer.id);
//                           }}
//                           className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
//                         >
//                           <FaEllipsisV className="text-xs" />
//                         </button>
//                       </div>
//                     ))}
//                     <div className="mt-3">
//                       <button
//                         onClick={toggleAdditionalLayers}
//                         className="w-full py-1.5 px-3 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
//                       >
//                         <span>ADDITIONAL LAYERS</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="flex items-center mb-3">
//                   <button
//                     onClick={backToInitialLayers}
//                     className="mr-2 text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
//                   >
//                     <FaArrowLeft className="text-sm" />
//                   </button>
//                   <h2 className="text-base font-bold text-gray-800">Additional Layers</h2>
//                   <button
//                     onClick={toggleSidePanel}
//                     className="ml-auto text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
//                   >
//                     <FaTimes className="text-sm" />
//                   </button>
//                 </div>
//                 <div className="flex border-b border-gray-200 mb-3 flex-shrink-0">
//                   {tabs.map((tab) => (
//                     <button
//                       key={tab.id}
//                       className={`px-2 py-1.5 text-xs font-medium transition-colors duration-200 ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
//                       onClick={() => handleTabChange(tab.id)}
//                     >
//                       {tab.label}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="flex-1 overflow-hidden flex">
//                   <div className="w-1/2 border-r border-gray-200 p-3">
//                     {activeTab === 'Local Authorities' ? (
//                       <>
//                         <div className="relative mb-3">
//                           <button
//                             className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md text-xs bg-white hover:bg-gray-50"
//                             onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
//                           >
//                             <span>Display by categories</span>
//                             <FaChevronDown className={`text-gray-400 text-xs transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
//                           </button>
//                           {categoryDropdownOpen && (
//                             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                               {localAuthorityCategories.map((category) => (
//                                 <button
//                                   key={category.id}
//                                   className={`flex items-center w-full p-2 text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
//                                   onClick={() => {
//                                     setCategoryFilter(category.id);
//                                     setCategoryDropdownOpen(false);
//                                   }}
//                                 >
//                                   <span className="mr-2">{category.icon}</span>
//                                   <span className="text-left">{category.label}</span>
//                                 </button>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                         <div className="grid grid-cols-2 gap-3 text-center">
//                           {localAuthorityCategories.map((category) => (
//                             <button
//                               key={category.id}
//                               className={`flex flex-col items-center justify-center p-2 border rounded-md text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
//                               onClick={() => setCategoryFilter(category.id)}
//                             >
//                               {category.icon}
//                               <span className="mt-1 text-center">{category.label}</span>
//                             </button>
//                           ))}
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <div className="relative mb-3">
//                           <button
//                             className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md text-xs bg-white hover:bg-gray-50"
//                             onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
//                           >
//                             <span>Display by categories</span>
//                             <FaChevronDown className={`text-gray-400 text-xs transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
//                           </button>
//                           {categoryDropdownOpen && (
//                             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                               {categoryOptions.map((category) => (
//                                 <button
//                                   key={category.id}
//                                   className={`flex items-center w-full p-2 text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
//                                   onClick={() => {
//                                     setCategoryFilter(category.id);
//                                     setCategoryDropdownOpen(false);
//                                   }}
//                                 >
//                                   <span className="mr-2">{category.icon}</span>
//                                   <span className="text-left">{category.label}</span>
//                                 </button>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                         <div className="grid grid-cols-2 gap-3 text-center">
//                           {categoryOptions.slice(0, 8).map((category) => (
//                             <button
//                               key={category.id}
//                               className={`flex flex-col items-center justify-center p-2 border rounded-md text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
//                               onClick={() => setCategoryFilter(category.id)}
//                             >
//                               {category.icon}
//                               <span className="mt-1 text-center">{category.label.split(',').join(',\n')}</span>
//                             </button>
//                           ))}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                   <div className="w-1/2 p-3 flex flex-col">
//                     {activeTab === 'Local Authorities' ? (
//                       <>
//                         <div className="relative mb-3">
//                           <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
//                             <FaSearch className="text-gray-400 text-xs" />
//                           </div>
//                           <input
//                             type="text"
//                             placeholder="Search Local Authorities"
//                             className="block w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                           />
//                         </div>
//                         <div className="flex-1 overflow-y-auto pr-1">
//                           <div className="space-y-1">
//                             {filterLocalAuthorities().map((authority) => (
//                               <div
//                                 key={authority.id}
//                                 className={`flex items-center p-1.5 rounded-md cursor-pointer ${selectedAuthority?.id === authority.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
//                                 onClick={() => setSelectedAuthority(authority)}
//                               >
//                                 <FaBuilding className="text-gray-500 mr-2" />
//                                 <span className="ml-2 text-xs font-medium text-gray-700 flex-1">
//                                   {authority.label}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <div className="relative mb-3">
//                           <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
//                             <FaSearch className="text-gray-400 text-xs" />
//                           </div>
//                           <input
//                             type="text"
//                             placeholder="Search Layer"
//                             className="block w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                           />
//                         </div>
//                         <div className="flex-1 overflow-y-auto pr-1">
//                           <div className="space-y-1">
//                             {getLayersToDisplay().map((option) => (
//                               <div key={option.id} className="flex items-center p-1 hover:bg-gray-50 rounded-sm relative">
//                                 {option.color && (
//                                   <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: option.color }}></div>
//                                 )}
//                                 <input
//                                   type="checkbox"
//                                   id={option.id}
//                                   className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
//                                   defaultChecked={false}
//                                 />
//                                 <label htmlFor={option.id} className="ml-1.5 text-xs text-gray-700 flex-1">{option.label}</label>
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     toggleLayerMenu(option.id);
//                                   }}
//                                   className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
//                                 >
//                                   <FaEllipsisV className="text-xs" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         ) : (
//           <LayerOptionsMenu
//             layerId={activeMenuLayerId}
//             layerName={getLayerNameById(activeMenuLayerId)}
//             initialOpacity={getLayerOpacity(activeMenuLayerId)}
//             onOpacityChange={(opacity) => handleLayerOpacityChange(activeMenuLayerId, opacity)}
//             onBack={handleBackToPreviousState}
//             onClose={() => setActiveMenuLayerId(null)}
//             isLocalMap={isLayerLocalMap(activeMenuLayerId)}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SidePanel;


import React, { useState } from 'react';
import { FaSearch, FaTimes, FaLayerGroup, FaMap, FaArrowLeft, FaEllipsisV, FaInfoCircle, FaAdjust, FaFilter, FaTrashAlt, FaMapMarkedAlt, FaChevronDown, FaBuilding } from 'react-icons/fa';
import LayerOptionsMenu from './LayerOptionsMenu';

const SidePanel = ({
  sidePanelOpen,
  toggleSidePanel,
  additionalLayersOpen,
  setAdditionalLayersOpen,
  toggleAdditionalLayers,
  backToInitialLayers,
  activeTab,
  setActiveTab,
  categoryFilter,
  setCategoryFilter,
  parcelsVisible,
  setParcelsVisible,
  parcelsOpacity,
  setParcelsOpacity,
  blocksVisible,
  setBlocksVisible,
  blocksOpacity,
  setBlocksOpacity,
  // Migration Routes layer props
  retzefmigrashimVisible,
  setRetzefmigrashimVisible,
  retzefmigrashimOpacity,
  setRetzefmigrashimOpacity
}) => {
  const [activeMenuLayerId, setActiveMenuLayerId] = useState(null);
  const [previousMenuState, setPreviousMenuState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState(null);

  const toggleLayerMenu = (layerId) => {
    setPreviousMenuState({
      additionalLayersOpen,
      activeTab,
      categoryFilter
    });
    setActiveMenuLayerId(layerId);
  };

  const handleBackToPreviousState = () => {
    if (previousMenuState) {
      setActiveTab(previousMenuState.activeTab);
      setCategoryFilter(previousMenuState.categoryFilter);
      setAdditionalLayersOpen(previousMenuState.additionalLayersOpen);
    }
    setActiveMenuLayerId(null);
  };

  const handleLayerOpacityChange = (layerId, opacity) => {
    if (layerId === 'parcels') {
      setParcelsOpacity(opacity);
    } else if (layerId === 'blocks') {
      setBlocksOpacity(opacity);
    } else if (layerId === 'retzefmigrashim') {
      setRetzefmigrashimOpacity(opacity);
    }
  };

  const mainLayers = [
    { id: 'parcels', label: 'Parcels', defaultChecked: false },
    { id: 'blocks', label: 'Blocks', defaultChecked: false },
    // Migration Routes layer
    { id: 'retzefmigrashim', label: 'Migration Routes', defaultChecked: false },
  ];

  const tabs = [
    { id: 'Governmental', label: 'Governmental' },
    { id: 'Local Authorities', label: 'Local Authorities' },
    { id: 'Shared with me', label: 'Shared with me' }
  ];

  const localAuthorities = [
    { id: 'all-local', label: 'All Local Authorities' },
    { id: 'ness-ziona', label: 'Ness Ziona' },
    { id: 'tel-aviv', label: 'Tel Aviv' },
    { id: 'jerusalem', label: 'Jerusalem' },
    { id: 'haifa', label: 'Haifa' },
    { id: 'rishon-lezion', label: 'Rishon LeZion' },
    { id: 'petah-tikva', label: 'Petah Tikva' },
    { id: 'ashdod', label: 'Ashdod' },
    { id: 'netanya', label: 'Netanya' },
    { id: 'beer-sheva', label: 'Beer Sheva' },
    { id: 'holon', label: 'Holon' },
    { id: 'bnei-brak', label: 'Bnei Brak' }
  ];

  const mappingLayers = [
    { id: 'coast-line-075', label: 'Coast Line 075', color: 'red' },
    { id: 'coastal-zone-limit', label: 'Coastal Zone Limit (Line 100 m.)', color: 'purple' },
    { id: 'contour-line', label: 'Contour line', color: 'brown' },
    { id: 'depth-contour', label: 'Depth contour', color: 'blue' },
    // Migration Routes layer
    { id: 'retzefmigrashim', label: 'Migration Routes', color: 'green' },
  ];

  const tourismLayers = [
    { id: 'field-school', label: 'Field school' },
    { id: 'gas-stations', label: 'Gas Stations' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'parking-lot', label: 'Parking lot' },
    { id: 'arrival-ways', label: 'Arrival ways' },
    { id: 'atm', label: 'ATM' },
    { id: 'border-checkpoints', label: 'Border Checkpoints' },
    { id: 'cultural-recreation', label: 'Cultural and recreation' },
    { id: 'convention-centers', label: 'Convention centers' },
    { id: 'guesthouses', label: 'Guesthouses / B&B' },
    { id: 'hostels', label: 'Hostels' },
    { id: 'information-centers', label: 'Information centers' },
    { id: 'kibbutzim-moshavim', label: 'Kibbutzim and Moshavim' },
    { id: 'lakes-springs', label: 'Lakes and springs' },
    { id: 'lookouts', label: 'Lookouts' },
    { id: 'memorial-sites', label: 'Memorial sites' },
    { id: 'museums', label: 'Museums' },
    { id: 'national-parks', label: 'National parks' },
    { id: 'nature-reserves', label: 'Nature Reserves' },
    { id: 'picnic-areas', label: 'Picnic areas' },
    { id: 'post-offices', label: 'Post offices' },
    { id: 'public-parks', label: 'Public parks' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'shopping-centers', label: 'Shopping centers' },
    { id: 'sites', label: 'Sites' },
    { id: 'sports-centers', label: 'Sports centers' },
    { id: 'synagogues', label: 'Synagogues' },
    { id: 'tents', label: 'Tents' },
    { id: 'tourist-farms', label: 'Tourist farms' },
    { id: 'viewpoints', label: 'Viewpoints' },
    { id: 'visitor-centers', label: 'Visitor centers' },
    { id: 'walking-routes', label: 'Walking routes' },
    { id: 'waterfalls', label: 'Waterfalls' },
    { id: 'wineries', label: 'Wineries' },
    { id: 'zoos', label: 'Zoos' },
    { id: 'tourism-video-links', label: 'Tourism video links' },
    { id: 'vat-refund-businesses', label: 'VAT refund businesses' },
  ];

  const cadasterLayers = [
    { id: 'housing-for-rent', label: 'Housing for rent' },
    { id: 'real-estate-tender', label: 'Real Estate tender plot - ILA' },
    { id: 'population-density-1967', label: 'Population density 1967' },
  ];

  const resourcesLayers = [
    { id: 'geo-200-contacts', label: 'Geo 200 - Contacts', color: 'purple' },
    { id: 'geo-200-plutonics', label: 'Geo 200 - Plutonics', color: 'red' },
    { id: 'geo-200-polygons', label: 'Geo 200 - Polygons', color: 'pink' },
    { id: 'oil-gas-drilling', label: 'Oil and Gas drilling' },
    { id: 'oil-rights', label: 'Oil rights' },
    { id: 'gas-pipeline-sector', label: 'Gas pipeline sector' },
    { id: 'iec-districts', label: 'IEC Districts' },
  ];

  const transportationLayers = [
    { id: 'motorcycle-rental', label: 'Motorcycle Rental' },
  ];

  const statisticalDataLayers = [
    { id: 'statistical-data', label: 'Statistical data' },
  ];

  const publicInstitutionsLayers = [
    { id: 'public-institutions', label: 'Public institutions and services' },
  ];

  const environmentLayers = [
    { id: 'coast-sensitivity-oil', label: "Coast's sensitivity to oil pollution" },
    { id: 'accident-prone-roads', label: 'Accident prone roads' },
    { id: 'emergency-security', label: 'Emergency, security and rescue operations' },
  ];

  const allLayers = [
    ...mappingLayers,
    ...tourismLayers,
    ...cadasterLayers,
    ...resourcesLayers,
    ...transportationLayers,
    ...statisticalDataLayers,
    ...publicInstitutionsLayers,
    ...environmentLayers
  ];

  const categoryOptions = [
    { id: 'All Categories', label: 'All Categories', icon: <FaLayerGroup className="h-4 w-4" /> },
    { id: 'Mapping, enclosures and boundaries', label: 'Mapping, enclosures and boundaries', icon: <FaMap className="h-4 w-4" /> },
    { id: 'Tourism, nature, leisure and sports', label: 'Tourism, nature, leisure and sports', icon: <img src="https://www.flaticon.com/svg/v2/svg/684/684869.svg" className="h-4 w-4" alt="Tourism icon" /> },
    { id: 'Cadaster, real estate and planning', label: 'Cadaster, real estate and planning', icon: <img src="https://www.flaticon.com/svg/v2/svg/1057/1057207.svg" className="h-4 w-4" alt="Cadaster icon" /> },
    { id: 'Resources, infrastructure and energy', label: 'Resources, infrastructure and energy', icon: <img src="https://www.flaticon.com/svg/v2/svg/2593/2593884.svg" className="h-4 w-4" alt="Resources icon" /> },
    { id: 'Transportation', label: 'Transportation', icon: <img src="https://www.flaticon.com/svg/v2/svg/2838/2838694.svg" className="h-4 w-4" alt="Transportation icon" /> },
    { id: 'Statistical data', label: 'Statistical data', icon: <img src="https://www.flaticon.com/svg/v2/svg/2919/2919605.svg" className="h-4 w-4" alt="Statistics icon" /> },
    { id: 'Public institutions and services', label: 'Public institutions and services', icon: <img src="https://www.flaticon.com/svg/v2/svg/2656/2656568.svg" className="h-4 w-4" alt="Public institutions icon" /> },
    { id: 'Environment and waste', label: 'Environment and waste', icon: <img src="https://www.flaticon.com/svg/v2/svg/2776/2776067.svg" className="h-4 w-4" alt="Environment icon" /> },
  ];

  const localAuthorityCategories = [
    { id: 'all-local', label: 'All Local Authorities', icon: <FaBuilding className="h-4 w-4" /> },
    { id: 'northern', label: 'Northern District', icon: <FaBuilding className="h-4 w-4" /> },
    { id: 'haifa', label: 'Haifa District', icon: <FaBuilding className="h-4 w-4" /> },
    { id: 'central', label: 'Central District', icon: <FaBuilding className="h-4 w-4" /> },
    { id: 'tel-aviv', label: 'Tel Aviv District', icon: <FaBuilding className="h-4 w-4" /> },
    { id: 'jerusalem', label: 'Jerusalem District', icon: <FaBuilding className="h-4 w-4" /> },
    { id: 'southern', label: 'Southern District', icon: <FaBuilding className="h-4 w-4" /> },
    { id: 'judea', label: 'Judea and Samaria', icon: <FaBuilding className="h-4 w-4" /> },
  ];

  const getLayerNameById = (id) => {
    const mainLayer = mainLayers.find(layer => layer.id === id);
    if (mainLayer) return mainLayer.label;
    
    const allLayerLists = [
      allLayers,
      mappingLayers,
      tourismLayers,
      cadasterLayers,
      resourcesLayers,
      transportationLayers,
      statisticalDataLayers,
      publicInstitutionsLayers,
      environmentLayers
    ];
    
    for (const layerList of allLayerLists) {
      const layer = layerList.find(layer => layer.id === id);
      if (layer) return layer.label;
    }
    
    return 'Layer Options';
  };

  const getLayerOpacity = (id) => {
    if (id === 'parcels') return parcelsOpacity;
    if (id === 'blocks') return blocksOpacity;
    if (id === 'retzefmigrashim') return retzefmigrashimOpacity;
    return 1;
  };

  const filterLayers = (layers) => {
    return layers.filter(layer =>
      layer.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filterLocalAuthorities = () => {
    return localAuthorities.filter(authority =>
      authority.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getLayersToDisplay = () => {
    switch (categoryFilter) {
      case 'All Categories':
        return filterLayers(allLayers);
      case 'Mapping, enclosures and boundaries':
        return filterLayers(mappingLayers);
      case 'Tourism, nature, leisure and sports':
        return filterLayers(tourismLayers);
      case 'Cadaster, real estate and planning':
        return filterLayers(cadasterLayers);
      case 'Resources, infrastructure and energy':
        return filterLayers(resourcesLayers);
      case 'Transportation':
        return filterLayers(transportationLayers);
      case 'Statistical data':
        return filterLayers(statisticalDataLayers);
      case 'Public institutions and services':
        return filterLayers(publicInstitutionsLayers);
      case 'Environment and waste':
        return filterLayers(environmentLayers);
      default:
        return [];
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedAuthority(null);
    setCategoryFilter('All Categories');
    setCategoryDropdownOpen(false);
  };

  return (
    <div
      className={`bg-white shadow-lg z-40 transition-all duration-300 ease-in-out ${sidePanelOpen ? (additionalLayersOpen ? 'w-[500px]' : 'w-[320px]') : 'w-0'} overflow-hidden flex flex-col border-r border-gray-200`}
    >
      <div className="p-3 h-full flex flex-col">
        {!activeMenuLayerId ? (
          <>
            {!additionalLayersOpen ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-bold text-gray-800">Data Layers</h2>
                  <button
                    onClick={toggleSidePanel}
                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="space-y-1">
                    {mainLayers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`flex items-center p-1.5 rounded-md border relative bg-blue-50 border-blue-200`}
                      >
                        <input
                          type="checkbox"
                          id={layer.id}
                          className="h-3.5 w-3.5 text-blue-600 rounded"
                          checked={
                            layer.id === 'parcels' ? parcelsVisible :
                            layer.id === 'blocks' ? blocksVisible :
                            layer.id === 'retzefmigrashim' ? retzefmigrashimVisible :
                            layer.defaultChecked
                          }
                          onChange={(e) => {
                            if (layer.id === 'parcels') {
                              setParcelsVisible(e.target.checked);
                            } else if (layer.id === 'blocks') {
                              setBlocksVisible(e.target.checked);
                            } else if (layer.id === 'retzefmigrashim') {
                              setRetzefmigrashimVisible(e.target.checked);
                            }
                          }}
                        />
                        <label htmlFor={layer.id} className="ml-2 text-xs font-medium text-gray-700 flex-1">
                          {layer.label}
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerMenu(layer.id);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                          <FaEllipsisV className="text-xs" />
                        </button>
                      </div>
                    ))}
                    <div className="mt-3">
                      <button
                        onClick={toggleAdditionalLayers}
                        className="w-full py-1.5 px-3 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <span>ADDITIONAL LAYERS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center mb-3">
                  <button
                    onClick={backToInitialLayers}
                    className="mr-2 text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                  >
                    <FaArrowLeft className="text-sm" />
                  </button>
                  <h2 className="text-base font-bold text-gray-800">Additional Layers</h2>
                  <button
                    onClick={toggleSidePanel}
                    className="ml-auto text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                <div className="flex border-b border-gray-200 mb-3 flex-shrink-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-2 py-1.5 text-xs font-medium transition-colors duration-200 ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-hidden flex">
                  <div className="w-1/2 border-r border-gray-200 p-3">
                    {activeTab === 'Local Authorities' ? (
                      <>
                        <div className="relative mb-3">
                          <button
                            className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md text-xs bg-white hover:bg-gray-50"
                            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                          >
                            <span>Display by categories</span>
                            <FaChevronDown className={`text-gray-400 text-xs transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {categoryDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {localAuthorityCategories.map((category) => (
                                <button
                                  key={category.id}
                                  className={`flex items-center w-full p-2 text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                  onClick={() => {
                                    setCategoryFilter(category.id);
                                    setCategoryDropdownOpen(false);
                                  }}
                                >
                                  <span className="mr-2">{category.icon}</span>
                                  <span className="text-left">{category.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          {localAuthorityCategories.map((category) => (
                            <button
                              key={category.id}
                              className={`flex flex-col items-center justify-center p-2 border rounded-md text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                              onClick={() => setCategoryFilter(category.id)}
                            >
                              {category.icon}
                              <span className="mt-1 text-center">{category.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-3">
                          <button
                            className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md text-xs bg-white hover:bg-gray-50"
                            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                          >
                            <span>Display by categories</span>
                            <FaChevronDown className={`text-gray-400 text-xs transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {categoryDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {categoryOptions.map((category) => (
                                <button
                                  key={category.id}
                                  className={`flex items-center w-full p-2 text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                  onClick={() => {
                                    setCategoryFilter(category.id);
                                    setCategoryDropdownOpen(false);
                                  }}
                                >
                                  <span className="mr-2">{category.icon}</span>
                                  <span className="text-left">{category.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          {categoryOptions.slice(0, 8).map((category) => (
                            <button
                              key={category.id}
                              className={`flex flex-col items-center justify-center p-2 border rounded-md text-xs transition-colors duration-200 ${categoryFilter === category.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                              onClick={() => setCategoryFilter(category.id)}
                            >
                              {category.icon}
                              <span className="mt-1 text-center">{category.label.split(',').join(',\n')}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="w-1/2 p-3 flex flex-col">
                    {activeTab === 'Local Authorities' ? (
                      <>
                        <div className="relative mb-3">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 text-xs" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search Local Authorities"
                            className="block w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                          <div className="space-y-1">
                            {filterLocalAuthorities().map((authority) => (
                              <div
                                key={authority.id}
                                className={`flex items-center p-1.5 rounded-md cursor-pointer ${selectedAuthority?.id === authority.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                                onClick={() => setSelectedAuthority(authority)}
                              >
                                <FaBuilding className="text-gray-500 mr-2" />
                                <span className="ml-2 text-xs font-medium text-gray-700 flex-1">
                                  {authority.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-3">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 text-xs" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search Layer"
                            className="block w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                          <div className="space-y-1">
                            {getLayersToDisplay().map((option) => (
                              <div key={option.id} className="flex items-center p-1 hover:bg-gray-50 rounded-sm relative">
                                {option.color && (
                                  <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: option.color }}></div>
                                )}
                                <input
                                  type="checkbox"
                                  id={option.id}
                                  className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
                                  defaultChecked={false}
                                />
                                <label htmlFor={option.id} className="ml-1.5 text-xs text-gray-700 flex-1">{option.label}</label>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLayerMenu(option.id);
                                  }}
                                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                                >
                                  <FaEllipsisV className="text-xs" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <LayerOptionsMenu
            layerId={activeMenuLayerId}
            layerName={getLayerNameById(activeMenuLayerId)}
            initialOpacity={getLayerOpacity(activeMenuLayerId)}
            onOpacityChange={(opacity) => handleLayerOpacityChange(activeMenuLayerId, opacity)}
            onBack={handleBackToPreviousState}
            onClose={() => setActiveMenuLayerId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SidePanel;