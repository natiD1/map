const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createAndEmitNotification } = require('../utils/notificationService');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { 
    getCompleteLocationData, 
    logHistory, 
    getChanges, 
    getFileTableName, 
    decodeFilename 
} = require('../utils/locationHelpers');
const _ = require('lodash');

// ============================================
// FILE VALIDATION UTILITIES
// ============================================

const FILE_CONSTRAINTS = {
    house_plans: {
        extensions: ['.pdf', '.dwg', '.dwf', '.dws', '.zip'],
        maxSize: 100 * 1024 * 1024,
        description: 'House Plans'
    },
    house_photos: {
        extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
        maxSize: 10 * 1024 * 1024,
        description: 'House Photos'
    },
    license_documents: {
        // I have added more extensions here to allow images
        extensions: ['.pdf', '.jpg', '.jpeg', '.png'], 
        maxSize: 20 * 1024 * 1024,
        description: 'License Documents'
    },
    house_info_documents: {
        extensions: ['.pdf', '.doc', '.docx', '.txt'],
        maxSize: 10 * 1024 * 1024,
        description: 'Additional Documents'
    }
};

const validateFile = (file) => {
    const fieldname = file.fieldname;
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!FILE_CONSTRAINTS[fieldname]) {
        return { 
            valid: false, 
            error: `Unknown file category: ${fieldname}` 
        };
    }
    
    const constraints = FILE_CONSTRAINTS[fieldname];
    
    if (!constraints.extensions.includes(ext)) {
        return { 
            valid: false, 
            error: `Invalid file type for ${constraints.description}. Allowed: ${constraints.extensions.join(', ')}` 
        };
    }
    
    if (file.size > constraints.maxSize) {
        const maxSizeMB = (constraints.maxSize / (1024 * 1024)).toFixed(0);
        return { 
            valid: false, 
            error: `File too large for ${constraints.description}. Maximum size: ${maxSizeMB}MB` 
        };
    }
    
    return { valid: true };
};

const validateFiles = (files) => {
    const errors = [];
    
    if (!files || files.length === 0) {
        return { valid: true, errors: [] };
    }
    
    for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
            errors.push({
                filename: file.originalname,
                error: validation.error
            });
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

const deletePhysicalFiles = async (fileUrls) => {
    for (const fileUrl of fileUrls) {
        try {
            const filePath = path.join(__dirname, '..', fileUrl);
            await fs.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
        } catch (err) {
            console.error(`Failed to delete file ${fileUrl}:`, err.message);
        }
    }
};

// ============================================
// MULTER CONFIGURATION WITH FIELD LIMITS
// ============================================

const uploadFields = upload.fields([
    { name: 'house_plans', maxCount: 20 },
    { name: 'house_photos', maxCount: 50 },
    { name: 'license_documents', maxCount: 10 },
    { name: 'licence_files', maxCount: 10 },  // ⭐ ADD THIS - support old field name
    { name: 'house_info_documents', maxCount: 20 }
]);

// ============================================
// FILE SERVING ROUTE
// ============================================

router.get('/uploads/:filename', authenticateToken, (req, res) => {
    const filename = req.params.filename;
    
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ message: 'Invalid filename.' });
    }
    
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    fsSync.access(filePath, fsSync.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            return res.status(404).json({ message: 'File not found' });
        }
        
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        
        switch (ext) {
            case '.pdf': contentType = 'application/pdf'; break;
            case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
            case '.png': contentType = 'image/png'; break;
            case '.webp': contentType = 'image/webp'; break;
            case '.gif': contentType = 'image/gif'; break;
            case '.dwg': contentType = 'application/acad'; break;
            case '.zip': contentType = 'application/zip'; break;
        }
        
        res.setHeader('Content-Type', contentType);
        res.sendFile(filePath);
    });
});

// ============================================
// CREATE A NEW LOCATION
// ============================================

