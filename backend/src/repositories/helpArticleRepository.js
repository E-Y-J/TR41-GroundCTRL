/**
 * Help Article Repository
 * Database operations for help articles
 */

const { getFirestore } = require('../config/firebase');

const COLLECTION = 'help_articles';

/**
 * Get article by ID
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
 * Get article by slug
 */
async function getBySlug(slug) {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTION)
    .where('slug', '==', slug)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Get all articles with filters and pagination
 */
async function getAll(filters = {}, page = 1, limit = 20) {
  const db = getFirestore();
  let query = db.collection(COLLECTION);
  
  // Apply filters
  if (filters.category_id) {
    query = query.where('category_id', '==', filters.category_id);
  }
  
  if (filters.type) {
    query = query.where('type', '==', filters.type);
  }
  
  if (filters.difficulty) {
    query = query.where('difficulty', '==', filters.difficulty);
  }
  
  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  
  if (filters.isActive !== undefined) {
    query = query.where('isActive', '==', filters.isActive);
  }
  
  if (filters.isFeatured !== undefined) {
    query = query.where('isFeatured', '==', filters.isFeatured);
  }
  
  // Ordering
  const sortBy = filters.sortBy || 'orderIndex';
  const sortOrder = filters.sortOrder || 'asc';
  query = query.orderBy(sortBy, sortOrder);
  
  // Pagination
  const offset = (page - 1) * limit;
  query = query.offset(offset).limit(limit);
  
  const snapshot = await query.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Search articles (simple implementation)
 */
async function search(searchTerm, filters = {}, limit = 10) {
  // Note: This is a basic implementation
  // For production, consider using Algolia or Elasticsearch
  const db = getFirestore();
  let query = db.collection(COLLECTION);
  
  // Apply status filter for published articles
  query = query.where('status', '==', 'PUBLISHED');
  query = query.where('isActive', '==', true);
  
  // Category filter if provided
  if (filters.category_id) {
    query = query.where('category_id', '==', filters.category_id);
  }
  
  query = query.limit(limit);
  
  const snapshot = await query.get();
  
  // Filter by search term in memory (basic approach)
  const searchLower = searchTerm.toLowerCase();
  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter(article => {
      const titleMatch = article.title?.toLowerCase().includes(searchLower);
      const excerptMatch = article.excerpt?.toLowerCase().includes(searchLower);
      const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      return titleMatch || excerptMatch || tagMatch;
    });
}

/**
 * Create new article
 */
async function create(data) {
  const db = getFirestore();
  const now = new Date().toISOString();
  
  const articleData = {
    ...data,
    views: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await db.collection(COLLECTION).add(articleData);
  
  return {
    id: docRef.id,
    ...articleData
  };
}

/**
 * Update article
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
 * Delete article
 */
async function deleteById(id) {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
}

/**
 * Increment view count
 */
async function incrementViews(id) {
  const db = getFirestore();
  const docRef = db.collection(COLLECTION).doc(id);
  
  await docRef.update({
    views: require('firebase-admin').firestore.FieldValue.increment(1)
  });
  
  return getById(id);
}

/**
 * Update feedback counts
 */
async function updateFeedback(id, isHelpful) {
  const db = getFirestore();
  const docRef = db.collection(COLLECTION).doc(id);
  
  const field = isHelpful ? 'helpfulCount' : 'notHelpfulCount';
  
  await docRef.update({
    [field]: require('firebase-admin').firestore.FieldValue.increment(1)
  });
  
  return getById(id);
}

/**
 * Check if slug exists
 */
async function existsBySlug(slug, excludeId = null) {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTION)
    .where('slug', '==', slug)
    .get();
  
  if (excludeId) {
    return snapshot.docs.some(doc => doc.id !== excludeId);
  }
  
  return !snapshot.empty;
}

module.exports = {
  getById,
  getBySlug,
  getAll,
  search,
  create,
  update,
  deleteById,
  incrementViews,
  updateFeedback,
  existsBySlug
};
