CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(100) NOT NULL
)

CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content VARCHAR(10000) NOT NULL,
  type VARCHAR(500) NOT NULL,
  image BYTEA NOT NULL,
  date_and_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id)
);

CREATE TABLE favorite (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  blog_id INTEGER REFERENCES blogs(id)	
);

SELECT
    blogs.id AS blogId,
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

-- Alter the "favorite" table to add cascading deletion
ALTER TABLE favorite
DROP CONSTRAINT IF EXISTS favorite_blog_id_fkey,
ADD CONSTRAINT favorite_blog_id_fkey
FOREIGN KEY (blog_id)
REFERENCES blogs(id)
ON DELETE CASCADE;