router.post('/', authenticateToken, uploadFields, async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const isPrivilegedUser = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'supervisor';

    const filesArray = req.files ? Object.values(req.files).flat() : [];
    
    const fileValidation = validateFiles(filesArray);
    if (!fileValidation.valid) {
        for (const file of filesArray) {
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error('Error deleting invalid file:', err);
            }
        }
        return res.status(400).json({ 
            message: 'File validation failed', 
            errors: fileValidation.errors 
        });
    }

    if (!isPrivilegedUser) {
        try {
            const payload = {
                ...req.body,
                owners: JSON.parse(req.body.owners),
                boundaryCoords: JSON.parse(req.body.boundaryCoords),
                files: filesArray.map(f => ({
                    fieldname: f.fieldname,
                    originalname: decodeFilename(f.originalname),
                    filename: f.filename,
                    file_extension: path.extname(f.originalname).substring(1).toLowerCase(),
                    size: f.size
                }))
            };
            
            await db.query(
                `INSERT INTO pending_actions (action_type, payload, requested_by) 
                 VALUES ('create', $1, $2)`,
                [JSON.stringify(payload), userId]
            );
            
            return res.status(202).json({ 
                message: 'Your request to create a new location has been submitted for approval.' 
            });
        } catch (error) {
            console.error('User error submitting create request:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');
        
        const { name, owners, boundaryCoords, property_type, ...otherData } = req.body;
        
        const result = await client.query(
            `INSERT INTO locationss (
                name, address, description, city, country, owners, license_status, 
                boundary_coords, gush_num, gush_suffix, parcel_num, legal_area, 
                created_by, updated_by, parent_house, property_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
            RETURNING id`,
            [
                name, 
                otherData.address, 
                otherData.description, 
                otherData.city, 
                otherData.country, 
                owners, 
                otherData.license_status, 
                boundaryCoords, 
                otherData.gush_num, 
                otherData.gush_suffix, 
                otherData.parcel_num, 
                otherData.legal_area, 
                userId, 
                userId, 
                otherData.parent_house, 
                property_type
            ]
        );
        
        const newLocationId = result.rows[0].id;

        if (filesArray.length > 0) {
            for (const file of filesArray) {
                const tableName = getFileTableName(file.fieldname);
                
                if (!tableName) {
                    console.error(`Invalid file fieldname: ${file.fieldname}`);
                    continue;
                }
                
                await client.query(
                    `INSERT INTO ${tableName} (location_id, file_name, file_url, file_type, file_size) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        newLocationId,
                        decodeFilename(file.originalname),
                        `/uploads/${file.filename}`,
                        path.extname(file.originalname).substring(1).toLowerCase(),
                        file.size
                    ]
                );
            }
        }

        await logHistory(newLocationId, userId, 'created', { 
            created_by_privileged_user: true 
        }, client);
        
        await client.query('COMMIT');
        
        const completeLocation = await getCompleteLocationData(newLocationId);
        
        await createAndEmitNotification(req, 'location_created', completeLocation);
        
        res.status(201).json({ 
            message: 'Location created successfully!', 
            location: completeLocation 
        });
        
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        
        for (const file of filesArray) {
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error('Error cleaning up file:', err);
            }
        }
        
        console.error('Privileged user error creating location:', error);
        res.status(500).json({ 
            message: 'Server error', 
            details: error.message 
        });
    } finally {
        if (client) client.release();
    }
});

// ============================================
// UPDATE AN EXISTING LOCATION
// ============================================

router.put('/:id', authenticateToken, uploadFields, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const isPrivilegedUser = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'supervisor';

    const filesArray = req.files ? Object.values(req.files).flat() : [];
    
    const fileValidation = validateFiles(filesArray);
    if (!fileValidation.valid) {
        for (const file of filesArray) {
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error('Error deleting invalid file:', err);
            }
        }
        return res.status(400).json({ 
            message: 'File validation failed', 
            errors: fileValidation.errors 
        });
    }

    if (!isPrivilegedUser) {
        try {
            const oldLocationData = await getCompleteLocationData(id);
            if (!oldLocationData) {
                return res.status(404).json({ message: 'Location not found.' });
            }
            
            const newLocationData = { 
                ...req.body, 
                owners: JSON.parse(req.body.owners) 
            };
            
            const filesToDeleteObj = req.body.filesToDelete 
                ? JSON.parse(req.body.filesToDelete) 
                : {};
            
            const newLocationDataForComparison = { 
                ...oldLocationData, 
                ...newLocationData 
            };
            
            const changes = getChanges(
                oldLocationData, 
                newLocationDataForComparison, 
                filesArray, 
                filesToDeleteObj
            );

            if (Object.keys(changes).length === 0 && filesArray.length === 0) {
                return res.status(200).json({ message: 'No changes detected.' });
            }
            
            const payload = { 
                ...newLocationData, 
                filesToDelete: filesToDeleteObj, 
                files: filesArray.map(f => ({
                    ...f, 
                    originalname: decodeFilename(f.originalname)
                })), 
                changes 
            };
            
            await db.query(
                `INSERT INTO pending_actions (location_id, action_type, payload, requested_by) 
                 VALUES ($1, 'update', $2, $3)`,
                [id, JSON.stringify(payload), userId]
            );
            
            return res.status(202).json({ 
                message: 'Your request to update this location has been submitted for approval.' 
            });
        } catch (error) {
            console.error('User error submitting update request:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');
        
        const oldLocationData = await getCompleteLocationData(id);
        if (!oldLocationData) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Location not found.' });
        }
        
        const { 
            name, address, description, city, country, 
            owners, license_status, property_type, filesToDelete 
        } = req.body;
        
        await client.query(
            `UPDATE locationss SET 
                name=$1, address=$2, description=$3, city=$4, country=$5, 
                owners=$6, license_status=$7, property_type=$8, 
                updated_by=$9, updated_at=NOW() 
             WHERE id=$10`,
            [
                name, address, description, city, country, 
                owners, license_status, property_type, 
                userId, id
            ]
        );
        
        const filesToDeleteParsed = JSON.parse(filesToDelete || '{}');
        const filesToDeleteFromDisk = [];
        
        for (const fileType in filesToDeleteParsed) {
            const idsToDelete = filesToDeleteParsed[fileType];
            
            if (idsToDelete && idsToDelete.length > 0) {
                const tableName = getFileTableName(fileType);
                
                if (!tableName) {
                    console.error(`Invalid file type: ${fileType}`);
                    continue;
                }
                
                const filesToDelete = await client.query(
                    `SELECT file_url FROM ${tableName} 
                     WHERE id = ANY($1::int[]) AND location_id = $2`,
                    [idsToDelete, id]
                );
                
                filesToDeleteFromDisk.push(...filesToDelete.rows.map(r => r.file_url));
                
                await client.query(
                    `DELETE FROM ${tableName} 
                     WHERE id = ANY($1::int[]) AND location_id = $2`,
                    [idsToDelete, id]
                );
            }
        }
        
        if (filesArray.length > 0) {
            for (const file of filesArray) {
                const tableName = getFileTableName(file.fieldname);
                
                if (!tableName) {
                    console.error(`Invalid file fieldname: ${file.fieldname}`);
                    continue;
                }
                
                await client.query(
                    `INSERT INTO ${tableName} (location_id, file_name, file_url, file_type, file_size) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        id,
                        decodeFilename(file.originalname),
                        `/uploads/${file.filename}`,
                        path.extname(file.originalname).substring(1).toLowerCase(),
                        file.size
                    ]
                );
            }
        }
        
        // Handle primary file marking
        const primaryFilesData = req.body.primaryFiles ? JSON.parse(req.body.primaryFiles) : {};
        
        for (const fileType in primaryFilesData) {
            const primaryFileId = primaryFilesData[fileType];
            if (primaryFileId) {
                const tableName = getFileTableName(fileType);
                if (tableName) {
                    await client.query(
                        `UPDATE ${tableName} SET is_primary = FALSE WHERE location_id = $1`,
                        [id]
                    );
                    
                    await client.query(
                        `UPDATE ${tableName} SET is_primary = TRUE 
                         WHERE (id = $1 OR file_name = $2) AND location_id = $3`,
                        [primaryFileId, primaryFileId, id]
                    );
                }
            }
        }
        
        const newLocationDataForComparison = { 
            ...oldLocationData, 
            name, address, description, city, country, 
            owners: JSON.parse(owners), 
            license_status, 
            property_type 
        };
        
        const changes = getChanges(
            oldLocationData, 
            newLocationDataForComparison, 
            filesArray, 
            filesToDeleteParsed
        );
        
        if (Object.keys(changes).length > 0) {
            await logHistory(id, userId, 'updated', changes, client);
        }
        
        await client.query('COMMIT');
        
        if (filesToDeleteFromDisk.length > 0) {
            deletePhysicalFiles(filesToDeleteFromDisk).catch(err => {
                console.error('Error deleting physical files:', err);
            });
        }
        
        const completeLocation = await getCompleteLocationData(id);
        
        await createAndEmitNotification(req, 'location_updated', completeLocation);
        
        res.status(200).json({ 
            message: 'Location updated successfully!', 
            location: completeLocation 
        });
        
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        
        for (const file of filesArray) {
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error('Error cleaning up file:', err);
            }
        }
        
        console.error('Privileged user error updating location:', error);
        res.status(500).json({ 
            message: 'Server error', 
            details: error.message 
        });
    } finally {
        if (client) client.release();
    }
});

