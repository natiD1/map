import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaSave, FaUpload, FaTrash, FaPlus,
  FaMapMarkerAlt, FaUser, FaFile, FaImage, FaIdCard,
  FaBuilding, FaGlobe, FaHashtag,
  FaFilePdf, FaFileImage, FaFileAlt, FaDownload,
  FaUserPlus, FaUserMinus, FaCheckCircle, FaExclamationTriangle,
  FaSpinner, FaPause, FaGripVertical, FaEdit, FaPhone, FaEnvelope, FaEye,
  FaInfoCircle, FaQuestionCircle, FaExclamationCircle, FaTimesCircle,
  FaExpand, FaCompress, FaStar, FaRegStar, FaSearchLocation, FaChevronDown,
  FaChevronUp, FaCrop, FaCheck, FaTh, FaList, FaSun, FaMoon
} from 'react-icons/fa';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ============================================
// UTILITY HOOKS
// ============================================

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================

const ToastNotification = ({ message, type, onClose, id, theme = 'dark' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const isDark = theme === 'dark';

  const getIcon = () => {
    switch (type) {
      case 'success': return <FaCheckCircle className={isDark ? "text-green-400" : "text-green-500"} />;
      case 'error': return <FaTimesCircle className={isDark ? "text-red-400" : "text-red-500"} />;
      case 'warning': return <FaExclamationTriangle className={isDark ? "text-yellow-400" : "text-yellow-500"} />;
      case 'info': return <FaInfoCircle className={isDark ? "text-blue-400" : "text-blue-500"} />;
      default: return <FaInfoCircle className={isDark ? "text-blue-400" : "text-blue-500"} />;
    }
  };

  const getBgClasses = () => {
    if (isDark) {
      switch (type) {
        case 'success': return 'bg-green-900/80 border-green-700';
        case 'error': return 'bg-red-900/80 border-red-700';
        case 'warning': return 'bg-yellow-900/80 border-yellow-700';
        case 'info': return 'bg-blue-900/80 border-blue-700';
        default: return 'bg-blue-900/80 border-blue-700';
      }
    } else {
       switch (type) {
        case 'success': return 'bg-green-100 border-green-300 text-green-800';
        case 'error': return 'bg-red-100 border-red-300 text-red-800';
        case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        case 'info': return 'bg-blue-100 border-blue-300 text-blue-800';
        default: return 'bg-blue-100 border-blue-300 text-blue-800';
      }
    }
  };
  
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const closeButtonColor = isDark ? 'text-white text-opacity-70 hover:text-opacity-100' : 'text-gray-600 hover:text-gray-900';

  return (
    <motion.div
      className={`${getBgClasses()} backdrop-blur-md p-4 rounded-lg shadow-lg mb-3 flex items-start max-w-md border`}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {getIcon()}
      </div>
      <div className={`flex-1 ${textColor}`}>
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`ml-3 flex-shrink-0 transition-opacity ${closeButtonColor}`}
      >
        <FaTimes size={14} />
      </button>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onClose, theme = 'dark' }) => {
  return (
    <div className="fixed top-4 right-4 z-[1005] space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onClose}
            theme={theme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================

const CollapsibleSection = ({ title, isOpen, onToggle, children, icon: Icon, badge, theme }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={`mb-6 rounded-xl border overflow-hidden transition-all ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-200'}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'}`}
      >
        <div className="flex items-center">
          {Icon && <Icon className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} text-xl mr-3`} />}
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          {badge && (
            <span className={`ml-3 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className={isDark ? 'text-gray-400' : 'text-gray-600'} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// INPUT FIELD COMPONENT WITH VALIDATION
// ============================================

const InputField = ({
  label, name, value, onChange, required, disabled,
  type = 'text', options, error, helperText, icon, placeholder, 
  className = '', theme = 'dark', onBlur, autoComplete = 'off'
}) => {
  const [focused, setFocused] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const isDark = theme === 'dark';

  const baseClasses = `w-full px-4 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`;
  const themeClasses = isDark 
    ? 'bg-gray-800/50 text-white placeholder-gray-500' 
    : 'bg-white text-gray-900 placeholder-gray-400';
  const borderClasses = error 
    ? 'border-red-500' 
    : focused 
      ? 'border-cyan-500' 
      : (isDark ? 'border-gray-700' : 'border-gray-300');
  const iconColor = isDark ? 'text-gray-500' : 'text-gray-400';
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const errorColor = isDark ? 'text-red-400' : 'text-red-600';
  const helperTextColor = isDark ? 'text-gray-500' : 'text-gray-500';
  const successColor = isDark ? 'text-green-400' : 'text-green-600';

  const handleBlur = (e) => {
    setFocused(false);
    setShowValidation(true);
    if (onBlur) onBlur(e);
  };

  const isValid = showValidation && !error && value && value.toString().trim() !== '';

  return (
    <div className={`relative ${className}`}>
      <label className={`block text-sm font-medium ${labelColor} mb-1.5`}>
        {label} {required && <span className={isDark ? "text-red-400" : "text-red-500"}>*</span>}
      </label>

      {type === 'select' ? (
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {React.cloneElement(icon, { className: `${iconColor} text-sm` })}
            </div>
          )}
          <select
            name={name} value={value} onChange={onChange} disabled={disabled}
            className={`${baseClasses} ${themeClasses} ${borderClasses} ${icon ? 'pl-10' : ''} pr-10`}
            onFocus={() => setFocused(true)} 
            onBlur={handleBlur}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className={isDark ? "text-gray-900" : ""}>
                {option.label}
              </option>
            ))}
          </select>
          <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      ) : (
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {React.cloneElement(icon, { className: `${iconColor} text-sm` })}
            </div>
          )}
          <input
            type={type} name={name} value={value} onChange={onChange} required={required}
            disabled={disabled} placeholder={placeholder}
            className={`${baseClasses} ${themeClasses} ${borderClasses} ${icon ? 'pl-10' : ''} ${isValid ? 'pr-10' : ''}`}
            onFocus={() => setFocused(true)} 
            onBlur={handleBlur}
            autoComplete={autoComplete}
          />
          {isValid && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaCheck className={successColor} size={14} />
            </div>
          )}
        </div>
      )}

      {error && (
        <motion.div
          className={`flex items-center mt-1 ${errorColor} text-xs`}
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        >
          <FaExclamationCircle className="mr-1" /> {error}
        </motion.div>
      )}
      {helperText && !error && (
        <div className={`flex items-center mt-1 ${helperTextColor} text-xs`}>
          <FaInfoCircle className="mr-1" /> {helperText}
        </div>
      )}
    </div>
  );
};

