-- Supabase 数据库 Schema
-- AgentCircle 项目数据库迁移

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 角色基础信息表
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  role_camp VARCHAR(30) NOT NULL,
  role_identity VARCHAR(100) NOT NULL,
  role_personality TEXT NOT NULL,
  role_feature TEXT,
  role_avatar VARCHAR(255),
  llm_model VARCHAR(50) DEFAULT 'qwen3:0.6b',
  daily_act_limit INTEGER DEFAULT 3,
  is_historical BOOLEAN DEFAULT false,
  status VARCHAR(10) DEFAULT 'alive',
  status_change_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_value DECIMAL(10, 2) DEFAULT 0.00,
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色每日行为记录表
CREATE TABLE IF NOT EXISTS daily_acts (
  act_id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  act_date DATE NOT NULL DEFAULT CURRENT_DATE,
  act_type VARCHAR(20) NOT NULL,
  target_role_id INTEGER REFERENCES roles(role_id) ON DELETE SET NULL,
  act_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  act_status VARCHAR(10) DEFAULT 'completed',
  act_tag VARCHAR(10) NOT NULL,
  output_type VARCHAR(30) NOT NULL,
  security_check_result VARCHAR(20) DEFAULT 'passed',
  output_rating DECIMAL(2, 1) DEFAULT 0.0
);

-- 自主行为详情表
CREATE TABLE IF NOT EXISTS self_act_details (
  self_act_id SERIAL PRIMARY KEY,
  act_id INTEGER NOT NULL UNIQUE REFERENCES daily_acts(act_id) ON DELETE CASCADE,
  self_act_content TEXT NOT NULL,
  output_content TEXT NOT NULL,
  llm_model VARCHAR(50) DEFAULT 'qwen3:0.6b',
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 交互对话详情表
CREATE TABLE IF NOT EXISTS dialog_act_details (
  dialog_id SERIAL PRIMARY KEY,
  act_id INTEGER NOT NULL REFERENCES daily_acts(act_id) ON DELETE CASCADE,
  dialog_round INTEGER NOT NULL,
  speaker_role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  listener_role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  dialog_content TEXT NOT NULL,
  llm_model VARCHAR(50) DEFAULT 'qwen3:0.6b',
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色记忆表
CREATE TABLE IF NOT EXISTS role_memories (
  memory_id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  act_id INTEGER NOT NULL REFERENCES daily_acts(act_id) ON DELETE CASCADE,
  memory_type VARCHAR(20) NOT NULL,
  memory_content TEXT NOT NULL,
  reward_memory TEXT,
  rating_memory TEXT,
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expire_time TIMESTAMP WITH TIME ZONE
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
  config_id SERIAL PRIMARY KEY,
  config_key VARCHAR(50) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  config_desc TEXT,
  stage VARCHAR(20) DEFAULT 'stage1',
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 安全审计日志表
CREATE TABLE IF NOT EXISTS security_logs (
  log_id SERIAL PRIMARY KEY,
  log_type VARCHAR(30) NOT NULL,
  related_id INTEGER,
  log_content TEXT NOT NULL,
  log_result VARCHAR(20) NOT NULL,
  log_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  operator VARCHAR(50) DEFAULT 'system'
);

-- 角色额度表
CREATE TABLE IF NOT EXISTS role_quota (
  quota_id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL UNIQUE REFERENCES roles(role_id) ON DELETE CASCADE,
  total_quota INTEGER DEFAULT 10000,
  used_quota INTEGER DEFAULT 0,
  remaining_quota INTEGER DEFAULT 10000,
  update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 行为标签表
CREATE TABLE IF NOT EXISTS behavior_tags (
  tag_id SERIAL PRIMARY KEY,
  tag_name VARCHAR(50) NOT NULL UNIQUE,
  tag_category VARCHAR(30) NOT NULL,
  tag_type VARCHAR(20) DEFAULT 'self_act',
  use_count INTEGER DEFAULT 0,
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_acts_role_id ON daily_acts(role_id);
CREATE INDEX IF NOT EXISTS idx_daily_acts_act_date ON daily_acts(act_date);
CREATE INDEX IF NOT EXISTS idx_role_memories_role_id ON role_memories(role_id);
CREATE INDEX IF NOT EXISTS idx_self_act_details_act_id ON self_act_details(act_id);
CREATE INDEX IF NOT EXISTS idx_dialog_act_details_act_id ON dialog_act_details(act_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_act_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialog_act_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_tags ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（允许所有操作，可根据需要限制）
CREATE POLICY "Enable all access for authenticated users" ON roles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON daily_acts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON self_act_details
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON dialog_act_details
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON role_memories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON system_configs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON security_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON role_quota
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON behavior_tags
  FOR ALL USING (auth.role() = 'authenticated');