// ============================================
// DELETE A LOCATION
// ============================================

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const isPrivilegedUser = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'supervisor';

    if (!isPrivilegedUser) {
        try {
            const locationToDelete = await getCompleteLocationData(id);
            if (!locationToDelete) {
                return res.status(404).json({ message: 'Location not found.' });
            }
            
            const payload = { 
                locationName: locationToDelete.name, 
                address: locationToDelete.address, 
                owners: locationToDelete.owners 
            };
            
            await db.query(
                `INSERT INTO pending_actions (location_id, action_type, payload, requested_by) 
                 VALUES ($1, 'delete', $2, $3)`,
                [id, JSON.stringify(payload), userId]
            );
            
            return res.status(202).json({ 
                message: 'Your request to delete this location has been submitted for approval.' 
            });
        } catch (error) {
            console.error('User error submitting delete request:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    let client;
    try {
        const locationId = parseInt(id, 10);
        if (isNaN(locationId)) {
            return res.status(400).json({ message: 'Invalid location ID.' });
        }
        
        client = await db.getClient();
        await client.query('BEGIN');
        
        const oldLocationData = await getCompleteLocationData(locationId, client);
        if (!oldLocationData) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Location not found.' });
        }
        
        const childrenCheck = await client.query(
            'SELECT id, name FROM locationss WHERE parent_house = $1',
            [locationId]
        );
        
        if (childrenCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ 
                message: 'Deletion failed: This property is a parent to other split properties.',
                children: childrenCheck.rows 
            });
        }
        
        const filesToDelete = [];
        const fileTypes = ['house_plans', 'house_photos', 'license_documents', 'house_info_documents'];
        
        for (const fileType of fileTypes) {
            const tableName = getFileTableName(fileType);
            if (tableName) {
                const files = await client.query(
                    `SELECT file_url FROM ${tableName} WHERE location_id = $1`,
                    [locationId]
                );
                filesToDelete.push(...files.rows.map(r => r.file_url));
            }
        }
        
        await client.query('DELETE FROM locationss WHERE id = $1', [locationId]);
        
        await logHistory(locationId, userId, 'deleted', { 
            deleted: oldLocationData 
        }, client);
        
        await client.query('COMMIT');
        
        if (filesToDelete.length > 0) {
            deletePhysicalFiles(filesToDelete).catch(err => {
                console.error('Error deleting physical files:', err);
            });
        }
        
        await createAndEmitNotification(req, 'location_deleted', { 
            id: oldLocationData.id, 
            name: oldLocationData.name 
        });
        
        res.status(200).json({ 
            message: 'Location deleted successfully!', 
            id: id 
        });
        
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Privileged user error deleting location:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (client) client.release();
    }
});

