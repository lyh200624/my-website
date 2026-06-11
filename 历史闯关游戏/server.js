const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const vm = require('vm');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'admin123';
const TEACHER_SESSION_SECRET = process.env.TEACHER_SESSION_SECRET || TEACHER_PASSWORD;
const rootDir = __dirname;
const isVercel = Boolean(process.env.VERCEL);
const onlineDbUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || '';
const onlineDbToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || '';
const dataDir = isVercel
  ? path.join(os.tmpdir(), 'history-reform-game')
  : path.join(rootDir, 'data');
const dbPath = path.join(dataDir, 'history-game.sqlite');
const gameDataPath = path.join(rootDir, 'js', 'gameData.js');

function createDatabase() {
  if (onlineDbUrl) {
    const { createClient } = require('@libsql/client');
    const client = createClient({
      url: onlineDbUrl,
      authToken: onlineDbToken || undefined
    });

    const execute = async (sql, args = []) => client.execute({ sql, args });

    return {
      type: 'libsql',
      async exec(sql) {
        const statements = sql
          .split(';')
          .map(statement => statement.trim())
          .filter(Boolean);
        for (const statement of statements) {
          await execute(statement);
        }
      },
      async get(sql, args = []) {
        const result = await execute(sql, args);
        return result.rows[0];
      },
      async all(sql, args = []) {
        const result = await execute(sql, args);
        return result.rows;
      },
      async run(sql, args = []) {
        const result = await execute(sql, args);
        const lastInsertRowid = typeof result.lastInsertRowid === 'bigint'
          ? Number(result.lastInsertRowid)
          : result.lastInsertRowid;
        return {
          lastInsertRowid,
          changes: result.rowsAffected
        };
      }
    };
  }

  fs.mkdirSync(dataDir, { recursive: true });
  const { DatabaseSync } = require('node:sqlite');
  const database = new DatabaseSync(dbPath);

  return {
    type: 'sqlite',
    async exec(sql) {
      database.exec(sql);
    },
    async get(sql, args = []) {
      return database.prepare(sql).get(...args);
    },
    async all(sql, args = []) {
      return database.prepare(sql).all(...args);
    },
    async run(sql, args = []) {
      const result = database.prepare(sql).run(...args);
      return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes
      };
    }
  };
}

const db = createDatabase();
const dbReady = initializeDatabase();