// ============================================
// TEXTAREA FIELD COMPONENT
// ============================================

const TextAreaField = ({
  label, name, value, onChange, disabled, rows = 3, error, helperText, placeholder, className = '', theme = 'dark'
}) => {
  const [focused, setFocused] = useState(false);
  const isDark = theme === 'dark';

  const baseClasses = `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed`;
  const themeClasses = isDark 
    ? 'bg-gray-800/50 text-white placeholder-gray-500' 
    : 'bg-white text-gray-900 placeholder-gray-400';
  const borderClasses = error 
    ? 'border-red-500' 
    : focused 
      ? 'border-cyan-500' 
      : (isDark ? 'border-gray-700' : 'border-gray-300');
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const errorColor = isDark ? 'text-red-400' : 'text-red-600';
  const helperTextColor = isDark ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`relative ${className}`}>
      <label className={`block text-sm font-medium ${labelColor} mb-1.5`}>
        {label}
      </label>
      <textarea
        name={name} value={value} onChange={onChange} rows={rows} disabled={disabled} placeholder={placeholder}
        className={`${baseClasses} ${themeClasses} ${borderClasses}`}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {error && (
        <motion.div
          className={`flex items-center mt-1 ${errorColor} text-xs`}
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        >
          <FaExclamationCircle className="mr-1" /> {error}
        </motion.div>
      )}
      {helperText && !error && (
        <div className={`flex items-center mt-1 ${helperTextColor} text-xs`}>
          <FaInfoCircle className="mr-1" /> {helperText}
        </div>
      )}
    </div>
  );
};

// ============================================
// SORTABLE FILE ITEM COMPONENT
// ============================================