// ============================================
// SPLIT A LOCATION
// ============================================

router.post('/:id/split', authenticateToken, async (req, res) => {
    const { id: parentId } = req.params;
    const { parentBoundary, newChildData } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const isPrivilegedUser = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'supervisor';

    if (!isPrivilegedUser) {
        try {
            const payload = { parentBoundary, newChildData };
            await db.query(
                `INSERT INTO pending_actions (location_id, action_type, payload, requested_by) 
                 VALUES ($1, 'split', $2, $3)`,
                [parentId, JSON.stringify(payload), userId]
            );
            return res.status(202).json({ 
                message: 'Your request to split this property has been submitted for approval.' 
            });
        } catch (error) {
            console.error('User error submitting split request:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const parentResult = await client.query(
            'SELECT * FROM locationss WHERE id = $1 FOR UPDATE',
            [parentId]
        );
        
        if (parentResult.rows.length === 0) {
            throw new Error('Original property not found.');
        }
        
        const parentLocation = parentResult.rows[0];

        await client.query(
            `UPDATE locationss SET 
                boundary_coords = $1, 
                updated_at = NOW(), 
                updated_by = $2 
             WHERE id = $3`,
            [JSON.stringify(parentBoundary), userId, parentId]
        );

        const newChildResult = await client.query(
            `INSERT INTO locationss (
                name, address, description, city, country, owners, license_status, 
                boundary_coords, gush_num, gush_suffix, parcel_num, legal_area, 
                parent_house, created_by, updated_by, property_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
            RETURNING id`,
            [
                newChildData.name || `${parentLocation.name} - Split`,
                newChildData.address || parentLocation.address,
                newChildData.description || parentLocation.description,
                newChildData.city || parentLocation.city,
                newChildData.country || parentLocation.country,
                JSON.stringify(newChildData.owners || parentLocation.owners),
                newChildData.license_status || parentLocation.license_status,
                JSON.stringify(newChildData.boundary_coords),
                newChildData.gush_num || parentLocation.gush_num,
                newChildData.gush_suffix || parentLocation.gush_suffix,
                newChildData.parcel_num || parentLocation.parcel_num,
                newChildData.legal_area || null,
                parentId,
                userId,
                userId,
                newChildData.property_type || parentLocation.property_type
            ]
        );
        
        const newChildId = newChildResult.rows[0].id;

        await logHistory(
            parentId, 
            userId, 
            'updated', 
            { split: `Split off new property ID ${newChildId}` }, 
            client
        );
        
        await logHistory(
            newChildId, 
            userId, 
            'created', 
            { split: `Created from parent property ID ${parentId}` }, 
            client
        );

        await client.query('COMMIT');
        
        const updatedParent = await getCompleteLocationData(parentId);
        const newChild = await getCompleteLocationData(newChildId);

        await createAndEmitNotification(req, 'location_updated', updatedParent);
        await createAndEmitNotification(req, 'location_created', newChild);
        
        res.status(200).json({
            message: 'Property split successfully!',
            updatedOriginal: updatedParent,
            newHouse: newChild,
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Privileged user error splitting location:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// ============================================
// GET ALL LOCATIONS
// ============================================

router.get('/all', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT
                l.id, l.name, l.address, l.description, l.city, l.country, l.owners, 
                l.license_status, l.boundary_coords, l.gush_num, l.gush_suffix, 
                l.parcel_num, l.legal_area, l.created_at, l.updated_at, 
                l.parent_house, l.property_type,
                uc.full_name as created_by_username, 
                uu.full_name as updated_by_username,
                COALESCE(hp.plans, '[]'::json) as house_plans, 
                COALESCE(hph.photos, '[]'::json) as house_photos,
                COALESCE(ld.docs, '[]'::json) as license_documents, 
                COALESCE(hid.docs, '[]'::json) as additional_documents
            FROM locationss l
            LEFT JOIN users uc ON l.created_by = uc.id
            LEFT JOIN users uu ON l.updated_by = uu.id
            LEFT JOIN (
                SELECT location_id, json_agg(json_build_object(
                    'id', id, 'file_name', file_name, 'file_url', file_url, 
                    'file_type', file_type, 'file_size', file_size,
                    'is_primary', COALESCE(is_primary, FALSE)
                ) ORDER BY is_primary DESC NULLS LAST, id) as plans 
                FROM house_plans 
                GROUP BY location_id
            ) hp ON hp.location_id = l.id
            LEFT JOIN (
                SELECT location_id, json_agg(json_build_object(
                    'id', id, 'file_name', file_name, 'file_url', file_url, 
                    'file_type', file_type, 'file_size', file_size,
                    'is_primary', COALESCE(is_primary, FALSE)
                ) ORDER BY is_primary DESC NULLS LAST, id) as photos 
                FROM house_photos 
                GROUP BY location_id
            ) hph ON hph.location_id = l.id
            LEFT JOIN (
                SELECT location_id, json_agg(json_build_object(
                    'id', id, 'file_name', file_name, 'file_url', file_url, 
                    'file_type', file_type, 'file_size', file_size,
                    'is_primary', COALESCE(is_primary, FALSE)
                ) ORDER BY is_primary DESC NULLS LAST, id) as docs 
                FROM license_documents 
                GROUP BY location_id
            ) ld ON ld.location_id = l.id
            LEFT JOIN (
                SELECT location_id, json_agg(json_build_object(
                    'id', id, 'file_name', file_name, 'file_url', file_url, 
                    'file_type', file_type, 'file_size', file_size,
                    'is_primary', COALESCE(is_primary, FALSE)
                ) ORDER BY is_primary DESC NULLS LAST, id) as docs 
                FROM house_info_documents 
                GROUP BY location_id
            ) hid ON hid.location_id = l.id
            ORDER BY l.created_at DESC;
        `;
        
        const { rows } = await db.query(query);
        
        const locationsById = rows.reduce((acc, loc) => { 
            acc[loc.id] = loc; 
            return acc; 
        }, {});
        
        const processedLocations = rows.map(location => {
            if (location.parent_house && locationsById[location.parent_house]) {
                const parent = locationsById[location.parent_house];
                const uniqueByURL = (files) => _.uniqBy(files, 'file_url');
                
                return {
                    ...location,
                    house_plans: uniqueByURL([...location.house_plans, ...parent.house_plans]),
                    house_photos: uniqueByURL([...location.house_photos, ...parent.house_photos]),
                    license_documents: uniqueByURL([...location.license_documents, ...parent.license_documents]),
                    additional_documents: uniqueByURL([...location.additional_documents, ...parent.additional_documents])
                };
            }
            return location;
        });
        
        res.status(200).json(processedLocations);
        
    } catch (error) {
        console.error('Error fetching all locations:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            details: error.message 
        });
    }
});

// ============================================
// SEARCH LOCATIONS
// ============================================

router.get('/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
        return res.status(400).json({ message: 'Search query "q" is required' });
    }
    
    const query = `%${q.trim()}%`;
    
    try {
        const isNumericQuery = /^\d+$/.test(q.trim());
        
        let whereClause = `(
            name ILIKE $1 OR 
            address ILIKE $1 OR 
            city ILIKE $1 OR 
            country ILIKE $1 OR 
            owners::text ILIKE $1
        )`;
        
        if (isNumericQuery) { 
            whereClause += ` OR parcel_num ILIKE $1 OR gush_num ILIKE $1`; 
        }
        
        const { rows } = await db.query(
            `SELECT 
                id, name, address, city, country, license_status, boundary_coords 
             FROM locationss 
             WHERE ${whereClause} AND id IS NOT NULL 
             ORDER BY 
                CASE 
                    WHEN parcel_num ILIKE $1 THEN 1 
                    WHEN gush_num ILIKE $1 THEN 2 
                    ELSE 3 
                END, 
                name 
             LIMIT 10`,
            [query]
        );
        
        res.status(200).json(rows);
        
    } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            details: error.message 
        });
    }
});

// ============================================
// GET USER'S PENDING ACTIONS
// ============================================

router.get('/my-actions', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    try {
        const result = await db.query(
            `SELECT 
                id, action_type, status, rejection_reason, 
                created_at, processed_at, payload, location_id
             FROM pending_actions 
             WHERE requested_by = $1 
             ORDER BY created_at DESC`,
            [userId]
        );
        
        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('Error fetching user actions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// GET SINGLE LOCATION BY ID
// ============================================

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ message: 'Invalid location ID' });
    }
    
    try {
        const location = await getCompleteLocationData(id);
        
        if (!location) { 
            return res.status(404).json({ message: 'Location not found.' }); 
        }
        
        res.status(200).json(location);
        
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// GET LOCATION HISTORY
// ============================================

router.get('/:id/history', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        const historyResult = await db.query(
            `SELECT h.*, u.full_name as user_name 
             FROM location_history h 
             JOIN users u ON h.user_id = u.id 
             WHERE h.location_id = $1 
             ORDER BY h.created_at DESC`,
            [id]
        );
        
        res.status(200).json(historyResult.rows);
        
    } catch (error) {
        console.error('Error fetching location history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;