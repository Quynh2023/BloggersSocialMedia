const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'blog',
  password: 'Quynh2882',
  port: 5432,
});

const createUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword]);
    return result.rows[0];
  } catch (error) {
    // Handle database query error
    console.error('Error creating user:', error.message);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    // Handle database query error
    console.error('Error finding user by email:', error.message);
    throw error;
  }
};

const findUserById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    // Handle database query error
    console.error('Error finding user by ID:', error.message);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};


