/**
 * Test script to verify commitment extraction with coach-formatted commitments
 */

import { extractCommitments } from "./ai-helpers";

const testConversation = [
  {
    role: "user",
    content: "add my commitments to the commitments tab"
  },
  {
    role: "assistant",
    content: `Commitments Logged:

| Commitment | Description | Deadline | Status |
|------------|-------------|----------|--------|
| Termination Meeting | Conduct the termination conversation with the employee (with Sabrina present). | Two Days from Now | PENDING |
| Action 1: Scheduling | Send the calendar invite for the termination meeting to the employee and Sabrina. | Today, 7:00 PM | PENDING |
| Action 2: Preparation | Confirm all necessary paperwork (severance, final pay, etc.) with Sabrina. | Today, 7:00 PM | PENDING |

Your focus remains on executing Actions 1 and 2 by 7:00 PM tonight. Get out of the planning phase and into the execution phase.`
  }
];

async function testExtraction() {
  console.log("Testing commitment extraction...\n");
  console.log("Input conversation:");
  console.log(JSON.stringify(testConversation, null, 2));
  console.log("\n---\n");
  
  try {
    const commitments = await extractCommitments(testConversation, 1);
    console.log(`Extracted ${commitments.length} commitments:\n`);
    commitments.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.description}`);
      console.log(`   Due: ${c.dueDate || 'No due date'}`);
      console.log(`   Priority: ${c.priority}`);
      console.log(`   Category: ${c.category}`);
      console.log();
    });
    
    if (commitments.length === 0) {
      console.error("❌ FAILED: No commitments extracted!");
      console.error("Expected 3 commitments from the coach's table.");
    } else if (commitments.length === 3) {
      console.log("✅ SUCCESS: All 3 commitments extracted correctly!");
    } else {
      console.warn(`⚠️  PARTIAL: Expected 3 commitments, got ${commitments.length}`);
    }
  } catch (error) {
    console.error("❌ ERROR during extraction:", error);
  }
}

testExtraction();