async function initializeDatabase() {
  await db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    class_name TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(name, class_name)
  );

  CREATE TABLE IF NOT EXISTS progress (
    student_id INTEGER PRIMARY KEY,
    total_score INTEGER NOT NULL DEFAULT 0,
    completed_levels INTEGER NOT NULL DEFAULT 0,
    max_streak INTEGER NOT NULL DEFAULT 0,
    level_progress TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS level_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    accuracy REAL NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    max_streak INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    answers TEXT NOT NULL DEFAULT '[]',
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS student_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    login_at TEXT NOT NULL DEFAULT (datetime('now')),
    ip_address TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    reform TEXT NOT NULL DEFAULT '',
    reform_id TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    images TEXT NOT NULL DEFAULT '[]',
    original_text TEXT NOT NULL DEFAULT '',
    annotation TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_level_results_student ON level_results(student_id);
  CREATE INDEX IF NOT EXISTS idx_level_results_completed ON level_results(completed_at);
  CREATE INDEX IF NOT EXISTS idx_student_logins_student ON student_logins(student_id);
  CREATE INDEX IF NOT EXISTS idx_documents_reform ON documents(reform_id);
  `);

  try {
    await db.exec(`ALTER TABLE students ADD COLUMN last_login_at TEXT DEFAULT NULL`);
  } catch {}

  try {
    await db.exec(`ALTER TABLE students ADD COLUMN login_count INTEGER NOT NULL DEFAULT 0`);
  } catch {}

  await seedDocuments();
}

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(asyncHandler(async (req, res, next) => {
  await dbReady;
  next();
}));

function cleanText(value) {
  return String(value || '').trim();
}

function toInt(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function signTeacherPayload(payload) {
  return crypto
    .createHmac('sha256', TEACHER_SESSION_SECRET)
    .update(payload)
    .digest('base64url');
}

function createTeacherToken() {
  const payload = Buffer.from(JSON.stringify({
    role: 'teacher',
    exp: Date.now() + 1000 * 60 * 60 * 8
  })).toString('base64url');
  return `${payload}.${signTeacherPayload(payload)}`;
}

function verifyTeacherToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return false;

  const expected = signTeacherPayload(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  if (!crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'teacher' && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function loadGameLevels() {
  try {
    const source = fs.readFileSync(gameDataPath, 'utf8');
    return vm.runInNewContext(`(() => { ${source}; return LEVELS; })()`, {}, {
      filename: gameDataPath,
      timeout: 1000
    });
  } catch (error) {
    console.warn('Unable to load game levels for analytics:', error.message);
    return [];
  }
}

function documentRowToApi(row) {
  return {
    id: row.id,
    reform: row.reform,
    reformId: row.reform_id,
    title: row.title,
    image: row.image,
    images: parseJson(row.images, []),
    originalText: row.original_text,
    annotation: row.annotation,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeDocumentPayload(body) {
  const images = Array.isArray(body?.images)
    ? body.images.map(cleanText).filter(Boolean)
    : cleanText(body?.images).split(/\r?\n|,/).map(cleanText).filter(Boolean);

  return {
    id: cleanText(body?.id) || crypto.randomUUID(),
    reform: cleanText(body?.reform),
    reformId: cleanText(body?.reformId),
    title: cleanText(body?.title),
    image: cleanText(body?.image),
    images,
    originalText: cleanText(body?.originalText),
    annotation: cleanText(body?.annotation),
    sortOrder: toInt(body?.sortOrder)
  };
}

function validateDocument(doc) {
  if (!doc.reformId) return 'reformId is required.';
  if (!doc.reform) return 'reform is required.';
  if (!doc.title) return 'title is required.';
  if (!doc.originalText) return 'originalText is required.';
  if (!doc.annotation) return 'annotation is required.';
  return '';
}

async function seedDocuments() {
  const count = (await db.get('SELECT COUNT(*) AS count FROM documents')).count;
  if (count > 0) return;

  let source;
  try {
    source = require('./js/documentData.js').DOCUMENT_DATA || [];
  } catch (error) {
    console.warn('Unable to seed documents from documentData.js:', error.message);
    return;
  }

  const insertSql = `
    INSERT INTO documents (
      id, reform, reform_id, title, image, images, original_text, annotation, sort_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const [index, doc] of source.entries()) {
    await db.run(insertSql, [
      cleanText(doc.id) || crypto.randomUUID(),
      cleanText(doc.reform),
      cleanText(doc.reformId),
      cleanText(doc.title),
      cleanText(doc.image),
      JSON.stringify(Array.isArray(doc.images) ? doc.images : []),
      cleanText(doc.originalText),
      cleanText(doc.annotation),
      index
    ]);
  }
}

async function ensureStudentRow(studentId) {
  await db.run(`
    INSERT OR IGNORE INTO students (id, name, class_name)
    VALUES (?, ?, '')
  `, [studentId, `Student ${studentId}`]);
}

async function ensureProgressRow(studentId) {
  await ensureStudentRow(studentId);
  await db.run(`
    INSERT OR IGNORE INTO progress (student_id, total_score, completed_levels, max_streak, level_progress)
    VALUES (?, 0, 0, 0, '{}')
  `, [studentId]);
}

function progressResponse(row) {
  return {
    levelProgress: parseJson(row?.level_progress, {}),
    userStats: {
      totalScore: toInt(row?.total_score),
      completedLevels: toInt(row?.completed_levels),
      maxStreak: toInt(row?.max_streak)
    },
    updatedAt: row?.updated_at || null
  };
}

