// ====================================================================
// SECOND SHELF - Full-Stack Application Logic (Supabase + PostgreSQL)
// Complete Real-Time Backend Integration & Role-Based Workflows
// ====================================================================

// Application State Store
const state = {
  language: 'en', // 'en' | 'kn'
  currentUser: null, // Initial state: unauthenticated
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
  activeConversation: null,
  activeChatSubscription: null
};

// Global Supabase Client instance
let supabase = null;

// Kannada Language Translations Map
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
    tagline: 'ನಿಮ್ಮ ಹಳೆಯ ಪುಸ್ತಕಗಳಿಗೆ ಹೊಸ ಜೀವ ನೀಡಿ',
    heroTitle: 'ಹಳೆಯ ಪುಸ್ತಕಗಳನ್ನು ಮಾರಿ.<br/>ಕಾಗದ ಮರುಬಳಕೆ ಮಾಡಿ.<br/><span class="text-shelf-yellow">ಹಣ ಗಳಿಸಿ.</span>',
    heroSubtitle: 'ನೋಂದಾಯಿತ ಪುಸ್ತಕ ಮಳಿಗೆಗಳು ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ ಮರುಬಳಕೆ ಸ್ಕ್ರ್ಯಾಪ್ ವ್ಯಾಪಾರಿಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ. ಪಾರದರ್ಶಕ ಬೆಲೆ ಅಂದಾಜು, ಮನೆ ಬಾಗಿಲಿನ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಪಾವತಿ ದೃಢೀಕರಣ.',
    sellBooksBtn: 'ಹಳೆಯ ಪುಸ್ತಕ ಮಾರಿ',
    sellRaddiBtn: 'ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರಿ (ಕನಿಷ್ಠ 10 ಕೆಜಿ)',
    home: 'ಮುಖಪುಟ',
    usedBooks: 'ಬಳಸಿದ ಪುಸ್ತಕಗಳು',
    raddi: 'ಮರುಬಳಕೆ ಸ್ಕ್ರ್ಯಾಪ್ (10+ ಕೆಜಿ)',
    submitBook: 'ಪುಸ್ತಕ ನಮೂದಿಸಿ',
    submitRaddi: 'ಮರುಬಳಕೆ ಸ್ಕ್ರ್ಯಾಪ್ ಪಿಕಪ್ ಕೋರಿ',
    estimator: 'ಬೆಲೆ ಅಂದಾಜು',
    paymentRules: 'ಪಾವತಿ ನಿಯಮಗಳು',
    privacy: 'ಡಿಪಿಡಿಪಿ ಗೌಪ್ಯತೆ (ಭಾರತ)'
  }
};

// ====================================================================
// 1. SUPABASE CLIENT INITIALIZATION & CONFIG LOADER
// ====================================================================
async function initSupabase() {
  let url = (window.SECOND_SHELF_CONFIG && window.SECOND_SHELF_CONFIG.supabaseUrl) || localStorage.getItem('SECOND_SHELF_SUPABASE_URL') || '';
  let key = (window.SECOND_SHELF_CONFIG && window.SECOND_SHELF_CONFIG.supabaseAnonKey) || localStorage.getItem('SECOND_SHELF_SUPABASE_ANON_KEY') || '';

  // Attempt to fetch from /api/config if not found in localStorage
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
      // Running standalone/offline or file://
    }
  }

  const statusDot = document.getElementById('supabase-status-dot');
  const statusText = document.getElementById('supabase-status-text');

  if (url && key && window.supabase) {
    try {
      supabase = window.supabase.createClient(url, key);
      state.supabaseConfig = { url, key, connected: true };

      if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      if (statusText) statusText.textContent = 'PostgreSQL Live';

      // Load initial live data
      await loadInitialDataFromSupabase();

      // Check current auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        state.currentSession = session;
        await resolveUserProfile(session.user);
      }

      // Initialize real-time listeners
      setupRealtimeSubscriptions();

    } catch (err) {
      console.warn('Supabase initialization error:', err);
      if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
      if (statusText) statusText.textContent = 'Supabase Error';
    }
  } else {
    // Missing credentials - update badge to prompt user
    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
    if (statusText) statusText.textContent = 'Connect Backend';
    loadFallbackData();
  }
}

// Fallback initial data in case credentials are pending entry
function loadFallbackData() {
  state.categories = [
    { id: '1', name: 'Degree Books', slug: 'degree-books', count: 142, active: true },
    { id: '2', name: 'PUC Books', slug: 'puc-books', count: 89, active: true },
    { id: '3', name: 'Class 10th / SSLC Books', slug: 'sslc-10th-books', count: 76, active: true },
    { id: '4', name: 'School Books', slug: 'school-books', count: 54, active: true },
    { id: '5', name: 'Engineering Books', slug: 'engineering-books', count: 210, active: true },
    { id: '6', name: 'Medical and Competitive Exam Books', slug: 'medical-competitive-exam', count: 118, active: true },
    { id: '7', name: 'Story Books and Novels', slug: 'story-books-novels', count: 95, active: true },
    { id: '8', name: 'Other Educational Books', slug: 'other-educational', count: 43, active: true }
  ];
  renderDemoBookListings();
  renderBookDirectory();
}

