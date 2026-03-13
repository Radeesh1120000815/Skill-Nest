import KuppiGroup from '../models/kuppiGroupModel.js';

// @desc    Get all Kuppi Groups (for Dashboard)
// @route   GET /api/groups
export const getGroups = async (req, res) => {
  try {
    // Populate use karala Senior ge name eka saha badges tika gannawa
    const groups = await KuppiGroup.find({}).populate('senior_id', 'name badges');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new Kuppi Group (Senior Only)
// @route   POST /api/groups
export const createGroup = async (req, res) => {
  const { module_name, semester, session_link, quiz_link } = req.body;

  try {
    const group = await KuppiGroup.create({
      senior_id: req.user._id, // Auth middleware eken ena user ID eka
      module_name,
      semester,
      session_link,
      quiz_link,
      status: 'pending' 
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a Kuppi Group (Junior Only)
// @route   PUT /api/groups/:id/join
export const joinGroup = async (req, res) => {
  try {
    const group = await KuppiGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Capacity check (max 10)
    if (group.current_members.length >= group.max_members) {
      return res.status(400).json({ message: 'This Kuppi is already full (max 10 students)' });
    }

    // Double join check
    if (group.current_members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already joined this session' });
    }

    group.current_members.push(req.user._id);

    // Business Logic: Activate the group once the 5th (min_members) person joins
    if (group.current_members.length >= group.min_members) {
      group.status = 'active';
    }

    await group.save();
    res.json({ message: 'Successfully joined the Kuppi!', group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};