async function upsertStudent(name, className) {
  if (!name) {
    return null;
  }

  let student = await db.get(`
    SELECT id, name, class_name AS className, created_at AS createdAt,
           last_login_at AS lastLoginAt, login_count AS loginCount
    FROM students
    WHERE name = ? AND class_name = ?
  `, [name, className]);

  if (!student) {
    const result = await db.run(`
      INSERT INTO students (name, class_name)
      VALUES (?, ?)
    `, [name, className]);

    student = await db.get(`
      SELECT id, name, class_name AS className, created_at AS createdAt,
             last_login_at AS lastLoginAt, login_count AS loginCount
      FROM students
      WHERE id = ?
    `, [result.lastInsertRowid]);
  }

  await ensureProgressRow(student.id);
  return student;
}

async function recordStudentLogin(req, studentId) {
  await db.run(`
    INSERT INTO student_logins (student_id, ip_address, user_agent)
    VALUES (?, ?, ?)
  `, [studentId, cleanText(req.ip), cleanText(req.get('user-agent'))]);

  await db.run(`
    UPDATE students
    SET last_login_at = datetime('now'),
        login_count = login_count + 1,
        updated_at = datetime('now')
    WHERE id = ?
  `, [studentId]);
}

async function getStudent(studentId) {
  return db.get(`
    SELECT id, name, class_name AS className, created_at AS createdAt,
           last_login_at AS lastLoginAt, login_count AS loginCount
    FROM students
    WHERE id = ?
  `, [studentId]);
}

function requireTeacher(req, res, next) {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!verifyTeacherToken(token)) {
    return res.status(401).json({ error: 'Teacher login required.' });
  }

  next();
}

app.post('/api/student/login', asyncHandler(async (req, res) => {
  const name = cleanText(req.body?.name);
  const className = cleanText(req.body?.className);

  if (!name) {
    return res.status(400).json({ error: 'Student name is required.' });
  }

  const student = await upsertStudent(name, className);
  await recordStudentLogin(req, student.id);
  res.json({ student: await getStudent(student.id) });
}));

app.post('/api/students', asyncHandler(async (req, res) => {
  const name = cleanText(req.body?.name);
  const className = cleanText(req.body?.className);

  if (!name) {
    return res.status(400).json({ error: 'Student name is required.' });
  }

  const student = await upsertStudent(name, className);
  res.json({ student });
}));

app.post('/api/teacher/login', (req, res) => {
  const password = String(req.body?.password || '');

  if (password !== TEACHER_PASSWORD) {
    return res.status(401).json({ error: 'Invalid teacher password.' });
  }

  res.json({ token: createTeacherToken(), teacher: { name: 'teacher' } });
});

app.get('/api/teacher/me', requireTeacher, (req, res) => {
  res.json({ teacher: { name: 'teacher' } });
});

app.get('/api/progress', asyncHandler(async (req, res) => {
  const studentId = toInt(req.query.studentId);
  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required.' });
  }

  await ensureProgressRow(studentId);
  const row = await db.get(`
    SELECT total_score, completed_levels, max_streak, level_progress, updated_at
    FROM progress
    WHERE student_id = ?
  `, [studentId]);

  res.json(progressResponse(row));
}));

app.post('/api/progress', asyncHandler(async (req, res) => {
  const studentId = toInt(req.body?.studentId);
  const levelProgress = req.body?.levelProgress && typeof req.body.levelProgress === 'object'
    ? req.body.levelProgress
    : {};
  const userStats = req.body?.userStats && typeof req.body.userStats === 'object'
    ? req.body.userStats
    : {};

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required.' });
  }

  await ensureProgressRow(studentId);
  await db.run(`
    UPDATE progress
    SET total_score = ?,
        completed_levels = ?,
        max_streak = ?,
        level_progress = ?,
        updated_at = datetime('now')
    WHERE student_id = ?
  `, [
    toInt(userStats.totalScore),
    toInt(userStats.completedLevels),
    toInt(userStats.maxStreak),
    JSON.stringify(levelProgress),
    studentId
  ]);

  const row = await db.get(`
    SELECT total_score, completed_levels, max_streak, level_progress, updated_at
    FROM progress
    WHERE student_id = ?
  `, [studentId]);

  res.json(progressResponse(row));
}));