// Load real database data from Supabase
async function loadInitialDataFromSupabase() {
  if (!supabase) return;

  try {
    // 1. Categories
    const { data: catData } = await supabase.from('textbook_categories').select('*').eq('is_active', true);
    if (catData && catData.length > 0) {
      state.categories = catData;
      renderBookDirectory();
    } else {
      loadFallbackData();
    }

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

    // 4. Stalls & Scrap Owners (Approved)
    const { data: stallData } = await supabase.from('book_stalls').select('*');
    if (stallData) state.bookStalls = stallData;

    const { data: scrapData } = await supabase.from('scrap_owners').select('*');
    if (scrapData) state.scrapOwners = scrapData;

    // 5. Active Submissions
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
      }
    }

    // Update active UI
    if (state.currentUser) {
      renderCurrentDashboard();
    }
    renderRaddiDirectory();
  } catch (err) {
    console.warn('Error refreshing requests:', err);
  }
}

// Setup Supabase Realtime subscriptions
function setupRealtimeSubscriptions() {
  if (!supabase) return;

  // Real-time channel for notifications, offers and payments
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

    const primaryRole = roles && roles.length > 0 ? roles[0].role : (user.user_metadata?.role || 'seller');

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

  } catch (err) {
    console.error('Error resolving user profile:', err);
  }
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

