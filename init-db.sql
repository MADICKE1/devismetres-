-- ================================================
-- DEVIS-IA Pro - Database Initialization Script
-- ================================================

-- ================================================
-- TABLES
-- ================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(20),
    plan VARCHAR(50) NOT NULL DEFAULT 'starter',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    surface DECIMAL(10,2) NOT NULL,
    floors INTEGER,
    region VARCHAR(255),
    difficulty VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Devis Table
CREATE TABLE IF NOT EXISTS devis (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    devis_number VARCHAR(50) UNIQUE NOT NULL,
    gros_oeuvre DECIMAL(15,2) NOT NULL,
    second_oeuvre DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    details JSONB,
    pdf_url VARCHAR(500),
    excel_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exported_at TIMESTAMP
);

-- Uploads Table
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(10),
    name VARCHAR(255),
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Pricing Plans Table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    devis_limit INTEGER,
    storage_limit BIGINT,
    api_calls_limit INTEGER,
    features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES pricing_plans(id),
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    next_billing_date TIMESTAMP
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_devis_project_id ON devis(project_id);
CREATE INDEX idx_devis_created_at ON devis(created_at);
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_project_id ON uploads(project_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ================================================
-- SAMPLE DATA
-- ================================================

-- Insert pricing plans
INSERT INTO pricing_plans (name, price_monthly, price_yearly, devis_limit, storage_limit, api_calls_limit, features) VALUES
('starter', 29.00, 290.00, 5, 1073741824, 10, '{"exports": ["pdf"], "support": "email"}'::jsonb),
('pro', 99.00, 990.00, 50, 10737418240, 500, '{"exports": ["pdf", "excel", "json"], "support": "prioritaire", "api": true}'::jsonb),
('enterprise', NULL, NULL, NULL, NULL, NULL, '{"exports": ["pdf", "excel", "json", "xml"], "support": "24/7", "api": true, "custom": true}'::jsonb);

-- Insert test user (optionnel)
INSERT INTO users (email, password_hash, full_name, company_name, plan) VALUES
('test@devis-ia.pro', '$2b$10$YJH.EnuaT8YWKCp.dRkZqeJrMKl.TZPMhZKDxNYGZ0tpM9nXBEJ0S', 'Test User', 'Test Company', 'pro');

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devis_updated_at BEFORE UPDATE ON devis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer les numéros de devis
CREATE OR REPLACE FUNCTION generate_devis_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.devis_number IS NULL THEN
        NEW.devis_number := 'DEV-' || TO_CHAR(NEW.created_at, 'YYYY') || '-' || 
                           LPAD(NEXTVAL('devis_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de devis
CREATE SEQUENCE IF NOT EXISTS devis_seq START 1;

-- Trigger pour les numéros de devis
CREATE TRIGGER set_devis_number BEFORE INSERT ON devis
    FOR EACH ROW EXECUTE FUNCTION generate_devis_number();

-- ================================================
-- VIEWS
-- ================================================

-- Vue : Résumé des projets par utilisateur
CREATE OR REPLACE VIEW user_project_summary AS
SELECT 
    u.id,
    u.email,
    u.company_name,
    COUNT(p.id) as total_projects,
    COUNT(d.id) as total_devis,
    SUM(d.total) as total_value,
    AVG(p.surface) as avg_surface,
    MAX(p.created_at) as last_project_date
FROM users u
LEFT JOIN projects p ON u.id = p.user_id AND p.deleted_at IS NULL
LEFT JOIN devis d ON p.id = d.project_id
GROUP BY u.id, u.email, u.company_name;

-- Vue : Devis par région
CREATE OR REPLACE VIEW devis_by_region AS
SELECT 
    p.region,
    COUNT(d.id) as devis_count,
    SUM(d.total) as total_value,
    AVG(d.total) as avg_value,
    MIN(d.total) as min_value,
    MAX(d.total) as max_value
FROM projects p
LEFT JOIN devis d ON p.id = d.project_id
WHERE p.region IS NOT NULL
GROUP BY p.region;

-- ================================================
-- PERMISSIONS
-- ================================================

-- Créer un utilisateur PostgreSQL pour l'application
-- (À adapter selon votre configuration)
-- COMMENT OUT si l'utilisateur existe déjà
-- CREATE USER devis_user WITH PASSWORD 'secure_password_123';
-- GRANT CONNECT ON DATABASE devis_ia TO devis_user;
-- GRANT USAGE ON SCHEMA public TO devis_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO devis_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO devis_user;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE users IS 'Utilisateurs de la plateforme';
COMMENT ON TABLE projects IS 'Projets de construction';
COMMENT ON TABLE devis IS 'Devis générés pour les projets';
COMMENT ON TABLE uploads IS 'Fichiers uploadés (plans, etc.)';
COMMENT ON TABLE api_keys IS 'Clés API des utilisateurs';
COMMENT ON TABLE pricing_plans IS 'Plans de tarification disponibles';
COMMENT ON TABLE subscriptions IS 'Souscriptions des utilisateurs';
COMMENT ON TABLE audit_logs IS 'Logs d''audit des actions';

-- ================================================
-- VERIFICATIONS
-- ================================================

-- Afficher les tables créées
\dt

-- Afficher les séquences
\ds

-- Afficher les vues
\dv

-- ================================================
-- FIN DU SCRIPT
-- ================================================

COMMIT;
