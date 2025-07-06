-- Visualization Studio Suggestions Database Schema
-- SQLite database for storing user suggestions and community feedback

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Suggestions table - main table for storing visualization suggestions
CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    last_modified DATETIME NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('pending', 'approved', 'implemented', 'rejected')) DEFAULT 'pending',
    category TEXT NOT NULL,
    complexity TEXT CHECK(complexity IN ('low', 'medium', 'high')) NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
    estimated_dev_time REAL DEFAULT 0,
    version TEXT DEFAULT '1.0.0',
    created_by TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0
);

-- Tags table for storing suggestion tags
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Suggestion tags junction table
CREATE TABLE IF NOT EXISTS suggestion_tags (
    suggestion_id TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (suggestion_id, tag_id),
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Comments table for suggestion comments
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    suggestion_id TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE
);

-- Implementation details table for storing visualization configuration
CREATE TABLE IF NOT EXISTS implementations (
    suggestion_id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('grid-field', 'flow-field', 'turbulence', 'circular-field', 'topography', 'custom')) NOT NULL,
    base_settings TEXT, -- JSON string
    animation_settings TEXT, -- JSON string
    custom_parameters TEXT, -- JSON string
    renderer_config TEXT, -- JSON string
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE
);

-- Dependencies table for storing suggestion dependencies
CREATE TABLE IF NOT EXISTS dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_id TEXT NOT NULL,
    dependency_name TEXT NOT NULL,
    dependency_version TEXT,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE
);

-- User interactions table for tracking votes and favorites
CREATE TABLE IF NOT EXISTS user_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    interaction_type TEXT CHECK(interaction_type IN ('upvote', 'downvote', 'favorite', 'view')) NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    UNIQUE(suggestion_id, user_id, interaction_type)
);

-- Statistics table for caching computed statistics
CREATE TABLE IF NOT EXISTS statistics (
    id TEXT PRIMARY KEY,
    total_suggestions INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    approved_count INTEGER DEFAULT 0,
    implemented_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    last_updated DATETIME NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);
CREATE INDEX IF NOT EXISTS idx_suggestions_complexity ON suggestions(complexity);
CREATE INDEX IF NOT EXISTS idx_suggestions_timestamp ON suggestions(timestamp);
CREATE INDEX IF NOT EXISTS idx_suggestions_author ON suggestions(author);
CREATE INDEX IF NOT EXISTS idx_suggestions_score ON suggestions(upvotes - downvotes DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_views ON suggestions(views DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_favorites ON suggestions(favorites DESC);

CREATE INDEX IF NOT EXISTS idx_comments_suggestion_id ON comments(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp);

CREATE INDEX IF NOT EXISTS idx_suggestion_tags_suggestion_id ON suggestion_tags(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_tags_tag_id ON suggestion_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_suggestion_id ON user_interactions(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);

-- Insert default statistics record
INSERT OR IGNORE INTO statistics (id, last_updated) VALUES ('main', datetime('now'));

-- Create views for common queries
CREATE VIEW IF NOT EXISTS suggestion_stats AS
SELECT 
    s.id,
    s.title,
    s.author,
    s.status,
    s.category,
    s.complexity,
    s.difficulty,
    s.upvotes,
    s.downvotes,
    (s.upvotes - s.downvotes) as score,
    s.views,
    s.favorites,
    s.timestamp,
    s.last_modified,
    COUNT(DISTINCT c.id) as comment_count,
    GROUP_CONCAT(DISTINCT t.name) as tags
FROM suggestions s
LEFT JOIN comments c ON s.id = c.suggestion_id
LEFT JOIN suggestion_tags st ON s.id = st.suggestion_id
LEFT JOIN tags t ON st.tag_id = t.id
GROUP BY s.id;

-- Create view for top rated suggestions
CREATE VIEW IF NOT EXISTS top_rated_suggestions AS
SELECT * FROM suggestion_stats 
WHERE status != 'rejected'
ORDER BY score DESC, upvotes DESC;

-- Create view for most viewed suggestions
CREATE VIEW IF NOT EXISTS most_viewed_suggestions AS
SELECT * FROM suggestion_stats 
WHERE status != 'rejected'
ORDER BY views DESC;

-- Create view for recently added suggestions
CREATE VIEW IF NOT EXISTS recent_suggestions AS
SELECT * FROM suggestion_stats 
WHERE status != 'rejected'
ORDER BY timestamp DESC; 