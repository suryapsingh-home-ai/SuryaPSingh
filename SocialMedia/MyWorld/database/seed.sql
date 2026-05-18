-- Sample data for testing
-- Insert test users
INSERT INTO users (username, email, password, bio) VALUES
('john_doe', 'john@example.com', '$2a$10$...',  'Love coding and social media'),
('jane_smith', 'jane@example.com', '$2a$10$...', 'Designer and creative thinker'),
('bob_wilson', 'bob@example.com', '$2a$10$...', 'Software developer');

-- Insert sample posts
INSERT INTO posts (user_id, content) VALUES
(1, 'Just launched MyWorld! Excited to build a social media app'),
(2, 'Beautiful day for coding 🌞'),
(3, 'React and Node.js are amazing technologies');

-- Insert sample comments
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, 'This looks amazing! Great work!'),
(1, 3, 'Count me in!'),
(2, 1, 'Love the energy!');

-- Insert sample likes
INSERT INTO likes (post_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(3, 1),
(3, 2);

-- Insert sample friendships
INSERT INTO friendships (user_id_1, user_id_2, status) VALUES
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(2, 3, 'pending');
