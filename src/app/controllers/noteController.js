const express = require('express');
const multer = require('multer');
const multerConfig = require('../middlewares/multer');
const authMiddleware = require('../middlewares/auth');
const Note = require('../models/note');
const fs = require('fs');

const router = express.Router();

// http://localhost:3000/notes - (Post) Rota protegida por token
router.post('/', authMiddleware, multer(multerConfig).single('initialImage'), async (req, res) => {
    const note = new Note({
        initialDescription: req.body.initialDescription,
        startedAt: req.body.startedAt,
        initialImage: process.env.DIR_IMAGE + req.file.filename,
        user: req.userId
    });
    note
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created note succesfully',
                createdNote: {
                    _id: result._id,
                    initialDescription: result.initialDescription,
                    initialImage: result.initialImage,
                    startedAt: result.startedAt,
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

// http://localhost:3000/notes - (Get) Rota protegida por token
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.query.user });//.populate('user');

        return res.send({ notes });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading notes' });
    }
});

// http://localhost:3000/notes/:finished - (Post) Rota protegida por token
router.get('/finished', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({
            finished: req.query.finished,
            user: req.query.user
        });//.populate('user');

        return res.send({ notes });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading note' });
    }
});

// http://localhost:3000/notes/:noteId - (Put) Rota protegida por token
router.put('/:noteId', authMiddleware, multer(multerConfig).single('finalImage'), async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note) {
            return res.status(400).send({ error: 'Note not found' });
        } else {
            await Note.findByIdAndUpdate({ _id: req.params.noteId }, {
                $set: {
                    finalDescription: req.body.finalDescription,
                    finalImage: process.env.DIR_IMAGE + req.file.filename,
                    stopedAt: req.body.stopedAt,
                    finished: true,
                }
            })
            res.status(201).json({ message: 'Updated note succesfully' });
        }
    } catch (err) {
        return res.status(400).send({ error: 'Error updating note' });
    }
});

// http://localhost:3000/notes/:noteId - (Post) Rota protegida por token
router.get('/:noteId', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);//.populate('user');

        return res.send({ note });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading note' });
    }
});

// http://localhost:3000/notes/:noteId - (Delete) Rota protegida por token
router.delete('/:noteId', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note) {
            return res.status(400).send({ error: 'Note not found' });
        } else {
            await Note.findByIdAndRemove(req.params.noteId, function (err) {
                if (err) {
                    console.log("failed to delete note:" + err);
                } else {
                    fs.unlink(process.env.IMAGE_STORAGE + req.body.initial, function (err) {
                        if (err) {
                            console.log("failed to delete initial image:" + err);
                        } else {
                            console.log('successfully deleted initial image');
                        }
                    });
                    fs.unlink(process.env.IMAGE_STORAGE + req.body.final, function (err) {
                        if (err) {
                            return res.status(400).send({ error: 'failed to delete final image:' + err });
                        } else {
                            return res.send({ message: 'successfully deleted final image' });
                        }
                    });
                }
            });
        }
    } catch (error) {
        return res.status(400).send({ Erro: error });
    }
});

module.exports = router;

