const db = require('../config/db'); // The global database connection pool
const _ = require('lodash');

/**
 * Retrieves the complete data for a location, including all associated files.
 * It intelligently fetches files from a parent property if one exists.
 * @param {number} locationId - The ID of the location to fetch.
 * @param {object} [client=db] - An optional database client for running the query within a transaction. Defaults to the global pool.
 * @returns {Promise<object|null>} The complete location object or null if not found.
 */
async function getCompleteLocationData(locationId, client = db) {
  try {
    // Use the provided client for transactions, or default to the global db pool
    const queryRunner = client;

    const locationResult = await queryRunner.query(
      `SELECT l.*, 
              uc.full_name as created_by_username, 
              uu.full_name as updated_by_username 
       FROM locationss l
       LEFT JOIN users uc ON l.created_by = uc.id
       LEFT JOIN users uu ON l.updated_by = uu.id
       WHERE l.id = $1`,
      [locationId]
    );
    
    if (locationResult.rows.length === 0) {
      return null;
    }
    
    const location = locationResult.rows[0];
    
    // Prepare to query files for both the location and its parent, if it exists
    const locationIdsToQuery = [location.id];
    if (location.parent_house) {
        locationIdsToQuery.push(location.parent_house);
    }

    // Use Promise.all to fetch all file types concurrently for better performance
    const [
        plansResult,
        photosResult,
        licenseDocsResult,
        infoDocsResult
    ] = await Promise.all([
        queryRunner.query('SELECT * FROM house_plans WHERE location_id = ANY($1::int[])', [locationIdsToQuery]),
        queryRunner.query('SELECT * FROM house_photos WHERE location_id = ANY($1::int[])', [locationIdsToQuery]),
        queryRunner.query('SELECT * FROM license_documents WHERE location_id = ANY($1::int[])', [locationIdsToQuery]),
        queryRunner.query('SELECT * FROM house_info_documents WHERE location_id = ANY($1::int[])', [locationIdsToQuery])
    ]);
    
    // Use lodash to merge and de-duplicate files from child and parent
    const uniqueByURL = (files) => _.uniqBy(files, 'file_url');

    location.house_plans = uniqueByURL(plansResult.rows);
    location.house_photos = uniqueByURL(photosResult.rows);
    location.license_documents = uniqueByURL(licenseDocsResult.rows);
    location.additional_documents = uniqueByURL(infoDocsResult.rows);
    
    // Safely parse the 'owners' JSON field, which might be a string or an object
    try {
        location.owners = (typeof location.owners === 'string') ? JSON.parse(location.owners) : (location.owners || []);
        if (!Array.isArray(location.owners)) {
            location.owners = [location.owners];
        }
    } catch (e) {
        console.error(`Error parsing owners JSON for location ${locationId}:`, e);
        location.owners = []; // Default to an empty array on parsing failure
    }
    
    return location;
  } catch (error) {
    console.error(`Error in getCompleteLocationData for location ID ${locationId}:`, error);
    throw error; // Re-throw the error to be caught by the calling transaction block
  }
}

/**
 * Decodes a filename from latin1 to utf8 to support international characters.
 * @param {string} filename The filename to decode.
 * @returns {string} The UTF-8 decoded filename.
 */
function decodeFilename(filename) {
  try {
    return Buffer.from(filename, 'latin1').toString('utf8');
  } catch (error) {
    console.error('Failed to decode filename, falling back to original:', error);
    return filename;
  }
}

/**
 * Logs an action to the location_history table.
 * @param {number} locationId - The ID of the location being acted upon.
 * @param {number} userId - The ID of the user performing the action.
 * @param {string} actionType - The type of action (e.g., 'created', 'updated').
 * @param {object} [changes={}] - A JSON object detailing the changes.
 * @param {object} [client=db] - An optional database client for transactions.
 */
async function logHistory(locationId, userId, actionType, changes = {}, client = db) {
  const queryRunner = client;
  try {
    await queryRunner.query(
      `INSERT INTO location_history (location_id, user_id, action_type, changes)
       VALUES ($1, $2, $3, $4)`,
      [locationId, userId, actionType, JSON.stringify(changes)]
    );
  } catch (error) {
    // Log the error but don't throw, as a history logging failure should not fail the main operation.
    console.error(`Failed to log history for location ${locationId}:`, error);
  }
}

/**
 * Compares old and new location data to generate a "changes" object for logging.
 * @param {object} oldData - The original location object from the database.
 * @param {object} newData - The new data submitted by the user.
 * @param {Array} newFiles - An array of newly uploaded files from multer.
 * @param {object} deletedFiles - An object listing file IDs to be deleted.
 * @returns {object} An object summarizing all the changes.
 */
function getChanges(oldData, newData, newFiles, deletedFiles) {
    const changes = {};
    const keysToCompare = ['name', 'address', 'description', 'city', 'country', 'license_status', 'gush_num', 'gush_suffix', 'parcel_num', 'legal_area'];

    keysToCompare.forEach(key => {
        const oldValue = oldData[key] || '';
        const newValue = newData[key] || '';
        if (String(oldValue) !== String(newValue)) {
            changes[key] = { old: oldValue, new: newValue };
        }
    });

    // Deep compare owners array using lodash
    if (!_.isEqual(oldData.owners, newData.owners)) {
        changes.owners = { old: oldData.owners, new: newData.owners };
    }
    
    const fileChanges = {};
    if (newFiles && newFiles.length > 0) {
        fileChanges.added = newFiles.map(f => decodeFilename(f.originalname));
    }
    if (deletedFiles && Object.values(deletedFiles).some(arr => arr.length > 0)) {
        fileChanges.removed = deletedFiles;
    }
    if (Object.keys(fileChanges).length > 0) {
        changes.files = fileChanges;
    }

    return changes;
}

/**
 * Maps a file's fieldname from a form submission to its corresponding database table name.
 * @param {string} fieldname - The fieldname from the multipart form data (e.g., 'house_plans').
 * @returns {string|null} The name of the database table or null if no match.
 */
const getFileTableName = (fieldname) => {
    switch (fieldname) {
        case 'house_plans':
            return 'house_plans';
        case 'house_photos':
            return 'house_photos';
        case 'licence_files':
        case 'license_documents':
            return 'license_documents';
        case 'additional_documents':
        case 'house_info_documents':
            return 'house_info_documents';
        default:
            return null;
    }
};

module.exports = { 
  getCompleteLocationData, 
  logHistory, 
  getChanges,
  getFileTableName, 
  decodeFilename 
};