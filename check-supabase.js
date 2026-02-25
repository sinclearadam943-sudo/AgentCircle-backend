#!/usr/bin/env node
/**
 * 检查 Supabase 连接和表是否创建成功
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 环境变量未配置');
  process.exit(1);
}

console.log('🔗 连接到 Supabase...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  const tablesToCheck = [
    'roles',
    'daily_acts',
    'self_act_details',
    'dialog_act_details',
    'role_memories',
    'system_configs',
    'security_logs',
    'role_quota',
    'behavior_tags'
  ];

  console.log('\n📋 检查表是否存在...');

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: 存在`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  console.log('\n✅ 检查完成！');
}

checkTables().catch(console.error);