app.post('/api/results', asyncHandler(async (req, res) => {
  const studentId = toInt(req.body?.studentId);
  const levelId = toInt(req.body?.levelId);

  if (!studentId || !levelId) {
    return res.status(400).json({ error: 'studentId and levelId are required.' });
  }

  await ensureProgressRow(studentId);
  const result = await db.run(`
    INSERT INTO level_results (
      student_id, level_id, score, accuracy, stars, max_streak,
      total_questions, correct_answers, answers
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    studentId,
    levelId,
    toInt(req.body?.score),
    toNumber(req.body?.accuracy),
    toInt(req.body?.stars),
    toInt(req.body?.maxStreak),
    toInt(req.body?.totalQuestions),
    toInt(req.body?.correctAnswers),
    JSON.stringify(Array.isArray(req.body?.answers) ? req.body.answers : [])
  ]);

  res.status(201).json({ id: result.lastInsertRowid });
}));

app.get('/api/documents', asyncHandler(async (req, res) => {
  const reformId = cleanText(req.query.reformId);
  const rows = reformId
    ? await db.all(`
        SELECT * FROM documents
        WHERE reform_id = ?
        ORDER BY sort_order ASC, created_at ASC
      `, [reformId])
    : await db.all(`
        SELECT * FROM documents
        ORDER BY sort_order ASC, created_at ASC
      `);

  res.json({ documents: rows.map(documentRowToApi) });
}));

app.post('/api/teacher/documents', requireTeacher, asyncHandler(async (req, res) => {
  const doc = normalizeDocumentPayload(req.body);
  const error = validateDocument(doc);

  if (error) {
    return res.status(400).json({ error });
  }

  await db.run(`
    INSERT INTO documents (
      id, reform, reform_id, title, image, images, original_text, annotation, sort_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    doc.id,
    doc.reform,
    doc.reformId,
    doc.title,
    doc.image,
    JSON.stringify(doc.images),
    doc.originalText,
    doc.annotation,
    doc.sortOrder
  ]);

  const row = await db.get('SELECT * FROM documents WHERE id = ?', [doc.id]);
  res.status(201).json({ document: documentRowToApi(row) });
}));

app.put('/api/teacher/documents/:id', requireTeacher, asyncHandler(async (req, res) => {
  const id = cleanText(req.params.id);
  const existing = await db.get('SELECT id FROM documents WHERE id = ?', [id]);

  if (!existing) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const doc = normalizeDocumentPayload({ ...req.body, id });
  const error = validateDocument(doc);

  if (error) {
    return res.status(400).json({ error });
  }

  await db.run(`
    UPDATE documents
    SET reform = ?,
        reform_id = ?,
        title = ?,
        image = ?,
        images = ?,
        original_text = ?,
        annotation = ?,
        sort_order = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `, [
    doc.reform,
    doc.reformId,
    doc.title,
    doc.image,
    JSON.stringify(doc.images),
    doc.originalText,
    doc.annotation,
    doc.sortOrder,
    id
  ]);

  const row = await db.get('SELECT * FROM documents WHERE id = ?', [id]);
  res.json({ document: documentRowToApi(row) });
}));