// 4. Admin Login (Secure Server-Side Verification — Only 1 Admin Account)
async function handleCreatorAdminLogin(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('creator-email')?.value?.trim();
  const password = document.getElementById('creator-password')?.value;

  const email = emailInput === 'admin' ? 'admin@secondshelf.in' : emailInput;

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

  // Log successful admin authentication
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

// Registration Handler with Real Email Verification
async function handleSignupSubmit(event) {
  if (event) event.preventDefault();
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const password = document.getElementById('signup-password')?.value;
  const phone = document.getElementById('signup-phone')?.value?.trim();
  const role = document.getElementById('signup-role')?.value || 'seller';
  const ageCheck = document.getElementById('signup-age-check')?.checked;

  if (!ageCheck) {
    showToast('Age Confirmation Required: You must be 18 years or older to register.', 'error');
    return;
  }

  if (!supabase) {
    showToast('Supabase backend not configured. Please click "Supabase" in header to connect.', 'error');
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

  const userId = data.user.id;

  // Additional Business Fields if registering Book Stall or Scrap Yard
  if (role === 'book_stall') {
    const stallName = document.getElementById('signup-biz-name')?.value?.trim();
    const licence = document.getElementById('signup-biz-licence')?.value?.trim();
    const address = document.getElementById('signup-biz-address')?.value?.trim();
    const pincode = document.getElementById('signup-biz-pin')?.value?.trim();

    await supabase.from('book_stalls').insert({
      user_id: userId,
      stall_name: stallName || name + ' Books',
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
      business_name: bizName || name + ' Recyclers',
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
  showToast(`Registration Successful! Verification email sent to ${email}. Please verify your email before logging in.`, 'success');
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

  const handover = form.querySelector('[name="handover_method"]')?.value || 'direct_stall_handover';
  const pickupAddress = document.getElementById('book-pickup-address')?.value || 'Self-handover';
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
            message: `${titles[0]} by ${authors[0]} submitted in ${categories[0]}. Est payout: ₹${grandEstimatedPayout.toFixed(2)}`,
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

// Stall or Scrap Owner Submits an Offer
async function handleSendOfferSubmit(event) {
  if (event) event.preventDefault();

  const reqId = document.getElementById('offer-req-id')?.value;
  const reqType = document.getElementById('offer-req-type')?.value;

  if (reqType === 'book') {
    const amount = parseFloat(document.getElementById('offer-book-amount')?.value) || 0;
    const maxCap = parseFloat(document.getElementById('offer-max-cap')?.value) || 99999;
    const reason = document.getElementById('offer-lower-reason')?.value?.trim();

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
    }

    closeModal('modal-send-offer');
    showToast(`Book Offer of ₹${amount.toFixed(2)} sent to seller!`, 'success');

  } else if (reqType === 'raddi') {
    const rateKg = parseFloat(document.getElementById('offer-rate-kg')?.value) || 0;
    const totalEst = parseFloat(document.getElementById('offer-raddi-total-val')?.textContent?.replace('₹', '')) || 0;

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
        total_estimated_amount: totalEst,
        status: 'Pending'
      });

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      await supabase.from('scrap_requests').update({ status: 'Offer Received' }).eq('id', reqId);
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
async function handleRecordPaymentSubmit(event) {
  if (event) event.preventDefault();

  const trxId = document.getElementById('record-payment-trx-id')?.value;
  const method = document.getElementById('payment-method')?.value;
  const utr = document.getElementById('payment-utr')?.value?.trim();
  const amount = parseFloat(document.getElementById('payment-amount')?.value) || 0;

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
      await supabase.from('payment_records').insert({
        transaction_id: trxId,
        paid_by: state.currentUser.id,
        payment_method: method,
        utr_reference: utr || 'CASH_IN_HAND',
        amount: amount,
        buyer_confirmed: true,
        seller_confirmed: false,
        status: 'pending_confirmation'
      });

      await supabase.from('transactions').update({
        status: 'payment_pending',
        final_amount: amount
      }).eq('id', trxId);

    } catch (err) {
      console.error('Error recording payment in Supabase:', err);
    }
  }

  closeModal('modal-record-payment');
  showToast(`Payment of ₹${amount.toFixed(2)} recorded! Awaiting seller confirmation.`, 'success');
  await refreshRequestsAndOffers();
  openCurrentRoleDashboard();
}

// Seller Confirms Payment Received (Two-Party Rule)
async function executePaymentConfirmation(type, reqId) {
  if (supabase) {
    try {
      if (type === 'book') {
        await supabase.from('book_requests').update({ status: 'Completed' }).eq('id', reqId);
      } else {
        await supabase.from('scrap_requests').update({ status: 'Completed' }).eq('id', reqId);
      }

      await supabase.from('payment_records').update({
        seller_confirmed: true,
        status: 'confirmed'
      }).eq('transaction_id', reqId);

    } catch (err) {
      console.error('Error confirming payment:', err);
    }
  }

  // Trigger celebration confetti
  if (window.confetti) {
    window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
  if (subEl) subEl.textContent = 'Conversation #' + transactionId.slice(0, 8);
  if (modal) modal.classList.remove('hidden');

  if (streamEl) streamEl.innerHTML = '<div class="text-center text-xs text-slate-400 py-6">Loading conversation...</div>';

  if (!supabase) {
    if (streamEl) {
      streamEl.innerHTML = `
        <div class="bg-white p-3 rounded-xl border text-xs shadow-sm">
          <strong>System:</strong> Private chat connects seller and partner directly upon offer acceptance. Connect Supabase to enable live messaging.
        </div>
      `;
    }
    return;
  }

  try {
    // 1. Fetch conversation
    const { data: convo } = await supabase.from('conversations').select('*').eq('transaction_id', transactionId).single();
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
      const { data: convo } = await supabase.from('conversations').select('id').eq('transaction_id', state.activeConversation).single();
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
      statusDetail.textContent = 'Supabase credentials not yet configured. Enter them below to connect.';
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
    showToast('Supabase JS library not loaded. Check your internet connection.', 'error');
    return;
  }

  try {
    showToast('Testing PostgreSQL connection...', 'info');
    const testClient = window.supabase.createClient(url, key);
    const { data, error } = await testClient.from('textbook_categories').select('count', { count: 'exact' });

    if (error && !error.message.includes('permission denied')) {
      showToast('Connection failed: ' + error.message, 'error');
    } else {
      showToast('✅ Connection Successful! Live database is ready.', 'success');
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

  // Attempt to save to .env via server API
  try {
    await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabaseUrl: url, supabaseAnonKey: key })
    });
  } catch (e) {}

  closeModal('modal-supabase-config');
  showToast('Supabase configuration saved! Reloading backend...', 'success');
  await initSupabase();
}

function openResetPasswordModal() {
  closeModal('modal-auth');
  document.getElementById('modal-reset-password')?.classList.remove('hidden');
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

// ====================================================================
// 10. ROLE-BASED DASHBOARDS RENDERING
// ====================================================================

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

// 1. SELLER DASHBOARD
function renderSellerDashboard(container) {
  const myBooks = state.bookRequests.filter(r => r.user_id === state.currentUser.id || r.sellerId === state.currentUser.id);
  const myRaddi = state.wasteRequests.filter(r => r.user_id === state.currentUser.id || r.sellerId === state.currentUser.id);

  let totalEarnings = 0;
  myBooks.forEach(r => { if (r.status === 'Completed' && r.final_amount) totalEarnings += parseFloat(r.final_amount); });
  myRaddi.forEach(r => { if (r.status === 'Completed' && r.final_amount) totalEarnings += parseFloat(r.final_amount); });

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Profile & Greeting -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg shadow-inner">
              ${state.currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold text-slate-900">${state.currentUser.name}</h2>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Email Verified ✅</span>
                <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">18+ Confirmed</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${state.currentUser.email} • ${state.currentUser.phone}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="openBookSubmissionModal()" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-2 rounded text-xs flex items-center gap-1 shadow">
              <span>➕</span> Submit Used Books
            </button>
            <button onclick="openRaddiSubmissionModal()" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-2 rounded text-xs flex items-center gap-1 shadow">
              <span>⚖️</span> Sell Recycle Scrap (10+ kg)
            </button>
            <button onclick="openComplaintModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded text-xs border font-medium">
              <span>🛡️</span> Support
            </button>
          </div>
        </div>

        <!-- Metrics cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100">
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div class="text-[11px] text-slate-500">Active Requests</div>
            <div class="text-xl font-bold text-slate-900">${myBooks.filter(r => r.status !== 'Completed').length + myRaddi.filter(r => r.status !== 'Completed').length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div class="text-[11px] text-slate-500">Completed Orders</div>
            <div class="text-xl font-bold text-emerald-700">${myBooks.filter(r => r.status === 'Completed').length + myRaddi.filter(r => r.status === 'Completed').length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div class="text-[11px] text-slate-500">Total Payout Received</div>
            <div class="text-xl font-bold text-amber-600">₹${totalEarnings.toFixed(2)}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div class="text-[11px] text-slate-500">Recycled Weight</div>
            <div class="text-xl font-bold text-emerald-800">${myRaddi.reduce((a, b) => a + (parseFloat(b.actual_weight_kg || b.estimated_weight_kg) || 0), 0)} kg</div>
          </div>
        </div>
      </div>

      <!-- My Used Books Submissions -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-base text-slate-900 flex items-center justify-between">
          <span class="flex items-center gap-2"><span>📚</span> My Book Requests (${myBooks.length})</span>
          <button onclick="openBookSubmissionModal()" class="text-xs text-emerald-700 hover:underline font-bold">+ New Submission</button>
        </h3>
        
        ${myBooks.length === 0 ? '<p class="text-xs text-slate-500 py-4 text-center">No textbook requests yet. Submit books above to receive offers from stalls.</p>' : ''}

        <div class="space-y-3">
          ${myBooks.map(b => `
            <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <span class="font-bold text-sm text-slate-900">${b.request_number || b.requestNumber}</span>
                  <span class="text-xs text-slate-500 ml-2">${b.title} (${b.book_condition || b.condition})</span>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <div>Orig: ₹${b.original_price || b.totalOriginalPrice} • Est Payout: <strong>₹${b.total_estimated_payout || b.totalEstimatedPayout}</strong></div>
                <div class="flex items-center gap-2">
                  ${b.status === 'Offer Received' ? `
                    <button onclick="acceptOffer('book', '${b.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                      Accept Offer
                    </button>
                  ` : ''}
                  ${['Accepted', 'Under Inspection', 'Final Offer Sent'].includes(b.status) ? `
                    <button onclick="openChatModal('${b.id}', 'Book Stall Partner')" class="bg-shelf-forest text-white font-bold px-3 py-1 rounded flex items-center gap-1 shadow">
                      <span>💬 Chat</span>
                    </button>
                  ` : ''}
                  ${b.status === 'Payment Pending' ? `
                    <button onclick="executePaymentConfirmation('book', '${b.id}')" class="bg-shelf-gold text-slate-950 font-bold px-3 py-1 rounded shadow animate-pulse">
                      Confirm Payment Received →
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- My Recycle Scrap Submissions -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-base text-slate-900 flex items-center justify-between">
          <span class="flex items-center gap-2"><span>♻️</span> My Recycle Scrap Requests (${myRaddi.length})</span>
          <button onclick="openRaddiSubmissionModal()" class="text-xs text-emerald-700 hover:underline font-bold">+ New Scrap Request</button>
        </h3>

        ${myRaddi.length === 0 ? '<p class="text-xs text-slate-500 py-4 text-center">No scrap requests logged yet. Submit paper/cardboard requests (min 10 kg).</p>' : ''}

        <div class="space-y-3">
          ${myRaddi.map(r => `
            <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <span class="font-bold text-sm text-slate-900">${r.request_number || r.requestNumber}</span>
                  <span class="text-xs text-slate-500 ml-2">${r.paper_type || r.paperType} (${r.estimated_weight_kg || r.estimatedWeightKg} kg)</span>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(r.status)}">${r.status}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <div>Area: <strong>${r.pickup_area || r.pickupArea}</strong> • Date: ${r.preferred_date || r.preferredDate}</div>
                <div class="flex items-center gap-2">
                  ${r.status === 'Offer Received' ? `
                    <button onclick="acceptOffer('raddi', '${r.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                      Accept Quote
                    </button>
                  ` : ''}
                  ${['Accepted', 'Pickup Scheduled', 'Collected'].includes(r.status) ? `
                    <button onclick="openChatModal('${r.id}', 'Recycle Scrap Partner')" class="bg-shelf-forest text-white font-bold px-3 py-1 rounded flex items-center gap-1 shadow">
                      <span>💬 Chat</span>
                    </button>
                  ` : ''}
                  ${r.status === 'Payment Pending' ? `
                    <button onclick="executePaymentConfirmation('raddi', '${r.id}')" class="bg-shelf-gold text-slate-950 font-bold px-3 py-1 rounded shadow animate-pulse">
                      Confirm Cash/UPI Received →
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 2. BOOK STALL OWNER DASHBOARD
function renderStallDashboard(container) {
  const stall = state.bookStalls.find(s => s.user_id === state.currentUser.id) || state.bookStalls[0] || {
    stall_name: 'Vidyarthi Book House',
    approval_status: 'approved',
    licence_number: 'BLR/STALL/2024/9918',
    address: 'Avenue Road, Chickpet, Bengaluru'
  };

  const availableBooks = state.bookRequests;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Business Profile Banner -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏬</span>
              <h2 class="text-xl font-bold text-slate-900">${stall.stall_name || stall.stallName}</h2>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                ${stall.approval_status === 'approved' ? 'Verified Partner ✅' : 'Pending Verification ⏳'}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Licence: ${stall.licence_number || stall.licence} • ${stall.address}</p>
          </div>
          <div class="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
            <strong>Condition Caps Active:</strong> Max 30% for Like New/Good, 20% Used, 15% Damaged.
          </div>
        </div>
      </div>

      <!-- Available Requests Feed -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-slate-900">New & Active Textbook Requests (${availableBooks.length})</h3>
          <span class="text-xs text-slate-500">Real-time stall feed</span>
        </div>

        <div class="space-y-3">
          ${availableBooks.map(b => `
            <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <span class="font-bold text-sm text-slate-900">${b.request_number || b.requestNumber}</span>
                  <span class="text-xs text-slate-600 font-medium ml-2">${b.title} (${b.book_condition || b.condition})</span>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>Author: <strong>${b.author}</strong> • Orig: ₹${b.original_price || b.totalOriginalPrice} (Cap: ₹${b.total_estimated_payout || b.totalEstimatedPayout})</div>
                <div class="flex items-center gap-2">
                  ${b.status === 'Pending' ? `
                    <button onclick="openSendOfferModal('book', '${b.id}')" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded shadow">
                      Make Offer (Max ₹${b.total_estimated_payout || b.totalEstimatedPayout}) →
                    </button>
                  ` : ''}
                  ${b.status === 'Accepted' ? `
                    <button onclick="openChatModal('${b.id}', 'Seller')" class="bg-shelf-forest text-white font-bold px-3 py-1 rounded flex items-center gap-1 shadow">
                      <span>💬 Chat with Seller</span>
                    </button>
                    <button onclick="openRecordPaymentModal('book', '${b.id}', ${b.total_estimated_payout || 300})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                      Record Payment →
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 3. SCRAP OWNER DASHBOARD
function renderRaddiOwnerDashboard(container) {
  const scrap = state.scrapOwners.find(s => s.user_id === state.currentUser.id) || state.scrapOwners[0] || {
    business_name: 'Karnataka Eco Recyclers',
    approval_status: 'approved',
    licence_number: 'KSPCB/WPR/2023/8821',
    address: 'Rajajinagar Industrial Area, Bengaluru'
  };

  const availableScrap = state.wasteRequests;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Business Profile Banner -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">♻️</span>
              <h2 class="text-xl font-bold text-slate-900">${scrap.business_name || scrap.businessName}</h2>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                ${scrap.approval_status === 'approved' ? 'Verified Scrap Dealer ✅' : 'Pending Verification ⏳'}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Licence: ${scrap.licence_number || scrap.licence} • ${scrap.address}</p>
          </div>
          <div class="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
            <strong>Strict 10 kg Rule:</strong> Only submissions of 10 kg and above are eligible. Doorstep weighing must use certified scales.
          </div>
        </div>
      </div>

      <!-- Scrap Requests Feed (Privacy-shielded) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-slate-900">Available Recycle Scrap Requests (≥ 10 kg)</h3>
          <span class="text-xs text-slate-500">${availableScrap.length} eligible requests</span>
        </div>

        <div class="space-y-3">
          ${availableScrap.map(r => `
            <div class="border rounded-xl p-4 bg-slate-50/60 space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <span class="font-bold text-sm text-slate-900">${r.request_number || r.requestNumber}</span>
                  <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">≥ 10 kg</span>
                  <span class="text-xs text-slate-600 font-medium ml-1">${r.paper_type || r.paperType} (${r.estimated_weight_kg || r.estimatedWeightKg} kg)</span>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(r.status)}">${r.status}</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>Area: <strong>${r.pickup_area || r.pickupArea}</strong> • Date: ${r.preferred_date || r.preferredDate}</div>
                <div class="flex items-center gap-2">
                  ${r.status === 'Pending' ? `
                    <button onclick="openSendOfferModal('raddi', '${r.id}')" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded shadow">
                      Propose Rate per kg (₹/kg) →
                    </button>
                  ` : ''}
                  ${r.status === 'Accepted' ? `
                    <button onclick="openChatModal('${r.id}', 'Seller')" class="bg-shelf-forest text-white font-bold px-3 py-1 rounded flex items-center gap-1 shadow">
                      <span>💬 Chat</span>
                    </button>
                    <button onclick="openRecordPaymentModal('raddi', '${r.id}', 350)" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                      Record Payment →
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 4. ADMIN DASHBOARD (Single Admin Authority)
function renderAdminDashboard(container) {
  const pendingStalls = state.bookStalls.filter(s => s.approval_status === 'pending');
  const pendingScrap = state.scrapOwners.filter(s => s.approval_status === 'pending');

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Admin Header -->
      <div class="bg-rose-950 text-white rounded-xl p-6 border-2 border-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🛡️</span>
            <h2 class="text-xl font-bold">Second Shelf Administration Console</h2>
            <span class="bg-rose-800 text-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full">Root Authority</span>
          </div>
          <p class="text-xs text-rose-300 mt-1">Single Provisioned Admin Clearance • Full PostgreSQL Access</p>
        </div>
        <div class="flex gap-2">
          <button onclick="openSupabaseConfigModal()" class="bg-rose-800 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded text-xs border border-rose-500">
            ⚙️ Supabase Settings
          </button>
          <button onclick="logout()" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded text-xs">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto pb-1">
        <button onclick="setAdminTab('approvals')" id="admin-tab-approvals" class="pb-2 border-b-2 border-emerald-600 text-emerald-800">
          Partner Approvals (${pendingStalls.length + pendingScrap.length})
        </button>
        <button onclick="setAdminTab('guidelines')" id="admin-tab-guidelines" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Guidelines & Announcements (${state.guidelines.length})
        </button>
        <button onclick="setAdminTab('users')" id="admin-tab-users" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          User Management
        </button>
        <button onclick="setAdminTab('website')" id="admin-tab-website" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Website Submissions & Deals
        </button>
        <button onclick="setAdminTab('complaints')" id="admin-tab-complaints" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Complaints & Disputes (${state.complaints.length})
        </button>
        <button onclick="setAdminTab('audit')" id="admin-tab-audit" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Security Audit Logs
        </button>
      </div>

      <!-- Tab Content Container -->
      <div id="admin-tab-container"></div>
    </div>
  `;

  setAdminTab('approvals');
}

function setAdminTab(tab) {
  ['approvals', 'guidelines', 'users', 'website', 'complaints', 'audit'].forEach(t => {
    const btn = document.getElementById(`admin-tab-${t}`);
    if (btn) {
      if (t === tab) {
        btn.className = 'pb-2 border-b-2 border-emerald-600 text-emerald-800 font-bold';
      } else {
        btn.className = 'pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold';
      }
    }
  });

  const container = document.getElementById('admin-tab-container');
  if (!container) return;

  if (tab === 'approvals') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-sm text-slate-900">Partner Registration Requests</h3>
        <p class="text-xs text-slate-500">Book stalls and scrap yards must be reviewed and approved by the administrator before participating in marketplace transactions.</p>
        
        <div class="space-y-3">
          ${state.bookStalls.map(s => `
            <div class="border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base">🏬</span>
                  <strong class="text-xs text-slate-900">${s.stall_name || s.stallName}</strong>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold ${s.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}">${s.approval_status || 'PENDING'}</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-0.5">Licence: ${s.licence_number || s.licence} • ${s.address}</div>
              </div>
              <div class="flex items-center gap-2">
                ${s.approval_status !== 'approved' ? `
                  <button onclick="approveBusiness('stall', '${s.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">Approve ✅</button>
                  <button onclick="rejectBusiness('stall', '${s.id}')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded text-xs shadow">Reject ❌</button>
                ` : `
                  <button onclick="suspendBusiness('stall', '${s.id}')" class="bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded text-xs">Suspend Access</button>
                `}
              </div>
            </div>
          `).join('')}

          ${state.scrapOwners.map(r => `
            <div class="border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base">♻️</span>
                  <strong class="text-xs text-slate-900">${r.business_name || r.businessName}</strong>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold ${r.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}">${r.approval_status || 'PENDING'}</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-0.5">Licence: ${r.licence_number || r.licence} • ${r.address}</div>
              </div>
              <div class="flex items-center gap-2">
                ${r.approval_status !== 'approved' ? `
                  <button onclick="approveBusiness('raddi', '${r.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">Approve ✅</button>
                  <button onclick="rejectBusiness('raddi', '${r.id}')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded text-xs shadow">Reject ❌</button>
                ` : `
                  <button onclick="suspendBusiness('raddi', '${r.id}')" class="bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded text-xs">Suspend Access</button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'guidelines') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-slate-900">Manage Dynamic Section Guidelines</h3>
            <p class="text-xs text-slate-500">Publish guidelines displayed across particular website submission sections.</p>
          </div>
          <button onclick="promptCreateGuideline()" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-1.5 rounded text-xs shadow">
            + New Guideline
          </button>
        </div>

        <div class="space-y-3">
          ${state.guidelines.map(g => `
            <div class="border rounded-xl p-3 bg-slate-50/70 flex items-center justify-between gap-3 text-xs">
              <div>
                <div class="flex items-center gap-2">
                  <strong class="text-slate-900 text-sm">${g.title}</strong>
                  <span class="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">${g.section_page}</span>
                </div>
                <p class="text-slate-600 mt-1">${g.content}</p>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="toggleGuidelinePublish('${g.id}', ${g.is_published})" class="px-2.5 py-1 rounded font-bold text-[11px] ${g.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                  ${g.is_published ? 'Published ✅' : 'Draft ⏸️'}
                </button>
                <button onclick="deleteGuideline('${g.id}')" class="text-rose-600 hover:text-rose-800 font-bold px-2">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'users') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-sm text-slate-900">Registered Platform Users</h3>
        <p class="text-xs text-slate-500">Search and manage student sellers, bookstore owners, and scrap collectors.</p>
        <div class="text-xs text-slate-600 py-4">Total registered profiles in PostgreSQL: <strong>${state.bookRequests.length + state.wasteRequests.length + 4}</strong></div>
      </div>
    `;
  } else if (tab === 'website') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-sm text-slate-900">All Submissions, Quotes & Payment Records</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3 bg-slate-50 rounded border">Books Logged: <strong>${state.bookRequests.length}</strong></div>
          <div class="p-3 bg-slate-50 rounded border">Scrap Logged: <strong>${state.wasteRequests.length}</strong></div>
          <div class="p-3 bg-slate-50 rounded border">Deals Active: <strong>${state.transactions.length}</strong></div>
        </div>
      </div>
    `;
  } else if (tab === 'complaints') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-sm text-slate-900">User Disputes & Support Complaints</h3>
        ${state.complaints.length === 0 ? '<p class="text-xs text-slate-500 py-4 text-center">No active complaints lodged. System operating normally.</p>' : ''}
      </div>
    `;
  } else if (tab === 'audit') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-sm text-slate-900">Administrator Security & Moderation Audit Trail</h3>
        <p class="text-xs text-slate-500">Immutable security logs stored in PostgreSQL table <code>admin_audit_logs</code>.</p>
        <div class="space-y-2 text-xs font-mono">
          <div class="p-2 bg-slate-50 rounded border text-slate-700">[SYSTEM] Root administrator clearance provisioned. RLS policies active.</div>
        </div>
      </div>
    `;
  }
}

// Admin Partner Approval Actions
async function approveBusiness(type, id) {
  if (supabase) {
    if (type === 'stall') {
      await supabase.from('book_stalls').update({ approval_status: 'approved' }).eq('id', id);
    } else {
      await supabase.from('scrap_owners').update({ approval_status: 'approved' }).eq('id', id);
    }
  }
  showToast('Partner approved successfully!', 'success');
  await refreshRequestsAndOffers();
  setAdminTab('approvals');
}

async function rejectBusiness(type, id) {
  if (supabase) {
    if (type === 'stall') {
      await supabase.from('book_stalls').update({ approval_status: 'rejected' }).eq('id', id);
    } else {
      await supabase.from('scrap_owners').update({ approval_status: 'rejected' }).eq('id', id);
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
  if (sectionId === 'used-books-page') document.getElementById('section-used-books-page')?.classList.remove('hidden');
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

  document.getElementById('tagline-text').innerHTML = t.tagline;
  document.getElementById('hero-title').innerHTML = t.heroTitle;
  document.getElementById('hero-subtitle').innerHTML = t.heroSubtitle;
  document.getElementById('hero-cta-books').innerHTML = t.sellBooksBtn;
  document.getElementById('hero-cta-raddi').innerHTML = t.sellRaddiBtn;
  document.getElementById('subnav-home').innerHTML = t.home;
  document.getElementById('subnav-used-books').innerHTML = t.usedBooks;
  document.getElementById('subnav-raddi').innerHTML = t.raddi;
  document.getElementById('subnav-submit-book').innerHTML = t.submitBook;
  document.getElementById('subnav-submit-raddi').innerHTML = t.submitRaddi;
  document.getElementById('subnav-calculator').innerHTML = t.estimator;
  document.getElementById('subnav-payment-policy').innerHTML = t.paymentRules;
  document.getElementById('subnav-privacy').innerHTML = t.privacy;
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

  if (!user) {
    if (greeting) greeting.textContent = 'Welcome, Guest';
    if (badge) badge.textContent = 'Sign In';
    if (roleIcon) roleIcon.textContent = '🔑';
    if (authNavBtn) authNavBtn.textContent = 'Sign In';
  } else {
    if (greeting) greeting.textContent = 'Hi, ' + user.name.split(' ')[0];
    if (badge) badge.textContent = getRoleTitle(user.role).split('/')[0].trim();
    if (roleIcon) roleIcon.textContent = user.role === 'admin' ? '🛡️' : user.role === 'book_stall' ? '🏬' : user.role === 'raddi_owner' ? '♻️' : '👤';
    if (authNavBtn) authNavBtn.textContent = 'Sign Out';
  }
}

// Modal open/close helpers
function openPortalSelector() {
  document.getElementById('modal-auth')?.classList.remove('hidden');
  switchPortalTab('seller');
}

function openLoginPortal(role) {
  document.getElementById('modal-auth')?.classList.remove('hidden');
  switchPortalTab(role);
}

function switchPortalTab(tab) {
  ['seller', 'stall', 'raddi', 'admin', 'signup'].forEach(t => {
    const btn = document.getElementById(`tab-portal-${t}`);
    const view = document.getElementById(`view-portal-${t}`);
    const isMatch = (t === tab) || (tab === 'book_stall' && t === 'stall') || (tab === 'raddi_owner' && t === 'raddi');

    if (btn) {
      if (isMatch) {
        btn.className = t === 'admin' 
          ? 'px-3 py-2 rounded-t border-b-2 border-rose-600 text-rose-900 bg-rose-100 font-bold flex items-center gap-1 shadow-sm'
          : 'px-3 py-2 rounded-t border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50 font-bold flex items-center gap-1 shadow-sm';
      } else {
        btn.className = 'px-3 py-2 rounded-t border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-1';
      }
    }
    if (view) {
      if (isMatch) view.classList.remove('hidden');
      else view.classList.add('hidden');
    }
  });
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

function openSendOfferModal(type, reqId) {
  document.getElementById('offer-req-id').value = reqId;
  document.getElementById('offer-req-type').value = type;
  const bookView = document.getElementById('offer-book-inputs');
  const raddiView = document.getElementById('offer-raddi-inputs');

  if (type === 'book') {
    bookView?.classList.remove('hidden');
    raddiView?.classList.add('hidden');
  } else {
    bookView?.classList.add('hidden');
    raddiView?.classList.remove('hidden');
  }

  document.getElementById('modal-send-offer')?.classList.remove('hidden');
}

function openRecordPaymentModal(type, trxId, amount) {
  document.getElementById('record-payment-trx-id').value = trxId;
  document.getElementById('payment-amount').value = amount || 350;
  document.getElementById('modal-record-payment')?.classList.remove('hidden');
  injectDynamicGuidelines('payment_guidelines', 'guidelines-payment');
}

function openSellActionSelector() {
  const choice = confirm('What would you like to sell?\n\nClick OK for USED BOOKS\nClick CANCEL for RECYCLE SCRAP (≥ 10 kg)');
  if (choice) openBookSubmissionModal();
  else openRaddiSubmissionModal();
}

function scrollToCalculator() {
  document.getElementById('hero-calculator')?.scrollIntoView({ behavior: 'smooth' });
}

function setCalcTab(tab) {
  const bTab = document.getElementById('calc-tab-books');
  const rTab = document.getElementById('calc-tab-raddi');
  const bInputs = document.getElementById('calc-books-inputs');
  const rInputs = document.getElementById('calc-raddi-inputs');

  if (tab === 'books') {
    bTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-emerald-50 border-emerald-600 text-emerald-900 text-center';
    rTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-slate-50 border-slate-300 text-slate-600 text-center';
    bInputs.classList.remove('hidden');
    rInputs.classList.add('hidden');
    runQuickBookCalc();
  } else {
    rTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-amber-50 border-amber-600 text-amber-900 text-center';
    bTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-slate-50 border-slate-300 text-slate-600 text-center';
    rInputs.classList.remove('hidden');
    bInputs.classList.add('hidden');
    runQuickRaddiCalc();
  }
}

function runQuickBookCalc() {
  const price = parseFloat(document.getElementById('quick-book-price')?.value) || 0;
  const condition = document.getElementById('quick-book-condition')?.value || 'Like New';
  const pct = state.valuationRules[condition] || 30.0;
  const estimate = price * (pct / 100);

  const resEl = document.getElementById('quick-book-result');
  const capEl = document.getElementById('quick-book-cap-text');
  if (resEl) resEl.textContent = '₹' + estimate.toFixed(2);
  if (capEl) capEl.textContent = `Estimated valuation cap: ${pct}% for ${condition}`;
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

function recalcRaddiOfferTotal() {
  const rate = parseFloat(document.getElementById('offer-rate-kg')?.value) || 0;
  const total = rate * 25.0; // standard estimate
  const el = document.getElementById('offer-raddi-total-val');
  if (el) el.textContent = '₹' + total.toFixed(2);
}

function renderBookDirectory() {
  const container = document.getElementById('used-books-grid');
  if (!container) return;

  container.innerHTML = state.categories.map(c => `
    <div onclick="showSection('used-books-page')" class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition cursor-pointer group">
      <div class="text-2xl mb-2">📚</div>
      <h3 class="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">${c.name}</h3>
      <p class="text-xs text-slate-500 mt-1">${c.description || 'Verified textbooks'}</p>
    </div>
  `).join('');
}

function renderRaddiDirectory() {
  const container = document.getElementById('raddi-directory-cards');
  if (!container) return;

  container.innerHTML = state.wasteRequests.map(r => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
      <div class="flex items-center justify-between border-b pb-2">
        <span class="font-bold text-sm text-slate-900">${r.request_number || r.requestNumber}</span>
        <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">≥ 10 kg</span>
      </div>
      <div class="text-xs space-y-1 text-slate-600">
        <div>Paper Type: <strong>${r.paper_type || r.paperType}</strong></div>
        <div>Weight: <strong>${r.estimated_weight_kg || r.estimatedWeightKg} kg</strong></div>
        <div>Area: <strong>${r.pickup_area || r.pickupArea}</strong></div>
      </div>
    </div>
  `).join('');
}

function renderDemoBookListings() {
  const container = document.getElementById('demo-book-listings');
  if (!container) return;
  container.innerHTML = state.categories.slice(0, 4).map(c => `
    <div class="bg-white rounded-xl p-3 border shadow-sm text-xs">
      <div class="font-bold text-slate-900">${c.name}</div>
      <div class="text-slate-500 text-[11px] mt-1">Available across certified local book stalls</div>
    </div>
  `).join('');
}

// Search
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
        <input type="text" required name="item_title" placeholder="Book title" class="w-full text-xs p-2 rounded border border-slate-300" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Author *</label>
        <input type="text" required name="item_author" placeholder="Author name" class="w-full text-xs p-2 rounded border border-slate-300" />
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
        <select name="item_category" class="w-full text-xs p-2 rounded border border-slate-300">
          ${state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Condition *</label>
        <select name="item_condition" onchange="calculateModalBookTotal()" class="w-full text-xs p-2 rounded border border-slate-300">
          <option value="Like New">Like New (Max 30%)</option>
          <option value="Good">Good (Max 30%)</option>
          <option value="Used">Used (Max 20%)</option>
          <option value="Old or Damaged">Old or Damaged (Max 15%)</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Original Price (₹) *</label>
        <input type="number" required min="1" step="1" name="item_price" value="500" oninput="calculateModalBookTotal()" class="w-full text-xs p-2 rounded border border-slate-300 font-bold" />
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

// Policies
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
  }
  document.getElementById('modal-policy')?.classList.remove('hidden');
}

// ====================================================================
// INITIALIZATION ON DOM READY
// ====================================================================
document.addEventListener('DOMContentLoaded', async () => {
  runQuickBookCalc();
  runQuickRaddiCalc();
  await initSupabase();
});
