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
        category: req.body.category,
        title: req.body.title,
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
                    category: result.category,
                    title: result.title,
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
        const notes = await Note.find();//.populate('user');

        return res.send({ notes });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading notes' });
    }
});

// http://localhost:3000/notes/:category - (Post) Rota protegida por token
router.get('/category/:category', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ category: req.params.category });//.populate('user');

        return res.send({ notes });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading note' });
    }
});

// http://localhost:3000/notes/:finished - (Post) Rota protegida por token
router.get('/finished/:finished', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ finished: req.params.finished });//.populate('user');

        return res.send({ notes });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading note' });
    }
});

// http://localhost:3000/notes/:noteId - (Put) Rota protegida por token
router.put('/:noteId', authMiddleware, multer(multerConfig).single('finalImage'), async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (note) {
            await Note.findByIdAndUpdate({ _id: req.params.noteId }, {
                $set: {
                    finalDescription: req.body.finalDescription,
                    finalImage: process.env.DIR_IMAGE + req.file.filename,
                    stopedAt: req.body.stopedAt,
                    finished: true,
                }
            })
            res.status(201).json({ message: 'Updated note succesfully' });
        } else {
            return res.status(400).send({ error: 'Note not found' });
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

    await Note.findByIdAndRemove(req.params.noteId, function (err) {
        if (err) {
            console.log("failed to delete local image:" + err);
        } else {
            fs.unlink(process.env.IMAGE_STORAGE + req.body.initial, function (err) {
                if (err) {
                    console.log("failed to delete local image:" + err);
                } else {
                    console.log('successfully deleted local image');
                }
            });
            fs.unlink(process.env.IMAGE_STORAGE + req.body.final, function (err) {
                if (err) {
                    return res.status(400).send({ error: 'failed to delete local image:' + err });
                } else {
                    return res.send({ message: 'successfully deleted local image' });
                }
            });

        }
    });
});

module.exports = router;

// // http://localhost:3000/notes/user - (Get) Rota protegida por token
// router.get('/user', authMiddleware, async (req, res) => {
//     try {
//         const notes = await Note.find({ user: req.body.id }).populate('user');
//         return res.send({ notes });
//     } catch (err) {
//         return res.status(400).send({ error: 'Error loading notes' });
//     }
// });