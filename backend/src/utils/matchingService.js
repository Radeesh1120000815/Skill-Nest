/**
 * Mentorship Matching Service
 * Calculates affinity scores between Junior (Mentee) and Senior (Mentor) users.
 */

export const calculateMatchScore = (mentee, mentor) => {
  let score = 0;
  const weights = {
    skillOverlap: 40,
    industryMatch: 30,
    languageMatch: 15,
    availabilityBonus: 15
  };

  // 1. Skill Overlap (Junior Interests vs Senior Skills)
  if (mentee.interests && mentor.skills) {
    const overlappingSkills = mentee.interests.filter(skill => 
      mentor.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    const overlapPercentage = overlappingSkills.length / Math.max(mentee.interests.length, 1);
    score += overlapPercentage * weights.skillOverlap;
  }

  // 2. Industry / Specialization Match
  if (mentee.batch_details?.specialization && mentor.industry) {
    if (mentee.batch_details.specialization.toLowerCase() === mentor.industry.toLowerCase()) {
      score += weights.industryMatch;
    }
  } else if (mentor.headline && mentee.batch_details?.specialization) {
    // Fallback search in headline
    if (mentor.headline.toLowerCase().includes(mentee.batch_details.specialization.toLowerCase())) {
      score += weights.industryMatch * 0.7;
    }
  }

  // 3. Language Match
  if (mentee.languages && mentor.languages) {
    const commonLanguages = mentee.languages.filter(lang => 
      mentor.languages.some(l => l.toLowerCase() === lang.toLowerCase())
    );
    if (commonLanguages.length > 0) {
      score += weights.languageMatch;
    }
  }

  // 4. Activity/Rating Bonus (Heuristic)
  if (mentor.rating > 4) {
    score += 10;
  }

  return Math.min(Math.round(score), 100);
};

/**
 * Filter and sort mentors for a specific junior
 */
export const getTopMatches = (junior, mentors, limit = 5) => {
  return mentors
    .map(mentor => ({
      mentor,
      score: calculateMatchScore(junior, mentor)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
