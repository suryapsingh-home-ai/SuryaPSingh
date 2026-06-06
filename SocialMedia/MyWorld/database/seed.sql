-- Sample data for testing
-- All users have password: password123

INSERT INTO users (username, email, password, bio) VALUES
('john_doe', 'john@example.com', '$2a$10$CcHkgjVZXVJyPoG6QI1.OuYXb3aQxxP2eP8IW1xq936vA38usLzdW', 'Love coding and social media'),
('jane_smith', 'jane@example.com', '$2a$10$CcHkgjVZXVJyPoG6QI1.OuYXb3aQxxP2eP8IW1xq936vA38usLzdW', 'Designer and creative thinker'),
('bob_wilson', 'bob@example.com', '$2a$10$CcHkgjVZXVJyPoG6QI1.OuYXb3aQxxP2eP8IW1xq936vA38usLzdW', 'Software developer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO posts (user_id, content) VALUES
(1, 'Just launched MyWorld! Excited to build a social media app'),
(2, 'Beautiful day for coding'),
(3, 'React, GraphQL, and Node.js are amazing technologies');

INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, 'This looks amazing! Great work!'),
(1, 3, 'Count me in!'),
(2, 1, 'Love the energy!');

INSERT INTO likes (post_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(3, 1),
(3, 2);

INSERT INTO friendships (user_id_1, user_id_2, requested_by, status) VALUES
(1, 2, 1, 'accepted'),
(1, 3, 1, 'accepted'),
(2, 3, 2, 'pending');
