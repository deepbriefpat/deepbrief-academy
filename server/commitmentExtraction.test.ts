/**
 * Tests for commitment extraction from coaching conversations
 */

import { describe, it, expect } from 'vitest';
import { extractCommitments } from './ai-helpers';

describe('Commitment Extraction', () => {
  it('should extract commitments from coach table format', async () => {
    const conversation = [
      {
        role: 'user',
        content: 'Can you log my commitments?'
      },
      {
        role: 'assistant',
        content: `Commitments Logged:

| Commitment | Description | Deadline | Status |
|------------|-------------|----------|--------|
| Termination Meeting | Conduct the termination conversation with the employee (with Sabrina present). | Two Days from Now | PENDING |
| Action 1: Scheduling | Send the calendar invite for the termination meeting to the employee and Sabrina. | Today, 7:00 PM | PENDING |
| Action 2: Preparation | Confirm all necessary paperwork (severance, final pay, etc.) with Sabrina. | Today, 7:00 PM | PENDING |

Your focus remains on executing Actions 1 and 2 by 7:00 PM tonight.`
      }
    ];

    const commitments = await extractCommitments(conversation, 1);
    
    expect(commitments.length).toBe(3);
    expect(commitments[0].description).toContain('Termination Meeting');
    expect(commitments[1].description).toContain('Action 1');
    expect(commitments[2].description).toContain('Action 2');
    
    // Check that deadlines are parsed
    expect(commitments[0].dueDate).toBeTruthy();
    expect(commitments[1].dueDate).toBeTruthy();
    expect(commitments[2].dueDate).toBeTruthy();
    
    // Check priorities
    expect(commitments[1].priority).toBe('high'); // Today = high priority
    expect(commitments[2].priority).toBe('high'); // Today = high priority
  });

  it('should extract commitments from natural language', async () => {
    const conversation = [
      {
        role: 'user',
        content: 'The biggest risk is losing our key customer. I\'ll schedule a call with them by end of day tomorrow to address their concerns. I also need to review the technical debt backlog by Friday and prioritize the top 3 items.'
      },
      {
        role: 'assistant',
        content: 'That\'s clarity. Now let\'s make those commitments specific.'
      }
    ];

    const commitments = await extractCommitments(conversation, 1);
    
    // Should extract at least the two explicit commitments
    expect(commitments.length).toBeGreaterThanOrEqual(2);
    
    // Check that commitments mention the key actions
    const descriptions = commitments.map(c => c.description.toLowerCase());
    const hasCallCommitment = descriptions.some(d => d.includes('call') || d.includes('schedule'));
    const hasReviewCommitment = descriptions.some(d => d.includes('review') || d.includes('technical debt'));
    
    expect(hasCallCommitment).toBe(true);
    expect(hasReviewCommitment).toBe(true);
  });

  it('should return empty array when no commitments exist', async () => {
    const conversation = [
      {
        role: 'user',
        content: 'I\'m feeling overwhelmed with everything.'
      },
      {
        role: 'assistant',
        content: 'Tell me more about what\'s overwhelming you.'
      }
    ];

    const commitments = await extractCommitments(conversation, 1);
    
    expect(commitments.length).toBe(0);
  });

  it('should handle mixed table and natural language commitments', async () => {
    const conversation = [
      {
        role: 'user',
        content: 'I\'ll talk to my co-founder tomorrow about the equity split.'
      },
      {
        role: 'assistant',
        content: `Good. Let me log that.

Commitments Logged:

| Commitment | Description | Deadline | Status |
|------------|-------------|----------|--------|
| Equity Discussion | Talk to co-founder about equity split | Tomorrow | PENDING |

What else do you need to address?`
      },
      {
        role: 'user',
        content: 'I also need to review the financials by end of week.'
      }
    ];

    const commitments = await extractCommitments(conversation, 1);
    
    // Should find the table commitment first (table parser takes priority)
    expect(commitments.length).toBeGreaterThanOrEqual(1);
    expect(commitments[0].description).toContain('Equity');
  });
});
