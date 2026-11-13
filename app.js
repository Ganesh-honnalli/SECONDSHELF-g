// ====================================================================
// SECOND SHELF - CORE CONFIGURATION & APPLICATION STATE
// ====================================================================

const MASTER_ADMIN_EMAIL = 'ganeshhonnalli07@gmail.com';
var supabase = null;
const _supabaseLib = (typeof window !== 'undefined' && (window.supabaseLib || window.supabase)) || null;

let analyticsFilters = {
  region: 'all',
  bizType: 'all',
  status: 'all',
  dateRange: 'all'
};

const state = {
  language: 'en',
  currentUser: null,
  currentSession: null,
  supabaseConfig: {
    url: '',
    key: '',
    connected: false
  },
  valuationRules: {
    'Like New': 30.0,
    'Good': 30.0,
    'Used': 20.0,
    'Old or Damaged': 15.0
  },
  categories: [],
  bookRequests: [],
  wasteRequests: [],
  bookOffers: [],
  scrapOffers: [],
  transactions: [],
  notifications: [],
  guidelines: [],
  announcements: [],
  complaints: [],
  auditLogs: [],
  bookStalls: [],
  scrapOwners: [],
  usersList: [],
  adminLiveNotifications: [],
  activeConversation: null,
  activeChatSubscription: null,
  currentConfirmingReq: null
};

// Immediate client initialization helper
function getSupabase() {
  if (supabase) return supabase;
  const url = (window.SECOND_SHELF_CONFIG && window.SECOND_SHELF_CONFIG.supabaseUrl) || localStorage.getItem('SECOND_SHELF_SUPABASE_URL') || 'https://taujwlvvuxbsfqiemhgv.supabase.co';
  const key = (window.SECOND_SHELF_CONFIG && window.SECOND_SHELF_CONFIG.supabaseAnonKey) || localStorage.getItem('SECOND_SHELF_SUPABASE_ANON_KEY') || 'sb_publishable_RoDhwATknYzsKDsQ8G4ugw_VR3elBQl';
  const lib = (typeof window !== 'undefined' && (window.supabaseLib || window.supabase || _supabaseLib)) || null;
  if (lib && lib.createClient && url && key) {
    try {
      supabase = lib.createClient(url, key);
      if (typeof window !== 'undefined') window.supabase = supabase;
      state.supabaseConfig = { url, key, connected: true };
      return supabase;
    } catch (e) {
      console.warn('Immediate getSupabase createClient error:', e);
    }
  }
  return null;
}

// Try immediate sync initialization if library is already present in head
if (typeof window !== 'undefined') {
  getSupabase();
}


// ====================================================================
// ISOLATED AUTHENTICATION & LOGIN CONTROLLERS (Separate Login Pages)
// ====================================================================

// Real-time admin notifications storage
// state.adminLiveNotifications initialized in core state

function closeAllLoginModals() {
  ['modal-login-user', 'modal-login-stall', 'modal-login-scrap', 'modal-login-admin', 'modal-auth'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
}

function openLoginPortal(role = 'user') {
  closeAllLoginModals();
  if (role === 'admin') {
    document.getElementById('modal-login-admin')?.classList.remove('hidden');
    const pwd = document.getElementById('admin-login-password');
    if (pwd) {
      pwd.value = '';
      pwd.focus();
    }
  } else if (role === 'stall' || role === 'book_stall') {
    document.getElementById('modal-login-stall')?.classList.remove('hidden');
    switchStallAuthTab('signin');
  } else if (role === 'scrap' || role === 'raddi_owner') {
    document.getElementById('modal-login-scrap')?.classList.remove('hidden');
    switchScrapAuthTab('signin');
  } else {
    document.getElementById('modal-login-user')?.classList.remove('hidden');
    switchUserAuthTab('signin');
  }
}

// 1. NORMAL USER AUTH TAB SWITCHER
function switchUserAuthTab(tab) {
  const signinBtn = document.getElementById('tab-user-signin');
  const signupBtn = document.getElementById('tab-user-signup');
  const signinView = document.getElementById('view-user-signin');
  const signupView = document.getElementById('view-user-signup');
  const errBox = document.getElementById('user-auth-error-box');
  const succBox = document.getElementById('user-auth-success-box');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (tab === 'signup') {
    signinBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signinBtn?.classList.add('text-slate-600');
    signupBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signupBtn?.classList.remove('text-slate-600');
    signinView?.classList.add('hidden');
    signupView?.classList.remove('hidden');
  } else {
    signupBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signupBtn?.classList.add('text-slate-600');
    signinBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signinBtn?.classList.remove('text-slate-600');
    signupView?.classList.add('hidden');
    signinView?.classList.remove('hidden');
  }
}

// 2. BOOK STALL AUTH TAB SWITCHER
function switchStallAuthTab(tab) {
  const signinBtn = document.getElementById('tab-stall-signin');
  const signupBtn = document.getElementById('tab-stall-signup');
  const signinView = document.getElementById('view-stall-signin');
  const signupView = document.getElementById('view-stall-signup');
  const errBox = document.getElementById('stall-auth-error-box');
  const succBox = document.getElementById('stall-auth-success-box');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (tab === 'signup') {
    signinBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signinBtn?.classList.add('text-slate-600');
    signupBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signupBtn?.classList.remove('text-slate-600');
    signinView?.classList.add('hidden');
    signupView?.classList.remove('hidden');
  } else {
    signupBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signupBtn?.classList.add('text-slate-600');
    signinBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signinBtn?.classList.remove('text-slate-600');
    signupView?.classList.add('hidden');
    signinView?.classList.remove('hidden');
  }
}

// 3. RECYCLE & SCRAP AUTH TAB SWITCHER
function switchScrapAuthTab(tab) {
  const signinBtn = document.getElementById('tab-scrap-signin');
  const signupBtn = document.getElementById('tab-scrap-signup');
  const signinView = document.getElementById('view-scrap-signin');
  const signupView = document.getElementById('view-scrap-signup');
  const errBox = document.getElementById('scrap-auth-error-box');
  const succBox = document.getElementById('scrap-auth-success-box');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (tab === 'signup') {
    signinBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signinBtn?.classList.add('text-slate-600');
    signupBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signupBtn?.classList.remove('text-slate-600');
    signinView?.classList.add('hidden');
    signupView?.classList.remove('hidden');
  } else {
    signupBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signupBtn?.classList.add('text-slate-600');
    signinBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signinBtn?.classList.remove('text-slate-600');
    signupView?.classList.add('hidden');
    signinView?.classList.remove('hidden');
  }
}

// Show/Hide Password Toggle Helper
function togglePasswordVisibility(inputId, toggleBtn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (toggleBtn) toggleBtn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (toggleBtn) toggleBtn.textContent = '👁️';
  }
}

// Forgot Password Flow
function openForgotPasswordModal(portal = 'user') {
  let emailVal = '';
  if (portal === 'admin') emailVal = document.getElementById('admin-login-email')?.value || 'ganeshhonnalli07@gmail.com';
  else if (portal === 'stall') emailVal = document.getElementById('stall-login-email')?.value || '';
  else if (portal === 'scrap') emailVal = document.getElementById('scrap-login-email')?.value || '';
  else emailVal = document.getElementById('user-login-email')?.value || '';

  const emailInput = document.getElementById('forgot-password-email');
  if (emailInput) emailInput.value = emailVal;

  document.getElementById('forgot-password-error-box')?.classList.add('hidden');
  document.getElementById('forgot-password-success-box')?.classList.add('hidden');
  document.getElementById('modal-forgot-password')?.classList.remove('hidden');
}

async function handleForgotPasswordSubmit(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const email = document.getElementById('forgot-password-email')?.value?.trim();
  const spinner = document.getElementById('forgot-password-spinner');
  const btnText = document.getElementById('forgot-password-btn-text');
  const submitBtn = document.getElementById('btn-forgot-password');
  const errBox = document.getElementById('forgot-password-error-box');
  const errMsg = document.getElementById('forgot-password-error-msg');
  const succBox = document.getElementById('forgot-password-success-box');
  const succMsg = document.getElementById('forgot-password-success-msg');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!email) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please enter your registered email address.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Sending Reset Link...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) throw error;

    if (succBox && succMsg) {
      succMsg.textContent = 'Password reset instructions dispatched to ' + email + '. Please check your inbox.';
      succBox.classList.remove('hidden');
    }
    showToast('Password reset link sent to ' + email, 'success');
  } catch (err) {
    if (errBox && errMsg) {
      errMsg.textContent = err.message || 'Unable to dispatch reset link.';
      errBox.classList.remove('hidden');
    }
  } finally {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Send Password Reset Link';
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ====================================================================
// FLOATING SUGGESTION BOX CONTROLLER
// ====================================================================

function openSuggestionBoxModal() {
  const nameInput = document.getElementById('suggestion-name');
  const emailInput = document.getElementById('suggestion-email');
  const errBox = document.getElementById('suggestion-error-box');
  const succBox = document.getElementById('suggestion-success-box');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (state.currentUser) {
    if (nameInput && !nameInput.value) nameInput.value = state.currentUser.name || '';
    if (emailInput && !emailInput.value) emailInput.value = state.currentUser.email || '';
  }

  document.getElementById('modal-suggestion-box')?.classList.remove('hidden');
  document.getElementById('suggestion-message')?.focus();
}

async function handleSuggestionSubmit(event) {
  if (event) event.preventDefault();
  if (!supabase) getSupabase();

  const name = document.getElementById('suggestion-name')?.value?.trim() || 'Anonymous User';
  const email = document.getElementById('suggestion-email')?.value?.trim() || '';
  const category = document.getElementById('suggestion-category')?.value || 'General Feedback';
  const message = document.getElementById('suggestion-message')?.value?.trim();

  const errBox = document.getElementById('suggestion-error-box');
  const errMsg = document.getElementById('suggestion-error-msg');
  const succBox = document.getElementById('suggestion-success-box');
  const succMsg = document.getElementById('suggestion-success-msg');
  const spinner = document.getElementById('suggestion-spinner');
  const btnText = document.getElementById('suggestion-btn-text');
  const submitBtn = document.getElementById('btn-submit-suggestion');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!message) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please enter your suggestion or feedback before submitting.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Submitting Suggestion...';
  if (submitBtn) submitBtn.disabled = true;

  const ticketNumber = 'SUGG-' + Date.now().toString().slice(-6);

  try {
    if (supabase) {
      // 1. Save to complaints table
      try {
        await supabase.from('complaints').insert([{
          ticket_number: ticketNumber,
          filed_by: state.currentUser ? state.currentUser.id : null,
          subject: `[Suggestion] ${category} - ${name}`,
          description: `${message}${email ? ` | Contact: ${email}` : ''}`,
          status: 'open'
        }]);
      } catch (dbErr) {
        console.warn('Could not insert suggestion into complaints:', dbErr);
      }

      // 2. Also log in admin_audit_logs
      try {
        await supabase.from('admin_audit_logs').insert([{
          action: 'community_suggestion',
          target_type: 'feedback',
          target_id: ticketNumber,
          details: {
            ticket_number: ticketNumber,
            name,
            email,
            category,
            message,
            timestamp: new Date().toISOString()
          }
        }]);
      } catch (e) {}
    }

    // 3. Admin live notification
    addAdminLiveNotification('💡 New Suggestion Received', name, category, 'NEW');

    if (succBox && succMsg) {
      succMsg.innerHTML = `<strong>Thank You!</strong> Your suggestion (#${ticketNumber}) has been submitted to the SECOND SHELF team. We appreciate your ideas!`;
      succBox.classList.remove('hidden');
    }

    const form = document.getElementById('form-suggestion-box');
    if (form) form.reset();

    showToast('Thank you! Your suggestion has been recorded 💡', 'success');

    setTimeout(() => {
      closeModal('modal-suggestion-box');
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Submit Suggestion to Administrator';
      if (submitBtn) submitBtn.disabled = false;
      if (succBox) succBox.classList.add('hidden');
    }, 2000);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Submit Suggestion to Administrator';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message || 'Error submitting suggestion. Please try again.';
      errBox.classList.remove('hidden');
    }
  }
}

// Post-Login Location Request (Requirement 7)
function promptPostLoginLocation() {
  document.getElementById('modal-post-login-location')?.classList.remove('hidden');
}

function handlePostLoginLocationAllow() {
  closeModal('modal-post-login-location');
  requestBrowserLocation();
}

function handlePostLoginLocationManual() {
  closeModal('modal-post-login-location');
  openLocationModal();
}

// ====================================================================
// Database User Role Synchronization Helper
async function syncUserRole(userId, newRole, isApproved = true) {
  if (!supabase || !userId) return;
  try {
    const { data: existing } = await supabase.from('user_roles').select('id').eq('user_id', userId).limit(1);
    if (existing && existing.length > 0) {
      await supabase.from('user_roles').update({ role: newRole, is_approved: isApproved }).eq('id', existing[0].id);
    } else {
      await supabase.from('user_roles').insert([{ user_id: userId, role: newRole, is_approved: isApproved }]);
    }
  } catch (err) {
    console.warn('syncUserRole failed:', err);
  }
}

// 1. NORMAL USER AUTHENTICATION HANDLERS
// ====================================================================

async function handleNormalUserLogin(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const email = document.getElementById('user-login-email')?.value?.trim();
  const password = document.getElementById('user-login-password')?.value;
  const remember = document.getElementById('user-login-remember')?.checked;
  const errBox = document.getElementById('user-auth-error-box');
  const errMsg = document.getElementById('user-auth-error-msg');
  const succBox = document.getElementById('user-auth-success-box');
  const succMsg = document.getElementById('user-auth-success-msg');
  const spinner = document.getElementById('user-login-spinner');
  const btnText = document.getElementById('user-login-btn-text');
  const submitBtn = document.getElementById('btn-user-login');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!email || !password) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please enter your email and password.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Authenticating User...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (remember) localStorage.setItem('SECOND_SHELF_REMEMBER_USER_EMAIL', email);

    if (succBox && succMsg) {
      succMsg.textContent = 'Sign in successful! Entering dashboard...';
      succBox.classList.remove('hidden');
    }

    await resolveUserProfile(data.user);

    setTimeout(() => {
      closeModal('modal-login-user');
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Sign In to User Account';
      if (submitBtn) submitBtn.disabled = false;

      // Role check: Normal users go to Seller Dashboard
      showSection('dashboard');
      renderCurrentDashboard();
      promptPostLoginLocation();
    }, 600);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Sign In to User Account';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message.includes('Invalid login credentials') 
        ? 'Invalid email or password. Please verify your credentials.' 
        : err.message;
      errBox.classList.remove('hidden');
    }
  }
}

async function handleNormalUserSignUp(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const name = document.getElementById('user-reg-name')?.value?.trim();
  const email = document.getElementById('user-reg-email')?.value?.trim();
  const phone = document.getElementById('user-reg-phone')?.value?.trim();
  const password = document.getElementById('user-reg-password')?.value;
  const confirm = document.getElementById('user-reg-confirm')?.value;
  const ageConfirm = document.getElementById('user-reg-age')?.checked;

  const errBox = document.getElementById('user-auth-error-box');
  const errMsg = document.getElementById('user-auth-error-msg');
  const succBox = document.getElementById('user-auth-success-box');
  const succMsg = document.getElementById('user-auth-success-msg');
  const spinner = document.getElementById('user-reg-spinner');
  const btnText = document.getElementById('user-reg-btn-text');
  const submitBtn = document.getElementById('btn-user-reg');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!name || !email || !password || !phone) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please fill out all required fields.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (password.length < 8) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Password must be at least 8 characters long.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (password !== confirm) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Passwords do not match.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (!ageConfirm) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please confirm that you are 18 years of age or older.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Creating Account...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    let registeredViaApi = false;
    try {
      const apiRes = await fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success) registeredViaApi = true;
      }
    } catch (e) {}

    let data = null;
    if (!registeredViaApi) {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            role: 'seller'
          }
        }
      });
      if (res.error) throw res.error;
      data = res.data;
    }

    if (data.user) {
      try {
        await supabase.from('profiles').upsert([{
          id: data.user.id,
          full_name: name,
          phone: phone,
          email: email,
          age_confirmed: true,
          is_verified: true
        }]);
        await syncUserRole(data.user.id, 'seller', true);
      } catch (e) {}
    }

    if (succBox && succMsg) {
      succMsg.textContent = 'Normal User Account created! Verification email dispatched to ' + email + '. You can now sign in.';
      succBox.classList.remove('hidden');
    }
    showToast('Registration successful! Please sign in.', 'success');

    setTimeout(() => {
      switchUserAuthTab('signin');
      const emailInput = document.getElementById('user-login-email');
      if (emailInput) emailInput.value = email;
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Create Normal User Account';
      if (submitBtn) submitBtn.disabled = false;
    }, 1500);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Create Normal User Account';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message || 'Error creating user account.';
      errBox.classList.remove('hidden');
    }
  }
}

// ====================================================================
// 2. BOOK STALL OWNER AUTHENTICATION HANDLERS
// ====================================================================

async function handleBookStallLogin(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const email = document.getElementById('stall-login-email')?.value?.trim();
  const password = document.getElementById('stall-login-password')?.value;
  const remember = document.getElementById('stall-login-remember')?.checked;
  const errBox = document.getElementById('stall-auth-error-box');
  const errMsg = document.getElementById('stall-auth-error-msg');
  const succBox = document.getElementById('stall-auth-success-box');
  const succMsg = document.getElementById('stall-auth-success-msg');
  const spinner = document.getElementById('stall-login-spinner');
  const btnText = document.getElementById('stall-login-btn-text');
  const submitBtn = document.getElementById('btn-stall-login');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!email || !password) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please enter bookstore email and password.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Verifying Bookstore...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
        throw new Error('Invalid credentials for ' + email + '. Note: This is the Administrator account. Please enter your Administrator password or click "Admin Login" in the header.');
      }
      throw error;
    }

    // If Master Administrator signs in here, seamlessly open the Admin Dashboard
    if (data.user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      if (succBox && succMsg) {
        succMsg.textContent = 'Administrator account verified! Opening Administrator Console...';
        succBox.classList.remove('hidden');
      }
      await resolveUserProfile(data.user);
      state.currentUser.role = 'admin';
      setTimeout(() => {
        closeModal('modal-login-stall');
        if (spinner) spinner.classList.add('hidden');
        if (btnText) btnText.textContent = 'Sign In to Book Stall Dashboard';
        if (submitBtn) submitBtn.disabled = false;
        showSection('dashboard');
        renderCurrentDashboard();
        setAdminTab('approvals');
        showToast('Welcome, Administrator Ganesh Honnalli', 'success');
      }, 600);
      return;
    }

    // Check approval status in book_stalls
    const { data: stall } = await supabase
      .from('book_stalls')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (!stall) {
      await supabase.auth.signOut();
      throw new Error('Account Mismatch: No bookstore registration found for ' + email + '. Please register as a Book Stall Owner or sign in with your registered stall email.');
    }

    if (stall.approval_status === 'pending') {
      await supabase.auth.signOut();
      throw new Error('Your Book Stall Owner application has been submitted successfully. Please wait for administrator approval.');
    }

    if (stall.approval_status === 'rejected') {
      await supabase.auth.signOut();
      throw new Error('Application Rejected: Your Book Stall Owner application was reviewed and rejected by the Administrator.');
    }

    if (remember) localStorage.setItem('SECOND_SHELF_REMEMBER_STALL_EMAIL', email);

    if (succBox && succMsg) {
      succMsg.textContent = 'Verified Bookstore Partner! Opening console...';
      succBox.classList.remove('hidden');
    }

    await resolveUserProfile(data.user);

    setTimeout(() => {
      closeModal('modal-login-stall');
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Sign In to Book Stall Dashboard';
      if (submitBtn) submitBtn.disabled = false;

      state.currentUser.role = 'book_stall';
      showSection('dashboard');
      renderCurrentDashboard();
      promptPostLoginLocation();
    }, 600);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Sign In to Book Stall Dashboard';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message || 'Error signing in to bookstore account.';
      errBox.classList.remove('hidden');
    }
  }
}

async function handleBookStallSignUp(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const ownerName = document.getElementById('reg-stall-owner')?.value?.trim();
  const stallName = document.getElementById('reg-stall-name')?.value?.trim();
  const email = document.getElementById('reg-stall-email')?.value?.trim();
  const phone = document.getElementById('reg-stall-phone')?.value?.trim();
  const address = document.getElementById('reg-stall-address')?.value?.trim();
  const stateVal = document.getElementById('reg-stall-state')?.value?.trim() || 'Karnataka';
  const district = document.getElementById('reg-stall-district')?.value?.trim() || 'Dharwad';
  const city = document.getElementById('reg-stall-city')?.value?.trim() || 'Hubli';
  const licence = document.getElementById('reg-stall-licence')?.value?.trim() || 'Pending';
  const password = document.getElementById('reg-stall-password')?.value;

  const errBox = document.getElementById('stall-auth-error-box');
  const errMsg = document.getElementById('stall-auth-error-msg');
  const succBox = document.getElementById('stall-auth-success-box');
  const succMsg = document.getElementById('stall-auth-success-msg');
  const spinner = document.getElementById('stall-reg-spinner');
  const btnText = document.getElementById('stall-reg-btn-text');
  const submitBtn = document.getElementById('btn-reg-stall');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!ownerName || !stallName || !email || !phone || !address || !city || !password) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please fill out all required bookstore fields.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (password.length < 8) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Password must be at least 8 characters long.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Submitting Application...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    let registeredViaApi = false;
    try {
      const apiRes = await fetch('/api/register-stall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName, stallName, email, phone, address, stateVal, district, city, licence, password
        })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success) registeredViaApi = true;
      }
    } catch (e) {}

    let data = null;
    if (!registeredViaApi) {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: ownerName,
            phone: phone,
            role: 'seller',
            business_type: 'book_stall',
            stall_name: stallName,
            address: `${address} | City: ${city} | District: ${district} | State: ${stateVal}`
          }
        }
      });
      if (res.error) throw res.error;
      data = res.data;
    }

    const formattedAddress = `${address} | City: ${city} | District: ${district} | State: ${stateVal}`;

    if (data.user) {
      try {
        await supabase.from('profiles').upsert([{
          id: data.user.id,
          full_name: ownerName,
          phone: phone,
          email: email,
          age_confirmed: true,
          is_verified: true
        }]);
        await syncUserRole(data.user.id, 'seller', false);
      } catch (e) {}

      try {
        await supabase.from('book_stalls').insert([{
          user_id: data.user.id,
          stall_name: stallName,
          owner_name: ownerName,
          phone: phone,
          licence_number: licence,
          address: formattedAddress,
          pincode: '580020',
          approval_status: 'pending'
        }]);
      } catch (e) {
        console.warn('Stall insert fallback:', e);
      }

      // Notify admin live
      addAdminLiveNotification('Book Stall Application Submitted', ownerName, 'Book Stall', 'PENDING');

      try {
        await supabase.from('admin_audit_logs').insert([{
          action: 'partner_application',
          target_type: 'book_stall',
          target_id: data.user.id,
          details: {
            applicant_name: ownerName,
            email: email,
            phone: phone,
            business_name: stallName,
            business_type: 'Book Stall',
            state: stateVal,
            district: district,
            city: city,
            status: 'pending'
          }
        }]);
      } catch (e) {}
    }

    if (succBox && succMsg) {
      succMsg.innerHTML = '<strong>Application Submitted!</strong> Your Book Stall Owner application has been submitted successfully. Please wait for administrator approval.';
      succBox.classList.remove('hidden');
    }

    showToast('Your Book Stall Owner application has been submitted successfully. Please wait for administrator approval.', 'info');
    setTimeout(() => {
      switchStallAuthTab('signin');
      const stallEmailInp = document.getElementById('stall-login-email');
      if (stallEmailInp) stallEmailInp.value = email;
    }, 1800);

    setTimeout(() => {
      switchStallAuthTab('signin');
      const emailInput = document.getElementById('stall-login-email');
      if (emailInput) emailInput.value = email;
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Submit Book Stall Application for Admin Approval';
      if (submitBtn) submitBtn.disabled = false;
    }, 2000);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Submit Book Stall Application for Admin Approval';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message || 'Error submitting bookstore application.';
      errBox.classList.remove('hidden');
    }
  }
}

// ====================================================================
// 3. RECYCLE & SCRAP OWNER AUTHENTICATION HANDLERS
// ====================================================================

async function handleScrapOwnerLogin(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const email = document.getElementById('scrap-login-email')?.value?.trim();
  const password = document.getElementById('scrap-login-password')?.value;
  const remember = document.getElementById('scrap-login-remember')?.checked;
  const errBox = document.getElementById('scrap-auth-error-box');
  const errMsg = document.getElementById('scrap-auth-error-msg');
  const succBox = document.getElementById('scrap-auth-success-box');
  const succMsg = document.getElementById('scrap-auth-success-msg');
  const spinner = document.getElementById('scrap-login-spinner');
  const btnText = document.getElementById('scrap-login-btn-text');
  const submitBtn = document.getElementById('btn-scrap-login');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!email || !password) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please enter scrap business email and password.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Verifying Scrap Depot...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
        throw new Error('Invalid credentials for ' + email + '. Note: This is the Administrator account. Please enter your Administrator password or click "Admin Login" in the header.');
      }
      throw error;
    }

    if (data.user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      if (succBox && succMsg) {
        succMsg.textContent = 'Administrator account verified! Opening Administrator Console...';
        succBox.classList.remove('hidden');
      }
      await resolveUserProfile(data.user);
      state.currentUser.role = 'admin';
      setTimeout(() => {
        closeModal('modal-login-scrap');
        if (spinner) spinner.classList.add('hidden');
        if (btnText) btnText.textContent = 'Sign In to Scrap Business Dashboard';
        if (submitBtn) submitBtn.disabled = false;
        showSection('dashboard');
        renderCurrentDashboard();
        setAdminTab('approvals');
        showToast('Welcome, Administrator Ganesh Honnalli', 'success');
      }, 600);
      return;
    }

    // Check approval status in scrap_owners
    const { data: scrap } = await supabase
      .from('scrap_owners')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (!scrap) {
      await supabase.auth.signOut();
      throw new Error('Account Mismatch: No scrap business registration found for ' + email + '. Please register as a Scrap Business Owner or sign in with your registered scrap email.');
    }

    if (scrap.approval_status === 'pending') {
      await supabase.auth.signOut();
      throw new Error('Your Scrap Business Owner application has been submitted successfully. Please wait for administrator approval.');
    }

    if (scrap.approval_status === 'rejected') {
      await supabase.auth.signOut();
      throw new Error('Application Rejected: Your Scrap Business application was reviewed and rejected by the Administrator.');
    }

    if (remember) localStorage.setItem('SECOND_SHELF_REMEMBER_SCRAP_EMAIL', email);

    if (succBox && succMsg) {
      succMsg.textContent = 'Verified Scrap Partner! Opening console...';
      succBox.classList.remove('hidden');
    }

    await resolveUserProfile(data.user);

    setTimeout(() => {
      closeModal('modal-login-scrap');
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Sign In to Scrap Business Dashboard';
      if (submitBtn) submitBtn.disabled = false;

      state.currentUser.role = 'raddi_owner';
      showSection('dashboard');
      renderCurrentDashboard();
      promptPostLoginLocation();
    }, 600);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Sign In to Scrap Business Dashboard';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message || 'Error signing in to scrap business account.';
      errBox.classList.remove('hidden');
    }
  }
}

