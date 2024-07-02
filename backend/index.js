import cors from 'cors';
import multer from 'multer';
import express from 'express';
import path from 'path';
import { rm } from 'fs/promises';
import { Picture } from './database.js';

const port = 3000;
const app = express();
const upload = multer({ dest: './db/images/' });

app.use(cors());
app.use(express.json());

// Helper function to get picture by ID
const getPictureById = async (id) => {
    const picture = await Picture.findByPk(id);
    if (!picture) {
        throw new Error('Picture not found');
    }
    return picture;
};

// Route to get an image by ID
app.get('/image/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const picture = await getPictureById(id);
        res.set('Content-Disposition', `attachment; filename="${picture.originalName}"`);
        res.status(200).sendFile(path.resolve(`./db/images/${picture.filename}`));
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

// Route to get paginated images
app.post('/images', async (req, res) => {
    try {
        const { pageNumber = 1 } = req.body;
        const { rows: pictures, count } = await Picture.findAndCountAll({
            limit: 9,
            offset: (pageNumber - 1) * 9,
        });
        const paging = {
            currentPage: pageNumber,
            pageCount: Math.ceil(count / 9),
        };
        res.json({ images: pictures, paging });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Route to upload a new image
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const picture = await Picture.create({
            title,
            description,
            originalName: req.file.originalname,
            filename: req.file.filename,
        });
        res.status(200).json(picture);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Route to patch an image by ID
app.patch('/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        const id = Number(req.params.id);
        const picture = await getPictureById(id);
        await picture.update({ title, description });
        res.status(200).json(picture);
    } catch (error) {
        res.status(409).send({ error: error.message });
    }
});

// Route to delete an image by ID
app.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const picture = await getPictureById(id);
        await picture.destroy();
        const picturePath = path.resolve(`./db/images/${picture.filename}`);
        await rm(picturePath);
        res.sendStatus(200);
    } catch (error) {
        res.status(409).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});
