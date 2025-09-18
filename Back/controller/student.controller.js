const pool = require("../config/db");

// Validate inputs
function validateStudentInput({ name, email, phone, mark }) {
  if (!name || !email) return "Name and email are required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";

  if (phone && !/^\d{10}$/.test(phone)) return "Invalid phone number";

  if (mark !== undefined && (isNaN(mark) || mark < 0 || mark > 100))
    return "Invalid mark (must be between 0 and 100)";

  return null;
}

// Create new student
exports.createStudent = async (req, res) => {
  const { name, email, phone, mark } = req.body;

  const validationError = validateStudentInput({ name, email, phone, mark });
  if (validationError)
    return res.status(400).json({ status: false, message: validationError });

  try {

    const result = await pool.query(
      "INSERT INTO students (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone]
    );

    const student = result.rows[0];

    if (mark !== undefined) {
      await pool.query(
        "INSERT INTO marks (student_id, mark) VALUES ($1, $2)",
        [student.id, mark]
      );
    }

    res.status(201).json({
      status: true,
      message: "Student created",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Get paginated list of students
exports.getAllStudents = async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  try {
   
    const data = await pool.query(
      `SELECT s.id, s.name, s.email, s.phone,
              COALESCE(JSON_AGG(m) FILTER (WHERE m.id IS NOT NULL), '[]') AS marks
       FROM students s
       LEFT JOIN marks m ON s.id = m.student_id
       GROUP BY s.id
       ORDER BY s.id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const count = await pool.query("SELECT COUNT(*) FROM students");

    res.json({
      status: true,
      message: "Students fetched",
      total: parseInt(count.rows[0].count),
      page,
      limit,
      data: data.rows,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  const id = req.params.id;
  try {
    const student = await pool.query(
      `SELECT s.*, m.mark
       FROM students s
       LEFT JOIN marks m ON s.id = m.student_id
       WHERE s.id = $1
       ORDER BY m.id DESC
       LIMIT 1`,
      [id]
    );

    if (student.rows.length === 0)
      return res.status(404).json({ status: false, message: "Student not found" });

    res.json({
      status: true,
      message: "Student fetched",
      data: student.rows[0],
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// Update student
exports.updateStudent = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, mark } = req.body;

  const validationError = validateStudentInput({ name, email, phone, mark });
  if (validationError)
    return res.status(400).json({ status: false, message: validationError });

  try {
     const result = await pool.query(
      "UPDATE students SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *",
      [name, email, phone, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Student not found" });
    }

    if (mark !== undefined) {
      const markResult = await pool.query(
        "UPDATE marks SET mark = $1 WHERE student_id = $2 RETURNING *",
        [mark, id]
      );

      if (markResult.rows.length === 0) {
        await pool.query(
          "INSERT INTO marks (student_id, mark) VALUES ($1, $2)",
          [id, mark]
        );
      }
    }

    res.json({
      status: true,
      message: "Student updated",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
    res.json({ status: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