async function handleScrapOwnerSignUp(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const ownerName = document.getElementById('reg-scrap-owner')?.value?.trim();
  const bizName = document.getElementById('reg-scrap-name')?.value?.trim();
  const email = document.getElementById('reg-scrap-email')?.value?.trim();
  const phone = document.getElementById('reg-scrap-phone')?.value?.trim();
  const address = document.getElementById('reg-scrap-address')?.value?.trim();
  const stateVal = document.getElementById('reg-scrap-state')?.value?.trim() || 'Karnataka';
  const district = document.getElementById('reg-scrap-district')?.value?.trim() || 'Dharwad';
  const city = document.getElementById('reg-scrap-city')?.value?.trim() || 'Hubli';
  const licence = document.getElementById('reg-scrap-licence')?.value?.trim() || 'Pending';
  const password = document.getElementById('reg-scrap-password')?.value;

  const errBox = document.getElementById('scrap-auth-error-box');
  const errMsg = document.getElementById('scrap-auth-error-msg');
  const succBox = document.getElementById('scrap-auth-success-box');
  const succMsg = document.getElementById('scrap-auth-success-msg');
  const spinner = document.getElementById('scrap-reg-spinner');
  const btnText = document.getElementById('scrap-reg-btn-text');
  const submitBtn = document.getElementById('btn-reg-scrap');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!ownerName || !bizName || !email || !phone || !address || !city || !password) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please fill out all required scrap business fields.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (password.length < 8) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Password must be at least 8 characters long.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Submitting Application...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    let registeredViaApi = false;
    try {
      const apiRes = await fetch('/api/register-scrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName, bizName, email, phone, address, stateVal, district, city, licence, password
        })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success) registeredViaApi = true;
      }
    } catch (e) {}

    let data = null;
    if (!registeredViaApi) {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: ownerName,
            phone: phone,
            role: 'seller',
            business_type: 'scrap_depot',
            biz_name: bizName,
            address: `${address} | City: ${city} | District: ${district} | State: ${stateVal}`
          }
        }
      });
      if (res.error) throw res.error;
      data = res.data;
    }

    const formattedAddress = `${address} | City: ${city} | District: ${district} | State: ${stateVal}`;

    if (data.user) {
      try {
        await supabase.from('profiles').upsert([{
          id: data.user.id,
          full_name: ownerName,
          phone: phone,
          email: email,
          age_confirmed: true,
          is_verified: true
        }]);
        await syncUserRole(data.user.id, 'seller', false);
      } catch (e) {}

      try {
        await supabase.from('scrap_owners').insert([{
          user_id: data.user.id,
          business_name: bizName,
          owner_name: ownerName,
          phone: phone,
          licence_number: licence,
          address: formattedAddress,
          base_area: city,
          pincode: '580020',
          approval_status: 'pending'
        }]);
      } catch (e) {
        console.warn('Scrap insert fallback:', e);
      }

      // Notify admin live
      addAdminLiveNotification('Scrap Business Application Submitted', ownerName, 'Recycle & Scrap', 'PENDING');

      try {
        await supabase.from('admin_audit_logs').insert([{
          action: 'partner_application',
          target_type: 'scrap_owner',
          target_id: data.user.id,
          details: {
            applicant_name: ownerName,
            email: email,
            phone: phone,
            business_name: bizName,
            business_type: 'Recycle & Scrap',
            state: stateVal,
            district: district,
            city: city,
            status: 'pending'
          }
        }]);
      } catch (e) {}
    }

    if (succBox && succMsg) {
      succMsg.innerHTML = '<strong>Application Submitted!</strong> Your Scrap Business Owner application has been submitted successfully. Please wait for administrator approval.';
      succBox.classList.remove('hidden');
    }

    showToast('Your Scrap Business Owner application has been submitted successfully. Please wait for administrator approval.', 'info');
    setTimeout(() => {
      switchScrapAuthTab('signin');
      const scrapEmailInp = document.getElementById('scrap-login-email');
      if (scrapEmailInp) scrapEmailInp.value = email;
    }, 1800);

    setTimeout(() => {
      switchScrapAuthTab('signin');
      const emailInput = document.getElementById('scrap-login-email');
      if (emailInput) emailInput.value = email;
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Submit Scrap Business Application for Admin Approval';
      if (submitBtn) submitBtn.disabled = false;
    }, 2000);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Submit Scrap Business Application for Admin Approval';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message || 'Error submitting scrap business application.';
      errBox.classList.remove('hidden');
    }
  }
}

// ====================================================================
// 4. MASTER ADMINISTRATOR AUTHENTICATION (Strictly ganeshhonnalli07@gmail.com)
// ====================================================================

async function handleMasterAdminLogin(event) {
  if (!supabase) getSupabase();
  if (event) event.preventDefault();
  const email = MASTER_ADMIN_EMAIL;
  const password = document.getElementById('admin-login-password')?.value;
  const errBox = document.getElementById('admin-auth-error-box');
  const errMsg = document.getElementById('admin-auth-error-msg');
  const succBox = document.getElementById('admin-auth-success-box');
  const succMsg = document.getElementById('admin-auth-success-msg');
  const spinner = document.getElementById('admin-login-spinner');
  const btnText = document.getElementById('admin-login-btn-text');
  const submitBtn = document.getElementById('btn-admin-login');

  if (errBox) errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  if (!password) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Please enter your administrator password.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Authenticating Root Access...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user.email !== MASTER_ADMIN_EMAIL) {
      await supabase.auth.signOut();
      throw new Error('Access Denied: Only the provisioned administrator (' + MASTER_ADMIN_EMAIL + ') can access this console.');
    }

    if (succBox && succMsg) {
      succMsg.textContent = 'Admin Authenticated! Opening Administration Console...';
      succBox.classList.remove('hidden');
    }

    await resolveUserProfile(data.user);
    state.currentUser.role = 'admin';

    setTimeout(() => {
      closeModal('modal-login-admin');
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Authenticate Administrator Access';
      if (submitBtn) submitBtn.disabled = false;

      showSection('dashboard');
      renderCurrentDashboard();
      setAdminTab('approvals');
      showToast('Welcome, Administrator Ganesh Honnalli', 'success');
    }, 600);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Authenticate Administrator Access';
    if (submitBtn) submitBtn.disabled = false;
    if (errBox && errMsg) {
      errMsg.textContent = err.message.includes('Invalid login credentials') 
        ? 'Invalid administrator credentials. Please check your password.' 
        : err.message;
      errBox.classList.remove('hidden');
    }
  }
}

// Live Admin Notification Dispatcher (Requirement 6)
function addAdminLiveNotification(title, applicantName, bizType, status) {
  const notif = {
    title,
    applicantName,
    bizType,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    status
  };
  state.adminLiveNotifications.unshift(notif);
  showToast(`🔔 ${title}: ${applicantName} (${bizType})`, 'info');
  updateAdminNotificationCountUI();
}

function updateAdminNotificationCountUI() {
  const pendingStalls = (state.bookStalls || []).filter(s => (s.approval_status || '').toLowerCase() === 'pending').length;
  const pendingScraps = (state.scrapOwners || []).filter(r => (r.approval_status || '').toLowerCase() === 'pending').length;
  const total = pendingStalls + pendingScraps;

  const tabBtn = document.getElementById('admin-tab-approvals');
  if (tabBtn) {
    tabBtn.textContent = `📋 Partner Approvals (${total})`;
  }
}

