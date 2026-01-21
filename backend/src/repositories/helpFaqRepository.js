/**
 * Help FAQ Repository
 * Database operations for FAQs
 */

const { getFirestore } = require('../config/firebase');

const COLLECTION = 'help_faqs';

/**
 * Get FAQ by ID
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
 * Get all FAQs with filters and pagination
 */
async function getAll(filters = {}, page = 1, limit = 20) {
  const db = getFirestore();
  let query = db.collection(COLLECTION);
  
  // Apply filters
  if (filters.category_id) {
    query = query.where('category_id', '==', filters.category_id);
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
  query = query.orderBy('orderIndex', 'asc');
  
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
 * Search FAQs
 */
async function search(searchTerm, filters = {}, limit = 10) {
  const db = getFirestore();
  let query = db.collection(COLLECTION);
  
  // Apply status filter for published FAQs
  query = query.where('status', '==', 'PUBLISHED');
  query = query.where('isActive', '==', true);
  
  // Category filter if provided
  if (filters.category_id) {
    query = query.where('category_id', '==', filters.category_id);
  }
  
  query = query.limit(limit);
  
  const snapshot = await query.get();
  
  // Filter by search term in memory
  const searchLower = searchTerm.toLowerCase();
  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter(faq => {
      const questionMatch = faq.question?.toLowerCase().includes(searchLower);
      const answerMatch = faq.answer?.toLowerCase().includes(searchLower);
      const tagMatch = faq.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      return questionMatch || answerMatch || tagMatch;
    });
}

/**
 * Create new FAQ
 */
async function create(data) {
  const db = getFirestore();
  const now = new Date().toISOString();
  
  const faqData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await db.collection(COLLECTION).add(faqData);
  
  return {
    id: docRef.id,
    ...faqData
  };
}

/**
 * Update FAQ
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
 * Delete FAQ
 */
async function deleteById(id) {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
}

module.exports = {
  getById,
  getAll,
  search,
  create,
  update,
  deleteById
};
