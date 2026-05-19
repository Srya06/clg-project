const http = require('http');

const BASE = 'http://localhost:5000';
const results = [];

function req(method, path, body = null) {
  return new Promise((resolve) => {
    const url = new URL(BASE + path);
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 4000,
    };
    const r = http.request(options, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    r.on('timeout', () => { r.destroy(); resolve('TIMEOUT'); });
    r.on('error', (e) => resolve(e.code === 'ECONNREFUSED' ? 'CONN_REFUSED' : 'ERROR'));
    if (postData) r.write(postData);
    r.end();
  });
}

function label(code) {
  if (code === 'CONN_REFUSED') return '❌ CONNECTION REFUSED';
  if (code === 'TIMEOUT')      return '❌ TIMEOUT';
  if (code === 'ERROR')        return '❌ ERROR';
  if (code >= 200 && code < 500) return `✅ ALIVE (${code})`;
  return `❌ SERVER ERROR (${code})`;
}

async function check(method, path, desc) {
  const code = await req(method, path);
  const status = label(code);
  const alive = typeof code === 'number' && code >= 200 && code < 500;
  results.push({ method, path, desc, code, alive });
  const icon = alive ? '✅' : '❌';
  const codeStr = String(code).padEnd(12);
  console.log(`  ${icon} [${codeStr}] ${method.padEnd(6)} ${path.padEnd(50)} ${desc}`);
}

async function run() {
  console.log('\n' + '='.repeat(80));
  console.log('  BACKEND ENDPOINT VERIFICATION  →  http://localhost:5000');
  console.log('='.repeat(80));

  // ── PUBLIC / HEALTH ──────────────────────────────────────────────────────────
  console.log('\n📌 PUBLIC / HEALTH');
  await check('GET',    '/health',                                    'Root health check');
  await check('GET',    '/api/v1/health',                             'API v1 health check');
  await check('GET',    '/api/docs',                                  'Swagger UI');

  // ── AUTH ─────────────────────────────────────────────────────────────────────
  console.log('\n🔐 AUTH  (400 = validation OK, 401 = auth guard OK)');
  await check('POST',   '/api/v1/auth/register',                      'Register');
  await check('POST',   '/api/v1/auth/login',                         'Login');
  await check('POST',   '/api/v1/auth/refresh',                       'Refresh token');
  await check('POST',   '/api/v1/auth/logout',                        'Logout');
  await check('POST',   '/api/v1/auth/forgot-password',               'Forgot password');
  await check('POST',   '/api/v1/auth/reset-password/dummytoken',     'Reset password');
  await check('PATCH',  '/api/v1/auth/update-password',               'Update password (protected)');

  // ── STUDENT ──────────────────────────────────────────────────────────────────
  console.log('\n🎓 STUDENT  (protected → expect 401)');
  await check('GET',    '/api/v1/student/profile',                    'Get profile');
  await check('PUT',    '/api/v1/student/profile',                    'Update profile');
  await check('POST',   '/api/v1/student/resume',                     'Upload resume');
  await check('GET',    '/api/v1/student/resume/analyze',             'Analyze resume');
  await check('GET',    '/api/v1/student/roadmap',                    'Get roadmap');
  await check('POST',   '/api/v1/student/roadmap/generate',           'Generate roadmap');
  await check('GET',    '/api/v1/student/progress',                   'Get progress');
  await check('PUT',    '/api/v1/student/progress',                   'Update progress');
  await check('GET',    '/api/v1/student/score',                      'Get score');
  await check('GET',    '/api/v1/student/recommendations',            'Recommendations');
  await check('GET',    '/api/v1/student/announcements',              'Student announcements');
  await check('POST',   '/api/v1/student/announcements/abc/respond',  'Respond to announcement');

  // ── HOD ──────────────────────────────────────────────────────────────────────
  console.log('\n🏫 HOD  (protected → expect 401)');
  await check('GET',    '/api/v1/hod/students',                       'List students');
  await check('GET',    '/api/v1/hod/students/dummyid',               'Student detail');
  await check('GET',    '/api/v1/hod/rankings',                       'Rankings');
  await check('GET',    '/api/v1/hod/alerts',                         'Alerts');
  await check('GET',    '/api/v1/hod/analytics',                      'Analytics');
  await check('GET',    '/api/v1/hod/top-performers',                 'Top performers');
  await check('GET',    '/api/v1/hod/low-performers',                 'Low performers');
  await check('POST',   '/api/v1/hod/announcements',                  'Create announcement');
  await check('GET',    '/api/v1/hod/announcements',                  'List announcements');
  await check('DELETE', '/api/v1/hod/announcements/dummyid',          'Delete announcement');

  // ── AI ───────────────────────────────────────────────────────────────────────
  console.log('\n🤖 AI  (protected → expect 401)');
  await check('POST',   '/api/v1/ai/chat',                            'AI chat');
  await check('POST',   '/api/v1/ai/generate-roadmap',                'AI generate roadmap');
  await check('GET',    '/api/v1/ai/recommend',                       'AI recommendations');
  await check('POST',   '/api/v1/ai/analyze-resume',                  'AI analyze resume');

  // ── INTEGRATIONS ─────────────────────────────────────────────────────────────
  console.log('\n🔗 INTEGRATIONS');
  await check('GET',    '/api/v1/integrations/github/callback',       'GitHub OAuth callback (no code)');
  await check('GET',    '/api/v1/integrations/github/connect',        'GitHub connect (protected)');
  await check('GET',    '/api/v1/integrations/status',                'Integration status');
  await check('POST',   '/api/v1/integrations/github/sync',           'GitHub sync');
  await check('POST',   '/api/v1/integrations/leetcode/sync',         'LeetCode sync');
  await check('GET',    '/api/v1/integrations/resources?topic=react', 'Learning resources');

  // ── UPLOAD (NEW) ─────────────────────────────────────────────────────────────
  console.log('\n📤 UPLOAD (Academ OS)');
  await check('POST',   '/api/v1/upload/attendance',                  'Attendance CSV upload');
  await check('POST',   '/api/v1/upload/marks',                       'Marks CSV upload');

  // ── AI MONITOR (NEW) ─────────────────────────────────────────────────────────
  console.log('\n👁️ AI MONITOR');
  await check('GET',    '/api/v1/ai/monitor/dummyid',                 'AI Academic Monitor');


  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
  console.log('\n🔔 NOTIFICATIONS  (protected → expect 401)');
  await check('GET',    '/api/v1/notifications',                      'Get notifications');
  await check('PUT',    '/api/v1/notifications/mark-all',             'Mark all as read');
  await check('PUT',    '/api/v1/notifications/dummyid',              'Mark one as read');

  // ── SUMMARY ──────────────────────────────────────────────────────────────────
  const alive = results.filter(r => r.alive).length;
  const dead  = results.filter(r => !r.alive).length;
  const total = results.length;

  console.log('\n' + '='.repeat(80));
  console.log('  SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Total   : ${total}`);
  console.log(`  ✅ Alive : ${alive}`);
  console.log(`  ❌ Dead  : ${dead}`);

  if (dead > 0) {
    console.log('\n  Failed endpoints:');
    results.filter(r => !r.alive).forEach(r =>
      console.log(`    ❌ ${r.method.padEnd(6)} ${r.path}  →  ${r.code}`)
    );
  }
  console.log('='.repeat(80) + '\n');
}

run();