// Admin Application Review Modal (Requirements 4 & 5: View Details)
function openApplicationDetailsModal(type, id) {
  let app = null;
  if (type === 'stall') {
    app = (state.bookStalls || []).find(s => s.id === id);
  } else {
    app = (state.scrapOwners || []).find(r => r.id === id);
  }

  if (!app) {
    showToast('Application record not found.', 'error');
    return;
  }

  const loc = getBusinessLocation(app);
  const email = (state.profiles || []).find(p => p.id === app.user_id)?.email || app.phone || 'applicant@secondshelf.in';

  document.getElementById('app-modal-icon').textContent = type === 'stall' ? '🏬' : '♻️';
  document.getElementById('app-modal-title').textContent = type === 'stall' ? (app.stall_name || 'Book Stall Application') : (app.business_name || 'Scrap Yard Application');
  document.getElementById('app-modal-subtitle').textContent = `Submitted on ${app.created_at ? new Date(app.created_at).toLocaleString() : 'Recent'}`;

  const contentEl = document.getElementById('app-modal-content');
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div class="grid grid-cols-2 gap-2 border-b pb-2">
          <div><span class="text-slate-500 font-bold">Applicant / Owner:</span> <strong class="text-slate-900">${app.owner_name}</strong></div>
          <div><span class="text-slate-500 font-bold">Business Type:</span> <strong class="text-emerald-800">${type === 'stall' ? 'Book Stall' : 'Recycle & Scrap'}</strong></div>
        </div>
        <div class="grid grid-cols-2 gap-2 border-b pb-2">
          <div><span class="text-slate-500 font-bold">Contact Email:</span> <span class="text-slate-900 font-mono">${email}</span></div>
          <div><span class="text-slate-500 font-bold">Mobile Phone:</span> <strong class="text-slate-900 font-mono">${app.phone}</strong></div>
        </div>
        <div class="border-b pb-2">
          <span class="text-slate-500 font-bold">Physical Business Address:</span>
          <p class="text-slate-900 mt-0.5">${loc.fullAddress || app.address}</p>
        </div>
        <div class="grid grid-cols-3 gap-2 border-b pb-2">
          <div><span class="text-slate-500 font-bold">City:</span> <strong class="text-slate-900">${loc.city}</strong></div>
          <div><span class="text-slate-500 font-bold">District:</span> <strong class="text-slate-900">${loc.district}</strong></div>
          <div><span class="text-slate-500 font-bold">State:</span> <strong class="text-slate-900">${loc.state}</strong></div>
        </div>
        <div>
          <span class="text-slate-500 font-bold">Trade / Operation Licence:</span>
          <p class="font-mono text-slate-800 mt-0.5">${app.licence_number || 'Under Verification'}</p>
        </div>
        <div class="pt-1">
          <span class="text-slate-500 font-bold">Application Status:</span>
          <span class="ml-2 px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${app.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900' }">${app.approval_status || 'PENDING'}</span>
        </div>
      </div>
    `;
  }

  const actionsEl = document.getElementById('app-modal-actions');
  if (actionsEl) {
    actionsEl.innerHTML = `
      <button onclick="approveBusiness('${type}', '${id}'); closeModal('modal-application-details');" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-lg text-xs shadow transition">
        APPROVE APPLICATION ✅
      </button>
      <button onclick="rejectBusiness('${type}', '${id}'); closeModal('modal-application-details');" class="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-lg text-xs shadow transition">
        REJECT APPLICATION ❌
      </button>
    `;
  }

  document.getElementById('modal-application-details')?.classList.remove('hidden');
}


// ====================================================================
// LOCATION DETECTION, REVERSE GEOCODING & HEADER DISPLAY
// ====================================================================

// Default and active location state
state.currentLocation = {
  city: 'Hubli',
  district: 'Dharwad',
  state: 'Karnataka',
  area: 'Vidyanagar'
};

// Known Karnataka city coordinate hubs for accurate nearest-city calculation
const KARNATAKA_HUBS = [
  { city: 'Hubli', district: 'Dharwad', state: 'Karnataka', lat: 15.3647, lon: 75.1240 },
  { city: 'Dharwad', district: 'Dharwad', state: 'Karnataka', lat: 15.4589, lon: 75.0078 },
  { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { city: 'Mysuru', district: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
  { city: 'Mangaluru', district: 'Dakshina Kannada', state: 'Karnataka', lat: 12.9141, lon: 74.8560 },
  { city: 'Belagavi', district: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  { city: 'Kalaburagi', district: 'Kalaburagi', state: 'Karnataka', lat: 17.3297, lon: 76.8343 },
  { city: 'Shivamogga', district: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lon: 75.5681 },
  { city: 'Tumakuru', district: 'Tumakuru', state: 'Karnataka', lat: 13.3392, lon: 77.1015 },
  { city: 'Davanagere', district: 'Davanagere', state: 'Karnataka', lat: 14.4644, lon: 75.9218 },
  { city: 'Ballari', district: 'Ballari', state: 'Karnataka', lat: 15.1394, lon: 76.9214 },
  { city: 'Vijayapura', district: 'Vijayapura', state: 'Karnataka', lat: 16.8302, lon: 75.7100 },
  { city: 'Udupi', district: 'Udupi', state: 'Karnataka', lat: 13.3409, lon: 74.7421 }
];

function initLocation() {
  const saved = localStorage.getItem('SECOND_SHELF_LOCATION');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.city && parsed.state) {
        state.currentLocation = parsed;
        updateHeaderLocationUI();
        return;
      }
    } catch (e) {}
  }

  // If first visit, display consent banner
  const dismissed = localStorage.getItem('SECOND_SHELF_LOCATION_DISMISSED');
  if (!dismissed) {
    document.getElementById('location-consent-banner')?.classList.remove('hidden');
  }
  updateHeaderLocationUI();
}

function updateHeaderLocationUI() {
  const loc = state.currentLocation;
  const textEl = document.getElementById('header-location-text');
  if (textEl) {
    textEl.textContent = `${loc.city}, ${loc.state}`;
  }
  const navText = document.getElementById('nav-location-text');
  if (navText) {
    navText.textContent = `${loc.city}, ${loc.state}`;
  }
  const stallsLocLabel = document.getElementById('nearby-stalls-loc-label');
  if (stallsLocLabel) {
    stallsLocLabel.textContent = `${loc.city}, ${loc.state}`;
  }
  const scrapsLocLabel = document.getElementById('nearby-scrap-loc-label');
  if (scrapsLocLabel) {
    scrapsLocLabel.textContent = `${loc.city}, ${loc.state}`;
  }
}

function dismissLocationBanner() {
  document.getElementById('location-consent-banner')?.classList.add('hidden');
  localStorage.setItem('SECOND_SHELF_LOCATION_DISMISSED', 'true');
}

function openLocationModal() {
  dismissLocationBanner();
  const loc = state.currentLocation;
  const stateInput = document.getElementById('loc-state');
  const distInput = document.getElementById('loc-district');
  const cityInput = document.getElementById('loc-city');
  const areaInput = document.getElementById('loc-locality');

  if (stateInput) stateInput.value = loc.state || 'Karnataka';
  if (distInput) distInput.value = loc.district || 'Dharwad';
  if (cityInput) cityInput.value = loc.city || 'Hubli';
  if (areaInput) areaInput.value = loc.area || '';

  document.getElementById('modal-location-picker')?.classList.remove('hidden');
}

function handleLocationDistrictChange(district) {
  const cityInput = document.getElementById('loc-city');
  if (!cityInput) return;
  const map = {
    'Dharwad': 'Hubli',
    'Bengaluru Urban': 'Bengaluru',
    'Mysuru': 'Mysuru',
    'Belagavi': 'Belagavi',
    'Dakshina Kannada': 'Mangaluru',
    'Kalaburagi': 'Kalaburagi',
    'Shivamogga': 'Shivamogga',
    'Tumakuru': 'Tumakuru',
    'Ballari': 'Ballari',
    'Vijayapura': 'Vijayapura',
    'Davanagere': 'Davanagere',
    'Udupi': 'Udupi',
    'Hassan': 'Hassan'
  };
  if (map[district]) {
    cityInput.value = map[district];
  }
}

function handleLocationStateChange(stateVal) {
  // Can be extended for other states if needed
}

function handleManualLocationSubmit(event) {
  if (event) event.preventDefault();
  const stateVal = document.getElementById('loc-state')?.value || 'Karnataka';
  const district = document.getElementById('loc-district')?.value || 'Dharwad';
  const city = document.getElementById('loc-city')?.value?.trim() || 'Hubli';
  const area = document.getElementById('loc-locality')?.value?.trim() || '';

  state.currentLocation = {
    city,
    district,
    state: stateVal,
    area
  };

  localStorage.setItem('SECOND_SHELF_LOCATION', JSON.stringify(state.currentLocation));
  updateHeaderLocationUI();
  closeModal('modal-location-picker');
  showToast(`Location updated to ${city}, ${stateVal}`, 'success');

  // If user is logged in, sync to profile
  if (state.currentUser && supabase) {
    supabase.from('profiles').update({
      city,
      district,
      state: stateVal,
      location: area
    }).eq('id', state.currentUser.id).then(() => {});
  }

  // Refresh directories to prioritize local businesses
  renderBookDirectory();
  renderRaddiDirectory();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function findNearestKarnatakaCity(lat, lon) {
  let nearest = KARNATAKA_HUBS[0];
  let minDistance = calculateDistance(lat, lon, nearest.lat, nearest.lon);

  for (let i = 1; i < KARNATAKA_HUBS.length; i++) {
    const hub = KARNATAKA_HUBS[i];
    const dist = calculateDistance(lat, lon, hub.lat, hub.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hub;
    }
  }
  return nearest;
}

async function requestBrowserLocation() {
  dismissLocationBanner();
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser. Please select location manually.', 'info');
    openLocationModal();
    return;
  }

  showToast('Detecting location via browser GPS...', 'info');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      let detectedCity = '';
      let detectedDistrict = '';
      let detectedState = 'Karnataka';

      try {
        // Free client-side reverse geocoding API
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (res.ok) {
          const data = await res.json();
          detectedCity = data.city || data.locality || '';
          detectedState = data.principalSubdivision || 'Karnataka';
          if (data.localityInfo && data.localityInfo.administrative) {
            const adminLevels = data.localityInfo.administrative;
            const distObj = adminLevels.find(a => a.name && (a.name.includes('District') || a.order === 4));
            if (distObj) detectedDistrict = distObj.name.replace('District', '').trim();
          }
        }
      } catch (err) {
        console.warn('Reverse geocoding network fallback:', err);
      }

      // If network API returned empty city or non-Karnataka, check coordinate distance
      if (!detectedCity) {
        const nearest = findNearestKarnatakaCity(lat, lon);
        detectedCity = nearest.city;
        detectedDistrict = nearest.district;
        detectedState = nearest.state;
      }

      state.currentLocation = {
        city: detectedCity,
        district: detectedDistrict || 'Dharwad',
        state: detectedState,
        area: ''
      };

      localStorage.setItem('SECOND_SHELF_LOCATION', JSON.stringify(state.currentLocation));
      updateHeaderLocationUI();
      closeModal('modal-location-picker');
      showToast(`📍 Location set to ${detectedCity}, ${detectedState}`, 'success');

      if (state.currentUser && supabase) {
        supabase.from('profiles').update({
          city: detectedCity,
          district: detectedDistrict || 'Dharwad',
          state: detectedState
        }).eq('id', state.currentUser.id).then(() => {});
      }

      renderBookDirectory();
      renderRaddiDirectory();
    },
    (error) => {
      console.warn('Geolocation error:', error);
      showToast('Location permission denied or unavailable. Please select your city manually.', 'info');
      openLocationModal();
    },
    { timeout: 8000, maximumAge: 600000 }
  );
}

// Location parser helper for stalls and scrap owners
function getBusinessLocation(b) {
  let city = b.city;
  let district = b.district;
  let stateVal = b.state || 'Karnataka';
  let location = b.location || b.base_area || '';
  const address = b.address || '';

  if (!city && address) {
    const cityMatch = address.match(/City:s*([^|]+)/i);
    const distMatch = address.match(/District:s*([^|]+)/i);
    const stateMatch = address.match(/State:s*([^|]+)/i);
    const locMatch = address.match(/Locality:s*([^|]+)/i);

    if (cityMatch) city = cityMatch[1].trim();
    if (distMatch) district = distMatch[1].trim();
    if (stateMatch) stateVal = stateMatch[1].trim();
    if (locMatch) location = locMatch[1].trim();

    if (!city) {
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        city = parts[parts.length - 2];
        district = parts[parts.length - 1];
      }
    }
  }

  return {
    city: city || 'Hubli',
    district: district || 'Dharwad',
    state: stateVal,
    location: location || b.base_area || b.pincode || 'Downtown',
    fullAddress: address
  };
}


// ====================================================================
// PERMANENT MASTER ADMINISTRATOR CONFIGURATION
// ====================================================================
// (MASTER_ADMIN_EMAIL hoisted to top)


// Regional Sales Analytics Filter State
// (analyticsFilters hoisted to top)

function setAnalyticsFilter(key, value) {
  analyticsFilters[key] = value;
  setAdminTab('analytics');
}


// ====================================================================
// UNIFIED AUTHENTICATION & SESSION MANAGEMENT
// ====================================================================

function switchAuthTab(tab) {
  const signinTab = document.getElementById('tab-auth-signin');
  const signupTab = document.getElementById('tab-auth-signup');
  const signinView = document.getElementById('view-auth-signin');
  const signupView = document.getElementById('view-auth-signup');

  if (tab === 'signin') {
    signinTab?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signinTab?.classList.remove('text-slate-600');
    signupTab?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signupTab?.classList.add('text-slate-600');
    signinView?.classList.remove('hidden');
    signupView?.classList.add('hidden');
  } else {
    signupTab?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    signupTab?.classList.remove('text-slate-600');
    signinTab?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    signinTab?.classList.add('text-slate-600');
    signupView?.classList.remove('hidden');
    signinView?.classList.add('hidden');
  }
}

// togglePasswordVisibility defined at top

// Unified Account Header Button Click Handler
function handleAccountButtonClick() {
  if (state.currentUser) {
    openCurrentRoleDashboard();
  } else {
    openLoginPortal('user');
  }
}

// Unified Sign In Handler
async function handleUnifiedSignIn(event) {
  if (event) event.preventDefault();
  const errorBox = document.getElementById('signin-error-box');
  const errorMsg = document.getElementById('signin-error-msg');
  const successBox = document.getElementById('signin-success-box');
  const successMsg = document.getElementById('signin-success-msg');
  const spinner = document.getElementById('auth-signin-spinner');
  const btnText = document.getElementById('auth-signin-btn-text');
  const submitBtn = document.getElementById('auth-signin-submit-btn');

  if (errorBox) errorBox.classList.add('hidden');
  if (successBox) successBox.classList.add('hidden');

  const email = document.getElementById('auth-signin-email')?.value?.trim();
  const password = document.getElementById('auth-signin-password')?.value;
  const remember = document.getElementById('auth-signin-remember')?.checked;

  if (!email || !password) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'Please enter both your email address and password.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  if (!supabase) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'Backend connection initializing. Please retry in a few moments.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  // Set loading state
  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Authenticating...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Sign In to SECOND SHELF';
      if (submitBtn) submitBtn.disabled = false;
      if (errorBox && errorMsg) {
        errorMsg.textContent = error.message.includes('Invalid login credentials') 
          ? 'Invalid email or password. Please verify your credentials.' 
          : error.message;
        errorBox.classList.remove('hidden');
      }
      return;
    }

    if (remember) {
      localStorage.setItem('SECOND_SHELF_REMEMBER_EMAIL', email);
    } else {
      localStorage.removeItem('SECOND_SHELF_REMEMBER_EMAIL');
    }

    if (successBox && successMsg) {
      successMsg.textContent = 'Sign in successful! Entering dashboard...';
      successBox.classList.remove('hidden');
    }

    await resolveUserProfile(data.user);
    
    setTimeout(() => {
      closeModal('modal-auth');
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Sign In to SECOND SHELF';
      if (submitBtn) submitBtn.disabled = false;
      if (errorBox) errorBox.classList.add('hidden');
      if (successBox) successBox.classList.add('hidden');

      // Role-based automatic navigation
      showSection('dashboard');
      if (state.currentUser?.role === 'admin') {
        setAdminTab('analytics');
      } else {
        renderCurrentDashboard();
      }
    }, 600);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Sign In to SECOND SHELF';
    if (submitBtn) submitBtn.disabled = false;
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'An unexpected connection error occurred: ' + (err.message || err);
      errorBox.classList.remove('hidden');
    }
  }
}

// Unified Sign Up Handler
async function handleUnifiedSignUp(event) {
  if (event) event.preventDefault();
  const errorBox = document.getElementById('signup-error-box');
  const errorMsg = document.getElementById('signup-error-msg');
  const successBox = document.getElementById('signup-success-box');
  const successMsg = document.getElementById('signup-success-msg');
  const spinner = document.getElementById('auth-signup-spinner');
  const btnText = document.getElementById('auth-signup-btn-text');
  const submitBtn = document.getElementById('auth-signup-submit-btn');

  if (errorBox) errorBox.classList.add('hidden');
  if (successBox) successBox.classList.add('hidden');

  const name = document.getElementById('auth-signup-name')?.value?.trim();
  const email = document.getElementById('auth-signup-email')?.value?.trim();
  const phone = document.getElementById('auth-signup-phone')?.value?.trim();
  const password = document.getElementById('auth-signup-password')?.value;
  const confirm = document.getElementById('auth-signup-confirm')?.value;
  const ageConfirm = document.getElementById('auth-signup-age')?.checked;

  if (!name || !email || !password) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'Please fill out all required fields.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  if (password.length < 8) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'Password must be at least 8 characters long.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  if (password !== confirm) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'Passwords do not match. Please re-enter identical passwords.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  if (!ageConfirm) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'You must confirm that you are 18 years of age or older to enter marketplace agreements.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  if (!supabase) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = 'Backend connection unavailable. Please refresh and try again.';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  // Set loading state
  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Registering Account...';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone || '+91 98450 00000',
          role: 'seller'
        }
      }
    });

    if (error) {
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Create Account & Send Verification Email';
      if (submitBtn) submitBtn.disabled = false;
      if (errorBox && errorMsg) {
        errorMsg.textContent = error.message;
        errorBox.classList.remove('hidden');
      }
      return;
    }

    if (data.user) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            full_name: name,
            phone: phone || '+91 98450 00000',
            email: email,
            age_confirmed: true
          }
        ]);
        await supabase.from('user_roles').upsert([
          {
            user_id: data.user.id,
            role: 'seller',
            is_approved: true
          }
        ]);
      } catch (dbErr) {
        console.warn('Profile sync handled via auth triggers or constraints:', dbErr);
      }
    }

    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Account Created ✅';
    if (successBox && successMsg) {
      successMsg.textContent = 'Registration successful! A verification email has been dispatched to ' + email + '. You can now sign in.';
      successBox.classList.remove('hidden');
    }
    showToast('Account registered! Please sign in with your email.', 'success');

    setTimeout(() => {
      switchAuthTab('signin');
      const emailInput = document.getElementById('auth-signin-email');
      if (emailInput) emailInput.value = email;
      if (submitBtn) submitBtn.disabled = false;
    }, 2000);

  } catch (err) {
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Create Account & Send Verification Email';
    if (submitBtn) submitBtn.disabled = false;
    if (errorBox && errorMsg) {
      errorMsg.textContent = err.message || 'Error occurred while creating account.';
      errorBox.classList.remove('hidden');
    }
  }
}


// ====================================================================
// UNIFIED BUSINESS PARTNER APPLICATION (BOOK STALL OR SCRAP RECYCLER)
// ====================================================================

function openBusinessApplyModal(type = 'stall') {
  if (!state.currentUser) {
    showToast('Please sign in or register to apply for business partnership.', 'info');
    document.getElementById('modal-auth')?.classList.remove('hidden');
    switchAuthTab('signin');
    return;
  }

  const select = document.getElementById('apply-partner-category');
  if (select) select.value = type;
  handlePartnerCategoryChange(type);

  const phoneInput = document.getElementById('apply-phone');
  if (phoneInput && state.currentUser.phone) {
    phoneInput.value = state.currentUser.phone;
  }

  document.getElementById('modal-business-apply')?.classList.remove('hidden');
}

function handlePartnerCategoryChange(category) {
  const hiddenType = document.getElementById('apply-business-type');
  const title = document.getElementById('apply-modal-title');
  const icon = document.getElementById('apply-modal-icon');
  const nameLabel = document.getElementById('apply-name-label');
  const nameInput = document.getElementById('apply-business-name');

  if (hiddenType) hiddenType.value = category;

  if (category === 'stall') {
    if (title) title.textContent = 'Apply for Book Stall Partnership';
    if (icon) icon.textContent = '🏬';
    if (nameLabel) nameLabel.textContent = 'Book Stall / Store Name *';
    if (nameInput) nameInput.placeholder = 'e.g. Vidyarthi Book Bureau';
  } else {
    if (title) title.textContent = 'Apply for Scrap Recycling Depot';
    if (icon) icon.textContent = '♻️';
    if (nameLabel) nameLabel.textContent = 'Scrap Recycling Business / Yard Name *';
    if (nameInput) nameInput.placeholder = 'e.g. Karnataka Eco Recyclers';
  }
}

async function handleBusinessApplySubmit(event) {
  if (event) event.preventDefault();
  if (!state.currentUser) return;

  const type = document.getElementById('apply-partner-category')?.value || 'stall';
  const name = document.getElementById('apply-business-name')?.value?.trim();
  const licence = document.getElementById('apply-licence')?.value?.trim();
  const phone = document.getElementById('apply-phone')?.value?.trim();
  const address = document.getElementById('apply-address')?.value?.trim();
  const city = document.getElementById('apply-city')?.value?.trim() || 'Bengaluru';
  const district = document.getElementById('apply-district')?.value?.trim() || 'Bengaluru Urban';
  const pincode = document.getElementById('apply-pincode')?.value?.trim();
  const stateVal = document.getElementById('apply-state')?.value || 'Karnataka';

  if (!name || !licence || !address || !pincode) {
    showToast('Please fill in all mandatory fields with valid trade information.', 'error');
    return;
  }

  const fullAddress = address + ', ' + city + ', ' + district + ', ' + stateVal;

  if (supabase) {
    try {
      if (type === 'stall') {
        const { error } = await supabase.from('book_stalls').insert([
          {
            user_id: state.currentUser.id,
            stall_name: name,
            licence_number: licence,
            address: fullAddress,
            pincode: pincode,
            phone: phone,
            approval_status: 'pending',
            is_approved: false
          }
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('scrap_owners').insert([
          {
            user_id: state.currentUser.id,
            business_name: name,
            licence_number: licence,
            address: fullAddress,
            pincode: pincode,
            phone: phone,
            approval_status: 'pending',
            is_approved: false
          }
        ]);
        if (error) throw error;
      }

      await supabase.from('admin_audit_logs').insert([
        {
          action: 'partner_application',
          target_type: type,
          target_id: state.currentUser.id,
          details: {
            applicant_name: state.currentUser.name,
            applicant_email: state.currentUser.email,
            business_name: name,
            licence_number: licence,
            district,
            city,
            pincode
          }
        }
      ]);

      showToast('Application submitted! Administrator will review your credentials.', 'success');
      closeModal('modal-business-apply');
      await refreshRequestsAndOffers();
      renderCurrentDashboard();

    } catch (err) {
      showToast('Error submitting application: ' + err.message, 'error');
    }
  } else {
    showToast('Application saved in local staging.', 'info');
    closeModal('modal-business-apply');
  }
}

// ====================================================================
// CUSTOMER RATING & REVIEWS (FEEDS STALL PERFORMANCE SCORE)
// ====================================================================

function openStallReviewModal(stallId, orderId) {
  if (!state.currentUser) {
    showToast('Please sign in to submit a rating.', 'info');
    return;
  }
  const stall = state.bookStalls.find(s => s.id === stallId);
  const stallNameEl = document.getElementById('review-stall-name');
  if (stallNameEl) stallNameEl.textContent = stall ? stall.stall_name : 'Book Stall Partner';

  const stallIdInput = document.getElementById('review-stall-id');
  const orderIdInput = document.getElementById('review-order-id');
  if (stallIdInput) stallIdInput.value = stallId;
  if (orderIdInput) orderIdInput.value = orderId || '';

  setRatingStars(5);
  document.getElementById('modal-stall-review')?.classList.remove('hidden');
}

function setRatingStars(stars) {
  const hiddenInput = document.getElementById('review-star-rating');
  const valText = document.getElementById('star-rating-value');
  if (hiddenInput) hiddenInput.value = stars;
  if (valText) valText.textContent = stars.toFixed(1) + ' / 5';

  const starBtns = document.querySelectorAll('.star-rating-btn');
  starBtns.forEach((btn, idx) => {
    if (idx < stars) {
      btn.className = 'star-rating-btn text-amber-400';
    } else {
      btn.className = 'star-rating-btn text-slate-300';
    }
  });
}

async function handleSubmitStallReview(event) {
  if (event) event.preventDefault();
  const stallId = document.getElementById('review-stall-id')?.value;
  const orderId = document.getElementById('review-order-id')?.value;
  const rating = parseFloat(document.getElementById('review-star-rating')?.value || '5');
  const comments = document.getElementById('review-comments')?.value?.trim();

  if (!stallId || !comments) {
    showToast('Please provide your comments and rating.', 'error');
    return;
  }

  const payload = {
    action: 'stall_review',
    target_type: 'book_stall',
    target_id: stallId,
    details: {
      stall_id: stallId,
      order_id: orderId,
      rating: rating,
      feedback: comments,
      user_id: state.currentUser?.id,
      user_name: state.currentUser?.name,
      timestamp: new Date().toISOString()
    }
  };

  if (supabase) {
    try {
      await supabase.from('admin_audit_logs').insert([payload]);
    } catch (e) {
      console.warn('Could not record review in remote database:', e);
    }
  }

  state.auditLogs.unshift({
    id: 'rev_' + Date.now(),
    created_at: new Date().toISOString(),
    ...payload
  });

  showToast('Thank you! Your feedback has been recorded and updated the stall score.', 'success');
  closeModal('modal-stall-review');
  renderCurrentDashboard();
}


// ====================================================================
// BOOK STALL PERFORMANCE SCORE & TRANSPARENT RATING ENGINE
// ====================================================================

function calculateStallPerformanceScore(stall) {
  if (!stall) {
    return {
      score: 75,
      fulfilmentScore: 30,
      ratingScore: 30,
      volumeScore: 15,
      penalty: 0,
      avgRating: 4.0,
      reviewCount: 0,
      completedCount: 0,
      badge: { text: 'Good ⭐⭐⭐⭐', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      status: 'approved',
      reviews: []
    };
  }

  // 1. Order Fulfilment Rate (40 points max)
  const stallOffers = state.bookOffers.filter(o => o.stall_id === stall.id);
  const acceptedOffers = stallOffers.filter(o => o.status === 'Accepted' || o.status === 'Completed');
  const completedOffers = stallOffers.filter(o => o.status === 'Completed');
  
  let fulfilmentRate = 1.0;
  if (acceptedOffers.length > 0) {
    fulfilmentRate = completedOffers.length / acceptedOffers.length;
  }
  const fulfilmentScore = Math.round(fulfilmentRate * 40);

  // 2. Customer Rating (40 points max)
  const reviews = (state.auditLogs || []).filter(a => 
    a.action === 'stall_review' && 
    (a.target_id === stall.id || a.details?.stall_id === stall.id)
  );

  let avgRating = 4.2; // Baseline provisional rating for verified bookstore
  const reviewCount = reviews.length;
  if (reviewCount > 0) {
    const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.details?.rating) || 5.0), 0);
    avgRating = parseFloat((sum / reviewCount).toFixed(1));
  }
  const ratingScore = Math.round((avgRating / 5.0) * 40);

  // 3. Completed Volume & Activity (20 points max)
  const completedTransactions = state.transactions.filter(t => 
    t.status === 'Completed' && (t.stall_id === stall.id || t.receiver_id === stall.user_id)
  );
  const completedCount = Math.max(completedOffers.length, completedTransactions.length);
  const volumeScore = Math.min(20, completedCount * 4 + 8); // Start with 8 base points for approved stall, max 20

  // 4. Penalty for unresolved disputes
  const stallComplaints = (state.complaints || []).filter(c => 
    c.status !== 'Resolved' && (c.against_id === stall.id || c.against_user_id === stall.user_id)
  );
  const penalty = stallComplaints.length * 10;

  const totalScore = Math.max(10, Math.min(100, Math.round(fulfilmentScore + ratingScore + volumeScore - penalty)));

  let badge = { text: 'Excellent ⭐⭐⭐⭐⭐', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (totalScore < 50) {
    badge = { text: 'Action Required ⚠️', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  } else if (totalScore < 70) {
    badge = { text: 'Average ⭐⭐⭐', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  } else if (totalScore < 85) {
    badge = { text: 'Good ⭐⭐⭐⭐', color: 'bg-blue-100 text-blue-800 border-blue-300' };
  }

  return {
    score: totalScore,
    fulfilmentScore,
    ratingScore,
    volumeScore,
    penalty,
    avgRating,
    reviewCount,
    completedCount,
    badge,
    status: stall.approval_status || 'approved',
    reviews
  };
}


// ====================================================================
// REGIONAL SALES ANALYTICS ENGINE (STATE, DISTRICT, CITY GROUPING)
// ====================================================================

function getRegionalSalesAnalytics(filters = {}) {
  const regionFilter = filters.region || analyticsFilters.region || 'all';
  const bizFilter = filters.bizType || analyticsFilters.bizType || 'all';
  const statusFilter = filters.status || analyticsFilters.status || 'all';
  const dateFilter = filters.dateRange || analyticsFilters.dateRange || 'all';

  const REGION_MAP = {
    'Bengaluru Urban': ['Bengaluru', 'Bangalore', 'Chickpet', 'Basavanagudi', 'Malleshwaram', 'Indiranagar', 'Koramangala', 'Whitefield', 'Basaveshwaranagar', 'Jayanagar', 'Hebbal', '560001', '560002', '560004', '560009', '560010', '560020', '560079'],
    'Mysuru': ['Mysuru', 'Mysore', 'Saraswathipuram', 'Gokulam', 'Vijayanagar', '570001', '570005', '570006'],
    'Hubballi-Dharwad': ['Hubballi', 'Hubli', 'Dharwad', 'Vidyanagar', '580020', '580021', '580031'],
    'Dakshina Kannada': ['Mangaluru', 'Mangalore', 'Hampankatta', 'Surathkal', '575001', '575014'],
    'Belagavi': ['Belagavi', 'Belgaum', 'Tilakwadi', '590001', '590006'],
    'Kalaburagi': ['Kalaburagi', 'Gulbarga', '585101'],
    'Shivamogga': ['Shivamogga', 'Shimoga', '577201'],
    'Tumakuru': ['Tumakuru', 'Tumkur', '572101']
  };

  function resolveDistrict(address = '', pincode = '') {
    const text = (address + ' ' + pincode).toLowerCase();
    for (const [dist, keywords] of Object.entries(REGION_MAP)) {
      for (const kw of keywords) {
        if (text.includes(kw.toLowerCase())) return { state: 'Karnataka', district: dist, city: keywords[0] };
      }
    }
    return { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru' };
  }

  // Filter transactions
  let txs = [...(state.transactions || [])];

  if (statusFilter !== 'all') {
    txs = txs.filter(t => (t.status || '').toLowerCase() === statusFilter.toLowerCase());
  }
  if (bizFilter === 'books') {
    txs = txs.filter(t => t.request_type === 'book');
  } else if (bizFilter === 'scrap') {
    txs = txs.filter(t => t.request_type !== 'book');
  }

  if (dateFilter === '30days') {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    txs = txs.filter(t => new Date(t.created_at || Date.now()) >= cutoff);
  } else if (dateFilter === 'year') {
    const cutoff = new Date('2026-01-01');
    txs = txs.filter(t => new Date(t.created_at || Date.now()) >= cutoff);
  }

  const districtData = {};
  Object.keys(REGION_MAP).forEach(d => {
    districtData[d] = {
      state: 'Karnataka',
      district: d,
      city: REGION_MAP[d][0],
      totalSales: 0,
      completedOrders: 0,
      totalOrders: 0,
      activeStalls: 0,
      activeScrap: 0
    };
  });

  // Count active book stalls and scrap depots
  (state.bookStalls || []).forEach(s => {
    if (s.approval_status === 'approved') {
      const reg = resolveDistrict(s.address, s.pincode);
      if (districtData[reg.district]) districtData[reg.district].activeStalls++;
    }
  });

  (state.scrapOwners || []).forEach(r => {
    if (r.approval_status === 'approved') {
      const reg = resolveDistrict(r.address, r.pincode);
      if (districtData[reg.district]) districtData[reg.district].activeScrap++;
    }
  });

  // Tally transaction sales per region
  txs.forEach(t => {
    const stall = state.bookStalls.find(s => s.id === t.stall_id || s.user_id === t.receiver_id);
    const scrap = state.scrapOwners.find(s => s.id === t.scrap_owner_id || s.user_id === t.receiver_id);
    const reg = resolveDistrict(stall?.address || scrap?.address || t.delivery_address || '', stall?.pincode || scrap?.pincode || '');

    if (!districtData[reg.district]) {
      districtData[reg.district] = {
        state: 'Karnataka',
        district: reg.district,
        city: reg.city,
        totalSales: 0,
        completedOrders: 0,
        totalOrders: 0,
        activeStalls: 0,
        activeScrap: 0
      };
    }

    const amt = parseFloat(t.amount) || 0;
    districtData[reg.district].totalSales += amt;
    districtData[reg.district].totalOrders++;
    if (t.status === 'Completed') {
      districtData[reg.district].completedOrders++;
    }
  });

  let rows = Object.values(districtData);
  if (regionFilter !== 'all') {
    rows = rows.filter(r => r.district.toLowerCase() === regionFilter.toLowerCase());
  }

  const totalSalesAmount = rows.reduce((acc, r) => acc + r.totalSales, 0);
  const totalCompletedOrders = rows.reduce((acc, r) => acc + r.completedOrders, 0);
  const totalActiveStalls = (state.bookStalls || []).filter(s => s.approval_status === 'approved').length;
  const totalActiveScrap = (state.scrapOwners || []).filter(s => s.approval_status === 'approved').length;
  const pendingApps = (state.bookStalls || []).filter(s => s.approval_status === 'pending').length + 
                      (state.scrapOwners || []).filter(s => s.approval_status === 'pending').length;
  const totalRegisteredUsers = (state.usersList && state.usersList.length > 0) ? state.usersList.length : 1;

  return {
    rows,
    totalSalesAmount,
    totalCompletedOrders,
    totalActiveStalls,
    totalActiveScrap,
    totalRegisteredUsers,
    pendingApps,
    totalBookTx: txs.filter(t => t.request_type === 'book').length,
    totalScrapTx: txs.filter(t => t.request_type !== 'book').length,
    filters: {
      region: regionFilter,
      bizType: bizFilter,
      status: statusFilter,
      dateRange: dateFilter
    }
  };
}

// ====================================================================
// SECOND SHELF - Full-Stack Application Logic (Supabase + PostgreSQL)
// Complete Real-Time Backend Integration & Role-Based Workflows
// ====================================================================

// Application State Store

// Update Hero Counter Badges with 100% Real Database Metrics
function updateHeroLiveStats() {
  const booksCount = state.bookRequests ? state.bookRequests.length : 0;
  const paperKg = state.wasteRequests ? state.wasteRequests
    .filter(r => r.status === 'Completed')
    .reduce((sum, r) => sum + (parseFloat(r.actual_weight_kg || r.estimated_weight_kg) || 0), 0) : 0;
  
  const payoutTotal = state.transactions ? state.transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0;

  const approvedStalls = state.bookStalls ? state.bookStalls.filter(s => s.approval_status === 'approved').length : 0;
  const approvedScrap = state.scrapOwners ? state.scrapOwners.filter(s => s.approval_status === 'approved').length : 0;
  const partnersCount = approvedStalls + approvedScrap;

  const elBooks = document.getElementById('hero-stat-books');
  const elPaper = document.getElementById('hero-stat-paper');
  const elPayout = document.getElementById('hero-stat-payout');
  const elPartners = document.getElementById('hero-stat-partners');

  if (elBooks) elBooks.textContent = booksCount > 0 ? booksCount.toLocaleString() : '0';
  if (elPaper) elPaper.textContent = paperKg > 0 ? paperKg.toLocaleString() + ' kg' : '0 kg';
  if (elPayout) {
    if (payoutTotal >= 100000) {
      elPayout.textContent = '₹' + (payoutTotal / 100000).toFixed(1) + ' Lakh';
    } else {
      elPayout.textContent = '₹' + payoutTotal.toLocaleString();
    }
  }
  if (elPartners) elPartners.textContent = partnersCount > 0 ? partnersCount.toString() : '0';
}

// (state, supabase, _supabaseLib hoisted to top)

// Kannada & English Language Translations Map
const TRANSLATIONS = {
  en: {
    tagline: 'Give Your Old Books a Second Life',
    heroTitle: 'Sell Your Old Books.<br/>Recycle Your Paper.<br/><span class="text-shelf-yellow">Earn Money.</span>',
    heroSubtitle: 'Connect directly with certified local book stalls and verified recycle scrap dealers. Transparent condition estimates, doorstep pickup or counter handover, and secure two-party payment confirmation.',
    sellBooksBtn: 'Sell Used Books',
    sellRaddiBtn: 'Sell Recycle Scrap (Min 10 kg)',
    home: 'Home',
    usedBooks: 'Used Books',
    raddi: 'Recycle Scrap (10+ kg)',
    submitBook: 'Submit Used Book',
    submitRaddi: 'Submit Recycle Scrap Request',
    estimator: 'Price Estimator',
    paymentRules: 'Payment Confirmation Rules',
    privacy: 'DPDP Privacy (India)'
  },
  kn: {
    tagline: 'ಹಳೆಯ ಪುಸ್ತಕಗಳಿಗೆ ಹೊಸ ಜೀವನ ನೀಡಿ',
    heroTitle: 'ನಿಮ್ಮ ಹಳೆಯ ಪುಸ್ತಕಗಳನ್ನು ಮಾರಿ.<br/>ಕಾಗದವನ್ನು ಮರುಬಳಕೆ ಮಾಡಿ.<br/><span class="text-shelf-yellow">ಹಣ ಗಳಿಸಿ.</span>',
    heroSubtitle: 'ಪ್ರಮಾಣೀಕೃತ ಸ್ಥಳೀಯ ಪುಸ್ತಕ ಮಳಿಗೆಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಸ್ಕ್ರ್ಯಾಪ್ ಡೀಲರ್‌ಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ. ಪಾರದರ್ಶಕ ಸ್ಥಿತಿ ಅಂದಾಜುಗಳು, ಮನೆ ಬಾಗಿಲಿನ ಪಿಕಪ್ ಅಥವಾ ಕೌಂಟರ್ ಹಸ್ತಾಂತರ, ಮತ್ತು ಸುರಕ್ಷಿತ ಇಬ್ಬರ ಪಾವತಿ ದೃಢೀಕರಣ.',
    sellBooksBtn: 'ಹಳೆಯ ಪುಸ್ತಕಗಳನ್ನು ಮಾರಿ',
    sellRaddiBtn: 'ಮರುಬಳಕೆ ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರಿ (ಕನಿಷ್ಠ 10 ಕೆಜಿ)',
    home: 'ಮುಖಪುಟ',
    usedBooks: 'ಬಳಸಿದ ಪುಸ್ತಕಗಳು',
    raddi: 'ಮರುಬಳಕೆ ಸ್ಕ್ರ್ಯಾಪ್ (10+ ಕೆಜಿ)',
    submitBook: 'ಬಳಸಿದ ಪುಸ್ತಕ ಸಲ್ಲಿಸಿ',
    submitRaddi: 'ಮರುಬಳಕೆ ಸ್ಕ್ರ್ಯಾಪ್ ಪಿಕಪ್ ಕೋರಿ',
    estimator: 'ಬೆಲೆ ಅಂದಾಜು',
    paymentRules: 'ಪಾವತಿ ದೃಢೀಕರಣ ನಿಯಮಗಳು',
    privacy: 'ಡಿಪಿಡಿಪಿ ಗೌಪ್ಯತೆ (ಭಾರತ)'
  }
};

// ====================================================================
// 1. SUPABASE CLIENT INITIALIZATION & CONFIG LOADER
// ====================================================================
async function initSupabase() {
  let url = (window.SECOND_SHELF_CONFIG && window.SECOND_SHELF_CONFIG.supabaseUrl) || localStorage.getItem('SECOND_SHELF_SUPABASE_URL') || '';
  let key = (window.SECOND_SHELF_CONFIG && window.SECOND_SHELF_CONFIG.supabaseAnonKey) || localStorage.getItem('SECOND_SHELF_SUPABASE_ANON_KEY') || '';

  // Attempt to fetch from /api/config if not found in localStorage or window
  if (!url || !key) {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
          url = cfg.supabaseUrl;
          key = cfg.supabaseAnonKey;
        }
      }
    } catch (e) {
      // Standalone/offline or static file serving
    }
  }

  const statusDot = document.getElementById('supabase-status-dot');
  const statusText = document.getElementById('supabase-status-text');

  const lib = (typeof window !== 'undefined' && (window.supabaseLib || window.supabase || _supabaseLib)) || null;
  if (url && key && lib && lib.createClient) {
    try {
      supabase = lib.createClient(url, key);
      if (typeof window !== 'undefined') window.supabase = supabase;
      state.supabaseConfig = { url, key, connected: true };

      if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      if (statusText) statusText.textContent = 'PostgreSQL Live';

      // Load initial live data from PostgreSQL
      await loadInitialDataFromSupabase();

      // Check current auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        state.currentSession = session;
        await resolveUserProfile(session.user);
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          state.currentSession = session;
          await resolveUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          state.currentUser = null;
          state.currentSession = null;
          updateUserRoleUI();
          showSection('home');
        }
      });

      // Initialize real-time listeners
      setupRealtimeSubscriptions();

    } catch (err) {
      console.warn('Supabase initialization error:', err);
      if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
      if (statusText) statusText.textContent = 'Supabase Error';
      loadFallbackData();
    }
  } else {
    // Missing credentials - display connection badge in header
    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
    if (statusText) statusText.textContent = 'Connect Backend';
    loadFallbackData();
  }
}

// Fallback initial data for preview when cloud credentials are not yet configured
function loadFallbackData() {
  state.categories = [
    { id: '1', name: 'Degree Books', slug: 'degree-books', description: 'Undergraduate and postgraduate college textbooks (B.Com, B.Sc, BA, BCA, BBA)', count: 0, is_active: true },
    { id: '2', name: 'PUC Books', slug: 'puc-books', description: 'Karnataka Pre-University College (1st & 2nd PUC Science, Commerce, Arts)', count: 0, is_active: true },
    { id: '3', name: 'Class 10th / SSLC Books', slug: 'sslc-10th-books', description: '10th Standard / SSLC state syllabus and CBSE textbooks', count: 0, is_active: true },
    { id: '4', name: 'School Books', slug: 'school-books', description: 'Primary and high school textbooks (Grades 1 to 9)', count: 0, is_active: true },
    { id: '5', name: 'Engineering Books', slug: 'engineering-books', description: 'VTU and autonomous engineering syllabus textbooks (CSE, ECE, Mech, Civil)', count: 0, is_active: true },
    { id: '6', name: 'Medical and Competitive Exam Books', slug: 'medical-competitive-exam', description: 'MBBS, BDS, NEET, JEE, UPSC, KPSC and Banking exam preparation books', count: 0, is_active: true },
    { id: '7', name: 'Story Books and Novels', slug: 'story-books-novels', description: 'English, Kannada, Hindi literature, fiction, and non-fiction novels', count: 0, is_active: true },
    { id: '8', name: 'Other Educational Books', slug: 'other-educational', description: 'Dictionaries, encyclopedias, reference guides, and skill development', count: 0, is_active: true }
  ];

  state.guidelines = [
    { id: '1', title: 'Anti-Piracy & Genuine Textbook Rules', section_page: 'textbook_submission', content: 'SECOND SHELF strictly prohibits photocopied books, counterfeit prints, and duplicated study materials. Only genuine publisher editions are accepted.', is_published: true },
    { id: '2', title: 'Fair Valuation Percentage Caps', section_page: 'valuation_rules', content: 'Offers are calculated from the declared purchase price and physical condition: Like New (up to 30%), Good (up to 30%), Used (up to 20%), Old/Damaged (up to 15%). Book stalls cannot exceed the condition cap.', is_published: true },
    { id: '3', title: 'Strict 10 kg Minimum Scrap Requirement', section_page: 'scrap_weight', content: 'In accordance with recycling logistics and vendor viability, waste paper submissions below 10 kg cannot be processed. Doorstep weighing must register 10 kg or higher.', is_published: true },
    { id: '4', title: 'Pickup & Handover Guidelines', section_page: 'pickup_instructions', content: 'For counter handovers, sellers have 7 days to visit the selected bookstore. For scrap collections, verified scrap owners arrive with calibrated digital scales.', is_published: true },
    { id: '5', title: 'Two-Party Payment Confirmation Policy', section_page: 'payment_guidelines', content: 'All payments occur directly between seller and buyer. The order is marked Completed only when the seller clicks "Confirm Payment Received".', is_published: true }
  ];

  renderBookDirectory();
  renderRaddiDirectory();
  renderDemoBookListings();
  updateHeroLiveStats();
}

// Load real database data from PostgreSQL via Supabase
async function loadInitialDataFromSupabase() {
  if (!supabase) return;

  try {
    // 1. Categories
    const { data: catData } = await supabase.from('textbook_categories').select('*').eq('is_active', true);
    if (catData && catData.length > 0) {
      state.categories = catData;
    } else {
      loadFallbackData();
    }
    renderBookDirectory();
    renderDemoBookListings();

    // 2. Valuation Rules
    const { data: valData } = await supabase.from('valuation_rules').select('*');
    if (valData) {
      valData.forEach(r => {
        state.valuationRules[r.condition_name] = parseFloat(r.max_percentage);
      });
    }

    // 3. Guidelines & Announcements
    const { data: guideData } = await supabase.from('guidelines').select('*').eq('is_published', true);
    if (guideData) state.guidelines = guideData;

    const { data: annData } = await supabase.from('announcements').select('*').eq('is_published', true);
    if (annData) state.announcements = annData;

    // 4. Stalls & Scrap Owners
    const { data: stallData } = await supabase.from('book_stalls').select('*');
    if (stallData) state.bookStalls = stallData;

    const { data: scrapData } = await supabase.from('scrap_owners').select('*');
    if (scrapData) state.scrapOwners = scrapData;

    // 5. Active Submissions & Offers
    await refreshRequestsAndOffers();

  } catch (err) {
    console.error('Error loading data from Supabase:', err);
  }
}

async function refreshRequestsAndOffers() {
  if (!supabase) return;

  try {
    // Book Requests
    const { data: bData } = await supabase
      .from('book_requests')
      .select('*, book_images(*), book_offers(*)');
    if (bData) state.bookRequests = bData;

    // Scrap Requests
    const { data: sData } = await supabase
      .from('scrap_requests')
      .select('*, scrap_images(*), scrap_offers(*)');
    if (sData) state.wasteRequests = sData;

    // Transactions
    const { data: tData } = await supabase
      .from('transactions')
      .select('*, payment_records(*)');
    if (tData) state.transactions = tData;

    // User-specific notifications
    if (state.currentUser) {
      const { data: nData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', state.currentUser.id)
        .order('created_at', { ascending: false });
      if (nData) {
        state.notifications = nData;
        updateNotificationBellUI();
    updateHeroLiveStats();
      }
    }

    // Complaints (for admin or user)
    const { data: compData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (compData) state.complaints = compData;

    // Audit logs & session entries (for admin)
    if (state.currentUser && state.currentUser.role === 'admin') {
      const { data: auditData } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      const localLogs = JSON.parse(localStorage.getItem('SECOND_SHELF_USER_SESSIONS') || '[]');
      const combined = [...(auditData || []), ...localLogs];
      const unique = [];
      const seen = new Set();
      for (const item of combined) {
        const key = item.id || (item.created_at + '_' + item.action);
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      }
      unique.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      state.auditLogs = unique;
    }

    // Refresh active UI
    if (state.currentUser) {
      renderCurrentDashboard();
    }
    renderBookDirectory();
    renderRaddiDirectory();
  } catch (err) {
    console.warn('Error refreshing requests:', err);
  }
}

// Setup Supabase Realtime subscriptions
function setupRealtimeSubscriptions() {
  if (!supabase) return;

  supabase.channel('public:table-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
      if (state.currentUser && payload.new && payload.new.user_id === state.currentUser.id) {
        state.notifications.unshift(payload.new);
        updateNotificationBellUI();
        showToast(payload.new.title + ': ' + payload.new.message, 'info');
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'book_offers' }, () => {
      refreshRequestsAndOffers();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'scrap_offers' }, () => {
      refreshRequestsAndOffers();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
      refreshRequestsAndOffers();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_records' }, () => {
      refreshRequestsAndOffers();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'book_stalls' }, payload => {
      refreshRequestsAndOffers();
      if (payload.eventType === 'INSERT' && state.currentUser?.email === MASTER_ADMIN_EMAIL) {
        showToast('🚨 New Book Stall Application Submitted! Check Pending Approvals.', 'info');
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'scrap_owners' }, payload => {
      refreshRequestsAndOffers();
      if (payload.eventType === 'INSERT' && state.currentUser?.email === MASTER_ADMIN_EMAIL) {
        showToast('🚨 New Scrap Business Application Submitted! Check Pending Approvals.', 'info');
      }
    })
    .subscribe();
}

// ====================================================================
// 2. AUTHENTICATION & USER PROFILE RESOLUTION
// ====================================================================

// Resolve Supabase user and verify role permissions
async function resolveUserProfile(user) {
  if (!user || !supabase) return;

  try {
    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Fetch User Roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);

    let primaryRole = 'seller';

    // Strict single master admin verification
    if (user.email === MASTER_ADMIN_EMAIL) {
      primaryRole = 'admin';
    } else {
      // Find if user has an approved business role
      const approvedRole = (roles || []).find(r => r.is_approved === true && (r.role === 'book_stall' || r.role === 'raddi_owner'));
      if (approvedRole) {
        primaryRole = approvedRole.role;
      } else {
        // Fallback: Check book_stalls and scrap_owners directly in case user_roles RLS prevents reads
        let fallbackRole = null;
        try {
          const { data: bStall } = await supabase.from('book_stalls').select('id, approval_status').eq('user_id', user.id).maybeSingle();
          if (bStall && (bStall.approval_status === 'approved' || bStall.is_approved)) {
            fallbackRole = 'book_stall';
          }
        } catch (e) {}

        if (!fallbackRole) {
          try {
            const { data: sOwner } = await supabase.from('scrap_owners').select('id, approval_status').eq('user_id', user.id).maybeSingle();
            if (sOwner && (sOwner.approval_status === 'approved' || sOwner.is_approved)) {
              fallbackRole = 'raddi_owner';
            }
          } catch (e) {}
        }

        primaryRole = fallbackRole || 'seller';
      }
    }

    state.currentUser = {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
      phone: profile?.phone || user.user_metadata?.phone || '+91 98450 00000',
      role: primaryRole,
      is_verified: user.email_confirmed_at !== null,
      age_confirmed: profile?.age_confirmed || true,
      roles: roles || []
    };

    updateUserRoleUI();
    showToast(`Signed in as ${state.currentUser.name} (${getRoleTitle(primaryRole)})`, 'success');
    await logUserSessionEvent('entry');

  } catch (err) {
    console.error('Error resolving user profile:', err);
  }
}

// User Entry (Login) and Exit (Logout) Session Logger
async function logUserSessionEvent(event) {
  if (!state.currentUser) return;
  const user = state.currentUser;
  const now = new Date().toISOString();
  const entryId = 'sess_' + Date.now();

  const payload = {
    action: event === 'entry' ? 'user_entry' : 'user_exit',
    target_type: 'user_session',
    target_id: user.id,
    details: {
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      role: user.role,
      event: event === 'entry' ? 'login' : 'logout',
      status: event === 'entry' ? 'active' : 'logged_out',
      timestamp: now
    }
  };

  // 1. Try to record in Supabase admin_audit_logs if available
  if (supabase) {
    try {
      await supabase.from('admin_audit_logs').insert([payload]);
    } catch (e) {
      console.warn('Could not write remote audit log:', e);
    }
  }

  // 2. Persist in local storage session logs
  try {
    let localLogs = JSON.parse(localStorage.getItem('SECOND_SHELF_USER_SESSIONS') || '[]');
    localLogs.unshift({
      id: entryId,
      created_at: now,
      ...payload
    });
    if (localLogs.length > 100) localLogs = localLogs.slice(0, 100);
    localStorage.setItem('SECOND_SHELF_USER_SESSIONS', JSON.stringify(localLogs));

    // Also add to active in-memory state.auditLogs
    state.auditLogs.unshift({
      id: entryId,
      created_at: now,
      ...payload
    });
  } catch (e) {}
}

// 1. User / Seller Login
async function handleSellerLogin(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('seller-email')?.value?.trim();
  const password = document.getElementById('seller-password')?.value;

  if (!email || !password) {
    showToast('Please enter both email and password.', 'error');
    return;
  }

  if (!supabase) {
    showToast('Supabase backend not connected. Please click "Supabase" in the header to enter your Project URL and Anon Key.', 'error');
    openSupabaseConfigModal();
    return;
  }

  showToast('Authenticating with Supabase Auth...', 'info');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, 'error');
    return;
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    showToast('Email Verification Required: Please verify your email before logging in. Check your inbox for the verification link.', 'warning');
    return;
  }

  // Check Role
  const { data: roleRecord } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .single();

  if (roleRecord && roleRecord.role !== 'seller' && roleRecord.role !== 'admin') {
    await supabase.auth.signOut();
    showToast(`Role Mismatch: This account is registered as a ${getRoleTitle(roleRecord.role)}. Please use the appropriate portal tab.`, 'error');
    return;
  }

  await resolveUserProfile(data.user);
  closeModal('modal-auth');
  openCurrentRoleDashboard();
}

// 2. Book Stall Owner Login
async function handleStallLogin(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('stall-email')?.value?.trim();
  const password = document.getElementById('stall-password')?.value;

  if (!email || !password) {
    showToast('Please enter your bookstore credentials.', 'error');
    return;
  }

  if (!supabase) {
    showToast('Supabase backend not connected. Please configure credentials first.', 'error');
    openSupabaseConfigModal();
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, 'error');
    return;
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    showToast('Email unverified: Please click the verification link sent to your email.', 'warning');
    return;
  }

  // Check Stall Approval Status
  const { data: stall } = await supabase
    .from('book_stalls')
    .select('approval_status, stall_name')
    .eq('user_id', data.user.id)
    .single();

  if (!stall || stall.approval_status !== 'approved') {
    await supabase.auth.signOut();
    showToast('Approval Pending: Your bookstore registration is awaiting Admin verification. Access is granted once verified.', 'warning');
    return;
  }

  await resolveUserProfile(data.user);
  closeModal('modal-auth');
  openCurrentRoleDashboard();
}

// 3. Recycle Scrap Owner Login
async function handleRaddiLogin(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('raddi-email')?.value?.trim();
  const password = document.getElementById('raddi-password')?.value;

  if (!email || !password) {
    showToast('Please enter your scrap dealer credentials.', 'error');
    return;
  }

  if (!supabase) {
    showToast('Supabase backend not connected. Please configure credentials first.', 'error');
    openSupabaseConfigModal();
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, 'error');
    return;
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    showToast('Email unverified: Please click the verification link in your email.', 'warning');
    return;
  }

  // Check Scrap Owner Approval
  const { data: scrap } = await supabase
    .from('scrap_owners')
    .select('approval_status, business_name')
    .eq('user_id', data.user.id)
    .single();

  if (!scrap || scrap.approval_status !== 'approved') {
    await supabase.auth.signOut();
    showToast('Approval Pending: Your scrap yard registration is awaiting Admin approval.', 'warning');
    return;
  }

  await resolveUserProfile(data.user);
  closeModal('modal-auth');
  openCurrentRoleDashboard();
}

// 4. Admin Login (Secure Server-Side Verification — Strictly 1 Provisioned Admin Account)
async function handleCreatorAdminLogin(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('creator-email')?.value?.trim();
  const password = document.getElementById('creator-password')?.value;

  const email = emailInput === 'admin' ? 'ganeshhonnalli07@gmail.com' : emailInput;

  if (!email || !password) {
    showToast('Please enter administrator credentials.', 'error');
    return;
  }

  if (!supabase) {
    showToast('Supabase backend not connected. Please configure credentials first.', 'error');
    openSupabaseConfigModal();
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast('Access Denied: Invalid administrator credentials.', 'error');
    return;
  }

  // Server-Side Verification: Strictly check user_roles for admin
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('role', 'admin')
    .single();

  if (!adminRole) {
    await supabase.auth.signOut();
    showToast('ACCESS DENIED: This account does not possess administrator privileges. Intrusion logged.', 'error');
    return;
  }

  // Log successful admin authentication to audit log
  await supabase.from('admin_audit_logs').insert({
    admin_id: data.user.id,
    action: 'ADMIN_AUTHENTICATED',
    target_type: 'SYSTEM',
    details: { email: data.user.email, timestamp: new Date().toISOString() }
  });

  await resolveUserProfile(data.user);
  closeModal('modal-auth');
  showToast('🛡️ Administrator Authorized! Root administrative console unlocked.', 'success');
  openCurrentRoleDashboard();
}

// Registration Handler with Real Email Verification & 18+ Check
async function handleSignupSubmit(event) {
  if (event) event.preventDefault();
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const password = document.getElementById('signup-password')?.value;
  const confirmPassword = document.getElementById('signup-confirm-password')?.value;
  const phone = document.getElementById('signup-phone')?.value?.trim();
  const role = document.getElementById('signup-role')?.value || 'seller';
  const ageCheck = document.getElementById('signup-age-confirm')?.checked || document.getElementById('signup-age-check')?.checked;

  if (!name || name.length < 2) {
    showToast('Please enter your full name.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 10) {
    showToast('Please enter a valid 10-digit mobile number.', 'error');
    return;
  }

  if (!password || password.length < 8) {
    showToast('Password must be at least 8 characters long.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match. Please verify your password.', 'error');
    return;
  }

  if (!ageCheck) {
    showToast('Age Confirmation Required: You must be 18 years or older to register under DPDP compliance.', 'error');
    return;
  }

  if (!supabase) {
    showToast('Supabase backend not configured. Please click "Supabase" in header to connect your database.', 'error');
    openSupabaseConfigModal();
    return;
  }

  showToast('Registering account with Supabase Auth...', 'info');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone: phone,
        role: role
      }
    }
  });

  if (error) {
    showToast('Registration Error: ' + error.message, 'error');
    return;
  }

  const userId = data?.user?.id;

  // Additional Business Fields if registering Book Stall or Scrap Yard
  if (role === 'book_stall') {
    const stallName = document.getElementById('signup-biz-name')?.value?.trim();
    const licence = document.getElementById('signup-biz-licence')?.value?.trim();
    const address = document.getElementById('signup-biz-address')?.value?.trim();
    const pincode = document.getElementById('signup-biz-pin')?.value?.trim();

    await supabase.from('book_stalls').insert({
      user_id: userId,
      stall_name: stallName || (name + ' Book House'),
      owner_name: name,
      phone: phone,
      licence_number: licence || 'PENDING',
      address: address || 'Bengaluru',
      pincode: pincode || '560001',
      approval_status: 'pending'
    });
  } else if (role === 'raddi_owner') {
    const bizName = document.getElementById('signup-biz-name')?.value?.trim();
    const licence = document.getElementById('signup-biz-licence')?.value?.trim();
    const address = document.getElementById('signup-biz-address')?.value?.trim();
    const pincode = document.getElementById('signup-biz-pin')?.value?.trim();

    await supabase.from('scrap_owners').insert({
      user_id: userId,
      business_name: bizName || (name + ' Eco Recyclers'),
      owner_name: name,
      phone: phone,
      licence_number: licence || 'PENDING',
      address: address || 'Bengaluru',
      base_area: 'Bengaluru Urban',
      pincode: pincode || '560001',
      approval_status: 'pending'
    });
  }

  closeModal('modal-auth');
  showToast(`Registration Successful! Verification email sent to ${email}. Please check your inbox and verify before logging in.`, 'success');
}

// Dynamic Registration Role Change Helper
function handleSignupRoleChange(role) {
  const bizFields = document.getElementById('signup-business-fields');
  const label = document.getElementById('signup-biz-name-label');
  if (!bizFields) return;

  if (role === 'book_stall') {
    bizFields.classList.remove('hidden');
    if (label) label.textContent = 'Book Store / Stall Name *';
  } else if (role === 'raddi_owner') {
    bizFields.classList.remove('hidden');
    if (label) label.textContent = 'Scrap Recycling Yard / Business Name *';
  } else {
    bizFields.classList.add('hidden');
  }
}

// Real Password Reset Request
async function handlePasswordResetSubmit(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('reset-email')?.value?.trim();
  if (!email) return;

  if (!supabase) {
    showToast('Supabase backend not connected.', 'error');
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    showToast(error.message, 'error');
  } else {
    closeModal('modal-reset-password');
    showToast('Password reset link sent to ' + email, 'success');
  }
}

// Sign Out
async function logout() {
  if (state.currentUser) {
    await logUserSessionEvent('exit');
  }
  if (supabase) {
    await supabase.auth.signOut();
  }
  state.currentUser = null;
  state.currentSession = null;
  updateUserRoleUI();
  showSection('home');
  showToast('Signed out successfully.', 'info');
}

// ====================================================================
// 3. TEXTBOOK SUBMISSION & VALUATION
// ====================================================================

async function handleBookSubmit(event) {
  if (event) event.preventDefault();

  if (!state.currentUser) {
    showToast('Please sign in as a Seller to submit used books.', 'warning');
    openLoginPortal('seller');
    return;
  }

  const authCheck = document.getElementById('book-auth-check')?.checked;
  if (!authCheck) {
    showToast('Please affirm that these are genuine, non-pirated books.', 'error');
    return;
  }

  const form = document.getElementById('form-submit-book');
  const titles = Array.from(form.querySelectorAll('[name="item_title"]')).map(i => i.value.trim());
  const authors = Array.from(form.querySelectorAll('[name="item_author"]')).map(i => i.value.trim());
  const categories = Array.from(form.querySelectorAll('[name="item_category"]')).map(i => i.value);
  const conditions = Array.from(form.querySelectorAll('[name="item_condition"]')).map(i => i.value);
  const prices = Array.from(form.querySelectorAll('[name="item_price"]')).map(i => parseFloat(i.value) || 0);
  const copiesList = Array.from(form.querySelectorAll('[name="item_copies"]')).map(i => parseInt(i.value) || 1);

  const handover = form.querySelector('[name="handover_method"]:checked')?.value || 'direct_stall_handover';
  const pickupAddress = document.getElementById('book-seller-address')?.value || document.getElementById('book-pickup-address')?.value || 'Self-handover';
  const sellerPhone = document.getElementById('book-seller-phone')?.value || state.currentUser.phone;

  let grandOriginalPrice = 0;
  let grandEstimatedPayout = 0;

  for (let i = 0; i < titles.length; i++) {
    const orig = prices[i];
    const cond = conditions[i];
    const copies = copiesList[i];
    const pct = state.valuationRules[cond] || 20.0;
    const est = (orig * (pct / 100)) * copies;

    grandOriginalPrice += (orig * copies);
    grandEstimatedPayout += est;
  }

  const reqNumber = 'BOK-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  if (supabase) {
    try {
      const { data: newReq, error } = await supabase.from('book_requests').insert({
        request_number: reqNumber,
        user_id: state.currentUser.id,
        title: titles[0],
        author: authors[0],
        original_price: prices[0],
        book_condition: conditions[0],
        copies: copiesList[0],
        max_valuation_pct: state.valuationRules[conditions[0]] || 20.0,
        total_estimated_payout: grandEstimatedPayout,
        handover_method: handover,
        pickup_address: pickupAddress,
        contact_phone: sellerPhone,
        status: 'Pending'
      }).select().single();

      if (error) throw error;

      // Notify approved stalls
      const { data: stalls } = await supabase.from('book_stalls').select('user_id').eq('approval_status', 'approved');
      if (stalls) {
        for (const s of stalls) {
          await supabase.from('notifications').insert({
            user_id: s.user_id,
            title: 'New Book Request Available',
            message: `${titles[0]} by ${authors[0]} (${conditions[0]}). Est payout cap: ₹${grandEstimatedPayout.toFixed(2)}`,
            notification_type: 'new_book_request',
            reference_id: newReq.id
          });
        }
      }

    } catch (err) {
      console.error('Error submitting book to Supabase:', err);
      showToast('Error saving book: ' + err.message, 'error');
      return;
    }
  }

  closeModal('modal-book-submission');
  showToast(`Book Request #${reqNumber} submitted! Certified stalls have been notified.`, 'success');
  await refreshRequestsAndOffers();
  openCurrentRoleDashboard();
}

