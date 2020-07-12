const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    initialDescription: {
        type: String,
        require: true,
    },
    initialImage: {
        type: String,
        require: true,
    },
    startedAt: {
        type: Date,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    finalDescription: {
        type: String,
    },
    finalImage: {
        type: String,
    },
    stopedAt: {
        type: Date,
    },
    finished: {
        type: Boolean,
        default: false,
    },
},
);

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;