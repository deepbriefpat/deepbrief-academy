#!/usr/bin/env node
/**
 * Database Cleanup Script
 * 
 * This script fixes corrupt data in the database:
 * - Sessions with invalid JSON in messages field
 * - Goals with invalid JSON in milestones field
 * 
 * Usage: pnpm db:cleanup
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { coachingSessions, coachingGoals } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create database connection
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('🔍 Starting database cleanup...\n');

let totalFixed = 0;

// ============================================================
// Fix 1: Sessions with invalid JSON in messages field
// ============================================================
console.log('📋 Checking for sessions with invalid JSON in messages...');
try {
  const allSessions = await db.select().from(coachingSessions);
  
  let invalidCount = 0;
  for (const session of allSessions) {
    if (!session.messages) continue;
    
    try {
      // Try to parse messages
      const parsed = typeof session.messages === 'string' 
        ? JSON.parse(session.messages) 
        : session.messages;
      
      // Check if it's a valid array
      if (!Array.isArray(parsed)) {
        throw new Error('Messages is not an array');
      }
    } catch (error) {
      invalidCount++;
      console.log(`   ⚠️  Session ${session.id} has invalid messages: ${error.message}`);
      
      // Fix: Set messages to empty array
      await db
        .update(coachingSessions)
        .set({ messages: JSON.stringify([]) })
        .where(eq(coachingSessions.id, session.id));
      
      console.log(`   ✅ Fixed session ${session.id}: reset messages to empty array`);
      totalFixed++;
    }
  }
  
  if (invalidCount === 0) {
    console.log('   ✅ No sessions with invalid JSON in messages found');
  }
} catch (error) {
  console.error('   ❌ Error fixing invalid messages JSON:', error.message);
}

console.log('');

// ============================================================
// Fix 2: Goals with invalid JSON in milestones field
// ============================================================
console.log('📋 Checking for goals with invalid JSON in milestones...');
try {
  const allGoals = await db.select().from(coachingGoals);
  
  let invalidCount = 0;
  for (const goal of allGoals) {
    if (!goal.milestones) continue;
    
    try {
      // Try to parse milestones
      const parsed = typeof goal.milestones === 'string' 
        ? JSON.parse(goal.milestones) 
        : goal.milestones;
      
      // Check if it's a valid array
      if (!Array.isArray(parsed)) {
        throw new Error('Milestones is not an array');
      }
    } catch (error) {
      invalidCount++;
      console.log(`   ⚠️  Goal ${goal.id} has invalid milestones: ${error.message}`);
      
      // Fix: Set milestones to empty array
      await db
        .update(coachingGoals)
        .set({ milestones: JSON.stringify([]) })
        .where(eq(coachingGoals.id, goal.id));
      
      console.log(`   ✅ Fixed goal ${goal.id}: reset milestones to empty array`);
      totalFixed++;
    }
  }
  
  if (invalidCount === 0) {
    console.log('   ✅ No goals with invalid JSON in milestones found');
  }
} catch (error) {
  console.error('   ❌ Error fixing invalid milestones JSON:', error.message);
}

console.log('');

// ============================================================
// Summary
// ============================================================
console.log('═══════════════════════════════════════════════════');
console.log(`✨ Database cleanup complete!`);
console.log(`   Total fixes applied: ${totalFixed}`);
console.log('═══════════════════════════════════════════════════\n');

// Close connection
await connection.end();
process.exit(0);