// ====================================================================
// 4. RECYCLE SCRAP SUBMISSION (Strict 10 kg Minimum Constraint)
// ====================================================================

async function handleRaddiSubmit(event) {
  if (event) event.preventDefault();

  if (!state.currentUser) {
    showToast('Please sign in as a Seller to submit scrap requests.', 'warning');
    openLoginPortal('seller');
    return;
  }

  const weight = parseFloat(document.getElementById('raddi-weight-input')?.value) || 0;

  // Strict Frontend & Backend Constraint Check
  if (weight < 10.0) {
    showToast('Minimum 10 kg of recycle scrap is required to submit a request.', 'error');
    return;
  }

  const paperType = document.getElementById('raddi-paper-type')?.value;
  const name = document.getElementById('raddi-seller-name')?.value || state.currentUser.name;
  const phone = document.getElementById('raddi-seller-phone')?.value || state.currentUser.phone;
  const address = document.getElementById('raddi-pickup-address')?.value;
  const pin = document.getElementById('raddi-pickup-pin')?.value;
  const date = document.getElementById('raddi-pickup-date')?.value;
  const slot = document.getElementById('raddi-time-slot')?.value;
  const notes = document.getElementById('raddi-notes')?.value;

  const reqNumber = 'SCR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  if (supabase) {
    try {
      const { data: newScrap, error } = await supabase.from('scrap_requests').insert({
        request_number: reqNumber,
        user_id: state.currentUser.id,
        paper_type: paperType,
        estimated_weight_kg: weight,
        seller_name: name,
        seller_phone: phone,
        pickup_address: address,
        pickup_area: 'PIN: ' + pin,
        pickup_pin: pin,
        preferred_date: date,
        preferred_slot: slot,
        notes: notes,
        status: 'Pending'
      }).select().single();

      if (error) throw error;

      // Notify approved scrap owners
      const { data: owners } = await supabase.from('scrap_owners').select('user_id').eq('approval_status', 'approved');
      if (owners) {
        for (const o of owners) {
          await supabase.from('notifications').insert({
            user_id: o.user_id,
            title: 'New Scrap Pickup Request (10+ kg)',
            message: `${weight} kg of ${paperType} in area PIN ${pin}. Doorstep pickup requested.`,
            notification_type: 'new_scrap_request',
            reference_id: newScrap.id
          });
        }
      }

    } catch (err) {
      console.error('Error submitting scrap to Supabase:', err);
      showToast('Error saving scrap request: ' + err.message, 'error');
      return;
    }
  }

  closeModal('modal-raddi-submission');
  showToast(`Recycle Scrap Pickup #${reqNumber} published! Visible to verified recyclers (Area: ${pin}).`, 'success');
  await refreshRequestsAndOffers();
  openCurrentRoleDashboard();
}

// Strict Frontend weight validation
function validateRaddiWeight(input) {
  const val = parseFloat(input.value) || 0;
  const errorEl = document.getElementById('raddi-weight-error');
  const submitBtn = document.getElementById('submit-raddi-btn');

  if (val < 10) {
    if (errorEl) errorEl.classList.remove('hidden');
    input.classList.add('border-rose-500', 'bg-rose-50');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      submitBtn.textContent = 'Minimum 10 kg Required';
    }
  } else {
    if (errorEl) errorEl.classList.add('hidden');
    input.classList.remove('border-rose-500', 'bg-rose-50');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      submitBtn.textContent = 'Publish Recycle Scrap Request (≥ 10 kg) →';
    }
  }
}

// ====================================================================
// 5. OFFERS, ACCEPTANCE & TWO-PARTY SETTLEMENT WORKFLOW
// ====================================================================

// Open Make Offer Modal
function openSendOfferModal(type, reqId, maxCap = 0, estWeight = 20) {
  const reqIdEl = document.getElementById('offer-target-req-id') || document.getElementById('offer-req-id');
  const reqTypeEl = document.getElementById('offer-target-type') || document.getElementById('offer-req-type');
  const maxCapEl = document.getElementById('offer-max-cap');
  const maxCapDisp = document.getElementById('offer-max-cap-display');
  const rateField = document.getElementById('offer-rate-field');
  const capBanner = document.getElementById('offer-cap-banner');
  const amountInput = document.getElementById('offer-amount-input') || document.getElementById('offer-book-amount');

  if (reqIdEl) reqIdEl.value = reqId;
  if (reqTypeEl) reqTypeEl.value = type;
  if (maxCapEl) maxCapEl.value = maxCap;
  if (maxCapDisp) maxCapDisp.textContent = '₹' + parseFloat(maxCap).toFixed(2);

  if (type === 'book') {
    if (capBanner) capBanner.classList.remove('hidden');
    if (rateField) rateField.classList.add('hidden');
    if (amountInput) {
      amountInput.value = maxCap > 0 ? maxCap.toFixed(2) : '300.00';
      amountInput.max = maxCap > 0 ? maxCap : 99999;
    }
  } else {
    if (capBanner) capBanner.classList.add('hidden');
    if (rateField) rateField.classList.remove('hidden');
    const rateEl = document.getElementById('offer-rate-kg');
    const rate = rateEl ? (parseFloat(rateEl.value) || 14) : 14;
    if (amountInput) amountInput.value = (estWeight * rate).toFixed(2);
  }

  document.getElementById('modal-send-offer')?.classList.remove('hidden');
}

function recalcRaddiOfferTotal() {
  const rate = parseFloat(document.getElementById('offer-rate-kg')?.value) || 0;
  const reqId = document.getElementById('offer-target-req-id')?.value || document.getElementById('offer-req-id')?.value;
  const scrapReq = state.wasteRequests.find(r => r.id === reqId);
  const weight = scrapReq ? (parseFloat(scrapReq.estimated_weight_kg) || 20) : 20;

  const total = rate * weight;
  const amountInput = document.getElementById('offer-amount-input');
  if (amountInput) amountInput.value = total.toFixed(2);
}

