// Create: src/scripts/cleanupEntryFees.js
// Run this once to convert entry fees from "$30 " to 30

import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export const cleanupEntryFees = async () => {
  try {
    console.log('🚀 Starting entry fee cleanup...');
    
    const snapshot = await getDocs(collection(db, 'parks'));
    const parks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    let updated = 0;
    
    for (const park of parks) {
      if (park.entryFee && typeof park.entryFee === 'string') {
        // Extract number from string like "$30 " or "$30"
        const numericFee = parseInt(park.entryFee.replace(/[^0-9]/g, ''));
        
        if (!isNaN(numericFee)) {
          await updateDoc(doc(db, 'parks', park.id), {
            entryFee: numericFee,
            updatedAt: new Date()
          });
          
          console.log(`✅ Updated ${park.name}: "${park.entryFee}" → ${numericFee}`);
          updated++;
        }
      }
    }
    
    console.log(`🎉 Cleanup completed! Updated ${updated} parks.`);
    return { success: true, updated };
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { success: false, error: error.message };
  }
};