const SortableFileItem = ({ file, index, onRemove, onSetPrimary, isPrimary, isViewable, onView, theme, fileType }) => {
  const isDark = theme === 'dark';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id || `file-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const decodeFilename = (filename) => {
    if (!filename) return '';
    try {
      return decodeURIComponent(filename);
    } catch (error) {
      return filename;
    }
  };

  const getFileIcon = (fileName) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FaFileImage className="text-blue-400" />;
    if (ext === 'pdf') return <FaFilePdf className="text-red-400" />;
    if (['dwg', 'dwf', 'dws'].includes(ext)) return <FaBuilding className="text-yellow-400" />;
    return <FaFile className={isDark ? "text-gray-400" : "text-gray-500"} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
  };

  const displayName = decodeFilename(file.file_name || file.name);
  const fileItemClasses = isDark 
    ? 'bg-gray-800 border-gray-700 group hover:border-gray-600' 
    : 'bg-white border-gray-200 group hover:border-gray-300';
  const fileIconBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const fileNameColor = isDark ? 'text-white' : 'text-gray-900';
  const fileSizeColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const buttonHoverClasses = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${fileItemClasses} ${isDragging ? 'shadow-lg z-10' : ''}`}
    >
      <div className="flex items-center min-w-0 flex-1">
        <div 
          {...attributes} 
          {...listeners}
          className={`p-2 rounded cursor-grab active:cursor-grabbing mr-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <FaGripVertical className={isDark ? 'text-gray-500' : 'text-gray-400'} />
        </div>

        <div className={`p-2 rounded-lg mr-3 text-lg ${fileIconBg}`}>
          {getFileIcon(displayName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <div className={`text-sm font-medium truncate ${fileNameColor}`} title={displayName}>
              {displayName || 'Unnamed File'}
            </div>
            {isPrimary && fileType === 'house_photos' && (
              <FaStar className="text-yellow-400 ml-2 flex-shrink-0" size={14} title="Primary Photo" />
            )}
          </div>
          <div className={`text-xs flex items-center mt-0.5 ${fileSizeColor}`}>
            {formatFileSize(file.file_size || file.size)}
            {file.file && <span className="ml-2 text-cyan-400 text-xs bg-cyan-900/30 px-1.5 py-0.5 rounded">New</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {fileType === 'house_photos' && (
          <button
            type="button"
            onClick={() => onSetPrimary(index)}
            className={`p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-yellow-400 rounded-full ${buttonHoverClasses}`}
            title={isPrimary ? "Primary Photo" : "Set as Primary"}
          >
            {isPrimary ? <FaStar /> : <FaRegStar />}
          </button>
        )}
        {file.file_url && (
          <button
            type="button"
            onClick={() => onView ? onView(file) : null}
            className={`p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-cyan-400 rounded-full ${buttonHoverClasses}`}
            title={isViewable ? "View" : "Download"}
          >
            {isViewable ? <FaEye /> : <FaDownload />}
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className={`p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-red-400 rounded-full ${buttonHoverClasses}`}
          title="Remove"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// ============================================
// ENHANCED FILE UPLOAD SECTION WITH DND
// ============================================

const EnhancedFileUploadSection = ({ 
  title, fileType, icon: Icon, accept, description, 
  maxFileSize = 10 * 1024 * 1024, onFileChange, onRemoveFile, 
  files, showToast, theme = 'dark', onReorderFiles, onSetPrimaryFile,
  primaryFileId, viewMode = 'list', onViewModeChange
}) => {
  const [isSectionDragging, setIsSectionDragging] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const isDark = theme === 'dark';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsSectionDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsSectionDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsSectionDragging(false); setUploadErrors([]);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(Array.from(e.dataTransfer.files));
  };
  const handleInputChange = (e) => { if (e.target.files && e.target.files.length > 0) processFiles(Array.from(e.target.files)); };
  
  const processFiles = (filesToProcess) => {
    const errors = [];
    const validFiles = [];
    
    filesToProcess.forEach((file, idx) => {
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isValidType = acceptedTypes.includes(fileExtension) || acceptedTypes.includes(file.type) || acceptedTypes.some(type => file.type.includes(type.replace('.', '')));
      const isValidSize = file.size <= maxFileSize;
      
      if (!isValidType) {
        errors.push({ name: file.name, error: `Invalid file type. Only ${acceptedTypes.join(', ')} are allowed.` });
      } else if (!isValidSize) {
        errors.push({ name: file.name, error: `File too large. Max size is ${formatFileSize(maxFileSize)}.` });
      } else {
        validFiles.push(file);
        const fileId = `temp-${Date.now()}-${idx}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        simulateUploadProgress(fileId);
      }
    });
    
    setUploadErrors(errors);
    if (validFiles.length > 0) {
      onFileChange(validFiles, fileType);
      showToast(`${validFiles.length} file(s) added successfully`, 'success');
    }
    if (errors.length > 0) {
      showToast(`${errors.length} file(s) could not be added`, 'warning');
    }
  };

  const simulateUploadProgress = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 500);
      }
    }, 100);
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
  };

  const handleSecureDownload = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/locations${file.file_url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
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
      console.error('Download error:', error);
      showToast('Failed to download file', 'error');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex(f => (f.id || f.name) === active.id);
      const newIndex = files.findIndex(f => (f.id || f.name) === over.id);
      onReorderFiles(arrayMove(files, oldIndex, newIndex), fileType);
      showToast('Files reordered', 'info');
    }
  };

  const isViewable = (fileName) => {
    return ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => 
      (fileName || '').toLowerCase().endsWith(ext)
    );
  };

  const containerClasses = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-200';
  const headerTextClasses = isDark ? 'text-white' : 'text-gray-900';
  const headerSubTextClasses = isDark ? 'text-white/80' : 'text-gray-600';
  const dividerClasses = isDark ? 'border-gray-700' : 'border-gray-200';
  const dragAreaBaseClasses = isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-400 hover:border-gray-500';
  const dragAreaActiveClasses = isDark ? 'border-cyan-500 bg-cyan-900/20' : 'border-cyan-500 bg-cyan-100/50';
  const dropzoneTextClasses = isDark ? 'text-gray-400' : 'text-gray-600';
  const dropzoneSubTextClasses = isDark ? 'text-gray-500' : 'text-gray-500';
  const noFilesTextColor = isDark ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`mb-6 rounded-xl border overflow-hidden ${containerClasses}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Icon className={`${headerTextClasses} text-xl mr-3`} />
          <div>
            <h3 className={`text-lg font-bold ${headerTextClasses}`}>{title}</h3>
            <p className={`text-xs ${headerSubTextClasses}`}>{description}</p>
          </div>
        </div>
        
        {fileType === 'house_photos' && files.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? (isDark ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
              title="Grid View"
            >
              <FaTh />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded ${viewMode === 'list' ? (isDark ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
              title="List View"
            >
              <FaList />
            </button>
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${dividerClasses} ${isSectionDragging ? (isDark ? 'bg-gray-700/50' : 'bg-gray-200/50') : ''}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isSectionDragging ? dragAreaActiveClasses : dragAreaBaseClasses}`} onClick={() => fileInputRef.current?.click()}>
          <FaUpload className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`} />
          <p className={`text-sm ${dropzoneTextClasses} mb-1`}>Click to upload or drag and drop</p>
          <p className={`text-xs ${dropzoneSubTextClasses}`}>Accepted: {accept.split(',').join(', ')}</p>
          <p className={`text-xs ${dropzoneSubTextClasses} mt-1`}>Max size: {formatFileSize(maxFileSize)}</p>
          <input ref={fileInputRef} type="file" multiple accept={accept} className="hidden" onChange={handleInputChange} />
        </div>

        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Uploading...</span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{progress}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                  <motion.div
                    className="h-full bg-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadErrors.length > 0 && (
          <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-100 border-red-300'}`}>
            <p className={`text-sm mb-2 font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>Upload errors:</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {uploadErrors.map((error, index) => (
                <div key={index} className={`text-xs ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                  <div className="font-medium">{error.name}</div>
                  <div>{error.error}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
        {files.length === 0 ? (
          <div className={`text-center py-8 ${noFilesTextColor} text-sm`}>No files attached.</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={files.map(f => f.id || f.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className={viewMode === 'grid' && fileType === 'house_photos' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-3'}>
                {files.map((file, index) => {
                  if (!file) return null;
                  const displayName = file.file_name || file.name;
                  const isPrimary = primaryFileId === (file.id || file.name);
                  const fileIsViewable = isViewable(displayName);
                  
                  return (
                    <SortableFileItem
                      key={file.id || `file-${index}`}
                      file={file}
                      index={index}
                      onRemove={onRemoveFile}
                      onSetPrimary={onSetPrimaryFile}
                      isPrimary={isPrimary}
                      isViewable={fileIsViewable}
                      onView={fileIsViewable ? handleSecureDownload : null}
                      theme={theme}
                      fileType={fileType}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

// ============================================
// IMAGE GALLERY WITH LIGHTBOX
// ============================================

const ImageGallery = ({ images, onSetPrimary, primaryImageId, onRemove, theme }) => {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [imageUrls, setImageUrls] = useState({});
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchImages = async () => {
      const token = localStorage.getItem('token');
      const urls = {};
      
      for (const img of images) {
        if (img.file_url) {
          try {
            const response = await fetch(`http://localhost:5001/api/locations${img.file_url}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            urls[img.id || img.name] = URL.createObjectURL(blob);
          } catch (err) {
            console.error('Error loading image:', err);
          }
        } else if (img.file) {
          urls[img.id || img.name] = URL.createObjectURL(img.file);
        }
      }
      
      setImageUrls(urls);
    };
    
    fetchImages();
    
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(-1);

  const lightboxSlides = images.map((img, index) => ({
    src: imageUrls[img.id || img.name] || '',
    alt: img.file_name || img.name || `Image ${index + 1}`,
    title: img.file_name || img.name
  }));

  if (images.length === 0) {
    return (
      <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <FaImage className="mx-auto text-4xl mb-3 opacity-50" />
        <p>No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => {
          const imgId = img.id || img.name;
          const isPrimary = primaryImageId === imgId;
          
          return (
            <motion.div
              key={imgId}
              className="relative group rounded-lg overflow-hidden aspect-square"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {imageUrls[imgId] && (
                <img
                  src={imageUrls[imgId]}
                  alt={img.file_name || img.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(index)}
                />
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSetPrimary(index); }}
                    className={`p-2 rounded-full ${isPrimary ? 'bg-yellow-500 text-white' : 'bg-white text-gray-900'} hover:scale-110 transition-transform`}
                    title={isPrimary ? "Primary Photo" : "Set as Primary"}
                  >
                    <FaStar size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openLightbox(index); }}
                    className="p-2 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform"
                    title="View Full Size"
                  >
                    <FaEye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                    className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                    title="Remove"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
              
              {isPrimary && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <FaStar className="mr-1" size={10} /> Primary
                </div>
              )}
              
              {img.file && (
                <div className="absolute top-2 left-2 bg-cyan-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  New
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={closeLightbox}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Zoom, Fullscreen]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true
        }}
        animation={{ fade: 300 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
};

// ============================================
// MAIN EDIT LOCATION FORM COMPONENT
// ============================================

const EditLocationForm = ({
  location,
  onSave,
  onCancel,
  onGeometryUpdate,
  theme: initialTheme = 'dark',
}) => {
  // Internal theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('editFormTheme') || initialTheme;
  });

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('editFormTheme', newTheme);
  };

  const isDark = theme === 'dark';
  const [toasts, setToasts] = useState([]);
  const [nextToastId, setNextToastId] = useState(1);
  const { width: windowWidth } = useWindowSize();
  const isMobile = useMemo(() => windowWidth < 768, [windowWidth]);

  const showToast = useCallback((message, type = 'info') => {
    const id = nextToastId;
    setNextToastId(prev => prev + 1);
    setToasts(prev => [...prev, { id, message, type }]);
  }, [nextToastId]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', address: '', city: '', country: '', description: '',
    owners: [{ first_name: '', last_name: '', id_number: '', phone: '', email: '' }],
    license_status: 'no_licence', property_type: 'residential',
    gush_num: '', gush_suffix: '', parcel_num: '', legal_area: '',
    points: []
  });

  const [files, setFiles] = useState({
    house_plans: [], house_photos: [], license_documents: [], house_info_documents: []
  });

  const [filesToDelete, setFilesToDelete] = useState({
    house_plans: [], house_photos: [], license_documents: [], house_info_documents: []
  });

  const [primaryFiles, setPrimaryFiles] = useState({
    house_photos: null
  });

  const [viewModes, setViewModes] = useState({
    house_photos: 'grid'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [openSections, setOpenSections] = useState({
    propertyInfo: true,
    parcelInfo: false,
    ownerInfo: true,
    files: true
  });

  useEffect(() => {
    if (!isMobile) {
      const formWidth = 896;
      const centerX = window.innerWidth / 2 - formWidth / 2;
      const centerY = 80;
      setPosition({ x: Math.max(20, centerX), y: centerY });
    }
  }, [isMobile]);

  const debouncedName = useDebounce(formData.name, 500);
  
  useEffect(() => {
    if (touchedFields.name && debouncedName.trim() === '') {
      setErrors(prev => ({ ...prev, name: 'Property name is required' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  }, [debouncedName, touchedFields.name]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }
    
    const hasValidOwner = formData.owners.some(owner => owner.first_name.trim() !== '');
    if (!hasValidOwner) {
      newErrors.owners = 'At least one owner with first name is required';
    }
    
    formData.owners.forEach((owner, index) => {
      if (owner.email && !/^\S+@\S+\.\S+$/.test(owner.email)) {
        newErrors[`ownerEmail_${index}`] = 'Please enter a valid email address';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleMouseDown = (e) => {
    if (!e.target.closest('.drag-header') || isMobile || isMaximized) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const formWidth = formRef.current?.offsetWidth || 800;
    const formHeight = formRef.current?.offsetHeight || 600;
    const padding = 20;
    const maxX = window.innerWidth - formWidth - padding;
    const maxY = window.innerHeight - formHeight - padding;
    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY))
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  useEffect(() => {
    if (location) {
      let ownersData = [{ first_name: '', last_name: '', id_number: '', phone: '', email: '' }];
      if (location.owners && Array.isArray(location.owners) && location.owners.length > 0) {
        ownersData = location.owners;
      }
      
      let pointsData = [];
      if (location.boundary_coords?.type === 'Polygon' && location.boundary_coords.coordinates?.[0]) {
        pointsData = location.boundary_coords.coordinates[0].slice(0, -1).map(p => [p[1], p[0]]);
      }
      
      setFormData({
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        country: location.country || '',
        description: location.description || '',
        owners: ownersData,
        license_status: location.license_status || 'no_licence',
        property_type: location.property_type || 'residential',
        gush_num: location.gush_num || '',
        gush_suffix: location.gush_suffix || '',
        parcel_num: location.parcel_num || '',
        legal_area: location.legal_area || '',
        points: pointsData
      });
      
      setFiles({
        house_plans: location.house_plans || [],
        house_photos: location.house_photos || [],
        license_documents: location.license_documents || location.licence_files || [],
        house_info_documents: location.additional_documents || []
      });
      
      const photos = location.house_photos || [];
      if (photos.length > 0) {
        const primaryPhoto = photos.find(p => p.is_primary) || photos[0];
        setPrimaryFiles(prev => ({ ...prev, house_photos: primaryPhoto.id || primaryPhoto.name }));
      }
    }
  }, [location]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleOwnerChange = useCallback((index, field, value) => {
    const newOwners = [...formData.owners];
    newOwners[index][field] = value;
    setFormData(prev => ({ ...prev, owners: newOwners }));
    
    if (errors[`owner${field}_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`owner${field}_${index}`];
        return newErrors;
      });
    }
  }, [formData.owners, errors]);

  const addOwner = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      owners: [...prev.owners, { first_name: '', last_name: '', id_number: '', phone: '', email: '' }]
    }));
    showToast('New owner field added', 'info');
  }, [showToast]);

  const removeOwner = useCallback((index) => {
    if (formData.owners.length > 1) {
      setFormData(prev => ({
        ...prev,
        owners: prev.owners.filter((_, i) => i !== index)
      }));
      showToast('Owner removed', 'info');
    }
  }, [formData.owners.length, showToast]);

  const handleFileChange = useCallback((newFiles, fileType) => {
    const processedFiles = newFiles.map(file => ({
      file,
      id: '_' + Math.random().toString(36).substr(2, 9),
      name: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type
    }));
    
    setFiles(prev => ({
      ...prev,
      [fileType]: [...prev[fileType], ...processedFiles]
    }));
  }, []);

  const handleRemoveFile = useCallback((fileIndex, fileType) => {
    const fileToRemove = files[fileType][fileIndex];
    
    if (fileToRemove.id && !fileToRemove.file) {
      setFilesToDelete(prev => ({
        ...prev,
        [fileType]: [...(prev[fileType] || []), fileToRemove.id]
      }));
    }
    
    setFiles(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter((_, i) => i !== fileIndex)
    }));
    
    showToast('File removed', 'info');
  }, [files, showToast]);

  const handleReorderFiles = useCallback((reorderedFiles, fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: reorderedFiles
    }));
  }, []);

  const handleSetPrimaryFile = useCallback((fileIndex, fileType) => {
    const file = files[fileType][fileIndex];
    setPrimaryFiles(prev => ({
      ...prev,
      [fileType]: file.id || file.name
    }));
    showToast('Primary file set', 'success');
  }, [files, showToast]);

  const handleViewModeChange = useCallback((mode) => {
    setViewModes(prev => ({
      ...prev,
      house_photos: mode
    }));
  }, []);

  const toggleSection = useCallback((section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please correct the errors before saving.', 'error');
      return;
    }
    
    setLoading(true);
    
    const submitData = new FormData();
    
    submitData.append('name', formData.name);
    submitData.append('address', formData.address);
    submitData.append('city', formData.city);
    submitData.append('country', formData.country);
    submitData.append('description', formData.description);
    submitData.append('license_status', formData.license_status);
    submitData.append('property_type', formData.property_type);
    submitData.append('owners', JSON.stringify(formData.owners));
    
    Object.keys(files).forEach(fileType => {
      files[fileType].forEach(fileObject => {
        if (fileObject.file) {
          submitData.append(fileType, fileObject.file, fileObject.name);
        }
      });
    });
    
    submitData.append('filesToDelete', JSON.stringify(filesToDelete));
    submitData.append('primaryFiles', JSON.stringify(primaryFiles));
    
    try {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5001/api/locations/${location.id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: submitData
  });
  
  const responseData = await response.json();
  
  if (response.ok) {
        if (response.status === 202) {
          showToast(responseData.message, 'info');
          setTimeout(() => onCancel(), 2000);
        } else {
          showToast(responseData.message, 'success');
          setTimeout(() => onSave(responseData.location), 1000);
        }
      } else {
    // Create error object with all details
    const error = new Error(responseData.message || 'Server error');
    error.errors = responseData.errors; // Include validation errors
    error.field = responseData.field; // Include problematic field
    error.hint = responseData.hint; // Include hint if available
    throw error;
  }
    } catch (err) {
  console.error('Error submitting form:', err);
  
  // Check if response has detailed file validation errors
  if (err.errors && Array.isArray(err.errors)) {
    // Show each file error
    err.errors.forEach(fileError => {
      showToast(
        `${fileError.filename}: ${fileError.error}`, 
        'error'
      );
    });
    showToast('Some files could not be uploaded. Please check file types and sizes.', 'warning');
  } else {
    showToast(err.message || 'An unexpected error occurred during submission.', 'error');
  }
} finally {
  setLoading(false);
}
  }, [formData, files, filesToDelete, primaryFiles, location.id, validateForm, onSave, onCancel, showToast]);

  const toggleMaximize = () => setIsMaximized(!isMaximized);

  const modalBg = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const headerBg = isDark ? 'bg-gray-850' : 'bg-gray-100';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const iconColor = isDark ? 'text-gray-500' : 'text-gray-500';
  const parcelInfoBg = isDark ? 'bg-gray-800/40' : 'bg-gray-100/50';
  const parcelInfoBorder = isDark ? 'border-gray-700/80' : 'border-gray-200/80';
  const dataBoxBg = isDark ? 'bg-gray-800/80' : 'bg-white';
  const dataBoxSubText = isDark ? 'text-gray-400' : 'text-gray-500';
  const dataBoxText = isDark ? 'text-white' : 'text-gray-800';
  const ownerSectionBg = isDark ? 'bg-gray-800/40' : 'bg-gray-100';
  const addOwnerButtonBorder = isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400';
  const addOwnerButtonBg = isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50';
  const addOwnerButtonText = isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800';
  const footerBg = isDark ? 'bg-gray-850' : 'bg-gray-100';
  const footerBorder = isDark ? 'border-gray-800' : 'border-gray-200';
  const cancelButtonClasses = isDark 
    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700' 
    : 'bg-white text-gray-700 hover:bg-gray-200 border-gray-300';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 ${isDark ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} z-[1003] backdrop-blur-sm 
                   ${isMobile || isMaximized ? 'flex items-center justify-center' : ''}`}
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <motion.div
          ref={formRef}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.320, 1] }}
          className={`${modalBg} shadow-2xl border ${borderColor} flex flex-col overflow-hidden 
                     ${isMaximized ? 'w-full h-full rounded-none' 
                                  : isMobile ? 'w-full h-full rounded-none' 
                                             : 'max-w-4xl max-h-[90vh] rounded-xl'}`}
          style={{
            ...( !isMobile && !isMaximized && {
                position: 'fixed',
                left: position.x,
                top: position.y,
            }),
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            zIndex: isDragging ? 1004 : 1003,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* HEADER WITH THEME TOGGLE */}
          <div
            className={`flex justify-between items-center p-4 border-b ${headerBg} ${borderColor} ${
              !isDragging && !isMobile && !isMaximized ? 'cursor-grab active:cursor-grabbing' : ''
            } drag-header select-none`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="flex items-center flex-1 min-w-0">
              <FaGripVertical className={`${iconColor} mr-3 flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <h2 className={`text-xl font-bold ${textColor} flex items-center truncate`}>
                  <FaEdit className="mr-2 text-cyan-500 flex-shrink-0" />
                  <span className="truncate">Edit Property</span>
                </h2>
                <p className={`text-xs ${subTextColor} mt-0.5 hidden sm:block truncate`}>
                  {formData.name || 'Unnamed Property'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleThemeToggle();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded-full transition-colors ${
                  isDark 
                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>

              {/* Maximize Button */}
              <button
                onClick={toggleMaximize}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? <FaCompress size={16} /> : <FaExpand size={16} />}
              </button>

              {/* Close Button */}
              <button
                onClick={onCancel}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                aria-label="Close"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${!isDark && 'custom-scrollbar-light'}`}>
            {errors.owners && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg text-sm flex items-start ${isDark ? 'bg-red-900/30 border-red-800/50 text-red-300' : 'bg-red-100 border-red-300 text-red-800'}`}
              >
                <FaExclamationTriangle className="mt-0.5 mr-3 flex-shrink-0" />
                <span>{errors.owners}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <CollapsibleSection
                title="Property Information"
                icon={FaMapMarkerAlt}
                isOpen={openSections.propertyInfo}
                onToggle={() => toggleSection('propertyInfo')}
                theme={theme}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <InputField
                      theme={theme}
                      label="Property Name / Number"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="E.g. Villa Sunset or Plot 123"
                      error={errors.name}
                      helperText="Enter a unique identifier for this property"
                      onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                    />
                  </div>
                  <InputField
                    theme={theme}
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street and number"
                    helperText="Physical street address of the property"
                    icon={<FaMapMarkerAlt />}
                  />
                  <InputField
                    theme={theme}
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    helperText="City where the property is located"
                    icon={<FaBuilding />}
                  />
                  <InputField
                    theme={theme}
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    helperText="Country where the property is located"
                    icon={<FaGlobe />}
                  />
                  <InputField
                    theme={theme}
                    label="Property Type"
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    type="select"
                    options={[
                      { value: 'residential', label: 'Residential' },
                      { value: 'commercial', label: 'Commercial' },
                      { value: 'industrial', label: 'Industrial' },
                      { value: 'land', label: 'Land / Plot' }
                    ]}
                    helperText="Select the type of property"
                  />
                  <InputField
                    theme={theme}
                    label="License Status"
                    name="license_status"
                    value={formData.license_status}
                    onChange={handleInputChange}
                    type="select"
                    options={[
                      { value: 'no_licence', label: 'No Licence' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'approved', label: 'Approved' }
                    ]}
                    helperText="Current licensing status of the property"
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      theme={theme}
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Additional details about the property..."
                      helperText="Provide any additional information about the property"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {(formData.gush_num || formData.parcel_num) && (
                <CollapsibleSection
                  title="Parcel Registry Data"
                  icon={FaHashtag}
                  isOpen={openSections.parcelInfo}
                  onToggle={() => toggleSection('parcelInfo')}
                  theme={theme}
                >
                  <div className={`p-5 rounded-xl border ${parcelInfoBg} ${parcelInfoBorder}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${dataBoxBg}`}>
                        <div className={`text-xs ${dataBoxSubText} mb-1`}>Gush</div>
                        <div className={`font-mono font-medium ${dataBoxText}`}>{formData.gush_num || '-'}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${dataBoxBg}`}>
                        <div className={`text-xs ${dataBoxSubText} mb-1`}>Parcel</div>
                        <div className={`font-mono font-medium ${dataBoxText}`}>{formData.parcel_num || '-'}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${dataBoxBg}`}>
                        <div className={`text-xs ${dataBoxSubText} mb-1`}>Suffix</div>
                        <div className={`font-mono font-medium ${dataBoxText}`}>{formData.gush_suffix || '-'}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${dataBoxBg}`}>
                        <div className={`text-xs ${dataBoxSubText} mb-1`}>Legal Area</div>
                        <div className={`font-mono font-medium ${dataBoxText}`}>
                          {formData.legal_area ? `${formData.legal_area} m²` : '-'}
                        </div>
                      </div>
                    </div>
                    <p className={`text-xs mt-3 italic ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Note: Parcel data is retrieved from official records and cannot be edited manually.
                    </p>
                  </div>
                </CollapsibleSection>
              )}

              <CollapsibleSection
                title="Owner Information"
                icon={FaUser}
                badge={`${formData.owners.length} ${formData.owners.length === 1 ? 'Owner' : 'Owners'}`}
                isOpen={openSections.ownerInfo}
                onToggle={() => toggleSection('ownerInfo')}
                theme={theme}
              >
                <div className="space-y-4">
                  {formData.owners.map((owner, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-xl border relative group ${ownerSectionBg} ${parcelInfoBorder}`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className={`font-medium ${textColor} flex items-center`}>
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs mr-2 font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
                            {index + 1}
                          </div>
                          {owner.first_name || owner.last_name ? `${owner.first_name} ${owner.last_name}` : `Owner ${index + 1}`}
                          {index === 0 && (
                            <span className="ml-2 text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
                              Primary
                            </span>
                          )}
                        </h4>

                        {formData.owners.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOwner(index)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-500 hover:text-red-500 hover:bg-red-100'}`}
                            title="Remove this owner"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          theme={theme}
                          label="First Name"
                          value={owner.first_name}
                          onChange={(e) => handleOwnerChange(index, 'first_name', e.target.value)}
                          required={index === 0}
                          placeholder="First Name"
                          error={index === 0 && !owner.first_name.trim() ? 'First name is required for primary owner' : ''}
                          icon={<FaUser />}
                        />
                        <InputField
                          theme={theme}
                          label="Last Name"
                          value={owner.last_name}
                          onChange={(e) => handleOwnerChange(index, 'last_name', e.target.value)}
                          placeholder="Last Name"
                          icon={<FaUser />}
                        />
                        <InputField
                          theme={theme}
                          label="ID / Passport Number"
                          value={owner.id_number}
                          onChange={(e) => handleOwnerChange(index, 'id_number', e.target.value)}
                          placeholder="ID Number"
                          icon={<FaIdCard />}
                          helperText="National ID or passport number"
                        />
                        <InputField
                          theme={theme}
                          label="Contact Phone"
                          value={owner.phone}
                          onChange={(e) => handleOwnerChange(index, 'phone', e.target.value)}
                          type="tel"
                          placeholder="Phone Number"
                          icon={<FaPhone />}
                          helperText="Contact phone number"
                        />
                        <div className="md:col-span-2">
                          <InputField
                            theme={theme}
                            label="Email Address"
                            value={owner.email}
                            onChange={(e) => handleOwnerChange(index, 'email', e.target.value)}
                            type="email"
                            placeholder="email@example.com"
                            icon={<FaEnvelope />}
                            error={errors[`ownerEmail_${index}`]}
                            helperText="Contact email address"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addOwner}
                  className={`mt-4 w-full py-2 border-2 border-dashed rounded-lg flex items-center justify-center transition-all group ${addOwnerButtonBorder} ${addOwnerButtonBg} ${addOwnerButtonText}`}
                >
                  <FaUserPlus className="mr-2 group-hover:text-cyan-400 transition-colors" />
                  Add Another Owner
                </button>
              </CollapsibleSection>

              <CollapsibleSection
                title="Documents & Files"
                icon={FaFile}
                badge={`${Object.values(files).flat().length} Files`}
                isOpen={openSections.files}
                onToggle={() => toggleSection('files')}
                theme={theme}
              >
                <div className="space-y-6">
                  <div>
                    <h4 className={`text-base font-semibold mb-3 flex items-center ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      <FaImage className="mr-2" /> House Photos
                    </h4>
                    <ImageGallery
                      images={files.house_photos}
                      onSetPrimary={(index) => handleSetPrimaryFile(index, 'house_photos')}
                      primaryImageId={primaryFiles.house_photos}
                      onRemove={(index) => handleRemoveFile(index, 'house_photos')}
                      theme={theme}
                    />
                    
                    <div className="mt-4">
                      <EnhancedFileUploadSection
                        theme={theme}
                        title="Add More Photos"
                        fileType="house_photos"
                        icon={FaImage}
                        accept="image/jpeg,image/png,image/webp"
                        description="Property images (JPG, PNG, WEBP)"
                        onFileChange={handleFileChange}
                        onRemoveFile={handleRemoveFile}
                        files={[]}
                        showToast={showToast}
                        maxFileSize={10 * 1024 * 1024}
                        onReorderFiles={handleReorderFiles}
                        onSetPrimaryFile={(idx) => handleSetPrimaryFile(idx, 'house_photos')}
                        primaryFileId={primaryFiles.house_photos}
                        viewMode={viewModes.house_photos}
                        onViewModeChange={handleViewModeChange}
                      />
                    </div>
                  </div>

                  <EnhancedFileUploadSection
                    theme={theme}
                    title="House Plans"
                    fileType="house_plans"
                    icon={FaFile}
                    accept=".pdf,.dwg,.dwf,.dws,.zip"
                    description="Architectural plans (PDF, DWG, DWF, DWS, zip)"
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    files={files.house_plans}
                    showToast={showToast}
                    maxFileSize={100 * 1024 * 1024}
                    onReorderFiles={handleReorderFiles}
                    onSetPrimaryFile={(idx) => handleSetPrimaryFile(idx, 'house_plans')}
                    primaryFileId={primaryFiles.house_plans}
                  />

                  <EnhancedFileUploadSection
                    theme={theme}
                    title="License Documents"
                    fileType="license_documents"
                    icon={FaIdCard}
                    accept=".pdf"
                    description="Permits and licenses (PDF)"
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    files={files.license_documents}
                    showToast={showToast}
                    maxFileSize={20 * 1024 * 1024}
                    onReorderFiles={handleReorderFiles}
                    onSetPrimaryFile={(idx) => handleSetPrimaryFile(idx, 'license_documents')}
                    primaryFileId={primaryFiles.license_documents}
                  />

                  <EnhancedFileUploadSection
                    theme={theme}
                    title="Additional Info"
                    fileType="house_info_documents"
                    icon={FaFileAlt}
                    accept=".pdf,.doc,.docx,.txt"
                    description="Supporting documents"
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    files={files.house_info_documents}
                    showToast={showToast}
                    maxFileSize={10 * 1024 * 1024}
                    onReorderFiles={handleReorderFiles}
                    onSetPrimaryFile={(idx) => handleSetPrimaryFile(idx, 'house_info_documents')}
                    primaryFileId={primaryFiles.house_info_documents}
                  />
                </div>
              </CollapsibleSection>
            </form>
          </div>

          {/* FOOTER */}
          <div className={`p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${footerBg} ${footerBorder}`}>
            <div className={`text-xs hidden sm:block ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Last updated: {location.updated_at ? new Date(location.updated_at).toLocaleDateString() : 'Never'}
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onCancel}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg border transition-colors font-medium ${cancelButtonClasses}`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-white font-medium flex items-center justify-center shadow-lg ${
                  loading
                    ? 'bg-cyan-800 cursor-wait opacity-80'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                } transition-all`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <ToastContainer toasts={toasts} onClose={removeToast} theme={theme} />
    </>
  );
};

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 8px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.5); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.8); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 1); }
  .custom-scrollbar-light::-webkit-scrollbar { width: 8px; }
  .custom-scrollbar-light::-webkit-scrollbar-track { background: #e5e7eb; border-radius: 4px; }
  .custom-scrollbar-light::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
  .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: #6b7280; }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customScrollbarStyles;
  document.head.appendChild(style);
}

export default EditLocationForm;