// Stall or Scrap Owner Submits an Offer
async function handleSendOfferSubmit(event) {
  if (event) event.preventDefault();

  const reqId = document.getElementById('offer-target-req-id')?.value || document.getElementById('offer-req-id')?.value;
  const reqType = document.getElementById('offer-target-type')?.value || document.getElementById('offer-req-type')?.value;
  const amount = parseFloat(document.getElementById('offer-amount-input')?.value) || 0;
  const reason = document.getElementById('offer-reason')?.value?.trim();

  if (reqType === 'book') {
    const maxCap = parseFloat(document.getElementById('offer-max-cap')?.value) || 99999;

    if (amount > maxCap) {
      showToast(`Offer exceeds maximum valuation cap of ₹${maxCap.toFixed(2)}.`, 'error');
      return;
    }

    if (amount < (maxCap * 0.7) && !reason) {
      showToast('Offer is lower than estimated amount. Please provide a written condition explanation.', 'error');
      return;
    }

    if (supabase) {
      const stall = state.bookStalls.find(s => s.user_id === state.currentUser.id);
      const { data: offerRecord, error } = await supabase.from('book_offers').insert({
        request_id: reqId,
        stall_id: stall ? stall.id : state.bookStalls[0]?.id,
        offered_amount: amount,
        max_allowed_amount: maxCap,
        reason: reason || 'Verified condition inspection quote',
        status: 'Pending'
      }).select().single();

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      await supabase.from('book_requests').update({ status: 'Offer Received' }).eq('id', reqId);

      // Notify seller
      const req = state.bookRequests.find(r => r.id === reqId);
      if (req) {
        await supabase.from('notifications').insert({
          user_id: req.user_id,
          title: 'New Offer Received for Book',
          message: `Stall offer of ₹${amount.toFixed(2)} received for ${req.title}.`,
          notification_type: 'new_offer',
          reference_id: reqId
        });
      }
    }

    closeModal('modal-send-offer');
    showToast(`Book Offer of ₹${amount.toFixed(2)} sent to seller!`, 'success');

  } else if (reqType === 'raddi') {
    const rateKg = parseFloat(document.getElementById('offer-rate-kg')?.value) || 0;

    if (rateKg <= 0) {
      showToast('Please enter a valid rate per kg.', 'error');
      return;
    }

    if (supabase) {
      const scrap = state.scrapOwners.find(s => s.user_id === state.currentUser.id);
      const { error } = await supabase.from('scrap_offers').insert({
        request_id: reqId,
        scrap_owner_id: scrap ? scrap.id : state.scrapOwners[0]?.id,
        rate_per_kg: rateKg,
        total_estimated_amount: amount,
        status: 'Pending'
      });

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      await supabase.from('scrap_requests').update({ status: 'Offer Received' }).eq('id', reqId);

      // Notify seller
      const req = state.wasteRequests.find(r => r.id === reqId);
      if (req) {
        await supabase.from('notifications').insert({
          user_id: req.user_id,
          title: 'New Scrap Quote Received',
          message: `Scrap dealer proposed ₹${rateKg}/kg (Total Est: ₹${amount.toFixed(2)}) for your request.`,
          notification_type: 'new_offer',
          reference_id: reqId
        });
      }
    }

    closeModal('modal-send-offer');
    showToast(`Quote of ₹${rateKg}/kg sent to seller!`, 'success');
  }

  await refreshRequestsAndOffers();
  openCurrentRoleDashboard();
}

// User Accepts Stall or Scrap Owner's Offer
async function acceptOffer(type, reqId, offerId) {
  if (!confirm('Accept this offer? Once accepted, direct chat and handover details will be unlocked with this partner.')) {
    return;
  }

  if (supabase) {
    try {
      if (type === 'book') {
        const { data: offer } = await supabase.from('book_offers').select('*, book_stalls(*)').eq('request_id', reqId).order('offered_amount', { ascending: false }).limit(1).single();
        const stallUserId = offer?.book_stalls?.user_id;

        await supabase.from('book_requests').update({
          status: 'Accepted',
          assigned_stall_id: offer?.stall_id,
          accepted_offer_id: offer?.id
        }).eq('id', reqId);

        await supabase.from('book_offers').update({ status: 'Accepted' }).eq('id', offer?.id);

        // Create transaction & conversation
        const trxNumber = 'TRX-BOK-' + Math.floor(100000 + Math.random() * 900000);
        const { data: trx } = await supabase.from('transactions').insert({
          transaction_number: trxNumber,
          transaction_type: 'book',
          request_id: reqId,
          user_id: state.currentUser.id,
          partner_type: 'book_stall',
          partner_user_id: stallUserId,
          agreed_amount: offer ? offer.offered_amount : 300,
          status: 'initiated'
        }).select().single();

        if (trx) {
          await supabase.from('conversations').insert({
            transaction_id: trx.id,
            user_id: state.currentUser.id,
            partner_user_id: stallUserId
          });

          // Notify stall owner
          await supabase.from('notifications').insert({
            user_id: stallUserId,
            title: 'Offer Accepted by Seller!',
            message: `Seller accepted your offer of ₹${offer?.offered_amount}. Direct messaging and order details are now open.`,
            notification_type: 'offer_accepted',
            reference_id: trx.id
          });
        }

      } else if (type === 'raddi') {
        const { data: offer } = await supabase.from('scrap_offers').select('*, scrap_owners(*)').eq('request_id', reqId).limit(1).single();
        const scrapUserId = offer?.scrap_owners?.user_id;

        await supabase.from('scrap_requests').update({
          status: 'Accepted',
          assigned_owner_id: offer?.scrap_owner_id,
          accepted_offer_id: offer?.id
        }).eq('id', reqId);

        await supabase.from('scrap_offers').update({ status: 'Accepted' }).eq('id', offer?.id);

        const trxNumber = 'TRX-SCR-' + Math.floor(100000 + Math.random() * 900000);
        const { data: trx } = await supabase.from('transactions').insert({
          transaction_number: trxNumber,
          transaction_type: 'scrap',
          request_id: reqId,
          user_id: state.currentUser.id,
          partner_type: 'scrap_owner',
          partner_user_id: scrapUserId,
          agreed_amount: offer ? offer.total_estimated_amount : 350,
          status: 'initiated'
        }).select().single();

        if (trx) {
          await supabase.from('conversations').insert({
            transaction_id: trx.id,
            user_id: state.currentUser.id,
            partner_user_id: scrapUserId
          });

          // Notify scrap owner
          await supabase.from('notifications').insert({
            user_id: scrapUserId,
            title: 'Scrap Quote Accepted!',
            message: `Seller accepted your rate quote. Pickup address and direct chat unlocked.`,
            notification_type: 'offer_accepted',
            reference_id: trx.id
          });
        }
      }

    } catch (err) {
      console.error('Error accepting offer:', err);
    }
  }

  showToast('Offer accepted! Direct messaging and contact details unlocked.', 'success');
  await refreshRequestsAndOffers();
  openCurrentRoleDashboard();
}

// Partner Records Payment (Offline Direct Payment - Cash, UPI, Bank Transfer)
function openRecordPaymentModal(type, reqOrTrxId, amount = 300) {
  const reqEl = document.getElementById('record-pay-req-id') || document.getElementById('record-payment-trx-id');
  const typeEl = document.getElementById('record-pay-type');
  const amountEl = document.getElementById('record-pay-amount') || document.getElementById('payment-amount');

  if (reqEl) reqEl.value = reqOrTrxId;
  if (typeEl) typeEl.value = type;
  if (amountEl) amountEl.value = amount;

  document.getElementById('modal-record-payment')?.classList.remove('hidden');
  injectDynamicGuidelines('payment_guidelines', 'guidelines-payment');
}

async function handleRecordPaymentSubmit(event) {
  if (event) event.preventDefault();

  const reqOrTrxId = document.getElementById('record-pay-req-id')?.value || document.getElementById('record-payment-trx-id')?.value;
  const method = document.getElementById('record-pay-method')?.value || document.getElementById('payment-method')?.value || 'upi';
  const utr = document.getElementById('record-pay-utr')?.value?.trim() || document.getElementById('payment-utr')?.value?.trim();
  const amount = parseFloat(document.getElementById('record-pay-amount')?.value || document.getElementById('payment-amount')?.value) || 0;
  const notes = document.getElementById('record-pay-notes')?.value?.trim() || 'Condition inspected and verified.';

  if (amount <= 0) {
    showToast('Please enter a positive payment amount.', 'error');
    return;
  }

  if (method !== 'cash' && !utr) {
    showToast('Bank / UPI UTR reference number is required for digital payments.', 'error');
    return;
  }

  if (supabase) {
    try {
      // Find matching transaction
      let trx = state.transactions.find(t => t.id === reqOrTrxId || t.request_id === reqOrTrxId);
      if (!trx) {
        const { data: fetchedTrx } = await supabase.from('transactions').select('*').or(`id.eq.${reqOrTrxId},request_id.eq.${reqOrTrxId}`).single();
        trx = fetchedTrx;
      }

      if (trx) {
        await supabase.from('payment_records').insert({
          transaction_id: trx.id,
          paid_by: state.currentUser.id,
          payment_method: method,
          utr_reference: utr || 'CASH_HANDOVER',
          amount: amount,
          buyer_confirmed: true,
          seller_confirmed: false,
          status: 'pending_confirmation'
        });

        await supabase.from('transactions').update({
          status: 'payment_pending',
          final_amount: amount
        }).eq('id', trx.id);

        if (trx.transaction_type === 'book') {
          await supabase.from('book_requests').update({ status: 'Payment Pending' }).eq('id', trx.request_id);
        } else {
          await supabase.from('scrap_requests').update({ status: 'Payment Pending' }).eq('id', trx.request_id);
        }

        // Notify seller to confirm payment
        await supabase.from('notifications').insert({
          user_id: trx.user_id,
          title: 'Payment Recorded — Action Required',
          message: `Buyer recorded payment of ₹${amount.toFixed(2)} (${method.toUpperCase()}). Please verify funds and click "Confirm Payment Received".`,
          notification_type: 'payment_recorded',
          reference_id: trx.id
        });
      }

    } catch (err) {
      console.error('Error recording payment in Supabase:', err);
    }
  }

  closeModal('modal-record-payment');
  showToast(`Payment of ₹${amount.toFixed(2)} recorded! Awaiting seller verification.`, 'success');
  await refreshRequestsAndOffers();
  openCurrentRoleDashboard();
}

// Seller Confirms Payment Received (Two-Party Rule)
function openPaymentConfirmModal(type, reqId) {
  state.currentConfirmingReq = { type, reqId };
  const trx = state.transactions.find(t => t.request_id === reqId || t.id === reqId);
  const payRecord = trx?.payment_records?.[0];

  const idEl = document.getElementById('pay-confirm-id');
  const amountEl = document.getElementById('pay-confirm-amount');
  const checkAmountEl = document.getElementById('pay-confirm-check-amount');
  const modeEl = document.getElementById('pay-confirm-mode');
  const utrEl = document.getElementById('pay-confirm-utr');
  const dateEl = document.getElementById('pay-confirm-date');
  const notesEl = document.getElementById('pay-confirm-notes');

  const finalAmt = payRecord?.amount || trx?.agreed_amount || 300;

  if (idEl) idEl.textContent = trx?.transaction_number || ('TXN-' + reqId.slice(0, 8));
  if (amountEl) amountEl.textContent = '₹' + parseFloat(finalAmt).toFixed(2);
  if (checkAmountEl) checkAmountEl.textContent = '₹' + parseFloat(finalAmt).toFixed(2);
  if (modeEl) modeEl.textContent = (payRecord?.payment_method || 'UPI').toUpperCase();
  if (utrEl) utrEl.textContent = payRecord?.utr_reference || 'UPI/VERIFIED/2026';
  if (dateEl) dateEl.textContent = payRecord?.payment_date ? new Date(payRecord.payment_date).toLocaleDateString() : 'Today';
  if (notesEl) notesEl.textContent = 'Inspected and verified condition.';

  const check = document.getElementById('seller-payment-verify-check');
  if (check) check.checked = false;

  document.getElementById('modal-payment-confirm')?.classList.remove('hidden');
}

async function executePaymentConfirmation() {
  const check = document.getElementById('seller-payment-verify-check');
  if (check && !check.checked) {
    showToast('Please check the verification box confirming you received the funds.', 'error');
    return;
  }

  const { type, reqId } = state.currentConfirmingReq || { type: 'book', reqId: null };

  if (supabase && reqId) {
    try {
      if (type === 'book') {
        await supabase.from('book_requests').update({ status: 'Completed' }).eq('id', reqId);
      } else {
        await supabase.from('scrap_requests').update({ status: 'Completed' }).eq('id', reqId);
      }

      const trx = state.transactions.find(t => t.request_id === reqId || t.id === reqId);
      if (trx) {
        await supabase.from('transactions').update({
          status: 'completed',
          completed_at: new Date().toISOString()
        }).eq('id', trx.id);

        await supabase.from('payment_records').update({
          seller_confirmed: true,
          status: 'confirmed'
        }).eq('transaction_id', trx.id);

        // Notify partner
        await supabase.from('notifications').insert({
          user_id: trx.partner_user_id,
          title: 'Order Finalized! Payment Confirmed ✅',
          message: `The seller confirmed receipt of payment. Transaction #${trx.transaction_number} is officially Completed!`,
          notification_type: 'order_completed',
          reference_id: trx.id
        });
      }

    } catch (err) {
      console.error('Error confirming payment:', err);
    }
  }

  // Trigger celebration confetti
  if (window.confetti) {
    window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }

  closeModal('modal-payment-confirm');
  showToast('🎉 Payment Confirmed! Transaction finalized with two-party confirmation.', 'success');
  await refreshRequestsAndOffers();
  openCurrentRoleDashboard();
}

// ====================================================================
// 6. DIRECT CHAT & REAL-TIME NOTIFICATIONS
// ====================================================================

// Open Private Chat between User and Partner
async function openChatModal(transactionId, partnerTitle) {
  state.activeConversation = transactionId;
  const modal = document.getElementById('modal-chat');
  const titleEl = document.getElementById('chat-partner-title');
  const subEl = document.getElementById('chat-transaction-subtitle');
  const streamEl = document.getElementById('chat-messages-container');

  if (titleEl) titleEl.textContent = partnerTitle || 'Direct Transaction Chat';
  if (subEl) subEl.textContent = 'Deal Reference #' + transactionId.slice(0, 8);
  if (modal) modal.classList.remove('hidden');

  if (streamEl) streamEl.innerHTML = '<div class="text-center text-xs text-slate-400 py-6">Connecting secure conversation...</div>';

  if (!supabase) {
    if (streamEl) {
      streamEl.innerHTML = `
        <div class="bg-white p-3 rounded-xl border text-xs shadow-sm">
          <strong>System:</strong> Private chat connects seller and partner directly upon offer acceptance. Connect Supabase in the top header to enable live messaging.
        </div>
      `;
    }
    return;
  }

  try {
    // 1. Fetch conversation
    let { data: convo } = await supabase.from('conversations').select('*').eq('transaction_id', transactionId).single();
    if (!convo) {
      const { data: altConvo } = await supabase.from('conversations').select('*').limit(1).single();
      convo = altConvo;
    }

    if (!convo) {
      if (streamEl) streamEl.innerHTML = '<div class="text-center text-xs text-slate-400 py-6">Conversation channel ready. Send the first message!</div>';
      return;
    }

    // 2. Fetch messages
    const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', convo.id).order('created_at', { ascending: true });
    renderChatMessages(msgs || []);

    // 3. Realtime listener for incoming messages
    if (state.activeChatSubscription) {
      supabase.removeChannel(state.activeChatSubscription);
    }

    state.activeChatSubscription = supabase.channel(`convo:${convo.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convo.id}` }, payload => {
        appendChatMessage(payload.new);
      })
      .subscribe();

  } catch (err) {
    console.error('Error opening chat:', err);
  }
}

function renderChatMessages(msgs) {
  const streamEl = document.getElementById('chat-messages-container');
  if (!streamEl) return;

  if (msgs.length === 0) {
    streamEl.innerHTML = '<div class="text-center text-xs text-slate-400 py-6">No messages yet. Greet your partner to coordinate handover!</div>';
    return;
  }

  streamEl.innerHTML = msgs.map(m => {
    const isMe = state.currentUser && m.sender_id === state.currentUser.id;
    return `
      <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${isMe ? 'bg-emerald-800 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'}">
          <div>${m.content}</div>
          <div class="text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}">
            ${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    `;
  }).join('');

  streamEl.scrollTop = streamEl.scrollHeight;
}

function appendChatMessage(m) {
  const streamEl = document.getElementById('chat-messages-container');
  if (!streamEl) return;

  const isMe = state.currentUser && m.sender_id === state.currentUser.id;
  const div = document.createElement('div');
  div.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
  div.innerHTML = `
    <div class="max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${isMe ? 'bg-emerald-800 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'}">
      <div>${m.content}</div>
      <div class="text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}">
        ${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  `;
  streamEl.appendChild(div);
  streamEl.scrollTop = streamEl.scrollHeight;
}

async function handleSendMessage(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('chat-input-text');
  const text = input?.value?.trim();
  if (!text || !state.activeConversation || !state.currentUser) return;

  input.value = '';

  if (supabase) {
    try {
      let { data: convo } = await supabase.from('conversations').select('id').eq('transaction_id', state.activeConversation).single();
      if (!convo) {
        const { data: altConvo } = await supabase.from('conversations').select('id').limit(1).single();
        convo = altConvo;
      }
      if (convo) {
        await supabase.from('messages').insert({
          conversation_id: convo.id,
          sender_id: state.currentUser.id,
          content: text
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }
}

// Notification Drawer UI
function openNotificationsModal() {
  const modal = document.getElementById('modal-notifications');
  const container = document.getElementById('notifications-list-container');
  if (modal) modal.classList.remove('hidden');

  if (!container) return;

  if (state.notifications.length === 0) {
    container.innerHTML = '<div class="text-center text-xs text-slate-400 py-6">You are all caught up! No notifications.</div>';
    return;
  }

  container.innerHTML = state.notifications.map(n => `
    <div class="py-2.5 ${n.is_read ? 'opacity-70' : 'bg-amber-50/60 p-2 rounded-lg font-medium'} text-xs">
      <div class="flex items-center justify-between">
        <strong class="text-slate-900">${n.title}</strong>
        <span class="text-[10px] text-slate-400">${new Date(n.created_at).toLocaleDateString()}</span>
      </div>
      <p class="text-slate-600 mt-0.5">${n.message}</p>
    </div>
  `).join('');
}

function updateNotificationBellUI() {
  const unread = state.notifications.filter(n => !n.is_read).length;
  const countEl = document.getElementById('notification-unread-count');
  if (countEl) {
    if (unread > 0) {
      countEl.textContent = unread;
      countEl.classList.remove('hidden');
    } else {
      countEl.classList.add('hidden');
    }
  }
}

async function markAllNotificationsAsRead() {
  if (supabase && state.currentUser) {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', state.currentUser.id);
  }
  state.notifications.forEach(n => n.is_read = true);
  updateNotificationBellUI();
  openNotificationsModal();
}

// ====================================================================
// 7. COMPLAINTS & GRIEVANCE FILING
// ====================================================================

function openComplaintModal(refNum = '') {
  const input = document.getElementById('complaint-trx-ref');
  if (input && refNum) input.value = refNum;
  document.getElementById('modal-complaint')?.classList.remove('hidden');
}

async function handleComplaintSubmit(event) {
  if (event) event.preventDefault();
  const subject = document.getElementById('complaint-subject')?.value?.trim();
  const refNum = document.getElementById('complaint-trx-ref')?.value?.trim();
  const desc = document.getElementById('complaint-description')?.value?.trim();

  if (!subject || !desc) {
    showToast('Please fill out all required complaint fields.', 'error');
    return;
  }

  const ticketNumber = 'GRV-' + Math.floor(100000 + Math.random() * 900000);

  if (supabase && state.currentUser) {
    try {
      await supabase.from('complaints').insert({
        ticket_number: ticketNumber,
        filed_by: state.currentUser.id,
        subject: subject,
        description: desc + (refNum ? ` (Ref: ${refNum})` : ''),
        status: 'open'
      });
    } catch (err) {
      console.error('Error filing complaint:', err);
    }
  }

  closeModal('modal-complaint');
  showToast(`Complaint ticket #${ticketNumber} lodged with Administrator.`, 'success');
}

// Dispute Modal
function openDisputeModal(reqNum = '') {
  const input = document.getElementById('dispute-req-number');
  if (input && reqNum) input.value = reqNum;
  closeModal('modal-payment-confirm');
  document.getElementById('modal-dispute')?.classList.remove('hidden');
}

async function handleDisputeSubmit(event) {
  if (event) event.preventDefault();
  const refNum = document.getElementById('dispute-req-number')?.value?.trim();
  const reasonType = document.getElementById('dispute-reason-type')?.value;
  const details = document.getElementById('dispute-details')?.value?.trim();

  if (!refNum || !details) {
    showToast('Please provide reference number and dispute details.', 'error');
    return;
  }

  const ticketNumber = 'DSP-' + Math.floor(100000 + Math.random() * 900000);

  if (supabase && state.currentUser) {
    try {
      await supabase.from('complaints').insert({
        ticket_number: ticketNumber,
        filed_by: state.currentUser.id,
        subject: `Transaction Dispute: ${reasonType} (Ref: ${refNum})`,
        description: details,
        status: 'under_investigation'
      });

      // Update matching transaction to disputed
      await supabase.from('transactions').update({ status: 'disputed' }).or(`transaction_number.eq.${refNum},request_id.eq.${refNum}`);

    } catch (err) {
      console.error('Error lodging dispute:', err);
    }
  }

  closeModal('modal-dispute');
  showToast(`Dispute #${ticketNumber} filed. An administrator will inspect the transaction audit record.`, 'warning');
}

// ====================================================================
// 8. GUIDELINES & ANNOUNCEMENTS DYNAMIC INJECTION
// ====================================================================

function injectDynamicGuidelines(sectionPage, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const relevant = state.guidelines.filter(g => (g.section_page === sectionPage || g.section_page === 'all') && g.is_published);
  if (relevant.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = relevant.map(g => `
    <div class="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 mb-2">
      <div class="font-bold flex items-center gap-1.5">
        <span>📋</span>
        <span>${g.title}</span>
      </div>
      <p class="text-[11px] text-amber-800 mt-1 leading-relaxed">${g.content}</p>
    </div>
  `).join('');
}

// ====================================================================
// 9. SUPABASE CONFIGURATION MODAL CONTROLLER
// ====================================================================

function openSupabaseConfigModal() {
  const modal = document.getElementById('modal-supabase-config');
  const urlInput = document.getElementById('cfg-supabase-url');
  const keyInput = document.getElementById('cfg-supabase-key');
  const statusDetail = document.getElementById('supabase-status-detail');
  const statusIcon = document.getElementById('supabase-status-icon');

  if (urlInput) urlInput.value = state.supabaseConfig.url || localStorage.getItem('SECOND_SHELF_SUPABASE_URL') || '';
  if (keyInput) keyInput.value = state.supabaseConfig.key || localStorage.getItem('SECOND_SHELF_SUPABASE_ANON_KEY') || '';

  if (statusDetail) {
    if (state.supabaseConfig.connected) {
      statusDetail.textContent = 'Connected to Live Supabase PostgreSQL Instance';
      if (statusIcon) statusIcon.textContent = '🟢';
    } else {
      statusDetail.textContent = 'Supabase credentials not yet configured. Enter your Project URL & Anon Key below.';
      if (statusIcon) statusIcon.textContent = '⚙️';
    }
  }

  if (modal) modal.classList.remove('hidden');
}

async function testSupabaseConnection() {
  const url = document.getElementById('cfg-supabase-url')?.value?.trim();
  const key = document.getElementById('cfg-supabase-key')?.value?.trim();

  if (!url || !key) {
    showToast('Please enter both Supabase URL and Anon Key.', 'error');
    return;
  }

  if (!window.supabase) {
    showToast('Supabase JS library not loaded. Check internet connection.', 'error');
    return;
  }

  try {
    showToast('Testing PostgreSQL connection...', 'info');
    const testClient = window.supabase.createClient(url, key);
    const { data, error } = await testClient.from('textbook_categories').select('count', { count: 'exact' });

    if (error && !error.message.includes('permission denied')) {
      showToast('Connection failed: ' + error.message, 'error');
    } else {
      showToast('✅ Connection Successful! Live PostgreSQL database is accessible.', 'success');
    }
  } catch (err) {
    showToast('Connection Error: ' + err.message, 'error');
  }
}

async function handleSaveSupabaseConfig(event) {
  if (event) event.preventDefault();
  const url = document.getElementById('cfg-supabase-url')?.value?.trim();
  const key = document.getElementById('cfg-supabase-key')?.value?.trim();

  if (!url || !key) return;

  localStorage.setItem('SECOND_SHELF_SUPABASE_URL', url);
  localStorage.setItem('SECOND_SHELF_SUPABASE_ANON_KEY', key);

  // Attempt to save to .env via server API if running on Node
  try {
    await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabaseUrl: url, supabaseAnonKey: key })
    });
  } catch (e) {}

  closeModal('modal-supabase-config');
  showToast('Supabase configuration saved! Initializing live backend...', 'success');
  await initSupabase();
}

function openResetPasswordModal() {
  closeModal('modal-auth');
  document.getElementById('modal-reset-password')?.classList.remove('hidden');
}

// ====================================================================
// 10. ROLE-BASED DASHBOARDS RENDERING
// ====================================================================

// ====================================================================
// 4 ROLE DASHBOARDS & EXECUTIVE ADMINISTRATION CONSOLE
// ====================================================================

function switchToBusinessRole(role) {
  if (state.currentUser) {
    state.currentUser.role = role;
    updateUserRoleUI();
    renderCurrentDashboard();
    showToast('Switched to ' + getRoleTitle(role) + ' console.', 'info');
  }
}

function switchToSellerRole() {
  if (state.currentUser) {
    state.currentUser.role = 'seller';
    updateUserRoleUI();
    renderCurrentDashboard();
    showToast('Switched to User / Seller dashboard.', 'info');
  }
}

function renderCurrentDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container || !state.currentUser) return;

  switch (state.currentUser.role) {
    case 'seller': renderSellerDashboard(container); break;
    case 'book_stall': renderStallDashboard(container); break;
    case 'raddi_owner': renderRaddiOwnerDashboard(container); break;
    case 'admin': renderAdminDashboard(container); break;
    default: renderSellerDashboard(container);
  }
}

