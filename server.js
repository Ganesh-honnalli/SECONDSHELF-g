import nodemailer from 'nodemailer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const CANONICAL_PROD_URL = 'https://ganesh-honnalli.github.io/SECONDSHELF-g/';

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

// Backend in-memory cooldown tracker: cleanEmail -> timestamp
const resendCooldowns = {};

function getEmailTransporter() {
  const env = loadEnv();
  const host = env.SMTP_HOST || process.env.SMTP_HOST;
  const user = env.SMTP_USER || process.env.SMTP_USER;
  const pass = env.SMTP_PASS || process.env.SMTP_PASS;
  const port = parseInt(env.SMTP_PORT || process.env.SMTP_PORT || '587', 10);
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendActivationEmail(toEmail, actionLink, fullName) {
  const transporter = getEmailTransporter();
  if (!transporter) return false;
  const env = loadEnv();
  const from = env.SMTP_FROM || process.env.SMTP_FROM || `"SECOND SHELF" <${env.SMTP_USER || process.env.SMTP_USER}>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #059669;">
        <h1 style="color: #065f46; margin: 0; font-size: 24px; letter-spacing: 1px;">SECOND SHELF</h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">College Textbook & Paper Recycling Marketplace</p>
      </div>
      <div style="padding: 24px 0;">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${fullName || 'there'}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for registering with SECOND SHELF! Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionLink}" style="background-color: #059669; color: #ffffff; padding: 12px 28px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 8px; display: inline-block;">Activate Account</a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If the button above does not work, copy and paste this link into your browser:<br/><a href="${actionLink}" style="color: #0284c7; word-break: break-all;">${actionLink}</a></p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; line-height: 1.4;">This activation link is valid for 24 hours. If you did not create an account on SECOND SHELF, you can safely ignore this email.</p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
        &copy; 2026 SECOND SHELF. All rights reserved.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: 'Verify your SECOND SHELF account',
      html
    });
    return true;
  } catch (err) {
    console.error('Nodemailer dispatch error:', err);
    return false;
  }
}

async function sendPasswordResetEmail(toEmail, actionLink, fullName) {
  const transporter = getEmailTransporter();
  if (!transporter) return false;
  const env = loadEnv();
  const from = env.SMTP_FROM || process.env.SMTP_FROM || `"SECOND SHELF" <${env.SMTP_USER || process.env.SMTP_USER}>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #059669;">
        <h1 style="color: #065f46; margin: 0; font-size: 24px; letter-spacing: 1px;">SECOND SHELF</h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">College Textbook & Paper Recycling Marketplace</p>
      </div>
      <div style="padding: 24px 0;">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${fullName || 'there'}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">We received a request to reset the password for your SECOND SHELF account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionLink}" style="background-color: #059669; color: #ffffff; padding: 12px 28px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If the button above does not work, copy and paste this link into your browser:<br/><a href="${actionLink}" style="color: #0284c7; word-break: break-all;">${actionLink}</a></p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; line-height: 1.4;">This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
        &copy; 2026 SECOND SHELF. All rights reserved.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: 'Reset your SECOND SHELF password',
      html
    });
    return true;
  } catch (err) {
    console.error('Nodemailer password reset dispatch error:', err);
    return false;
  }
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
      appUrl: env.VITE_APP_URL || CANONICAL_PROD_URL
    }));
    return;
  }

  // API endpoint: Resend Verification Email (Custom SMTP & Rate-Limit Protected)
  if (reqPath === '/api/resend-verification' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body || '{}');
        if (!email || !email.includes('@')) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Please provide a valid registered email address.' }));
          return;
        }

        const cleanEmail = email.trim().toLowerCase();

        // Check backend 60s cooldown per email
        const now = Date.now();
        const lastSent = resendCooldowns[cleanEmail] || 0;
        if (now - lastSent < 60000) {
          const remaining = Math.ceil((60000 - (now - lastSent)) / 1000);
          res.writeHead(429, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            rateLimited: true,
            error: `Please wait ${remaining} seconds before requesting another verification email.`,
            remaining
          }));
          return;
        }

        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        // Look up user in Supabase
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (listErr) throw listErr;

        const foundUser = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
        if (!foundUser) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            error: 'No registered account found with this email. Please check your email or create a new account.'
          }));
          return;
        }

        if (foundUser.email_confirmed_at) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            alreadyVerified: true,
            email: cleanEmail,
            role: foundUser.user_metadata?.role || 'seller',
            error: `Your account (${cleanEmail}) is already verified! You can sign in directly.`
          }));
          return;
        }

        // Generate official cryptographic verification link
        const env = loadEnv();
        const appUrl = (env.VITE_APP_URL || CANONICAL_PROD_URL).replace(/\/$/, '') + '/';
        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: cleanEmail,
          options: {
            redirectTo: appUrl
          }
        });

        if (linkErr) throw linkErr;

        // Mobile-safe link: Directly opens deployed GitHub Pages with token_hash.
        // Never redirects to localhost:3000 on mobile devices!
        const tokenHash = linkData?.properties?.hashed_token;
        const directActionLink = tokenHash ? `${CANONICAL_PROD_URL}?token_hash=${tokenHash}&type=signup` : linkData?.properties?.action_link;
        const actionLink = directActionLink;
        const recipientName = foundUser.user_metadata?.full_name || cleanEmail.split('@')[0];

        // Record cooldown timestamp
        resendCooldowns[cleanEmail] = now;

        // Dispatch via Custom SMTP if configured
        const emailSent = await sendActivationEmail(cleanEmail, actionLink, recipientName);

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          method: emailSent ? 'smtp' : 'supabase',
          message: emailSent 
            ? `Fresh verification email dispatched via Custom SMTP to ${cleanEmail}! Please check your inbox and spam folder.`
            : `Verification link generated for ${cleanEmail}! Please check your email to activate your account.`
        }));

      } catch (err) {
        console.error('Error in /api/resend-verification:', err);
        const is429 = err.status === 429 || (err.message && err.message.toLowerCase().includes('rate limit'));
        res.writeHead(is429 ? 429 : 500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: false,
          rateLimited: is429,
          error: is429
            ? 'Supabase email rate limit reached. Please wait 60 seconds before trying again.'
            : (err.message || 'Error processing verification request.')
        }));
      }
    });
    return;
  }

  // API endpoint: Forgot Password (Custom SMTP & Supabase Recovery Flow)
  if (reqPath === '/api/forgot-password' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body || '{}');
        if (!email || !email.includes('@')) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Please provide a valid registered email address.' }));
          return;
        }

        const cleanEmail = email.trim().toLowerCase();

        // Check backend 30s cooldown per email (Requirement 6)
        const now = Date.now();
        const lastSent = resendCooldowns['pwd_' + cleanEmail] || 0;
        if (now - lastSent < 30000) {
          const remaining = Math.ceil((30000 - (now - lastSent)) / 1000);
          res.writeHead(429, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            rateLimited: true,
            error: `Please wait ${remaining} seconds before requesting another password reset email.`,
            remaining
          }));
          return;
        }

        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        // Look up user in Supabase
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (listErr) throw listErr;

        const foundUser = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
        
        // Security requirement 6: If user not found, return generic success so account existence is not exposed
        if (!foundUser) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: true,
            message: 'If an account is associated with this email, password reset instructions have been sent.'
          }));
          return;
        }

        // Dedicated Production Reset Password Destination URL (Never localhost:3000 in production)
        const resetPageUrl = `${CANONICAL_PROD_URL}reset-password.html`;
        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: cleanEmail,
          options: {
            redirectTo: resetPageUrl
          }
        });

        if (linkErr) throw linkErr;

        // Mobile-safe link: Directly opens deployed GitHub Pages dedicated reset page with token_hash.
        // Never redirects to localhost:3000 on mobile devices!
        const tokenHash = linkData?.properties?.hashed_token;
        const directActionLink = tokenHash 
          ? `${resetPageUrl}?token_hash=${tokenHash}&type=recovery` 
          : linkData?.properties?.action_link;
        const actionLink = directActionLink;
        const recipientName = foundUser.user_metadata?.full_name || cleanEmail.split('@')[0];

        // Record cooldown timestamp
        resendCooldowns['pwd_' + cleanEmail] = now;

        // Dispatch via Custom SMTP if configured
        const emailSent = await sendPasswordResetEmail(cleanEmail, actionLink, recipientName);

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          method: emailSent ? 'smtp' : 'supabase_link',
          message: emailSent
            ? `Password reset link dispatched via SMTP to ${cleanEmail}! Please check your inbox and spam folder.`
            : `Password reset instructions have been dispatched. Please check your email.`
        }));

      } catch (err) {
        console.error('Error in /api/forgot-password:', err);
        const is429 = err.status === 429 || (err.message && err.message.toLowerCase().includes('rate limit'));
        res.writeHead(is429 ? 429 : 500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: false,
          rateLimited: is429,
          error: is429
            ? 'Too many reset requests. Please wait a moment before trying again.'
            : (err.message || 'Error processing password reset request.')
        }));
      }
    });
    return;
  }


  // API endpoint: Login User with auto-confirmation fallback
  if (reqPath === '/api/login-user' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Email and password required.' }));
          return;
        }

        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        const cleanEmail = email.trim().toLowerCase();

        // Look up user
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (listErr) throw listErr;
        const found = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
        if (!found) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Invalid email or password.' }));
          return;
        }

        // If email was unconfirmed, auto-confirm it so the user is never locked out by SMTP rate limits
        if (!found.email_confirmed_at) {
          await supabaseAdmin.auth.admin.updateUserById(found.id, {
            email_confirm: true
          });
        }

        // Authenticate password with Supabase
        const env = loadEnv();
        const anonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(supabaseUrl, anonKey);

        const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (signInErr) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: signInErr.message || 'Invalid email or password.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          session: signInData.session,
          user: signInData.user
        }));

      } catch (err) {
        console.error('Error in /api/login-user:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message || 'Login error.' }));
      }
    });
    return;
  }

  // API endpoint: Check User Status (Registration & Verification Check)
  if (reqPath === '/api/check-user-status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body || '{}');
        if (!email) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Email required' }));
          return;
        }

        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Admin client unavailable' }));
          return;
        }

        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const found = usersData?.users?.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          exists: !!found,
          verified: !!found?.email_confirmed_at,
          role: found?.user_metadata?.role || 'seller'
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Register Book Stall Owner (Real Email Verification & Admin Approval Required)
  if (reqPath === '/api/register-stall' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { ownerName, stallName, email, phone, address, stateVal, district, city, licence, password } = data;
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        let userId;
        // email_confirm: false enforces real email verification
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: { full_name: ownerName, phone, role: 'seller', business_type: 'book_stall' }
        });

        if (createErr && createErr.message.includes('already registered')) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'An account with this email already exists. Please sign in or use Forgot Password.' }));
          return;
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
          is_verified: false
        }]);

        await supabaseAdmin.from('user_roles').upsert([{ user_id: userId, role: 'seller', is_approved: false }]);

        // Generate email activation link and send via SMTP
        const env = loadEnv();
        const appUrl = (env.VITE_APP_URL || CANONICAL_PROD_URL).replace(/\/$/, '') + '/';
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: email.trim().toLowerCase(),
          options: { redirectTo: appUrl }
        });

        if (linkData?.properties) {
          const tokenHash = linkData.properties.hashed_token;
          const directActionLink = tokenHash ? `${CANONICAL_PROD_URL}?token_hash=${tokenHash}&type=signup` : linkData.properties.action_link;
          await sendActivationEmail(email.trim().toLowerCase(), directActionLink, ownerName);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          message: 'Your Book Stall registration has been submitted. Verification email dispatched to your inbox. Waiting for Admin approval.'
        }));
      } catch (err) {
        console.error('Error in /api/register-stall:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Register Scrap Business Owner (Real Email Verification & Admin Approval Required)
  if (reqPath === '/api/register-scrap' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { ownerName, bizName, email, phone, address, stateVal, district, city, licence, password } = data;
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        let userId;
        // email_confirm: false enforces real email verification
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: { full_name: ownerName, phone, role: 'seller', business_type: 'scrap_depot' }
        });

        if (createErr && createErr.message.includes('already registered')) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'An account with this email already exists. Please sign in or use Forgot Password.' }));
          return;
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
          is_verified: false
        }]);

        await supabaseAdmin.from('user_roles').upsert([{ user_id: userId, role: 'seller', is_approved: false }]);

        // Generate email activation link and send via SMTP
        const env = loadEnv();
        const appUrl = (env.VITE_APP_URL || CANONICAL_PROD_URL).replace(/\/$/, '') + '/';
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: email.trim().toLowerCase(),
          options: { redirectTo: appUrl }
        });

        if (linkData?.properties) {
          const tokenHash = linkData.properties.hashed_token;
          const directActionLink = tokenHash ? `${CANONICAL_PROD_URL}?token_hash=${tokenHash}&type=signup` : linkData.properties.action_link;
          await sendActivationEmail(email.trim().toLowerCase(), directActionLink, ownerName);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          message: 'Your Scrap Business registration has been submitted. Verification email dispatched to your inbox. Waiting for Admin approval.'
        }));
      } catch (err) {
        console.error('Error in /api/register-scrap:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Register Normal User (Real Email Verification Required)
  if (reqPath === '/api/register-user' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { name, email, phone, password } = data;
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Server missing admin credentials.' }));
          return;
        }

        // email_confirm: false enforces real email verification
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: { full_name: name, phone, role: 'seller' }
        });

        if (createErr && createErr.message.includes('already registered')) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'An account with this email already exists. Please sign in or use Forgot Password.' }));
          return;
        } else if (createErr) {
          throw createErr;
        }

        await supabaseAdmin.from('profiles').upsert([{
          id: newUser.user.id,
          full_name: name,
          phone: phone,
          email: email,
          age_confirmed: true,
          is_verified: false
        }]);

        await supabaseAdmin.from('user_roles').upsert([{
          user_id: newUser.user.id,
          role: 'seller',
          is_approved: true
        }]);

        // Generate email activation link and send via SMTP
        const env = loadEnv();
        const appUrl = (env.VITE_APP_URL || CANONICAL_PROD_URL).replace(/\/$/, '') + '/';
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: email.trim().toLowerCase(),
          options: { redirectTo: appUrl }
        });

        if (linkData?.properties) {
          const tokenHash = linkData.properties.hashed_token;
          const directActionLink = tokenHash ? `${CANONICAL_PROD_URL}?token_hash=${tokenHash}&type=signup` : linkData.properties.action_link;
          await sendActivationEmail(email.trim().toLowerCase(), directActionLink, name);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          message: 'User account created successfully! Verification email dispatched to your inbox. Please verify before signing in.'
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

  // API endpoint: Propose Counteroffer (Prompt Section 3 - Real Negotiation)
  if (reqPath === '/api/counter-offer' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { type, requestId, offerId, counterAmount, notes, senderUserId, targetUserId } = JSON.parse(body);
        const amt = parseFloat(counterAmount);
        if (!amt || amt <= 0) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Please enter a valid counteroffer amount greater than 0.' }));
          return;
        }

        const supabaseAdmin = getAdminClient();
        if (supabaseAdmin) {
          if (type === 'book') {
            await supabaseAdmin.from('book_offers').update({
              counter_amount: amt,
              status: 'Offer Revised',
              reason: notes ? `Counteroffer: ${notes}` : 'Counteroffer sent by seller'
            }).eq('id', offerId);

            await supabaseAdmin.from('book_requests').update({
              status: 'Offer Revised'
            }).eq('id', requestId);
          } else {
            await supabaseAdmin.from('scrap_offers').update({
              counter_amount: amt,
              status: 'Offer Revised',
              notes: notes ? `Counteroffer: ${notes}` : 'Counteroffer sent by seller'
            }).eq('id', offerId);

            await supabaseAdmin.from('scrap_requests').update({
              status: 'Offer Revised'
            }).eq('id', requestId);
          }

          if (targetUserId) {
            await supabaseAdmin.from('notifications').insert([{
              user_id: targetUserId,
              title: 'Counteroffer Received 🤝',
              message: `A counteroffer of ₹${amt.toFixed(2)} was proposed for Request #${(requestId || '').slice(0, 8)}. Click to review.`,
              notification_type: 'counter_offer',
              reference_id: requestId,
              is_read: false
            }]);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: `Counteroffer of ₹${amt.toFixed(2)} dispatched successfully.` }));
      } catch (err) {
        console.error('Error in /api/counter-offer:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Schedule Scrap Collection (Prompt Section 4)
  if (reqPath === '/api/schedule-scrap-collection' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { requestId, scheduledDate, timeSlot, collectorNotes, sellerUserId } = JSON.parse(body);
        if (!scheduledDate || !timeSlot) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Pickup date and time slot are required.' }));
          return;
        }

        const supabaseAdmin = getAdminClient();
        if (supabaseAdmin) {
          await supabaseAdmin.from('scrap_requests').update({
            status: 'Received',
            pickup_address: collectorNotes ? `${collectorNotes}` : undefined
          }).eq('id', requestId);

          if (sellerUserId) {
            await supabaseAdmin.from('notifications').insert([{
              user_id: sellerUserId,
              title: 'Scrap Pickup Scheduled 📅',
              message: `Recycling dealer scheduled collection for ${scheduledDate} (${timeSlot}). Digital scale weighing will take place at your doorstep.`,
              notification_type: 'collection_scheduled',
              reference_id: requestId,
              is_read: false
            }]);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'Pickup collection scheduled successfully.' }));
      } catch (err) {
        console.error('Error in /api/schedule-scrap-collection:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Record Doorstep Actual Scrap Weight (Strict ≥ 10 kg Check)
  if (reqPath === '/api/record-scrap-weight' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { requestId, actualWeightKg, agreedRatePerKg, scaleRemarks, sellerUserId } = JSON.parse(body);
        const actualKg = parseFloat(actualWeightKg);
        const rate = parseFloat(agreedRatePerKg) || 14;

        if (!actualKg || actualKg < 10.0) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            error: 'Minimum scrap weight is strictly 10.0 kg. Quantities under 10 kg cannot be processed as commercial recycling.'
          }));
          return;
        }

        const finalAmount = Math.round(actualKg * rate * 100) / 100;
        const supabaseAdmin = getAdminClient();
        if (supabaseAdmin) {
          await supabaseAdmin.from('scrap_requests').update({
            status: 'Payment Pending'
          }).eq('id', requestId);

          if (sellerUserId) {
            await supabaseAdmin.from('notifications').insert([{
              user_id: sellerUserId,
              title: 'Scrap Weighed on Digital Scale ⚖️',
              message: `Actual weight recorded: ${actualKg} kg at ₹${rate}/kg. Final payout: ₹${finalAmount.toFixed(2)}. Please confirm receipt once paid.`,
              notification_type: 'weight_recorded',
              reference_id: requestId,
              is_read: false
            }]);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          actualWeightKg: actualKg,
          finalAmount,
          message: `Actual weight of ${actualKg} kg recorded. Payable amount calculated at ₹${finalAmount.toFixed(2)}.`
        }));
      } catch (err) {
        console.error('Error in /api/record-scrap-weight:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Two-Party Transaction Completion Confirmation
  if (reqPath === '/api/confirm-transaction' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { transactionId, type, requestId, userId, partnerUserId } = JSON.parse(body);
        const supabaseAdmin = getAdminClient();
        if (supabaseAdmin) {
          if (type === 'book') {
            await supabaseAdmin.from('book_requests').update({ status: 'Completed' }).eq('id', requestId);
          } else {
            await supabaseAdmin.from('scrap_requests').update({ status: 'Completed' }).eq('id', requestId);
          }

          if (transactionId) {
            await supabaseAdmin.from('transactions').update({
              status: 'completed',
              completed_at: new Date().toISOString()
            }).eq('id', transactionId);

            await supabaseAdmin.from('payment_records').update({
              seller_confirmed: true,
              status: 'confirmed'
            }).eq('transaction_id', transactionId);
          }

          if (partnerUserId) {
            await supabaseAdmin.from('notifications').insert([{
              user_id: partnerUserId,
              title: 'Order Completed & Confirmed ✅',
              message: 'Both parties confirmed delivery and payment receipt. Order has been marked COMPLETED.',
              notification_type: 'order_completed',
              reference_id: requestId,
              is_read: false
            }]);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'Transaction finalized and marked Completed with two-party confirmation.' }));
      } catch (err) {
        console.error('Error in /api/confirm-transaction:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Multi-Role Notification Dispatcher (Bypasses Client RLS)
  if (reqPath === '/api/notify-owners' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { type, requestId, title, message, bookTitle, author, condition, price, pickupLocation, weightKg, paperType, pinCode, address, targetUserId } = JSON.parse(body || '{}');
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Database admin client unavailable.' }));
          return;
        }

        const isUuid = str => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');
        const refUuid = isUuid(requestId) ? requestId : null;

        let insertedCount = 0;

        if (type === 'book_upload') {
          // Fetch all approved book stall owners
          const { data: stalls, error: stallErr } = await supabaseAdmin
            .from('book_stalls')
            .select('user_id, stall_name, pincode, address')
            .eq('approval_status', 'approved');

          if (stallErr) throw stallErr;

          if (stalls && stalls.length > 0) {
            const notifs = stalls.map(s => ({
              user_id: s.user_id,
              title: title || 'New Used Textbook Available 📚',
              message: message || `${bookTitle || 'Textbook'} by ${author || 'Unknown'} (${condition || 'Good'}). Expected: ₹${price || '0'} | Location: ${pickupLocation || 'Local Campus'}`,
              notification_type: 'new_book_request',
              reference_id: refUuid,
              is_read: false
            }));

            const { data: inserted, error: insErr } = await supabaseAdmin.from('notifications').insert(notifs).select();
            if (insErr) throw insErr;
            insertedCount = inserted?.length || notifs.length;
          }
        } else if (type === 'scrap_request') {
          // Scrap collection request: enforce minimum 10.0 kg
          const kg = parseFloat(weightKg || 0);
          if (kg < 10.0) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: false, error: 'Minimum scrap weight is strictly 10.0 kg.' }));
            return;
          }

          // Fetch all approved scrap recycling owners
          const { data: scrapOwners, error: scrapErr } = await supabaseAdmin
            .from('scrap_owners')
            .select('user_id, business_name, pincode, address, base_area')
            .eq('approval_status', 'approved');

          if (scrapErr) throw scrapErr;

          if (scrapOwners && scrapOwners.length > 0) {
            const notifs = scrapOwners.map(o => ({
              user_id: o.user_id,
              title: title || 'New Scrap Collection Request (≥ 10 kg) ♻️',
              message: message || `${kg} kg of ${paperType || 'Paper Scrap'}. Pickup at PIN ${pinCode || ''}, ${address || 'Customer Location'}`,
              notification_type: 'new_scrap_request',
              reference_id: refUuid,
              is_read: false
            }));

            const { data: inserted, error: insErr } = await supabaseAdmin.from('notifications').insert(notifs).select();
            if (insErr) throw insErr;
            insertedCount = inserted?.length || notifs.length;
          }
        } else if (targetUserId) {
          // Direct notification to specific user (e.g. counter-offer, approval, rejection)
          const { error: insErr } = await supabaseAdmin.from('notifications').insert([{
            user_id: targetUserId,
            title: title || 'Order Update',
            message: message || '',
            notification_type: type || 'system_notice',
            reference_id: refUuid,
            is_read: false
          }]);
          if (insErr) throw insErr;
          insertedCount = 1;
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, count: insertedCount, message: `Dispatched ${insertedCount} notification(s).` }));
      } catch (err) {
        console.error('Error in /api/notify-owners:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Verify user account status (already verified or pending)
  if (reqPath === '/api/check-user-status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body || '{}');
        if (!email || !email.includes('@')) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Valid email required' }));
          return;
        }
        const cleanEmail = email.trim().toLowerCase();
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'Database unavailable' }));
          return;
        }
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        const user = (data?.users || []).find(u => u.email?.toLowerCase() === cleanEmail);
        if (!user) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: true, exists: false, isVerified: false }));
          return;
        }
        const isVerified = !!user.email_confirmed_at;
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          exists: true,
          isVerified,
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'seller'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (reqPath === '/') {
    reqPath = '/index.html';
  } else if (reqPath === '/reset-password' || reqPath === '/reset-password/') {
    reqPath = '/reset-password.html';
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
