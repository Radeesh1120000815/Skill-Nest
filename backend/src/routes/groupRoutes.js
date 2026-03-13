import express from 'express';
import mongoose from 'mongoose'; 
import KuppiGroup from '../models/kuppiGroupModel.js';

const router = express.Router();

// 🟢 සියලුම Groups ලබාගැනීම (Pending ළමයි සහ Mentor ගේ නම සමඟ)
router.get('/', async (req, res) => {
  try {
    const groups = await KuppiGroup.find()
      .populate('pending_members', 'name email')
      .populate('senior_id', 'name'); // 🔴 Mentor ගේ නම ගන්න අලුතින් දැම්මේ මේකයි
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Junior කෙනෙක් Group එකකට Request කිරීම (කලින් තිබුණු Join route එක)
router.put('/join/:groupId', async (req, res) => {
  try {
    const group = await KuppiGroup.findById(req.params.groupId);
    const { userId } = req.body;

    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.current_members.length >= group.max_members) {
      return res.status(400).json({ message: "This group is already full!" });
    }
    if (group.current_members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this group." });
    }
    // දැනටමත් Request එකක් යවලාද බලමු
    if (group.pending_members && group.pending_members.includes(userId)) {
      return res.status(400).json({ message: "You have already sent a request!" });
    }

    // 🔴 Request එක pending_members array එකට දාමු
    if (!group.pending_members) group.pending_members = [];
    group.pending_members.push(userId);

    await group.save();
    res.json({ message: "Join request sent to the Mentor successfully! ⏳", group });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 අලුතින් Kuppi Session එකක් සෑදීම
router.post('/create', async (req, res) => {
  try {
    const { module_name, max_members, session_link, semester, senior_id , quiz_link} = req.body;

    if (!module_name || !max_members || !session_link || !semester || !senior_id) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const newGroup = new KuppiGroup({
      module_name, max_members, session_link, semester, senior_id, quiz_link,    
      current_members: [], pending_members: [], status: 'pending' 
    });

    await newGroup.save();
    res.status(201).json({ message: "Premium Session Created Successfully! 🚀", group: newGroup });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔴 NEW: Request එකක් Approve කිරීම
router.put('/approve/:groupId/:studentId', async (req, res) => {
  try {
    const { groupId, studentId } = req.params;
    const group = await KuppiGroup.findById(groupId);

    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.current_members.length >= group.max_members) return res.status(400).json({ message: "Group is full!" });

    // Pending එකෙන් අයින් කරලා Current එකට දානවා
    group.pending_members = group.pending_members.filter(id => id.toString() !== studentId);
    if (!group.current_members.includes(studentId)) {
      group.current_members.push(studentId);
    }

    if (group.current_members.length >= 5) group.status = 'active';

    await group.save();
    res.json({ message: "Student approved and added to the session! ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error approving student" });
  }
});

// 🔴 NEW: Request එකක් Reject කිරීම
router.delete('/reject/:groupId/:studentId', async (req, res) => {
  try {
    const { groupId, studentId } = req.params;
    const group = await KuppiGroup.findById(groupId);

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Pending එකෙන් අයින් කරනවා විතරයි
    group.pending_members = group.pending_members.filter(id => id.toString() !== studentId);

    await group.save();
    res.json({ message: "Student request rejected! ❌" });
  } catch (err) {
    res.status(500).json({ message: "Server error rejecting student" });
  }
});

// 🟢 Group එකක ඉන්න ළමයි ලිස්ට් එක ගැනීම
router.get('/:groupId/students', async (req, res) => {
  try {
    const group = await KuppiGroup.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const students = await Promise.all(
      group.current_members.map(async (studentId) => {
        const studentQuery = await mongoose.model('User').findById(studentId).select('name email badges'); 
        return studentQuery;
      })
    );
    res.json(students.filter(student => student !== null));
  } catch (err) {
    res.status(500).json({ message: "Server error fetching students" });
  }
});

// 🟢 Mentor විසින් ළමයෙක්ව Group එකෙන් ඉවත් කිරීම
router.delete('/:groupId/remove-student/:studentId', async (req, res) => {
  try {
    const { groupId, studentId } = req.params;
    const group = await KuppiGroup.findById(groupId);

    if (!group) return res.status(404).json({ message: "Group not found" });

    const updatedMembers = group.current_members.filter((id) => id.toString() !== studentId);
    await KuppiGroup.findByIdAndUpdate(groupId, {
      current_members: updatedMembers,
      status: updatedMembers.length < 5 ? 'pending' : group.status
    });

    res.json({ message: "Student successfully removed from the session! ✅" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🟢 Session එකක් Update කිරීම
router.put('/update/:groupId', async (req, res) => {
  try {
    const updatedGroup = await KuppiGroup.findByIdAndUpdate(req.params.groupId, req.body, { new: true, runValidators: false });
    if (!updatedGroup) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session Details Updated Successfully! ✨", group: updatedGroup });
  } catch (err) {
    res.status(500).json({ message: "Server error updating session" });
  }
});

// 🟢 Session එකක් මකා දැමීම
router.delete('/delete/:groupId', async (req, res) => {
  try {
    const deletedGroup = await KuppiGroup.findByIdAndDelete(req.params.groupId);
    if (!deletedGroup) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session Deleted Successfully! 🗑️" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting session" });
  }
});

export default router;