CREATE TABLE shop.article_parent_category (
    reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.article_parent_category (reference) VALUES
('TOPS'), 
('BOTTOMS'), 
('OUTERWEAR'), 
('DRESSES'), 
('BAGS'), 
('SHOES'),
('ACCESSORIES'),
('UNDERGARMENTS');