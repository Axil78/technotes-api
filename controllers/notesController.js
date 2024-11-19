const Note = require('../models/Note');
const User = require('../models/User');

// @desc Get all notes 
// @route GET /notes
// @access Private
const getAllNotes = (req, res) => {
    Note.find()
        .lean()
        .then(notes => {
            if (!notes?.length) {
                return res.status(400).json({ message: 'No notes found' });
            }

            // Extract unique user IDs
            const userIds = [...new Set(notes.map(note => note.user))];

            // Fetch user data
            User.find({ _id: { $in: userIds } })
                .lean()
                .then(users => {
                    const userMap = users.reduce((map, user) => {
                        map[user._id] = user.username;
                        return map;
                    }, {});

                    const notesWithUser = notes.map(note => ({
                        ...note,
                        username: userMap[note.user] || 'Unknown User',
                    }));

                    res.json(notesWithUser);
                })
                .catch(err => res.status(500).json({ message: 'Error fetching users', error: err.message }));
        })
        .catch(err => res.status(500).json({ message: 'Error fetching notes', error: err.message }));
};

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = (req, res) => {
    const { user, title, text } = req.body;

    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    Note.findOne({ title })
        .collation({ locale: 'en', strength: 2 })
        .lean()
        .then(duplicate => {
            if (duplicate) {
                return res.status(409).json({ message: 'Duplicate note title' });
            }

            Note.create({ user, title, text })
                .then(() => res.status(201).json({ message: 'New note created' }))
                .catch(err => res.status(500).json({ message: 'Error creating note', error: err.message }));
        })
        .catch(err => res.status(500).json({ message: 'Error checking duplicates', error: err.message }));
};

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = (req, res) => {
    const { id, user, title, text, completed } = req.body;

    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }

    Note.findById(id)
        .then(note => {
            if (!note) {
                return res.status(400).json({ message: 'Note not found' });
            }

            Note.findOne({ title })
                .collation({ locale: 'en', strength: 2 })
                .lean()
                .then(duplicate => {
                    if (duplicate && duplicate._id.toString() !== id) {
                        return res.status(409).json({ message: 'Duplicate note title' });
                    }

                    note.user = user;
                    note.title = title;
                    note.text = text;
                    note.completed = completed;

                    note.save()
                        .then(updatedNote => res.json({ message: `'${updatedNote.title}' updated` }))
                        .catch(err => res.status(500).json({ message: 'Error updating note', error: err.message }));
                })
                .catch(err => res.status(500).json({ message: 'Error checking duplicates', error: err.message }));
        })
        .catch(err => res.status(500).json({ message: 'Error finding note', error: err.message }));
};

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Note ID required' });
    }

    Note.findById(id)
        .then(note => {
            if (!note) {
                return res.status(400).json({ message: 'Note not found' });
            }

            note.deleteOne()
                .then(result => res.json({ message: `Note '${result.title}' with ID ${result._id} deleted` }))
                .catch(err => res.status(500).json({ message: 'Error deleting note', error: err.message }));
        })
        .catch(err => res.status(500).json({ message: 'Error finding note', error: err.message }));
};

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote,
};
