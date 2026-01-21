/**
 * Help Category Repository
 * Database operations for help categories
 */

const { getFirestore } = require('../config/firebase');

const COLLECTION = 'help_categories';

/**
 * Get category by ID
 */
async function getById(id) {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION).doc(id).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Get all categories with filters
 */
async function getAll(filters = {}) {
  const db = getFirestore();
  let query = db.collection(COLLECTION);
  
  // Apply filters
  if (filters.isActive !== undefined) {
    query = query.where('isActive', '==', filters.isActive);
  }
  
  if (filters.parentCategoryId !== undefined) {
    if (filters.parentCategoryId === null) {
      query = query.where('parentCategoryId', '==', null);
    } else {
      query = query.where('parentCategoryId', '==', filters.parentCategoryId);
    }
  }
  
  // Default ordering by orderIndex
  query = query.orderBy('orderIndex', 'asc');
  
  const snapshot = await query.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Create new category
 */
async function create(data) {
  const db = getFirestore();
  const now = new Date().toISOString();
  
  const categoryData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await db.collection(COLLECTION).add(categoryData);
  
  return {
    id: docRef.id,
    ...categoryData
  };
}

/**
 * Update category
 */
async function update(id, data) {
  const db = getFirestore();
  const now = new Date().toISOString();
  
  const updateData = {
    ...data,
    updatedAt: now
  };
  
  await db.collection(COLLECTION).doc(id).update(updateData);
  
  return getById(id);
}

/**
 * Delete category
 */
async function deleteById(id) {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
}

/**
 * Check if category code exists
 */
async function existsByCode(code, excludeId = null) {
  const db = getFirestore();
  let query = db.collection(COLLECTION).where('code', '==', code);
  
  const snapshot = await query.get();
  
  if (excludeId) {
    return snapshot.docs.some(doc => doc.id !== excludeId);
  }
  
  return !snapshot.empty;
}

module.exports = {
  getById,
  getAll,
  create,
  update,
  deleteById,
  existsByCode
};