app.delete('/api/teacher/documents/:id', requireTeacher, asyncHandler(async (req, res) => {
  const id = cleanText(req.params.id);
  const result = await db.run('DELETE FROM documents WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  res.json({ ok: true });
}));

app.get('/api/teacher/summary', requireTeacher, asyncHandler(async (req, res) => {
  const rows = await db.all(`
    SELECT
      s.id,
      s.name,
      s.class_name AS className,
      s.created_at AS createdAt,
      s.last_login_at AS lastLoginAt,
      s.login_count AS loginCount,
      COALESCE(p.total_score, 0) AS totalScore,
      COALESCE(p.completed_levels, 0) AS completedLevels,
      COALESCE(p.max_streak, 0) AS maxStreak,
      COALESCE(p.level_progress, '{}') AS levelProgress,
      COALESCE(p.updated_at, s.updated_at) AS updatedAt,
      COUNT(r.id) AS attempts,
      MAX(r.completed_at) AS lastCompletedAt
    FROM students s
    LEFT JOIN progress p ON p.student_id = s.id
    LEFT JOIN level_results r ON r.student_id = s.id
    GROUP BY s.id
    ORDER BY totalScore DESC, completedLevels DESC, maxStreak DESC, s.created_at ASC
  `);

  res.json({
    students: rows.map(row => ({
      id: row.id,
      name: row.name,
      className: row.className,
      totalScore: row.totalScore,
      completedLevels: row.completedLevels,
      maxStreak: row.maxStreak,
      levelProgress: parseJson(row.levelProgress, {}),
      attempts: row.attempts,
      createdAt: row.createdAt,
      lastLoginAt: row.lastLoginAt,
      loginCount: row.loginCount,
      updatedAt: row.updatedAt,
      lastCompletedAt: row.lastCompletedAt
    }))
  });
}));

app.get('/api/teacher/results', requireTeacher, asyncHandler(async (req, res) => {
  const studentId = toInt(req.query.studentId);
  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required.' });
  }

  const student = await db.get(`
    SELECT id, name, class_name AS className
    FROM students
    WHERE id = ?
  `, [studentId]);

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const results = (await db.all(`
    SELECT id, level_id AS levelId, score, accuracy, stars, max_streak AS maxStreak,
           total_questions AS totalQuestions, correct_answers AS correctAnswers,
           answers, completed_at AS completedAt
    FROM level_results
    WHERE student_id = ?
    ORDER BY completed_at DESC, id DESC
  `, [studentId])).map(row => ({
    ...row,
    answers: parseJson(row.answers, [])
  }));

  res.json({ student, results });
}));

app.get('/api/teacher/wrong-questions', requireTeacher, asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(toInt(req.query.limit, 10), 1), 50);
  const levels = loadGameLevels();
  const questionsByKey = new Map();

  levels.forEach(level => {
    (level.questions || []).forEach((question, index) => {
      questionsByKey.set(`${level.id}:${index}`, {
        levelId: level.id,
        levelName: level.name,
        questionIndex: index,
        questionNo: index + 1,
        type: question.type || '',
        question: question.question || ''
      });
    });
  });

  const stats = new Map();
  const rows = await db.all(`
    SELECT level_id AS levelId, answers
    FROM level_results
  `);

  rows.forEach(row => {
    const answers = parseJson(row.answers, []);
    if (!Array.isArray(answers)) return;

    answers.forEach(answer => {
      const questionIndex = toInt(answer?.questionIndex, -1);
      if (questionIndex < 0) return;

      const key = `${row.levelId}:${questionIndex}`;
      const meta = questionsByKey.get(key) || {
        levelId: row.levelId,
        levelName: `第${row.levelId}关`,
        questionIndex,
        questionNo: questionIndex + 1,
        type: '',
        question: `第${questionIndex + 1}题`
      };

      if (!stats.has(key)) {
        stats.set(key, {
          ...meta,
          wrongCount: 0,
          attemptCount: 0
        });
      }

      const item = stats.get(key);
      item.attemptCount += 1;
      if (answer?.correct === false) {
        item.wrongCount += 1;
      }
    });
  });

  const questions = Array.from(stats.values())
    .filter(item => item.wrongCount > 0)
    .map(item => ({
      ...item,
      wrongRate: item.attemptCount ? Number((item.wrongCount / item.attemptCount).toFixed(4)) : 0
    }))
    .sort((a, b) => (
      b.wrongCount - a.wrongCount ||
      b.wrongRate - a.wrongRate ||
      a.levelId - b.levelId ||
      a.questionIndex - b.questionIndex
    ))
    .slice(0, limit);

  res.json({ questions });
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index - 副本.html'));
});

app.use(express.static(rootDir));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`History game server running at http://localhost:${PORT}`);
    console.log(`Teacher dashboard: http://localhost:${PORT}/teacher.html`);
    console.log(`SQLite database: ${dbPath}`);
  });
}

module.exports = app;
