/**
 * Mentorship Matching Service for Frontend
 * Calculates affinity scores between Junior (Mentee) and Senior (Mentor) users.
 */

export const calculateMatchScore = (mentee, mentor) => {
  let score = 0;
  const weights = {
    skillOverlap: 40,
    industryMatch: 30,
    languageMatch: 15,
    ratingBonus: 15
  };

  // 1. Skill Overlap (Junior Interests vs Senior Skills)
  if (mentee?.interests && mentor?.skills) {
    const overlappingSkills = mentee.interests.filter(skill => 
      mentor.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    const overlapPercentage = overlappingSkills.length / Math.max(mentee.interests.length, 1);
    score += overlapPercentage * weights.skillOverlap;
  }

  // 2. Industry / Specialization Match
  if (mentee?.batch_details?.specialization && mentor?.industry) {
    if (mentee.batch_details.specialization.toLowerCase() === mentor.industry.toLowerCase()) {
      score += weights.industryMatch;
    }
  } else if (mentor?.headline && mentee?.batch_details?.specialization) {
    if (mentor.headline.toLowerCase().includes(mentee.batch_details.specialization.toLowerCase())) {
      score += weights.industryMatch * 0.7;
    }
  }

  // 3. Language Match
  if (mentee?.languages && mentor?.languages) {
    const commonLanguages = mentee.languages.filter(lang => 
      mentor.languages.some(l => l.toLowerCase() === lang.toLowerCase())
    );
    if (commonLanguages.length > 0) {
      score += weights.languageMatch;
    }
  }

  // 4. Rating Bonus
  if (mentor?.rating > 4) {
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
