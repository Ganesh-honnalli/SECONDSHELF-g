import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Simple .env and .env.local parser helper
function loadEnv() {
  const env = {};
  for (const file of ['.env', '.env.local']) {
    const envPath = path.join(__dirname, file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          env[key] = val;
          process.env[key] = val;
        }
      }
    }
  }
  return env;
}

loadEnv();

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function getAdminClient() {
  const env = loadEnv();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://taujwlvvuxbsfqiemhgv.supabase.co';
  if (!serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

const server = http.createServer((req, res) => {
  // Normalize URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = parsedUrl.pathname;

  // API endpoint for Supabase client configuration
  if (reqPath === '/api/config') {
    const env = loadEnv();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      supabaseUrl: env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
      appUrl: env.VITE_APP_URL || `http://localhost:${PORT}`
    }));
    return;
  }

  // API endpoint: Register Book Stall Owner with Auto Email Confirmation
  if (reqPath === '/api/register-stall' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { ownerName, stallName, email, phone, address, stateVal, district, city, licence, password } = data;
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        let userId;
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: ownerName, phone, role: 'seller' }
        });

        if (createErr && createErr.message.includes('already registered')) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const found = users.users.find(u => u.email === email);
          if (found) {
            userId = found.id;
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              password,
              email_confirm: true,
              user_metadata: { full_name: ownerName, phone, role: 'seller' }
            });
          } else {
            throw createErr;
          }
        } else if (createErr) {
          throw createErr;
        } else {
          userId = newUser.user.id;
        }

        const formattedAddress = `${address} | City: ${city} | District: ${district} | State: ${stateVal || 'Karnataka'}`;

        await supabaseAdmin.from('book_stalls').upsert([{
          user_id: userId,
          stall_name: stallName,
          owner_name: ownerName,
          phone: phone,
          licence_number: licence || 'Pending',
          address: formattedAddress,
          pincode: '580020',
          approval_status: 'pending'
        }]);

        await supabaseAdmin.from('profiles').upsert([{
          id: userId,
          full_name: ownerName,
          phone: phone,
          email: email,
          age_confirmed: true,
          is_verified: true
        }]);

        const { data: existingRoles } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', userId);
        if (existingRoles && existingRoles.length > 0) {
          await supabaseAdmin.from('user_roles').update({ role: 'seller', is_approved: false }).eq('id', existingRoles[0].id);
        } else {
          await supabaseAdmin.from('user_roles').insert([{ user_id: userId, role: 'seller', is_approved: false }]);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          message: 'Your Book Stall registration has been submitted. Waiting for Admin approval.'
        }));
      } catch (err) {
        console.error('Error in /api/register-stall:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Register Scrap Business Owner with Auto Email Confirmation
  if (reqPath === '/api/register-scrap' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { ownerName, bizName, email, phone, address, stateVal, district, city, licence, password } = data;
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        let userId;
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: ownerName, phone, role: 'seller' }
        });

        if (createErr && createErr.message.includes('already registered')) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const found = users.users.find(u => u.email === email);
          if (found) {
            userId = found.id;
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              password,
              email_confirm: true,
              user_metadata: { full_name: ownerName, phone, role: 'seller' }
            });
          } else {
            throw createErr;
          }
        } else if (createErr) {
          throw createErr;
        } else {
          userId = newUser.user.id;
        }

        const formattedAddress = `${address} | City: ${city} | District: ${district} | State: ${stateVal || 'Karnataka'}`;

        await supabaseAdmin.from('scrap_owners').upsert([{
          user_id: userId,
          business_name: bizName,
          owner_name: ownerName,
          phone: phone,
          licence_number: licence || 'Pending',
          address: formattedAddress,
          base_area: city,
          pincode: '580020',
          approval_status: 'pending'
        }]);

        await supabaseAdmin.from('profiles').upsert([{
          id: userId,
          full_name: ownerName,
          phone: phone,
          email: email,
          age_confirmed: true,
          is_verified: true
        }]);

        const { data: existingRoles } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', userId);
        if (existingRoles && existingRoles.length > 0) {
          await supabaseAdmin.from('user_roles').update({ role: 'seller', is_approved: false }).eq('id', existingRoles[0].id);
        } else {
          await supabaseAdmin.from('user_roles').insert([{ user_id: userId, role: 'seller', is_approved: false }]);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          message: 'Your Scrap Business registration has been submitted. Waiting for Admin approval.'
        }));
      } catch (err) {
        console.error('Error in /api/register-scrap:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Register Normal User with Auto Email Confirmation
  if (reqPath === '/api/register-user' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { name, email, phone, password } = data;
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: name, phone, role: 'seller' }
        });

        if (createErr) throw createErr;

        await supabaseAdmin.from('profiles').upsert([{
          id: newUser.user.id,
          full_name: name,
          phone: phone,
          email: email,
          age_confirmed: true,
          is_verified: true
        }]);

        await supabaseAdmin.from('user_roles').insert([{
          user_id: newUser.user.id,
          role: 'seller',
          is_approved: true
        }]);

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          message: 'User account created successfully! You can now sign in.'
        }));
      } catch (err) {
        console.error('Error in /api/register-user:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Approve Business (Book Stall or Scrap Depot)
  if (reqPath === '/api/approve-business' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { type, id, userId } = JSON.parse(body);
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin client.' }));
          return;
        }

        if (type === 'stall') {
          await supabaseAdmin.from('book_stalls').update({ approval_status: 'approved' }).eq('id', id);
          if (userId) {
            const { data: existingRoles } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', userId);
            if (existingRoles && existingRoles.length > 0) {
              await supabaseAdmin.from('user_roles').update({ role: 'book_stall', is_approved: true }).eq('id', existingRoles[0].id);
            } else {
              await supabaseAdmin.from('user_roles').insert([{ user_id: userId, role: 'book_stall', is_approved: true }]);
            }
          }
        } else {
          await supabaseAdmin.from('scrap_owners').update({ approval_status: 'approved' }).eq('id', id);
          if (userId) {
            const { data: existingRoles } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', userId);
            if (existingRoles && existingRoles.length > 0) {
              await supabaseAdmin.from('user_roles').update({ role: 'raddi_owner', is_approved: true }).eq('id', existingRoles[0].id);
            } else {
              await supabaseAdmin.from('user_roles').insert([{ user_id: userId, role: 'raddi_owner', is_approved: true }]);
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'Business successfully approved.' }));
      } catch (err) {
        console.error('Error in /api/approve-business:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Reject Business
  if (reqPath === '/api/reject-business' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { type, id, userId } = JSON.parse(body);
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin client.' }));
          return;
        }

        if (type === 'stall') {
          await supabaseAdmin.from('book_stalls').update({ approval_status: 'rejected' }).eq('id', id);
          if (userId) {
            await supabaseAdmin.from('user_roles').update({ role: 'seller', is_approved: false }).eq('user_id', userId);
          }
        } else {
          await supabaseAdmin.from('scrap_owners').update({ approval_status: 'rejected' }).eq('id', id);
          if (userId) {
            await supabaseAdmin.from('user_roles').update({ role: 'seller', is_approved: false }).eq('user_id', userId);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'Business application rejected.' }));
      } catch (err) {
        console.error('Error in /api/reject-business:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const fallbackPath = path.join(__dirname, 'index.html');
      fs.readFile(fallbackPath, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SECOND SHELF server is running at http://localhost:${PORT}`);
  console.log(`Open in your browser: file://${path.join(__dirname, 'index.html').replace(/\\/g, '/')}`);
});
