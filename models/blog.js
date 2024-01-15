const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'blog',
  password: 'Quynh2882',
  port: 5432,
});

async function uploadBlog(title, content, type, image, userID) {
  try {
    // Use a library like 'pg-promise' or 'node-postgres' to interact with PostgreSQL
    const result = await pool.query('INSERT INTO blogs (title, content, type, image, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id', [title, content, type, Buffer.from(image.buffer), userID]);

  } catch (error) {
    console.error(error);
  }
}

async function getAllBlogs(userID) {
  try {
    const result = await pool.query('SELECT id, title, content, type, image, date_and_time FROM blogs WHERE user_id = $1 ORDER BY date_and_time DESC', [userID]);   //to display the most recent blogs
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getBlogById(blogId) {
  try {
    const result = await pool.query('SELECT blogs.id AS "id", title, content, type, image, date_and_time, INITCAP(name) AS "author" FROM blogs INNER JOIN users ON blogs.user_id = users.id WHERE blogs.id = $1', [blogId]); 
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function deleteBlog(blogId) {
  try {
    const result = await pool.query('DELETE FROM blogs WHERE id = $1', [blogId]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updateBlog(blog) {
  try {
    const { id, title, content, type, image} = blog;

    const result = await pool.query(
      'UPDATE blogs SET title = $1, content = $2, type = $3, image = $4,  date_and_time = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [title, content, type, Buffer.from(image), id]
    );

    if (result.rowCount === 0) {
      // No blog found with the given ID
      console.info('No blog found with the given ID');
      return null;
    }

    // Return the updated blog
    return result.rows[0];
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

async function getAllBlogsForAllUsersWithFavorite(userId) {
  try {
    const resultFavorite = await pool.query('SELECT blogs.id AS "id", title, content, type, image, date_and_time, INITCAP(name) AS "author", favorite.id AS "favoriteId" FROM blogs INNER JOIN users ON blogs.user_id = users.id LEFT JOIN favorite ON blogs.id = favorite.blog_id AND $1 = favorite.user_id ORDER BY date_and_time DESC', [userId]);
    return resultFavorite.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAllBlogsForAllUsersWithFavoriteType(userId, type) {
  try {
    const resultFavorite = await pool.query('SELECT blogs.id AS "id", title, content, type, image, date_and_time, INITCAP(name) AS "author", favorite.id AS "favoriteId" FROM blogs INNER JOIN users ON blogs.user_id = users.id AND LOWER(blogs.type) = $1 LEFT JOIN favorite ON blogs.id = favorite.blog_id AND $2 = favorite.user_id ORDER BY date_and_time DESC', [type.toLowerCase(), userId]);
    return resultFavorite.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAllBlogsForAllUsersWithSearchAuthor(userId, author) {
  try {
    const resultAuthor = await pool.query('SELECT blogs.id AS "id", title, content, type, image, date_and_time, INITCAP(name) AS "author", favorite.id AS "favoriteId" FROM blogs INNER JOIN users ON blogs.user_id = users.id LEFT JOIN favorite ON blogs.id = favorite.blog_id AND $2 = favorite.user_id WHERE LOWER(users.name) = $1 ORDER BY date_and_time DESC', [author.toLowerCase(), userId]);
    return resultAuthor.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getBlogsWithHighestFavorite() {
  try {
    const result = await pool.query(`
      SELECT
        blogs.id AS "id",
        title,
        content,
        type,
        image,
        date_and_time,
        INITCAP(users.name) AS author,
        COUNT(favorite.id) AS favoriteCount
      FROM blogs
      JOIN users ON blogs.user_id = users.id
      JOIN favorite ON blogs.id = favorite.blog_id
      GROUP BY
        blogs.id,
        title,
        content,
        type,
        image,
        date_and_time,
        users.name
      ORDER BY favoriteCount DESC, date_and_time DESC
      LIMIT 3
    `);

    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function addFavorite(userId, blogId) {
  try {
    const result = await pool.query('INSERT INTO favorite (user_id, blog_id) VALUES ($1, $2) RETURNING id', [userId, blogId]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function isFavorited(userId, blogId) {
  try {
    const result = await pool.query('SELECT * FROM favorite WHERE user_id = $1 AND blog_id = $2', [userId, blogId]);
    return result.rows.length !== 0;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function removeFavorite(userId, blogId) {
  try {
    const result = await pool.query('DELETE FROM favorite WHERE user_id = $1 AND blog_id = $2', [userId, blogId]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}


module.exports = {
  uploadBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  updateBlog,
  addFavorite,
  isFavorited,
  removeFavorite,
  getAllBlogsForAllUsersWithFavorite,
  getAllBlogsForAllUsersWithFavoriteType,
  getAllBlogsForAllUsersWithSearchAuthor,
  getBlogsWithHighestFavorite,
};
