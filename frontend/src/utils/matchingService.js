/**
 * Mentorship Matching Service for Frontend
 * Calculates affinity scores between Junior (Mentee) and Senior (Mentor) users.
 */

export const calculateMatchScore = (mentee, mentor) => {
  if (!mentee || !mentor) return 0;
  
  let score = 20; // 🚀 Base Affinity Score (prevents uninviting 0% for new users)
  
  const weights = {
    skillOverlap: 35, // Adjusted from 40
    industryMatch: 25, // Adjusted from 30
    languageMatch: 10, // Adjusted from 15
    ratingBonus: 10   // Adjusted from 15
  };

  // 1. Skill Overlap (Junior Interests vs Senior Skills)
  if (Array.isArray(mentee.interests) && Array.isArray(mentor.skills) && mentee.interests.length > 0) {
    const overlappingSkills = mentee.interests.filter(skill => 
      mentor.skills.some(s => s && s.toLowerCase() === skill.toLowerCase())
    );
    const overlapPercentage = overlappingSkills.length / mentee.interests.length;
    score += overlapPercentage * weights.skillOverlap;
  }

  // 2. Industry / Specialization Match
  const menteeSpec = mentee.batch_details?.specialization?.toLowerCase();
  const mentorInd = mentor.industry?.toLowerCase();
  const mentorHead = mentor.headline?.toLowerCase();

  if (menteeSpec && mentorInd) {
    if (menteeSpec === mentorInd) {
      score += weights.industryMatch;
    } else if (mentorInd.includes(menteeSpec) || mentorHead?.includes(menteeSpec)) {
      score += weights.industryMatch * 0.6;
    }
  }

  // 3. Language Match
  if (Array.isArray(mentee.languages) && Array.isArray(mentor.languages)) {
    const commonLanguages = mentee.languages.filter(lang => 
      mentor.languages.some(l => l && l.toLowerCase() === lang.toLowerCase())
    );
    if (commonLanguages.length > 0) {
      score += weights.languageMatch;
    }
  }

  // 4. Rating Bonus
  if (mentor.rating && mentor.rating >= 4) {
    score += weights.ratingBonus;
  }

  return Math.min(Math.round(score), 100);
};

export const getTopMatches = (junior, mentors, limit = 5) => {
  if (!junior || !mentors) return [];
  return mentors
    .map(mentor => ({
      ...mentor,
      matchScore: calculateMatchScore(junior, mentor)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};