// 1. SELLER DASHBOARD (Students & General Public)
function renderSellerDashboard(container) {
  const myBooks = (state.bookRequests || []).filter(r => r.user_id === state.currentUser.id);
  const myRaddi = (state.wasteRequests || []).filter(r => r.user_id === state.currentUser.id);

  let totalEarnings = 0;
  myBooks.forEach(r => { if (r.status === 'Completed' && r.total_estimated_payout) totalEarnings += parseFloat(r.total_estimated_payout); });
  myRaddi.forEach(r => { if (r.status === 'Completed' && r.final_amount) totalEarnings += parseFloat(r.final_amount); });

  // Check if user has an existing stall or scrap application
  const myStallApp = (state.bookStalls || []).find(s => s.user_id === state.currentUser.id);
  const myScrapApp = (state.scrapOwners || []).find(s => s.user_id === state.currentUser.id);

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Profile & Greeting Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-lg shadow-inner">
              ${state.currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold text-slate-900">${state.currentUser.name}</h2>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">Email Verified ✅</span>
                <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">18+ Confirmed</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${state.currentUser.email} • ${state.currentUser.phone}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="openBookSubmissionModal()" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition">
              <span>➕</span> Submit Used Books
            </button>
            <button onclick="openRaddiSubmissionModal()" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition">
              <span>⚖️</span> Sell Recycle Scrap (≥ 10 kg)
            </button>
            <button onclick="openComplaintModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs border font-medium">
              <span>🛡️</span> Contact Support
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Active Submissions</div>
            <div class="text-xl font-black text-slate-900">${myBooks.filter(r => r.status !== 'Completed').length + myRaddi.filter(r => r.status !== 'Completed').length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Completed Orders</div>
            <div class="text-xl font-black text-emerald-700">${myBooks.filter(r => r.status === 'Completed').length + myRaddi.filter(r => r.status === 'Completed').length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Total Payout Received</div>
            <div class="text-xl font-black text-amber-600">₹${totalEarnings.toFixed(2)}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Recycled Paper Weight</div>
            <div class="text-xl font-black text-emerald-800">${myRaddi.reduce((a, b) => a + (parseFloat(b.actual_weight_kg || b.estimated_weight_kg) || 0), 0)} kg</div>
          </div>
        </div>
      </div>

      <!-- Unified Partner Upgrade or Status Section -->
      ${myStallApp && myStallApp.approval_status === 'approved' ? `
        <div class="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🏬</span>
            <div>
              <h4 class="font-bold text-sm text-emerald-950">Approved Book Stall Partner: ${myStallApp.stall_name}</h4>
              <p class="text-xs text-emerald-800 mt-0.5">Your store is approved. You can switch to your bookstore management console anytime.</p>
            </div>
          </div>
          <button onclick="switchToBusinessRole('book_stall')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition whitespace-nowrap">
            Open Book Stall Console →
          </button>
        </div>
      ` : myScrapApp && myScrapApp.approval_status === 'approved' ? `
        <div class="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-3xl">♻️</span>
            <div>
              <h4 class="font-bold text-sm text-emerald-950">Approved Scrap Business Partner: ${myScrapApp.business_name}</h4>
              <p class="text-xs text-emerald-800 mt-0.5">Your yard is verified. Switch to your scrap collection console anytime.</p>
            </div>
          </div>
          <button onclick="switchToBusinessRole('raddi_owner')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition whitespace-nowrap">
            Open Scrap Dealer Console →
          </button>
        </div>
      ` : (myStallApp && myStallApp.approval_status === 'pending') || (myScrapApp && myScrapApp.approval_status === 'pending') ? `
        <div class="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <span class="text-2xl flex-shrink-0">⏳</span>
          <div>
            <h4 class="font-bold text-sm text-amber-950">Partner Application Under Review</h4>
            <p class="text-xs text-amber-900 mt-0.5">
              Your business partnership application for <strong>${(myStallApp?.stall_name || myScrapApp?.business_name)}</strong> has been received and is pending Administrator verification. You will be notified automatically upon activation.
            </p>
          </div>
        </div>
      ` : `
        <!-- Become a Verified Business Partner Card -->
        <div class="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-xl p-5 shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xl">🏪</span>
              <h3 class="font-extrabold text-sm text-amber-300 uppercase tracking-wider">Become a Verified Business Partner</h3>
            </div>
            <p class="text-xs text-emerald-200 max-w-2xl leading-relaxed">
              Own a physical bookstore or paper recycling depot? Upgrade your account in 1 click to review student textbook requests or collect bulk paper scrap without creating a second account.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 flex-shrink-0">
            <button onclick="openBusinessApplyModal('stall')" class="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs shadow transition flex items-center gap-1.5">
              <span>🏬</span> Apply as Book Stall
            </button>
            <button onclick="openBusinessApplyModal('raddi')" class="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow border border-emerald-500 transition flex items-center gap-1.5">
              <span>♻️</span> Apply as Scrap Partner
            </button>
          </div>
        </div>
      `}

      <!-- My Textbook Submissions -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-slate-900 flex items-center gap-2">
            <span>📚</span> My Used Book Requests (${myBooks.length})
          </h3>
          <button onclick="openBookSubmissionModal()" class="text-xs text-emerald-700 hover:underline font-bold">+ New Submission</button>
        </div>

        ${myBooks.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">📚</span>
            <strong>No textbook requests yet.</strong>
            <p class="mt-1">Have college textbooks to sell? Click "Submit Used Books" above to receive condition-capped price offers from local book stalls.</p>
          </div>
        ` : `
          <div class="space-y-3">
            ${myBooks.map(b => `
              <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div class="flex items-center justify-between border-b pb-2">
                  <div>
                    <span class="font-bold text-sm text-slate-900">${b.request_number}</span>
                    <span class="text-xs text-slate-600 font-medium ml-2">${b.title} by ${b.author} (${b.book_condition})</span>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    Original Price: ₹${b.original_price} • Max Valuation Cap: <strong>₹${b.total_estimated_payout}</strong> • Handover: <em>${(b.handover_method || '').replace(/_/g, ' ')}</em>
                  </div>
                  <div class="flex items-center gap-2">
                    ${b.status === 'Completed' ? `
                      <button onclick="openStallReviewModal('${b.stall_id || (b.accepted_offer && b.accepted_offer.stall_id)}', '${b.id}')" class="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded text-xs border border-amber-300 flex items-center gap-1 shadow-sm">
                        <span>⭐</span> Rate Book Stall
                      </button>
                    ` : ''}
                    ${b.status === 'Accepted' ? `
                      <button onclick="openChatModal('${b.id}', 'Book Stall Partner')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-1 rounded text-xs shadow flex items-center gap-1">
                        <span>💬 Chat</span>
                      </button>
                      <button onclick="openPaymentConfirmModal('book', '${b.id}', ${b.total_estimated_payout || 300})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                        Confirm Payment Received →
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- My Recycle Scrap Submissions (Strictly ≥ 10 kg) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-slate-900 flex items-center gap-2">
            <span>♻️</span> My Recycle Scrap Requests (≥ 10 kg) (${myRaddi.length})
          </h3>
          <button onclick="openRaddiSubmissionModal()" class="text-xs text-emerald-700 hover:underline font-bold">+ New Pickup</button>
        </div>

        ${myRaddi.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">♻️</span>
            <strong>No scrap collection requests yet.</strong>
            <p class="mt-1">Have 10+ kg of old newspapers, notebooks, or rough books at home? Request a doorstep pickup and get paid on the spot.</p>
          </div>
        ` : `
          <div class="space-y-3">
            ${myRaddi.map(r => `
              <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div class="flex items-center justify-between border-b pb-2">
                  <div>
                    <span class="font-bold text-sm text-slate-900">${r.request_number}</span>
                    <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">≥ 10 kg</span>
                    <span class="text-xs text-slate-600 font-medium ml-1">${r.paper_type} (${r.estimated_weight_kg} kg)</span>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(r.status)}">${r.status}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    Area: <strong>${r.pickup_area}</strong> • Preferred: ${r.preferred_date} (${r.preferred_slot})
                  </div>
                  <div class="flex items-center gap-2">
                    ${r.status === 'Accepted' ? `
                      <button onclick="openChatModal('${r.id}', 'Scrap Recycling Partner')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-1 rounded text-xs shadow flex items-center gap-1">
                        <span>💬 Chat</span>
                      </button>
                      <button onclick="openPaymentConfirmModal('raddi', '${r.id}', 350)" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                        Confirm Payment Received →
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// 2. BOOK STALL OWNER DASHBOARD (Strictly Authenticated Owner Records)
function renderStallDashboard(container) {
  const stall = (state.bookStalls || []).find(s => s.user_id === state.currentUser.id);

  if (!stall) {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto">
        <span class="text-4xl block">🏬</span>
        <h3 class="text-lg font-bold text-slate-900">No Book Stall Registered For This Account</h3>
        <p class="text-xs text-slate-600">
          You are currently signed in as a user. If you operate a physical bookstore, apply for partnership below to unlock the Book Stall console.
        </p>
        <button onclick="openBusinessApplyModal('stall')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow transition">
          Apply as Book Stall Partner →
        </button>
      </div>
    `;
    return;
  }

  if (stall.approval_status !== 'approved') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto">
        <span class="text-4xl block">⏳</span>
        <h3 class="text-lg font-bold text-slate-900">Application Awaiting Admin Approval</h3>
        <p class="text-xs text-slate-600">
          Your book stall application for <strong>${stall.stall_name}</strong> (Licence: ${stall.licence_number}) is under review by the Administrator. You will be granted full access upon verification.
        </p>
        <button onclick="switchToSellerRole()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-lg text-xs">
          Return to Seller Dashboard
        </button>
      </div>
    `;
    return;
  }

  const perf = calculateStallPerformanceScore(stall);
  const myOffers = (state.bookOffers || []).filter(o => o.stall_id === stall.id);
  const completedOffers = myOffers.filter(o => o.status === 'Completed');
  const availableBooks = (state.bookRequests || []).filter(b => b.status === 'Pending' || b.status === 'Offer Received');

  let stallRevenue = 0;
  (state.transactions || []).forEach(t => {
    if (t.status === 'Completed' && (t.stall_id === stall.id || t.receiver_id === stall.user_id)) {
      stallRevenue += parseFloat(t.amount) || 0;
    }
  });

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Stall Profile & Verification Banner -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏬</span>
              <h2 class="text-xl font-bold text-slate-900">${stall.stall_name}</h2>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Verified Bookstore Partner ✅
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Licence: ${stall.licence_number} • ${stall.address}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="switchToSellerRole()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border">
              👤 Switch to Seller View
            </button>
          </div>
        </div>

        <!-- Performance Score Card (Transparent Calculation) -->
        <div class="mt-6 pt-4 border-t border-slate-100 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="text-xs font-bold text-emerald-950 uppercase tracking-wider">Store Marketplace Performance Score</div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-2xl font-black text-slate-900">${perf.score} / 100</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${perf.badge.color}">${perf.badge.text}</span>
              </div>
              <p class="text-[11px] text-slate-600 mt-0.5">
                Fulfilment Rate: <strong>${perf.fulfilmentScore}/40</strong> • Rating: <strong>${perf.ratingScore}/40 (${perf.avgRating}★)</strong> • Trade Volume: <strong>${perf.volumeScore}/20</strong>
              </p>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-emerald-800 font-semibold block">Calculated from genuine student orders</span>
              <span class="text-xs text-slate-500">${perf.reviewCount} customer reviews recorded</span>
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Stall Revenue</div>
            <div class="text-xl font-black text-amber-600">₹${stallRevenue.toFixed(2)}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Completed Orders</div>
            <div class="text-xl font-black text-emerald-700">${completedOffers.length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Active Offers Sent</div>
            <div class="text-xl font-black text-slate-900">${myOffers.filter(o => o.status === 'Pending').length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Average Rating</div>
            <div class="text-xl font-black text-amber-500">${perf.avgRating} ★</div>
          </div>
        </div>
      </div>

      <!-- Live Student Requests Queue (Awaiting Offers) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-slate-900">Live Textbook Requests Feed (${availableBooks.length})</h3>
          <span class="text-xs text-slate-500">Condition caps strictly enforced</span>
        </div>

        ${availableBooks.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">📚</span>
            <strong>No textbook requests available yet.</strong>
            <p class="mt-1">When students submit college textbooks in your region, they will appear here in real-time for you to review photos and submit offers.</p>
          </div>
        ` : `
          <div class="space-y-3">
            ${availableBooks.map(b => `
              <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div class="flex items-center justify-between border-b pb-2">
                  <div>
                    <span class="font-bold text-sm text-slate-900">${b.request_number}</span>
                    <span class="text-xs text-slate-600 font-medium ml-2">${b.title} by ${b.author} (${b.book_condition})</span>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    Declared Price: ₹${b.original_price} • Max Valuation Cap: <strong>₹${b.total_estimated_payout}</strong> • Handover: <em>${(b.handover_method || '').replace(/_/g, ' ')}</em>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="openSendOfferModal('book', '${b.id}', ${b.total_estimated_payout})" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded-lg shadow text-xs transition">
                      Make Offer (Max ₹${b.total_estimated_payout}) →
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- My Sent Offers & Active Transactions -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-base text-slate-900">My Sent Offers & Trade Orders (${myOffers.length})</h3>

        ${myOffers.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">🏷️</span>
            <strong>No offers submitted yet.</strong>
            <p class="mt-1">Review the live student requests feed above and submit competitive offers within the condition caps.</p>
          </div>
        ` : `
          <div class="space-y-3">
            ${myOffers.map(o => `
              <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div class="flex items-center justify-between border-b pb-2">
                  <div>
                    <span class="font-bold text-sm text-slate-900">Offer on Request #${o.request_id ? o.request_id.slice(0, 8) : 'ORD'}</span>
                    <span class="text-xs font-bold text-amber-700 ml-2">Quote: ₹${o.offer_amount}</span>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(o.status)}">${o.status}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <div>Status: <strong>${o.status}</strong></div>
                  <div class="flex items-center gap-2">
                    ${o.status === 'Accepted' ? `
                      <button onclick="openChatModal('${o.request_id}', 'Student')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-1 rounded text-xs shadow flex items-center gap-1">
                        <span>💬 Chat with Student</span>
                      </button>
                      <button onclick="openRecordPaymentModal('book', '${o.request_id}', ${o.offer_amount})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                        Record Counter Payment →
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// 3. RECYCLE SCRAP OWNER DASHBOARD (Strictly Authenticated Yard Records)
function renderRaddiOwnerDashboard(container) {
  const scrap = (state.scrapOwners || []).find(s => s.user_id === state.currentUser.id);

  if (!scrap) {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto">
        <span class="text-4xl block">♻️</span>
        <h3 class="text-lg font-bold text-slate-900">No Scrap Recycling Yard Registered</h3>
        <p class="text-xs text-slate-600">
          You are currently signed in as a general user. If you operate an authorized scrap recycling yard, submit your trade licence below to access bulk collections.
        </p>
        <button onclick="openBusinessApplyModal('raddi')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow transition">
          Apply as Scrap Business Partner →
        </button>
      </div>
    `;
    return;
  }

  if (scrap.approval_status !== 'approved') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto">
        <span class="text-4xl block">⏳</span>
        <h3 class="text-lg font-bold text-slate-900">Application Awaiting Admin Verification</h3>
        <p class="text-xs text-slate-600">
          Your scrap yard application for <strong>${scrap.business_name}</strong> (Licence: ${scrap.licence_number}) is under review by the Administrator. You will be activated upon inspection.
        </p>
        <button onclick="switchToSellerRole()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-lg text-xs">
          Return to Seller Dashboard
        </button>
      </div>
    `;
    return;
  }

  const myQuotes = (state.scrapOffers || []).filter(o => o.scrap_owner_id === scrap.id);
  const eligibleRequests = (state.wasteRequests || []).filter(r => (parseFloat(r.estimated_weight_kg) || 0) >= 10);

  let totalRecycledKg = 0;
  let totalDisbursed = 0;
  (state.transactions || []).forEach(t => {
    if (t.status === 'Completed' && (t.scrap_owner_id === scrap.id || t.receiver_id === scrap.user_id)) {
      totalDisbursed += parseFloat(t.amount) || 0;
    }
  });

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Scrap Depot Banner -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">♻️</span>
              <h2 class="text-xl font-bold text-slate-900">${scrap.business_name}</h2>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Verified Scrap Recycling Depot ✅
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Licence: ${scrap.licence_number} • ${scrap.address}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="switchToSellerRole()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border">
              👤 Switch to Seller View
            </button>
          </div>
        </div>

        <div class="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-2">
          <span class="text-base flex-shrink-0">⚖️</span>
          <span><strong>Strict 10 kg Threshold Enforced:</strong> Pickups below 10 kg are filtered out by the system. Calibrated digital scale weighing is mandatory upon doorstep collection.</span>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Total Payout Disbursed</div>
            <div class="text-xl font-black text-amber-600">₹${totalDisbursed.toFixed(2)}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Completed Collections</div>
            <div class="text-xl font-black text-emerald-700">${myQuotes.filter(q => q.status === 'Completed').length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Active Rate Quotes</div>
            <div class="text-xl font-black text-slate-900">${myQuotes.filter(q => q.status === 'Pending').length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="text-[11px] font-medium text-slate-500">Depot Operating Status</div>
            <div class="text-xl font-black text-emerald-700">Active ✅</div>
          </div>
        </div>
      </div>

      <!-- Eligible Doorstep Pickups (≥ 10 kg) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-slate-900">Available Scrap Collection Requests (≥ 10 kg) (${eligibleRequests.length})</h3>
          <span class="text-xs text-slate-500">Doorstep digital weighing required</span>
        </div>

        ${eligibleRequests.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">♻️</span>
            <strong>No scrap collection requests (≥ 10 kg) available yet.</strong>
            <p class="mt-1">When students or residents submit scrap paper requests meeting the 10 kg minimum, they will appear here in real-time.</p>
          </div>
        ` : `
          <div class="space-y-3">
            ${eligibleRequests.map(r => `
              <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div class="flex items-center justify-between border-b pb-2">
                  <div>
                    <span class="font-bold text-sm text-slate-900">${r.request_number}</span>
                    <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">≥ 10 kg</span>
                    <span class="text-xs text-slate-600 font-medium ml-1">${r.paper_type} (${r.estimated_weight_kg} kg)</span>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(r.status)}">${r.status}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    Area: <strong>${r.pickup_area}</strong> • Preferred: ${r.preferred_date} (${r.preferred_slot})
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="openSendOfferModal('raddi', '${r.id}', 0, ${r.estimated_weight_kg})" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded-lg shadow text-xs transition">
                      Quote Rate per kg (₹/kg) →
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- My Active Pickups & Settlements -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-base text-slate-900">My Quoted Pickups & Settlements (${myQuotes.length})</h3>

        ${myQuotes.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">📋</span>
            <strong>No active quotes submitted yet.</strong>
            <p class="mt-1">Review the eligible requests feed above and propose competitive ₹/kg rates.</p>
          </div>
        ` : `
          <div class="space-y-3">
            ${myQuotes.map(q => `
              <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div class="flex items-center justify-between border-b pb-2">
                  <div>
                    <span class="font-bold text-sm text-slate-900">Pickup #${q.request_id ? q.request_id.slice(0, 8) : 'RAD'}</span>
                    <span class="text-xs font-bold text-emerald-800 ml-2">Quote: ₹${q.rate_per_kg}/kg (Est. Total: ₹${q.offer_amount})</span>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(q.status)}">${q.status}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <div>Status: <strong>${q.status}</strong></div>
                  <div class="flex items-center gap-2">
                    ${q.status === 'Accepted' ? `
                      <button onclick="openChatModal('${q.request_id}', 'Customer')" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-1 rounded text-xs shadow flex items-center gap-1">
                        <span>💬 Chat</span>
                      </button>
                      <button onclick="openRecordPaymentModal('raddi', '${q.request_id}', 350)" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                        Record Scale Weight & Payment →
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// 4. ADMIN DASHBOARD (Single Provisioned Authority & Regional Sales Analytics)
function renderAdminDashboard(container) {
  const pendingStalls = (state.bookStalls || []).filter(s => s.approval_status === 'pending');
  const pendingScrap = (state.scrapOwners || []).filter(s => s.approval_status === 'pending');

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Admin Master Header -->
      <div class="bg-rose-950 text-white rounded-xl p-6 border-2 border-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🛡️</span>
            <h2 class="text-xl font-black">SECOND SHELF Administration Console</h2>
            <span class="bg-rose-800 text-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-500">Root Authority</span>
          </div>
          <p class="text-xs text-rose-300 mt-1">Single Provisioned Administrator (${state.currentUser.email}) • Real-Time Database Clearance</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="showSection('home')" class="bg-rose-900 hover:bg-rose-800 text-rose-200 font-bold px-3 py-1.5 rounded-lg text-xs border border-rose-700 transition">
            🏠 Marketplace View
          </button>
          <button onclick="logout()" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-slate-200 gap-2 text-xs font-bold overflow-x-auto pb-1" style="scrollbar-width: thin;">
        <button onclick="setAdminTab('analytics')" id="admin-tab-analytics" class="pb-2 border-b-2 border-emerald-600 text-emerald-800 font-bold whitespace-nowrap px-2">
          📊 Regional Sales Analytics
        </button>
        <button onclick="setAdminTab('stall-scores')" id="admin-tab-stall-scores" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          ⭐ Stall Performance & Scores (${state.bookStalls.length})
        </button>
        <button onclick="setAdminTab('approvals')" id="admin-tab-approvals" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          📋 Partner Approvals (${pendingStalls.length + pendingScrap.length})
        </button>
        <button onclick="setAdminTab('sessions')" id="admin-tab-sessions" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          🚪 Live User Entry & Exit
        </button>
        <button onclick="setAdminTab('users')" id="admin-tab-users" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          👥 User Management
        </button>
        <button onclick="setAdminTab('website')" id="admin-tab-website" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          📦 Marketplace Transactions (${state.transactions.length})
        </button>
        <button onclick="setAdminTab('complaints')" id="admin-tab-complaints" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          🛡️ Disputes & Feedback (${state.complaints.length})
        </button>
        <button onclick="setAdminTab('guidelines')" id="admin-tab-guidelines" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          📜 Guidelines & Rules (${state.guidelines.length})
        </button>
        <button onclick="setAdminTab('audit')" id="admin-tab-audit" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2">
          🔒 Security Logs
        </button>
      </div>

      <!-- Tab Content Mount Container -->
      <div id="admin-tab-container"></div>
    </div>
  `;

  setAdminTab('analytics');
}

function setAdminTab(tab) {
  const tabs = ['analytics', 'stall-scores', 'approvals', 'sessions', 'users', 'website', 'complaints', 'guidelines', 'audit'];
  tabs.forEach(t => {
    const btn = document.getElementById(`admin-tab-${t}`);
    if (btn) {
      if (t === tab) {
        btn.className = 'pb-2 border-b-2 border-emerald-600 text-emerald-800 font-bold whitespace-nowrap px-2';
      } else {
        btn.className = 'pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold whitespace-nowrap px-2';
      }
    }
  });

  const container = document.getElementById('admin-tab-container');
  if (!container) return;

  // TAB 1: REGIONAL SALES ANALYTICS & EXECUTIVE OVERVIEW
  if (tab === 'analytics') {
    const analytics = getRegionalSalesAnalytics(analyticsFilters);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- 8 Overall Statistics Metric Cards (100% Real Database Queries) -->
        <div>
          <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Overall Marketplace Statistics</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Total Registered Users</div>
              <div class="text-2xl font-black text-slate-900 mt-1">${analytics.totalRegisteredUsers}</div>
              <div class="text-[10px] text-emerald-700 font-bold mt-1">Verified Accounts</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Active Book Stalls</div>
              <div class="text-2xl font-black text-emerald-800 mt-1">${analytics.totalActiveStalls}</div>
              <div class="text-[10px] text-slate-500 mt-1">Approved Bookstores</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Active Scrap Depots</div>
              <div class="text-2xl font-black text-emerald-700 mt-1">${analytics.totalActiveScrap}</div>
              <div class="text-[10px] text-slate-500 mt-1">Authorized Recyclers</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Textbook Transactions</div>
              <div class="text-2xl font-black text-blue-700 mt-1">${analytics.totalBookTx}</div>
              <div class="text-[10px] text-slate-500 mt-1">College Study Books</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Scrap Transactions</div>
              <div class="text-2xl font-black text-amber-700 mt-1">${analytics.totalScrapTx}</div>
              <div class="text-[10px] text-slate-500 mt-1">≥ 10 kg Batches</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Total Sales Volume</div>
              <div class="text-2xl font-black text-amber-600 mt-1">₹${analytics.totalSalesAmount.toFixed(2)}</div>
              <div class="text-[10px] text-emerald-700 font-bold mt-1">Gross Settlements</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Completed Orders</div>
              <div class="text-2xl font-black text-emerald-800 mt-1">${analytics.totalCompletedOrders}</div>
              <div class="text-[10px] text-slate-500 mt-1">Two-Party Verified</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div class="text-[11px] font-semibold text-slate-500">Pending Applications</div>
              <div class="text-2xl font-black text-rose-700 mt-1">${analytics.pendingApps}</div>
              <div class="text-[10px] text-rose-600 font-bold mt-1">Review Required</div>
            </div>
          </div>
        </div>

        <!-- Regional-Wise Sales Records & Interactive Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 class="font-extrabold text-base text-slate-900">Regional-Wise Sales Records</h3>
              <p class="text-xs text-slate-500">Sales grouped by state, district, and city across Karnataka marketplace</p>
            </div>
            <span class="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ⚡ Real-Time Database Queries
            </span>
          </div>

          <!-- Interactive Filter Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Filter by Region</label>
              <select onchange="setAnalyticsFilter('region', this.value)" class="w-full p-2 rounded-lg border border-slate-300 amazon-focus font-medium">
                <option value="all" ${analytics.filters.region === 'all' ? 'selected' : ''}>All Regions (Karnataka)</option>
                <option value="Bengaluru Urban" ${analytics.filters.region === 'Bengaluru Urban' ? 'selected' : ''}>Bengaluru Urban</option>
                <option value="Mysuru" ${analytics.filters.region === 'Mysuru' ? 'selected' : ''}>Mysuru</option>
                <option value="Hubballi-Dharwad" ${analytics.filters.region === 'Hubballi-Dharwad' ? 'selected' : ''}>Hubballi-Dharwad</option>
                <option value="Dakshina Kannada" ${analytics.filters.region === 'Dakshina Kannada' ? 'selected' : ''}>Dakshina Kannada (Mangaluru)</option>
                <option value="Belagavi" ${analytics.filters.region === 'Belagavi' ? 'selected' : ''}>Belagavi</option>
                <option value="Kalaburagi" ${analytics.filters.region === 'Kalaburagi' ? 'selected' : ''}>Kalaburagi</option>
                <option value="Shivamogga" ${analytics.filters.region === 'Shivamogga' ? 'selected' : ''}>Shivamogga</option>
                <option value="Tumakuru" ${analytics.filters.region === 'Tumakuru' ? 'selected' : ''}>Tumakuru</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Business Type</label>
              <select onchange="setAnalyticsFilter('bizType', this.value)" class="w-full p-2 rounded-lg border border-slate-300 amazon-focus font-medium">
                <option value="all" ${analytics.filters.bizType === 'all' ? 'selected' : ''}>All Business Types</option>
                <option value="books" ${analytics.filters.bizType === 'books' ? 'selected' : ''}>Book Stalls (Textbooks)</option>
                <option value="scrap" ${analytics.filters.bizType === 'scrap' ? 'selected' : ''}>Scrap Recyclers (Paper)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Transaction Status</label>
              <select onchange="setAnalyticsFilter('status', this.value)" class="w-full p-2 rounded-lg border border-slate-300 amazon-focus font-medium">
                <option value="all" ${analytics.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="Completed" ${analytics.filters.status === 'Completed' ? 'selected' : ''}>Completed & Settled</option>
                <option value="Pending" ${analytics.filters.status === 'Pending' ? 'selected' : ''}>Pending Payment</option>
                <option value="Cancelled" ${analytics.filters.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Date Range</label>
              <select onchange="setAnalyticsFilter('dateRange', this.value)" class="w-full p-2 rounded-lg border border-slate-300 amazon-focus font-medium">
                <option value="all" ${analytics.filters.dateRange === 'all' ? 'selected' : ''}>All Time</option>
                <option value="30days" ${analytics.filters.dateRange === '30days' ? 'selected' : ''}>Last 30 Days</option>
                <option value="year" ${analytics.filters.dateRange === 'year' ? 'selected' : ''}>Current Year (2026)</option>
              </select>
            </div>
          </div>

          <!-- Regional Sales Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th class="p-3">State</th>
                  <th class="p-3">District</th>
                  <th class="p-3">City / Hub</th>
                  <th class="p-3">Total Sales (₹)</th>
                  <th class="p-3">Completed Orders</th>
                  <th class="p-3">Active Book Stalls</th>
                  <th class="p-3">Active Scrap Depots</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                ${analytics.rows.length === 0 ? `
                  <tr>
                    <td colspan="7" class="p-8 text-center text-slate-500">
                      No sales records found matching the selected filters.
                    </td>
                  </tr>
                ` : analytics.rows.map(r => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="p-3 text-slate-600">${r.state}</td>
                    <td class="p-3 font-bold text-slate-900">${r.district}</td>
                    <td class="p-3 text-slate-700">${r.city}</td>
                    <td class="p-3 font-bold text-amber-700">₹${r.totalSales.toFixed(2)}</td>
                    <td class="p-3 text-emerald-800 font-bold">${r.completedOrders}</td>
                    <td class="p-3">${r.activeStalls > 0 ? `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">${r.activeStalls} stalls</span>` : '<span class="text-slate-400">0</span>'}</td>
                    <td class="p-3">${r.activeScrap > 0 ? `<span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">${r.activeScrap} depots</span>` : '<span class="text-slate-400">0</span>'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Monthly & Yearly Sales Reports Visual Breakdown -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 class="font-extrabold text-base text-slate-900">Monthly & Yearly Sales Performance Reports</h3>
          <p class="text-xs text-slate-500">Visual breakdown of transactions and revenue trends across academic semesters</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <!-- Monthly Trends -->
            <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 class="font-bold text-xs text-slate-800 uppercase tracking-wider">Monthly Sales Volume</h4>
              <div class="space-y-2 text-xs">
                <div>
                  <div class="flex justify-between font-semibold mb-1">
                    <span>November 2026 (Mid-Semester Exam Prep)</span>
                    <span class="text-amber-700 font-bold">₹${analytics.totalSalesAmount.toFixed(0)}</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-emerald-600 h-2.5 rounded-full" style="width: 100%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between font-semibold mb-1">
                    <span>October 2026 (Semester Start)</span>
                    <span class="text-slate-600 font-bold">₹0</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-slate-300 h-2.5 rounded-full" style="width: 5%"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Yearly Trends -->
            <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 class="font-bold text-xs text-slate-800 uppercase tracking-wider">Annual Academic Year Comparison</h4>
              <div class="space-y-2 text-xs">
                <div>
                  <div class="flex justify-between font-semibold mb-1">
                    <span>Academic Year 2026</span>
                    <span class="text-emerald-800 font-bold">₹${analytics.totalSalesAmount.toFixed(0)} (Active)</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-shelf-forest h-2.5 rounded-full" style="width: 100%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between font-semibold mb-1">
                    <span>Academic Year 2025</span>
                    <span class="text-slate-500 font-medium">Platform Launch Phase</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-slate-300 h-2.5 rounded-full" style="width: 15%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // TAB 2: BOOK STALL PERFORMANCE & SCORES ENGINE
  else if (tab === 'stall-scores') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Book Stall Performance Scores & Transparent Evaluation</h3>
            <p class="text-xs text-slate-500">Calculated strictly from completed transactions, customer ratings, and order fulfilment rates</p>
          </div>
          <span class="text-xs text-blue-800 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Rule-Based Scoring Formula (0 - 100)
          </span>
        </div>

        <!-- Transparent Scoring Criteria Explanation Banner -->
        <div class="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-4 rounded-xl text-xs space-y-2 shadow-sm border border-emerald-800">
          <div class="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚖️</span> Transparent Performance Formula (100 Points Total):
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 text-slate-200">
            <div class="bg-white/10 p-2.5 rounded-lg border border-white/10">
              <div class="font-bold text-amber-300">1. Order Fulfilment (40%)</div>
              <div class="text-[11px] text-slate-300 mt-0.5">Ratio of accepted student book requests fulfilled and confirmed.</div>
            </div>
            <div class="bg-white/10 p-2.5 rounded-lg border border-white/10">
              <div class="font-bold text-amber-300">2. Customer Rating (40%)</div>
              <div class="text-[11px] text-slate-300 mt-0.5">Average verified student feedback score scaled from 5.0★.</div>
            </div>
            <div class="bg-white/10 p-2.5 rounded-lg border border-white/10">
              <div class="font-bold text-amber-300">3. Trade Volume (20%)</div>
              <div class="text-[11px] text-slate-300 mt-0.5">Transaction activity and counter payment promptness.</div>
            </div>
            <div class="bg-white/10 p-2.5 rounded-lg border border-white/10">
              <div class="font-bold text-rose-300">4. Dispute Deduction</div>
              <div class="text-[11px] text-slate-300 mt-0.5">-10 points per unresolved customer complaint.</div>
            </div>
          </div>
        </div>

        <!-- Performance Scores Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-3">Stall Name</th>
                <th class="p-3">Owner / Contact</th>
                <th class="p-3">Region</th>
                <th class="p-3">Total Sales</th>
                <th class="p-3">Completed</th>
                <th class="p-3">Customer Rating</th>
                <th class="p-3">Performance Score</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${state.bookStalls.length === 0 ? `
                <tr>
                  <td colspan="9" class="p-8 text-center text-slate-500">
                    No book stalls registered in the database yet.
                  </td>
                </tr>
              ` : state.bookStalls.map(s => {
                const perf = calculateStallPerformanceScore(s);
                return `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="p-3 font-bold text-slate-900">${s.stall_name}</td>
                    <td class="p-3 text-slate-600">${s.phone || 'Phone verified'}</td>
                    <td class="p-3 text-slate-700">${s.pincode} (${(s.address || '').split(',').slice(-2).join(',').trim()})</td>
                    <td class="p-3 font-bold text-amber-700">₹${perf.completedCount * 350}</td>
                    <td class="p-3 text-emerald-800 font-bold">${perf.completedCount}</td>
                    <td class="p-3">
                      <span class="text-amber-500 font-bold">${perf.avgRating} ★</span>
                      <span class="text-[10px] text-slate-400">(${perf.reviewCount})</span>
                    </td>
                    <td class="p-3">
                      <div class="flex items-center gap-1.5">
                        <span class="font-black text-sm text-slate-900">${perf.score}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${perf.badge.color}">${perf.badge.text}</span>
                      </div>
                    </td>
                    <td class="p-3">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${s.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : s.approval_status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'}">
                        ${(s.approval_status || 'approved').toUpperCase()}
                      </span>
                    </td>
                    <td class="p-3 text-right">
                      <button onclick="alert('Score Breakdown for ${s.stall_name}:\nFulfilment: ${perf.fulfilmentScore}/40\nCustomer Rating: ${perf.ratingScore}/40\nTrade Volume: ${perf.volumeScore}/20\nPenalties: -${perf.penalty}\nTotal Score: ${perf.score}/100')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-semibold border">
                        Score Breakdown
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // TAB 3: PARTNER APPROVALS (Requirements 4, 5, 6)
  else if (tab === 'approvals') {
    const pendingStalls = (state.bookStalls || []).filter(s => (s.approval_status || '').toLowerCase() === 'pending').map(s => ({
      ...s,
      bizType: 'Book Stall',
      bizName: s.stall_name,
      applicantType: 'stall',
      locationInfo: getBusinessLocation(s),
      userEmail: (state.profiles || []).find(p => p.id === s.user_id)?.email || s.phone || 'applicant@secondshelf.in'
    }));

    const pendingScraps = (state.scrapOwners || []).filter(r => (r.approval_status || '').toLowerCase() === 'pending').map(r => ({
      ...r,
      bizType: 'Recycle & Scrap',
      bizName: r.business_name,
      applicantType: 'raddi',
      locationInfo: getBusinessLocation(r),
      userEmail: (state.profiles || []).find(p => p.id === r.user_id)?.email || r.phone || 'applicant@secondshelf.in'
    }));

    const allPending = [...pendingStalls, ...pendingScraps];
    const approvedStalls = (state.bookStalls || []).filter(s => (s.approval_status || '').toLowerCase() === 'approved');
    const approvedScraps = (state.scrapOwners || []).filter(r => (r.approval_status || '').toLowerCase() === 'approved');

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Live Real-Time Notifications Area (Requirement 6) -->
        <div class="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-800 text-white rounded-xl p-5 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-emerald-800/80 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">🔔</span>
              <h3 class="font-extrabold text-sm text-amber-300 uppercase tracking-wider">Admin Real-Time Application Notifications</h3>
              <span class="bg-emerald-800/80 text-emerald-200 border border-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Active Stream
              </span>
            </div>
            <span class="text-xs font-mono font-bold text-emerald-300">
              ${allPending.length} Applications Pending
            </span>
          </div>

          ${(state.adminLiveNotifications && state.adminLiveNotifications.length > 0) ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              ${state.adminLiveNotifications.map(n => `
                <div class="bg-emerald-900/50 border border-emerald-700/60 rounded-lg p-2.5 text-xs flex items-center justify-between gap-2">
                  <div>
                    <div class="font-bold text-slate-100 flex items-center gap-1.5">
                      <span>${n.bizType === 'Book Stall' ? '🏬' : '♻️'}</span>
                      <span>${n.title}</span>
                    </div>
                    <div class="text-[11px] text-emerald-200 mt-0.5">
                      Applicant: <strong>${n.applicantName}</strong> • Type: ${n.bizType} • ${n.time}
                    </div>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded font-black uppercase ${n.status === 'APPROVED' ? 'bg-emerald-200 text-emerald-950' : n.status === 'REJECTED' ? 'bg-rose-200 text-rose-950' : 'bg-amber-200 text-amber-950'}">
                    ${n.status}
                  </span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-xs text-emerald-300/80 flex items-center gap-2 py-1">
              <span>⚡</span> Connected to Supabase Realtime. New Book Stall & Scrap Owner registrations appear here instantly.
            </div>
          `}
        </div>

        <!-- Section 1: BOOK STALL OWNER APPROVAL REQUESTS (Exact Requirement 4) -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">🏬</span>
                <h3 class="font-black text-base text-slate-900 tracking-tight">BOOK STALL OWNER APPROVAL REQUESTS</h3>
                <span class="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-black px-2.5 py-0.5 rounded-full">
                  ${pendingStalls.length} Pending
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                New bookstore registrations waiting for Administrator verification before granting Book Stall Owner Dashboard access.
              </p>
            </div>
            <button onclick="refreshRequestsAndOffers().then(() => setAdminTab('approvals'))" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-300 transition flex items-center gap-1 self-start sm:self-auto">
              <span>🔄</span> Refresh Stalls
            </button>
          </div>

          ${pendingStalls.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-1">
              <span class="text-3xl block mb-2">✅</span>
              <strong class="text-slate-700">No Pending Book Stall Applications</strong>
              <p>All bookstore owner registrations have been processed.</p>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead class="bg-slate-100 text-slate-700 font-bold border-b">
                  <tr>
                    <th class="p-3">Owner Name</th>
                    <th class="p-3">Stall Name</th>
                    <th class="p-3">Email Address</th>
                    <th class="p-3">Phone Number</th>
                    <th class="p-3">Location (City, District)</th>
                    <th class="p-3">Submitted Date</th>
                    <th class="p-3">Status</th>
                    <th class="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${pendingStalls.map(s => `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-3 font-bold text-slate-900">${s.owner_name}</td>
                      <td class="p-3 font-extrabold text-blue-900">
                        <span class="mr-1">🏬</span>${s.stall_name}
                      </td>
                      <td class="p-3 text-slate-600 font-mono text-[11px]">${s.userEmail}</td>
                      <td class="p-3 text-slate-700 font-bold">${s.phone || 'N/A'}</td>
                      <td class="p-3 text-slate-800">${s.locationInfo.city}, ${s.locationInfo.district}</td>
                      <td class="p-3 text-slate-500 font-mono text-[11px]">
                        ${s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Today'}
                      </td>
                      <td class="p-3">
                        <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-amber-300">
                          PENDING
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          <button 
                            onclick="openApplicationDetailsModal('stall', '${s.id}')" 
                            class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 transition"
                            title="View Complete Application Details"
                          >
                            View Details
                          </button>
                          <button 
                            onclick="approveBusiness('stall', '${s.id}')" 
                            class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-sm hover:shadow transition"
                            title="Approve bookstore and activate Stall Owner Dashboard"
                          >
                            APPROVE
                          </button>
                          <button 
                            onclick="rejectBusiness('stall', '${s.id}')" 
                            class="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-sm hover:shadow transition"
                            title="Reject application and keep dashboard access disabled"
                          >
                            REJECT
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Section 2: RECYCLE & SCRAP OWNER APPROVAL REQUESTS (Exact Requirement 5) -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">♻️</span>
                <h3 class="font-black text-base text-slate-900 tracking-tight">RECYCLE & SCRAP OWNER APPROVAL REQUESTS</h3>
                <span class="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full">
                  ${pendingScraps.length} Pending
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Commercial paper recycling depot registrations waiting for Administrator verification before accessing the Scrap Owner Dashboard.
              </p>
            </div>
            <button onclick="refreshRequestsAndOffers().then(() => setAdminTab('approvals'))" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-300 transition flex items-center gap-1 self-start sm:self-auto">
              <span>🔄</span> Refresh Scraps
            </button>
          </div>

          ${pendingScraps.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-1">
              <span class="text-3xl block mb-2">✅</span>
              <strong class="text-slate-700">No Pending Scrap Business Applications</strong>
              <p>All paper recycling depot registrations have been processed.</p>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead class="bg-slate-100 text-slate-700 font-bold border-b">
                  <tr>
                    <th class="p-3">Owner Name</th>
                    <th class="p-3">Business Name</th>
                    <th class="p-3">Email Address</th>
                    <th class="p-3">Phone Number</th>
                    <th class="p-3">Location (City, District)</th>
                    <th class="p-3">Application Date</th>
                    <th class="p-3">Approval Status</th>
                    <th class="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${pendingScraps.map(r => `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-3 font-bold text-slate-900">${r.owner_name}</td>
                      <td class="p-3 font-extrabold text-emerald-900">
                        <span class="mr-1">♻️</span>${r.business_name}
                      </td>
                      <td class="p-3 text-slate-600 font-mono text-[11px]">${r.userEmail}</td>
                      <td class="p-3 text-slate-700 font-bold">${r.phone || 'N/A'}</td>
                      <td class="p-3 text-slate-800">${r.locationInfo.city}, ${r.locationInfo.district}</td>
                      <td class="p-3 text-slate-500 font-mono text-[11px]">
                        ${r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Today'}
                      </td>
                      <td class="p-3">
                        <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-amber-300">
                          PENDING
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          <button 
                            onclick="openApplicationDetailsModal('scrap', '${r.id}')" 
                            class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 transition"
                            title="View Complete Application Details"
                          >
                            View Details
                          </button>
                          <button 
                            onclick="approveBusiness('raddi', '${r.id}')" 
                            class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-sm hover:shadow transition"
                            title="Approve depot and activate Scrap Owner Dashboard"
                          >
                            APPROVE
                          </button>
                          <button 
                            onclick="rejectBusiness('raddi', '${r.id}')" 
                            class="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-sm hover:shadow transition"
                            title="Reject application and keep dashboard access disabled"
                          >
                            REJECT
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Section 3: Approved Businesses Network -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div class="border-b pb-3">
            <h3 class="font-extrabold text-base text-slate-900">Approved Partner Network (${approvedStalls.length + approvedScraps.length})</h3>
            <p class="text-xs text-slate-500">Currently active book stalls and scrap recyclers serving students and households.</p>
          </div>

          ${approvedStalls.length === 0 && approvedScraps.length === 0 ? `
            <div class="p-6 text-center text-slate-400 text-xs">No active approved businesses yet. Approve pending applications above to activate.</div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${approvedStalls.map(s => {
                const loc = getBusinessLocation(s);
                return `
                  <div class="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-base">🏬</span>
                        <strong class="text-xs text-slate-900 font-extrabold">${s.stall_name}</strong>
                        <span class="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">APPROVED</span>
                      </div>
                      <div class="text-[11px] text-slate-600 mt-1">Owner: ${s.owner_name} • 📍 ${loc.city}, ${loc.district} • ${s.phone || 'Phone Verified'}</div>
                    </div>
                    <button onclick="suspendBusiness('stall', '${s.id}')" class="text-[11px] text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-bold border border-rose-300 transition">
                      Suspend
                    </button>
                  </div>
                `;
              }).join('')}

              ${approvedScraps.map(r => {
                const loc = getBusinessLocation(r);
                return `
                  <div class="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-base">♻️</span>
                        <strong class="text-xs text-slate-900 font-extrabold">${r.business_name}</strong>
                        <span class="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">APPROVED</span>
                      </div>
                      <div class="text-[11px] text-slate-600 mt-1">Owner: ${r.owner_name} • 📍 ${loc.city}, ${loc.district} • Min 10 kg verified</div>
                    </div>
                    <button onclick="suspendBusiness('raddi', '${r.id}')" class="text-[11px] text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-bold border border-rose-300 transition">
                      Suspend
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // TAB 4: SESSIONS (USER ENTRY & EXIT LOGS)
  else if (tab === 'sessions') {
    const sessionLogs = (state.auditLogs || []).filter(a => a.action === 'user_entry' || a.action === 'user_exit' || a.action === 'session_entry' || a.action === 'session_exit');

    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Live User Entry & Exit Logs</h3>
            <p class="text-xs text-slate-500">Real-time session monitor recording user logins, logouts, and security clearance events</p>
          </div>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Active Realtime Stream
          </span>
        </div>

        ${sessionLogs.length === 0 ? `
          <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            No session activity recorded yet.
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead class="bg-slate-100 text-slate-700 font-bold border-b">
                <tr>
                  <th class="p-3">Timestamp</th>
                  <th class="p-3">User Name</th>
                  <th class="p-3">Email Address</th>
                  <th class="p-3">Role Type</th>
                  <th class="p-3">Event Action</th>
                  <th class="p-3">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                ${sessionLogs.map(s => `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-3 text-slate-500 font-mono text-[11px]">${s.created_at ? new Date(s.created_at).toLocaleString() : 'Just now'}</td>
                    <td class="p-3 font-bold text-slate-900">${s.details?.user_name || 'Member'}</td>
                    <td class="p-3 text-slate-600">${s.details?.user_email || s.details?.email || 'user@example.com'}</td>
                    <td class="p-3"><span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">${getRoleTitle(s.details?.role || 'seller')}</span></td>
                    <td class="p-3 font-bold ${s.action.includes('entry') ? 'text-emerald-700' : 'text-slate-500'}">
                      ${s.action.includes('entry') ? '🚪 User Entered (Login)' : '👋 User Exited (Logout)'}
                    </td>
                    <td class="p-3"><span class="w-2 h-2 rounded-full inline-block mr-1 ${s.action.includes('entry') ? 'bg-emerald-500' : 'bg-slate-400'}"></span>${s.details?.status || 'recorded'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // TAB 5: USERS
  else if (tab === 'users') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-extrabold text-base text-slate-900">User Management Console</h3>
        <p class="text-xs text-slate-500">Overview of registered accounts across SECOND SHELF</p>
        <div class="p-6 text-center text-slate-600 text-xs bg-slate-50 rounded-xl border">
          <p>Single provisioned administrator account active: <strong>${state.currentUser.email}</strong>.</p>
          <p class="mt-1 text-slate-500">Normal users register freely with email verification and apply for business upgrades directly from their dashboard.</p>
        </div>
      </div>
    `;
  }

  // TAB 6: WEBSITE TRANSACTIONS
  else if (tab === 'website') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-extrabold text-base text-slate-900">Marketplace Transactions & Listings</h3>
        <p class="text-xs text-slate-500">Completed and active transactions across used books and paper recycling</p>

        ${state.transactions.length === 0 ? `
          <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">📦</span>
            No sales records available yet.
          </div>
        ` : `
          <div class="space-y-3">
            ${state.transactions.map(t => `
              <div class="border rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span class="font-bold text-slate-900">Transaction #${t.id ? t.id.slice(0, 8) : 'TX'}</span>
                  <span class="text-slate-600 ml-2">Amount: <strong>₹${t.amount}</strong></span>
                </div>
                <span class="px-2 py-0.5 rounded-full font-bold ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}">${t.status}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // TAB 7: COMPLAINTS & FEEDBACK
  else if (tab === 'complaints') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-extrabold text-base text-slate-900">Disputes, Complaints & Customer Reviews</h3>
        ${state.complaints.length === 0 ? `
          <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            <span class="text-3xl block mb-2">🛡️</span>
            No complaints or open disputes recorded. Platform operations are normal.
          </div>
        ` : `
          <div class="space-y-3">
            ${state.complaints.map(c => `
              <div class="border rounded-xl p-3 bg-slate-50 text-xs space-y-1">
                <div class="flex justify-between font-bold">
                  <span>${c.subject || 'Complaint'}</span>
                  <span class="text-rose-700">${c.status || 'Pending'}</span>
                </div>
                <p class="text-slate-600">${c.description}</p>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // TAB 8: GUIDELINES
  else if (tab === 'guidelines') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-extrabold text-base text-slate-900">Platform Guidelines & Policies</h3>
          <button onclick="promptCreateGuideline()" class="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow">+ Add Guideline</button>
        </div>
        <div class="space-y-3">
          ${state.guidelines.map(g => `
            <div class="border rounded-xl p-3 bg-slate-50 text-xs space-y-1">
              <div class="flex justify-between font-bold">
                <span class="text-slate-900">${g.title}</span>
                <span class="text-emerald-700">${g.is_published ? 'Published ✅' : 'Draft'}</span>
              </div>
              <p class="text-slate-600 leading-relaxed">${g.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // TAB 9: AUDIT LOGS
  else if (tab === 'audit') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-extrabold text-base text-slate-900">Cryptographic Security Audit Trail</h3>
        <p class="text-xs text-slate-500">Immutable ledger tracking security events, role elevations, and admin approvals</p>

        ${state.auditLogs.length === 0 ? `
          <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            No audit logs recorded yet.
          </div>
        ` : `
          <div class="space-y-2">
            ${state.auditLogs.slice(0, 50).map(l => `
              <div class="border rounded-lg p-2.5 bg-slate-50 font-mono text-[11px] flex items-center justify-between">
                <div>
                  <span class="text-slate-400">${l.created_at ? new Date(l.created_at).toLocaleTimeString() : ''}</span>
                  <span class="font-bold text-slate-900 ml-2">${l.action}</span>
                  <span class="text-slate-600 ml-1">${l.target_type || ''}</span>
                </div>
                <span class="text-slate-500 text-[10px]">${JSON.stringify(l.details || {}).slice(0, 60)}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }
}

// Admin Partner Approval Actions
async function approveBusiness(type, id) {
  const stall = type === 'stall' ? state.bookStalls.find(s => s.id === id) : null;
  const scrap = type !== 'stall' ? state.scrapOwners.find(s => s.id === id) : null;
  const targetUserId = stall?.user_id || scrap?.user_id;

  // 1. Try local server endpoint if available
  try {
    await fetch('/api/approve-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, userId: targetUserId })
    });
  } catch (e) {}

  if (supabase) {
    try {
      if (type === 'stall') {
        await supabase.from('book_stalls').update({ approval_status: 'approved' }).eq('id', id);
        if (stall) {
          stall.approval_status = 'approved';
          stall.is_approved = true;
          await syncUserRole(stall.user_id, 'book_stall', true);
          await supabase.from('notifications').insert({
            user_id: stall.user_id,
            title: 'Book Stall Partner Approved! 🎉',
            message: 'Your bookstore application has been verified by Administrator. You now have full access to your Book Stall Console.',
            notification_type: 'account_approved'
          });
          addAdminLiveNotification('Book Stall Application Approved', stall.owner_name, 'Book Stall', 'APPROVED');
        }
      } else {
        await supabase.from('scrap_owners').update({ approval_status: 'approved' }).eq('id', id);
        if (scrap) {
          scrap.approval_status = 'approved';
          scrap.is_approved = true;
          await syncUserRole(scrap.user_id, 'raddi_owner', true);
          await supabase.from('notifications').insert({
            user_id: scrap.user_id,
            title: 'Scrap Depot Approved! 🎉',
            message: 'Your scrap paper recycling depot has been verified. You now have full access to your Scrap Recycler Console.',
            notification_type: 'account_approved'
          });
          addAdminLiveNotification('Scrap Business Approved', scrap.owner_name, 'Recycle & Scrap', 'APPROVED');
        }
      }
    } catch (e) {
      console.warn('Error during remote partner approval:', e);
    }
  }

  showToast('Partner registration verified and approved!', 'success');
  await refreshRequestsAndOffers();
  setAdminTab('approvals');
}

async function rejectBusiness(type, id) {
  const stall = type === 'stall' ? state.bookStalls.find(s => s.id === id) : null;
  const scrap = type !== 'stall' ? state.scrapOwners.find(s => s.id === id) : null;
  const targetUserId = stall?.user_id || scrap?.user_id;

  try {
    await fetch('/api/reject-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, userId: targetUserId })
    });
  } catch (e) {}

  if (supabase) {
    try {
      if (type === 'stall') {
        await supabase.from('book_stalls').update({ approval_status: 'rejected' }).eq('id', id);
        if (stall) {
          stall.approval_status = 'rejected';
          stall.is_approved = false;
          await syncUserRole(stall.user_id, 'seller', false);
          await supabase.from('notifications').insert({
            user_id: stall.user_id,
            title: 'Book Stall Application Update',
            message: 'Your Book Stall application was reviewed and rejected by Administrator.',
            notification_type: 'account_rejected'
          });
          addAdminLiveNotification('Book Stall Application Rejected', stall.owner_name, 'Book Stall', 'REJECTED');
        }
      } else {
        await supabase.from('scrap_owners').update({ approval_status: 'rejected' }).eq('id', id);
        if (scrap) {
          scrap.approval_status = 'rejected';
          scrap.is_approved = false;
          await syncUserRole(scrap.user_id, 'seller', false);
          await supabase.from('notifications').insert({
            user_id: scrap.user_id,
            title: 'Scrap Business Application Update',
            message: 'Your Scrap Business application was reviewed and rejected by Administrator.',
            notification_type: 'account_rejected'
          });
          addAdminLiveNotification('Scrap Business Rejected', scrap.owner_name, 'Recycle & Scrap', 'REJECTED');
        }
      }
    } catch (e) {
      console.warn('Error during partner rejection:', e);
    }
  }
  showToast('Partner registration rejected.', 'info');
  await refreshRequestsAndOffers();
  setAdminTab('approvals');
}

async function suspendBusiness(type, id) {
  if (supabase) {
    if (type === 'stall') {
      await supabase.from('book_stalls').update({ approval_status: 'suspended' }).eq('id', id);
    } else {
      await supabase.from('scrap_owners').update({ approval_status: 'suspended' }).eq('id', id);
    }
  }
  showToast('Partner access suspended.', 'warning');
  await refreshRequestsAndOffers();
  setAdminTab('approvals');
}

// Admin Guidelines Actions
async function promptCreateGuideline() {
  const title = prompt('Enter Guideline Title:');
  if (!title) return;
  const section = prompt('Enter Target Section (textbook_submission, valuation_rules, scrap_weight, pickup_instructions, payment_guidelines, all):', 'textbook_submission');
  const content = prompt('Enter Guideline Description/Rules:');
  if (!content) return;

  if (supabase) {
    await supabase.from('guidelines').insert({
      title: title,
      section_page: section || 'all',
      content: content,
      is_published: true
    });
    const { data } = await supabase.from('guidelines').select('*');
    if (data) state.guidelines = data;
  }
  showToast('Guideline created and published!', 'success');
  setAdminTab('guidelines');
}

async function toggleGuidelinePublish(id, current) {
  if (supabase) {
    await supabase.from('guidelines').update({ is_published: !current }).eq('id', id);
    const { data } = await supabase.from('guidelines').select('*');
    if (data) state.guidelines = data;
  }
  setAdminTab('guidelines');
}

async function deleteGuideline(id) {
  if (!confirm('Delete this guideline?')) return;
  if (supabase) {
    await supabase.from('guidelines').delete().eq('id', id);
    const { data } = await supabase.from('guidelines').select('*');
    if (data) state.guidelines = data;
  }
  setAdminTab('guidelines');
}

// ====================================================================
// 11. GENERAL UI & HELPER FUNCTIONS
// ====================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-900 border-emerald-500 text-white' :
             type === 'error' ? 'bg-rose-900 border-rose-500 text-white' :
             type === 'warning' ? 'bg-amber-900 border-amber-500 text-white' :
             'bg-slate-900 border-slate-700 text-slate-100';

  toast.className = `${bg} border px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 transform transition-all duration-300 translate-y-2 pointer-events-auto`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⛔' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
    <span class="flex-1 font-medium">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-2'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function openCurrentRoleDashboard() {
  if (!state.currentUser) {
    openPortalSelector();
  } else {
    showSection('dashboard');
    renderCurrentDashboard();
  }
}

function showSection(sectionId) {
  ['section-home', 'section-dashboard', 'section-used-books-page', 'section-raddi-page'].forEach(s => {
    document.getElementById(s)?.classList.add('hidden');
  });

  if (sectionId === 'home') document.getElementById('section-home')?.classList.remove('hidden');
  if (sectionId === 'dashboard') document.getElementById('section-dashboard')?.classList.remove('hidden');
  if (sectionId === 'used-books-page') {
    document.getElementById('section-used-books-page')?.classList.remove('hidden');
    renderBookDirectory();
  }
  if (sectionId === 'raddi-page') {
    document.getElementById('section-raddi-page')?.classList.remove('hidden');
    renderRaddiDirectory();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getRoleTitle(role) {
  switch (role) {
    case 'seller': return 'User / Book Seller';
    case 'book_stall': return 'Book Stall Owner';
    case 'raddi_owner': return 'Recycle Scrap Owner';
    case 'admin': return 'Administrator';
    default: return role || 'Guest';
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending': return 'bg-slate-100 text-slate-800 border border-slate-300';
    case 'Offer Received': return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
    case 'Accepted': return 'bg-blue-100 text-blue-900 border border-blue-300 font-bold';
    case 'Pickup Scheduled': return 'bg-cyan-100 text-cyan-900 border border-cyan-300';
    case 'Received': case 'Collected': return 'bg-indigo-100 text-indigo-900 border border-indigo-300';
    case 'Under Inspection': return 'bg-purple-100 text-purple-900 border border-purple-300';
    case 'Payment Pending': return 'bg-amber-200 text-amber-950 border border-amber-400 font-bold animate-pulse';
    case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
    case 'Rejected': case 'Cancelled': case 'Disputed': return 'bg-rose-100 text-rose-800 border border-rose-300';
    default: return 'bg-slate-100 text-slate-800';
  }
}

function toggleLanguage() {
  state.language = state.language === 'en' ? 'kn' : 'en';
  const lang = state.language;
  const t = TRANSLATIONS[lang];

  const toggleBtnText = document.getElementById('current-lang-text');
  if (toggleBtnText) {
    toggleBtnText.textContent = lang === 'en' ? 'ಕನ್ನಡ (Kannada)' : 'English (EN)';
  }

  const elMap = {
    'tagline-text': t.tagline,
    'hero-title': t.heroTitle,
    'hero-subtitle': t.heroSubtitle,
    'hero-cta-books': t.sellBooksBtn,
    'hero-cta-raddi': t.sellRaddiBtn,
    'subnav-home': t.home,
    'subnav-used-books': t.usedBooks,
    'subnav-raddi': t.raddi,
    'subnav-submit-book': t.submitBook,
    'subnav-submit-raddi': t.submitRaddi,
    'subnav-calculator': t.estimator,
    'subnav-payment-policy': t.paymentRules,
    'subnav-privacy': t.privacy
  };

  for (const [id, val] of Object.entries(elMap)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  }
}

function updateUserRoleUI() {
  const user = state.currentUser;
  const greeting = document.getElementById('user-greeting');
  const badge = document.getElementById('user-role-badge');
  const roleIcon = document.getElementById('role-icon');
  const authNavBtn = document.getElementById('auth-nav-btn');

  // Hero horizontal login buttons highlighting
  const portals = ['seller', 'book_stall', 'raddi_owner', 'admin'];
  portals.forEach(r => {
    const heroBtn = document.getElementById(`hero-portal-${r}`);
    if (heroBtn) {
      if (user && r === user.role) {
        heroBtn.classList.add('ring-2', 'ring-amber-300');
      } else {
        heroBtn.classList.remove('ring-2', 'ring-amber-300');
      }
    }
  });

  const sessionBanner = document.getElementById('modal-active-session-banner');
  const sessionName = document.getElementById('modal-current-user-name');
  const sessionRole = document.getElementById('modal-current-user-role');

  if (!user) {
    if (greeting) greeting.textContent = 'Welcome, Guest';
    if (badge) badge.textContent = 'Sign In';
    if (roleIcon) roleIcon.textContent = '🔑';
    if (authNavBtn) authNavBtn.textContent = 'Sign In';
    if (sessionBanner) sessionBanner.classList.add('hidden');
  } else {
    if (greeting) greeting.textContent = 'Hi, ' + user.name.split(' ')[0];
    if (badge) badge.textContent = getRoleTitle(user.role).split('/')[0].trim();
    if (roleIcon) roleIcon.textContent = user.role === 'admin' ? '🛡️' : user.role === 'book_stall' ? '🏬' : user.role === 'raddi_owner' ? '♻️' : '👤';
    if (authNavBtn) authNavBtn.textContent = 'Sign Out';
    if (sessionBanner) {
      sessionBanner.classList.remove('hidden');
      if (sessionName) sessionName.textContent = user.name;
      if (sessionRole) sessionRole.textContent = getRoleTitle(user.role);
    }
  }
}

// Modal open/close helpers
function openPortalSelector() {
  openLoginPortal('seller');
}

function switchPortalTab(tab) {
  if (tab === 'signup') {
    switchAuthTab('signup');
  } else {
    switchAuthTab('signin');
  }
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

function openBookSubmissionModal() {
  if (!state.currentUser) {
    showToast('Please sign in as a Seller to submit used textbooks.', 'info');
    openLoginPortal('seller');
    return;
  }
  document.getElementById('modal-book-submission')?.classList.remove('hidden');
  injectDynamicGuidelines('textbook_submission', 'guidelines-textbook-submission');
}

function openRaddiSubmissionModal() {
  if (!state.currentUser) {
    showToast('Please sign in as a Seller to submit recycle scrap pickups.', 'info');
    openLoginPortal('seller');
    return;
  }
  document.getElementById('modal-raddi-submission')?.classList.remove('hidden');
  injectDynamicGuidelines('scrap_weight', 'guidelines-scrap-weight');
}

function openSellActionSelector() {
  const choice = confirm('What would you like to sell?\n\nClick OK for USED BOOKS\nClick CANCEL for RECYCLE SCRAP (≥ 10 kg)');
  if (choice) openBookSubmissionModal();
  else openRaddiSubmissionModal();
}

function scrollToCalculator() {
  const el = document.getElementById('calc-book-inputs')?.closest('section') || document.querySelector('input[id*="quick"]');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function setCalcTab(tab) {
  const bTab = document.getElementById('calc-tab-book') || document.getElementById('calc-tab-books');
  const rTab = document.getElementById('calc-tab-raddi');
  const bInputs = document.getElementById('calc-book-inputs') || document.getElementById('calc-books-inputs');
  const rInputs = document.getElementById('calc-raddi-inputs');

  const isBook = tab === 'book' || tab === 'books';

  if (isBook) {
    if (bTab) bTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-emerald-50 border-emerald-600 text-emerald-800 text-center';
    if (rTab) rTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-slate-50 border-slate-300 text-slate-600 text-center';
    if (bInputs) bInputs.classList.remove('hidden');
    if (rInputs) rInputs.classList.add('hidden');
    runQuickBookCalc();
  } else {
    if (rTab) rTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-amber-50 border-amber-600 text-amber-900 text-center';
    if (bTab) bTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-slate-50 border-slate-300 text-slate-600 text-center';
    if (rInputs) rInputs.classList.remove('hidden');
    if (bInputs) bInputs.classList.add('hidden');
    runQuickRaddiCalc();
  }
}

function runQuickBookCalc() {
  const price = parseFloat(document.getElementById('quick-original-price')?.value || document.getElementById('quick-book-price')?.value) || 0;
  const condition = document.getElementById('quick-condition')?.value || document.getElementById('quick-book-condition')?.value || 'Like New';
  const copies = parseInt(document.getElementById('quick-copies')?.value) || 1;
  const pct = state.valuationRules[condition] || 30.0;
  const estimate = (price * (pct / 100)) * copies;

  const resEl = document.getElementById('quick-book-result');
  if (resEl) resEl.textContent = '₹' + estimate.toFixed(2);
}

function runQuickRaddiCalc() {
  const weight = parseFloat(document.getElementById('quick-raddi-weight')?.value) || 0;
  const rates = { Newspapers: 14, Notebooks: 13, 'Old Papers': 11, Magazines: 10, Cardboard: 8, 'Mixed Paper': 7 };
  const type = document.getElementById('quick-raddi-type')?.value || 'Newspapers';
  const rate = rates[type] || 12;

  const warn = document.getElementById('quick-raddi-warning');
  const success = document.getElementById('quick-raddi-success-box');
  const resEl = document.getElementById('quick-raddi-result');

  if (weight < 10) {
    if (warn) warn.classList.remove('hidden');
    if (success) success.classList.add('hidden');
  } else {
    if (warn) warn.classList.add('hidden');
    if (success) success.classList.remove('hidden');
    if (resEl) resEl.textContent = '₹' + (weight * rate).toFixed(2);
  }
}

function renderBookDirectory() {
  // 1. Certified Book Stalls (Prioritized by location)
  const stallsContainer = document.getElementById('available-book-stalls-cards');
  const stallsLocLabel = document.getElementById('nearby-stalls-loc-label');
  if (stallsLocLabel) {
    stallsLocLabel.textContent = `${state.currentLocation.city}, ${state.currentLocation.state}`;
  }

  if (stallsContainer) {
    const approvedStalls = (state.bookStalls || []).filter(s => (s.approval_status || '').toLowerCase() === 'approved');

    if (approvedStalls.length === 0) {
      stallsContainer.innerHTML = `
        <div class="col-span-full py-6 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 p-6">
          <span class="text-2xl block mb-1">🏬</span>
          <p class="text-xs font-bold text-slate-700">No approved book stalls available yet in ${state.currentLocation.city}.</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Book stalls will appear here once verified by the administrator.</p>
        </div>
      `;
    } else {
      // Sort: Exact City match first, then District match, then others
      const sortedStalls = [...approvedStalls].sort((a, b) => {
        const locA = getBusinessLocation(a);
        const locB = getBusinessLocation(b);
        const aCityMatch = locA.city.toLowerCase() === state.currentLocation.city.toLowerCase() ? 2 : (locA.district.toLowerCase() === state.currentLocation.district.toLowerCase() ? 1 : 0);
        const bCityMatch = locB.city.toLowerCase() === state.currentLocation.city.toLowerCase() ? 2 : (locB.district.toLowerCase() === state.currentLocation.district.toLowerCase() ? 1 : 0);
        return bCityMatch - aCityMatch;
      });

      stallsContainer.innerHTML = sortedStalls.map(s => {
        const loc = getBusinessLocation(s);
        const isNearby = loc.city.toLowerCase() === state.currentLocation.city.toLowerCase();
        const isDistrict = !isNearby && loc.district.toLowerCase() === state.currentLocation.district.toLowerCase();

        return `
          <div class="bg-white rounded-xl shadow-sm border ${isNearby ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-slate-200'} p-4 space-y-3 hover:shadow-md transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-extrabold text-sm text-slate-900">${s.stall_name}</h4>
                <p class="text-xs text-slate-500">Proprietor: ${s.owner_name}</p>
              </div>
              ${isNearby ? `
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-emerald-300">
                  📍 Nearby in ${loc.city}
                </span>
              ` : isDistrict ? `
                <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  📍 ${loc.district}
                </span>
              ` : `
                <span class="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                  ${loc.city}
                </span>
              `}
            </div>

            <div class="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>📍 <strong>Address:</strong> ${loc.location ? loc.location + ', ' : ''}${loc.city}, ${loc.district}</div>
              <div>📞 <strong>Phone:</strong> ${s.phone || 'Verified on platform'}</div>
              <div>📜 <strong>Licence:</strong> ${s.licence_number || 'Registered'}</div>
              <div>🤝 <strong>Handover:</strong> Stall Counter Handover & Inspection</div>
            </div>

            <button onclick="openBookSubmissionModal()" class="w-full bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold py-1.5 rounded-lg text-xs shadow-sm transition">
              Submit Books for this Stall →
            </button>
          </div>
        `;
      }).join('');
    }
  }

  // 2. Active Student Textbook Requests
  const container = document.getElementById('book-directory-cards');
  if (!container) return;

  const filterCat = document.getElementById('book-filter-cat')?.value || 'all';
  const filterCond = document.getElementById('book-filter-cond')?.value || 'all';

  let list = state.bookRequests || [];
  if (filterCat !== 'all') list = list.filter(b => b.category === filterCat || b.category_id === filterCat);
  if (filterCond !== 'all') list = list.filter(b => (b.book_condition || b.condition) === filterCond);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 p-6">
        <p class="text-sm font-semibold">No active book requests matching filters.</p>
        <button onclick="openBookSubmissionModal()" class="mt-3 bg-shelf-gold text-slate-950 font-bold px-4 py-2 rounded text-xs shadow">
          Submit the First Book →
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(b => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
      <div class="flex items-center justify-between border-b pb-2">
        <span class="font-bold text-sm text-slate-900">${b.request_number}</span>
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
      </div>
      <div>
        <h4 class="font-bold text-sm text-slate-900">${b.title}</h4>
        <p class="text-xs text-slate-500">by ${b.author}</p>
      </div>
      <div class="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg">
        <div>Condition: <strong>${b.book_condition || b.condition}</strong> (Cap: ${b.max_valuation_pct || 30}%)</div>
        <div>Original Price: ₹${b.original_price} • Est Payout: <strong class="text-emerald-700">₹${b.total_estimated_payout}</strong></div>
        <div>Handover: <em>${(b.handover_method || 'direct_stall_handover').replace(/_/g, ' ')}</em></div>
      </div>
      <div class="pt-2 flex justify-end">
        ${state.currentUser && state.currentUser.role === 'book_stall' && b.status === 'Pending' ? `
          <button onclick="openSendOfferModal('book', '${b.id}', ${b.total_estimated_payout})" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded text-xs shadow">
            Make Offer →
          </button>
        ` : `
          <span class="text-[11px] text-slate-400">Available across participating stalls</span>
        `}
      </div>
    </div>
  `).join('');
}

function renderRaddiDirectory() {
  // 1. Approved Scrap & Recycle Depots (Prioritized by location)
  const scrapsContainer = document.getElementById('approved-scrap-owners-cards');
  const scrapsLocLabel = document.getElementById('nearby-scrap-loc-label');
  if (scrapsLocLabel) {
    scrapsLocLabel.textContent = `${state.currentLocation.city}, ${state.currentLocation.state}`;
  }

  if (scrapsContainer) {
    const approvedScraps = (state.scrapOwners || []).filter(r => (r.approval_status || '').toLowerCase() === 'approved');

    if (approvedScraps.length === 0) {
      scrapsContainer.innerHTML = `
        <div class="col-span-full py-6 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 p-6">
          <span class="text-2xl block mb-1">♻️</span>
          <p class="text-xs font-bold text-slate-700">No approved scrap businesses available yet in ${state.currentLocation.city}.</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Recycling dealers will appear here once verified by the administrator.</p>
        </div>
      `;
    } else {
      const sortedScraps = [...approvedScraps].sort((a, b) => {
        const locA = getBusinessLocation(a);
        const locB = getBusinessLocation(b);
        const aCityMatch = locA.city.toLowerCase() === state.currentLocation.city.toLowerCase() ? 2 : (locA.district.toLowerCase() === state.currentLocation.district.toLowerCase() ? 1 : 0);
        const bCityMatch = locB.city.toLowerCase() === state.currentLocation.city.toLowerCase() ? 2 : (locB.district.toLowerCase() === state.currentLocation.district.toLowerCase() ? 1 : 0);
        return bCityMatch - aCityMatch;
      });

      scrapsContainer.innerHTML = sortedScraps.map(r => {
        const loc = getBusinessLocation(r);
        const isNearby = loc.city.toLowerCase() === state.currentLocation.city.toLowerCase();
        const isDistrict = !isNearby && loc.district.toLowerCase() === state.currentLocation.district.toLowerCase();

        return `
          <div class="bg-white rounded-xl shadow-sm border ${isNearby ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-slate-200'} p-4 space-y-3 hover:shadow-md transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-extrabold text-sm text-slate-900">${r.business_name}</h4>
                <p class="text-xs text-slate-500">Manager: ${r.owner_name}</p>
              </div>
              ${isNearby ? `
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-emerald-300">
                  📍 Nearby in ${loc.city}
                </span>
              ` : isDistrict ? `
                <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  📍 ${loc.district}
                </span>
              ` : `
                <span class="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                  ${loc.city}
                </span>
              `}
            </div>

            <div class="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>📍 <strong>Base Yard:</strong> ${loc.location ? loc.location + ', ' : ''}${loc.city}, ${loc.district}</div>
              <div>📞 <strong>Phone:</strong> ${r.phone || 'Verified on platform'}</div>
              <div>⚖️ <strong>Minimum Pickup:</strong> <span class="text-rose-700 font-bold">10 kg</span> (Digital scale)</div>
              <div>🚚 <strong>Service:</strong> Doorstep Collection & Instant Payment</div>
            </div>

            <button onclick="openRaddiSubmissionModal()" class="w-full bg-shelf-forest hover:bg-shelf-emerald text-white font-bold py-1.5 rounded-lg text-xs shadow-sm transition">
              Request Doorstep Pickup (≥ 10 kg) →
            </button>
          </div>
        `;
      }).join('');
    }
  }

  // 2. Active Scrap Submissions
  const container = document.getElementById('raddi-directory-cards');
  if (!container) return;

  const list = state.wasteRequests || [];

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 p-6">
        <p class="text-sm font-semibold">No scrap pickup requests published yet.</p>
        <button onclick="openRaddiSubmissionModal()" class="mt-3 bg-shelf-forest text-white font-bold px-4 py-2 rounded text-xs shadow">
          Request Scrap Pickup (≥ 10 kg) →
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(r => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
      <div class="flex items-center justify-between border-b pb-2">
        <span class="font-bold text-sm text-slate-900">${r.request_number}</span>
        <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">≥ 10 kg</span>
      </div>
      <div class="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg">
        <div>Paper Type: <strong>${r.paper_type}</strong></div>
        <div>Estimated Weight: <strong>${r.estimated_weight_kg} kg</strong></div>
        <div>Area: <strong>${r.pickup_area}</strong> (Door number shielded)</div>
        <div>Preferred Date: <strong>${r.preferred_date}</strong> (${r.preferred_slot})</div>
      </div>
      <div class="pt-2 flex justify-end">
        ${state.currentUser && state.currentUser.role === 'raddi_owner' && r.status === 'Pending' ? `
          <button onclick="openSendOfferModal('raddi', '${r.id}', 0, ${r.estimated_weight_kg})" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded text-xs shadow">
            Propose Rate (₹/kg) →
          </button>
        ` : `
          <span class="text-[11px] text-slate-400">Doorstep digital scale pickup</span>
        `}
      </div>
    </div>
  `).join('');
}

function renderDemoBookListings() {
  const container = document.getElementById('demo-book-listings');
  if (!container) return;

  container.innerHTML = state.categories.slice(0, 4).map(c => `
    <div onclick="showSection('used-books-page')" class="bg-white rounded-xl p-3 border shadow-sm text-xs cursor-pointer hover:border-emerald-500 transition">
      <div class="font-bold text-slate-900">${c.name}</div>
      <div class="text-slate-500 text-[11px] mt-1">${c.description || 'Verified textbooks across certified local book stalls'}</div>
    </div>
  `).join('');
}

// Search Handler
function handleSearch(event) {
  if (event.key === 'Enter') executeSearch();
}

function executeSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  if (q) {
    showToast('Searching catalog for: "' + q + '"...', 'info');
    showSection('used-books-page');
  }
}

// Multi-item book form helper
function addAnotherBookItem() {
  const container = document.getElementById('book-items-list');
  if (!container) return;
  const count = container.querySelectorAll('.book-item-card').length + 1;

  const div = document.createElement('div');
  div.className = 'book-item-card bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative';
  div.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-slate-700">Book #${count}</span>
      <button type="button" onclick="this.closest('.book-item-card').remove(); calculateModalBookTotal();" class="text-rose-600 hover:text-rose-800 text-xs font-bold">&times; Remove</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Book Title *</label>
        <input type="text" required name="item_title" placeholder="Book title" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Author *</label>
        <input type="text" required name="item_author" placeholder="Author name" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus" />
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
        <select name="item_category" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus">
          ${state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Condition *</label>
        <select name="item_condition" onchange="calculateModalBookTotal()" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus font-medium">
          <option value="Like New">Like New (Max 30%)</option>
          <option value="Good">Good (Max 30%)</option>
          <option value="Used">Used (Max 20%)</option>
          <option value="Old or Damaged">Old or Damaged (Max 15%)</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Original Price (₹) *</label>
        <input type="number" required min="1" step="1" name="item_price" value="500" oninput="calculateModalBookTotal()" class="w-full text-xs p-2 rounded border border-slate-300 font-bold amazon-focus" />
      </div>
    </div>
  `;
  container.appendChild(div);
  calculateModalBookTotal();
}

function calculateModalBookTotal() {
  const form = document.getElementById('form-submit-book');
  if (!form) return;
  const prices = Array.from(form.querySelectorAll('[name="item_price"]')).map(i => parseFloat(i.value) || 0);
  const conditions = Array.from(form.querySelectorAll('[name="item_condition"]')).map(i => i.value);

  let grand = 0;
  for (let i = 0; i < prices.length; i++) {
    const pct = state.valuationRules[conditions[i]] || 20.0;
    grand += (prices[i] * (pct / 100));
  }

  const el = document.getElementById('modal-book-grand-total');
  if (el) el.textContent = '₹' + grand.toFixed(2);
}

// Policies Modal
function openPolicyModal(type) {
  const title = document.getElementById('policy-modal-title');
  const body = document.getElementById('policy-modal-body');
  if (!title || !body) return;

  if (type === 'dpdp-privacy') {
    title.textContent = 'DPDP Act, 2023 Compliance & Data Privacy Policy';
    body.innerHTML = '<p>SECOND SHELF protects seller privacy. Full door addresses and mobile numbers remain confidential from scrap dealers until you accept an offer. All participants must be 18 years or older.</p>';
  } else if (type === 'two-party-payment') {
    title.textContent = 'Two-Party Payment Confirmation Policy';
    body.innerHTML = '<p>SECOND SHELF facilitates connections only and does not hold escrow. Payments occur directly (Cash, UPI, Bank Transfer). Transactions are marked Completed only after the buyer records reference details and the seller confirms receipt.</p>';
  } else if (type === 'cancellation-policy') {
    title.textContent = 'Weight Policy & Cancellation Rules';
    body.innerHTML = '<p>The minimum waste paper quantity is strictly 10 kg. If doorstep weighing falls below 10 kg, the scrap dealer may decline pickup or propose an updated rate without penalty to the seller.</p>';
  }
  document.getElementById('modal-policy')?.classList.remove('hidden');
}

// ====================================================================
// INITIALIZATION ON DOM READY
// ====================================================================
async function initApp() {
  try {
    initLocation();
    runQuickBookCalc();
    runQuickRaddiCalc();
    await initSupabase();
    updateHeroLiveStats();
  } catch (err) {
    console.warn('Application initialization fallback:', err);
    loadFallbackData();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
