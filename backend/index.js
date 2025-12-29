let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let bodyParser = require('body-parser');
const multer = require('multer');
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
let dbConfig = require('./database/db');

const routes = require('./routes');
mongoose.Promise = global.Promise;
mongoose
    .connect(dbConfig.db, { useNewUrlParser: true })
    .then(() => console.log('Connection successful!'))
    .catch((error) => console.error('Connection failed:', error));

const app = express();
app.use(bodyParser.json({limit: '2gb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '2gb',
}));

app.use(cors({origin: '*'}));
app.options('*', cors({origin: '*'}));

const ROOT_UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(ROOT_UPLOAD_DIR)) {
    fs.mkdirSync(ROOT_UPLOAD_DIR, {recursive: true});
}

function sanitizeName(name, fallback) {
    const raw = (name || '').toString().trim();
    const used = raw || fallback;
    const safe = used.replace(/[^a-zA-Z0-9_\-]/g, '_');
    return {raw: used, safe};
}

function makeFolderId(existing) {
    const raw = (existing || '').toString().trim();
    if (raw) {
        const safe = raw.replace(/[^a-zA-Z0-9_\-]/g, '_');
        return {raw, safe, mode: 'update'};
    }
    const generated = crypto.randomUUID();
    return {raw: generated, safe: generated, mode: 'create'};
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!req._uploadInfo) {
            const company = sanitizeName(req.body.companyName, 'company_default');
            const title = sanitizeName(req.body.titleName, 'title_default');
            const folderId = makeFolderId(req.body.folderId);
            const uploadPath = path.join(ROOT_UPLOAD_DIR, company.safe, folderId.safe);
            req._uploadInfo = {company, title, folderId, uploadPath};
        }

        const {uploadPath} = req._uploadInfo;
        fs.mkdir(uploadPath, {recursive: true}, (err) => {
            cb(err, uploadPath);
        });
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5GB per file
        fieldSize: 50 * 1024 * 1024, // 50MB for non-file fields
    },
});

// expose uploaded files
app.use('/uploads', express.static(ROOT_UPLOAD_DIR));

// health check for upload service
app.get('/health', (req, res) => {
    res.json({status: 'ok'});
});

// Upload / Update endpoint
app.post('/upload', upload.array('files', 200), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No files uploaded',
        });
    }

    const info = req._uploadInfo;
    const {company, title, folderId, uploadPath} = info;
    const folderUrl = `/uploads/${company.safe}/${folderId.safe}`;

    res.json({
        success: true,
        message: 'Files uploaded successfully',
        mode: folderId.mode,
        company: {raw: company.raw, safe: company.safe},
        title: {raw: title.raw, safe: title.safe},
        folderId: {raw: folderId.raw, safe: folderId.safe},
        folderPath: uploadPath,
        folderUrl,
        count: req.files.length,
        files: req.files.map((f) => ({
            originalName: f.originalname,
            savedAs: f.filename,
            path: f.path,
        })),
    });
});

app.use('/', routes);

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log('Connected to port: ' + port);
});

app.use((req, res, next) => {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
})
