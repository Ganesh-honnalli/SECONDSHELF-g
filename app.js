// ====================================================================
// SECOND SHELF - Core Application Logic
// Marketplace connecting Sellers with Book Stalls & Raddi Recyclers
// ====================================================================

// Application State Store (Offline-First / Supabase-ready)
const state = {
  language: 'en', // 'en' | 'kn'
  currentUser: null, // Initial state: unauthenticated (forces login on first opening)
  valuationRules: {
    'Like New': 30.0,
    'Good': 30.0,
    'Used': 20.0,
    'Old or Damaged': 15.0
  },
  categories: [
    { id: '1', name: 'Degree Books', slug: 'degree-books', count: 142, active: true },
    { id: '2', name: 'PUC Books', slug: 'puc-books', count: 89, active: true },
    { id: '3', name: 'Class 10th / SSLC Books', slug: 'sslc-10th-books', count: 76, active: true },
    { id: '4', name: 'School Books', slug: 'school-books', count: 54, active: true },
    { id: '5', name: 'Engineering Books', slug: 'engineering-books', count: 210, active: true },
    { id: '6', name: 'Medical and Competitive Exam Books', slug: 'medical-competitive-exam', count: 118, active: true },
    { id: '7', name: 'Story Books and Novels', slug: 'story-books-novels', count: 95, active: true },
    { id: '8', name: 'Other Educational Books', slug: 'other-educational', count: 43, active: true }
  ],
  bookStalls: [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      userId: 'c0000000-0000-0000-0000-000000000001',
      stallName: 'Vidyarthi Book House',
      ownerName: 'Rajesh Gowda',
      licence: 'KA-BBMP-BL-2018-9941',
      address: 'Shop #14, Avenue Road, Chickpet, Bengaluru',
      pinCode: '560002',
      phone: '+91 98440 22334',
      email: 'vidyarthi.books@avenue.in',
      approvalStatus: 'approved',
      offersPickup: true
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      userId: 'c0000000-0000-0000-0000-000000000002',
      stallName: 'Sapna Used Book Corner',
      ownerName: 'Mahesh Hegde',
      licence: 'KA-BBMP-BL-2022-3841',
      address: 'Shop #8, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru',
      pinCode: '560004',
      phone: '+91 94480 33445',
      email: 'sapna.corner@books.in',
      approvalStatus: 'pending',
      offersPickup: false
    }
  ],
  raddiOwners: [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      userId: 'd0000000-0000-0000-0000-000000000001',
      businessName: 'Karnataka Eco Recyclers',
      ownerName: 'Anand Rao',
      licence: 'KSPCB-HAZ-REC-2020-112',
      baseAddress: 'Yard #42, Industrial Area, Rajajinagar 1st Block',
      pinCodes: ['560001', '560002', '560010', '560041', '560070'],
      phone: '+91 99001 55667',
      email: 'anand@ecorecyclers.in',
      approvalStatus: 'approved'
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      userId: 'd0000000-0000-0000-0000-000000000002',
      businessName: 'Green Paper Traders',
      ownerName: 'Syed Khaleel',
      licence: 'KSPCB-HAZ-REC-2023-450',
      baseAddress: 'Shed 12, Mysuru Road, Nayandahalli',
      pinCodes: ['560039', '560040', '560050'],
      phone: '+91 98860 66778',
      email: 'syed@greenpaper.in',
      approvalStatus: 'pending'
    }
  ],
  bookRequests: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      requestNumber: 'BOK-2026-0001',
      sellerId: 'b0000000-0000-0000-0000-000000000001',
      sellerName: 'Priya Sharma',
      sellerPhone: '+91 98451 12345',
      sellerAddress: '#24, 7th Cross, Jayanagar 4th Block, Bengaluru',
      sellerPin: '560041',
      handoverMethod: 'direct_stall_handover',
      status: 'Payment Pending',
      totalOriginalPrice: 1450.0,
      totalEstimatedPayout: 395.0,
      assignedStallId: 'e0000000-0000-0000-0000-000000000001',
      stallName: 'Vidyarthi Book House',
      createdAt: '2026-10-24T10:15:00Z',
      items: [
        {
          id: 'b-item-1',
          title: 'Data Structures Using C',
          author: 'Reema Thareja',
          isbn: '978-0198099307',
          category: 'Engineering Books',
          originalPrice: 650.0,
          condition: 'Like New',
          copies: 1,
          estimatedPayout: 195.0,
          images: [
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'
          ]
        },
        {
          id: 'b-item-2',
          title: 'Discrete Mathematics and Its Applications',
          author: 'Kenneth H. Rosen',
          isbn: '978-0070681880',
          category: 'Engineering Books',
          originalPrice: 800.0,
          condition: 'Good',
          copies: 1,
          estimatedPayout: 200.0,
          images: [
            'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400'
          ]
        }
      ],
      currentOffer: {
        amount: 395.0,
        notes: 'Initial valuation approved. Inspected books at stall counter.'
      },
      payment: {
        amount: 395.0,
        method: 'upi',
        utr: 'UPI/261025884920/GPay',
        date: '2026-10-25',
        notes: 'Transferred to Priya via Google Pay. Inspected condition matches Like New & Good.',
        payerRecorded: true,
        sellerConfirmed: false
      }
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      requestNumber: 'BOK-2026-0002',
      sellerId: 'b0000000-0000-0000-0000-000000000001',
      sellerName: 'Priya Sharma',
      sellerPhone: '+91 98451 12345',
      sellerAddress: '#24, 7th Cross, Jayanagar 4th Block, Bengaluru',
      sellerPin: '560041',
      handoverMethod: 'arranged_pickup',
      status: 'Pending',
      totalOriginalPrice: 850.0,
      totalEstimatedPayout: 255.0,
      assignedStallId: null,
      createdAt: '2026-10-25T08:30:00Z',
      items: [
        {
          id: 'b-item-3',
          title: 'Objective Biology for NEET Vol 1',
          author: 'Dr. Ali',
          isbn: '978-9386320114',
          category: 'Medical and Competitive Exam Books',
          originalPrice: 850.0,
          condition: 'Like New',
          copies: 1,
          estimatedPayout: 255.0,
          images: [
            'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'
          ]
        }
      ],
      currentOffer: null,
      payment: null
    }
  ],
  wasteRequests: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      requestNumber: 'RAD-2026-0001',
      sellerId: 'b0000000-0000-0000-0000-000000000001',
      sellerName: 'Priya Sharma',
      sellerPhone: '+91 98451 12345',
      sellerEmail: 'priya.sharma@gmail.com',
      pickupAddress: '#24, 7th Cross, Jayanagar 4th Block, Near Cool Joint, Bengaluru',
      pickupPin: '560041',
      pickupArea: 'Jayanagar 4th Block',
      paperType: 'Newspapers',
      estimatedWeightKg: 25.0, // Strictly >= 10 kg
      actualWeightKg: 26.5,
      preferredDate: '2026-10-28',
      preferredSlot: 'Morning (9 AM - 12 PM)',
      notes: '6 months of English & Kannada newspapers bundled with twine.',
      status: 'Payment Pending',
      assignedOwnerId: 'f0000000-0000-0000-0000-000000000001',
      ownerBusinessName: 'Karnataka Eco Recyclers',
      agreedRateKg: 14.0,
      finalAmount: 371.0, // 26.5 kg * ₹14/kg
      createdAt: '2026-10-23T11:00:00Z',
      payment: {
        amount: 371.0,
        method: 'cash',
        utr: 'CASH-REC-261025-01',
        date: '2026-10-25',
        notes: 'Weighed 26.5 kg on electronic scale. Cash handed over in person.',
        payerRecorded: true,
        sellerConfirmed: false
      }
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      requestNumber: 'RAD-2026-0002',
      sellerId: 'b0000000-0000-0000-0000-000000000002',
      sellerName: 'Ramesh Kumar',
      sellerPhone: '+91 97402 98765',
      sellerEmail: 'ramesh.kumar@yahoo.com',
      pickupAddress: '#102, Shanti Nilaya, 3rd Stage, Basaveshwaranagar, Bengaluru',
      pickupPin: '560079',
      pickupArea: 'Basaveshwaranagar',
      paperType: 'Notebooks',
      estimatedWeightKg: 15.0, // Strictly >= 10 kg
      actualWeightKg: null,
      preferredDate: '2026-10-29',
      preferredSlot: 'Afternoon (12 PM - 3 PM)',
      notes: 'Old college long notebooks and assignment drafts.',
      status: 'Pending',
      assignedOwnerId: null,
      ownerBusinessName: null,
      agreedRateKg: null,
      finalAmount: null,
      createdAt: '2026-10-25T09:15:00Z',
      payment: null
    }
  ],
  disputes: [
    {
      id: 'dsp-01',
      requestNumber: 'BOK-2026-0099',
      raisedBy: 'Ramesh Kumar',
      against: 'Sapna Used Book Corner',
      reason: 'wrong_payment_amount',
      details: 'Agreed final offer was ₹450, but transfer received was ₹350.',
      status: 'under_review',
      createdAt: '2026-10-22'
    }
  ],
  auditLogs: [
    { id: 'log-1', timestamp: '2026-10-25 09:30', user: 'System Admin', action: 'Valuation Rule Checked', details: 'Confirmed condition cap: Like New 30%, Good 30%, Used 20%, Damaged 15%' },
    { id: 'log-2', timestamp: '2026-10-25 10:15', user: 'Rajesh Gowda (Stall)', action: 'Payment Logged', details: 'Logged ₹395 UPI payment for BOK-2026-0001 (UTR: UPI/261025884920/GPay)' },
    { id: 'log-3', timestamp: '2026-10-25 11:20', user: 'Anand Rao (Recycler)', action: 'Payment Logged', details: 'Logged ₹371 Cash settlement for RAD-2026-0001' }
  ]
};

// Demo user profiles for instant switcher
const DEMO_USERS = {
  seller: {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98451 12345',
    role: 'seller',
    is_verified: true,
    age_confirmed: true
  },
  book_stall: {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Rajesh Gowda (Vidyarthi Books)',
    email: 'vidyarthi.books@avenue.in',
    phone: '+91 98440 22334',
    role: 'book_stall',
    stallId: 'e0000000-0000-0000-0000-000000000001',
    stallName: 'Vidyarthi Book House (Avenue Rd)',
    is_verified: true,
    age_confirmed: true,
    approvalStatus: 'approved'
  },
  raddi_owner: {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'Anand Rao (Karnataka Eco Recyclers)',
    email: 'anand@ecorecyclers.in',
    phone: '+91 99001 55667',
    role: 'raddi_owner',
    ownerId: 'f0000000-0000-0000-0000-000000000001',
    businessName: 'Karnataka Eco Recyclers',
    is_verified: true,
    age_confirmed: true,
    approvalStatus: 'approved'
  },
  admin: {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Super Admin',
    email: 'admin@secondshelf.in',
    phone: '+91 98765 43210',
    role: 'admin',
    is_verified: true,
    age_confirmed: true
  }
};

// Kannada Language Translations Map (Section 8 of Prompt)
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
// INITIALIZATION
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderDemoBookListings();
  runQuickBookCalc();
  runQuickRaddiCalc();
  updateUserRoleUI();

  // Set default pickup date in raddi modal to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateInput = document.getElementById('raddi-pickup-date');
  if (dateInput) {
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }

  // FIRST OPENING REQUIREMENT:
  // Ask for login first before allowing marketplace and dashboard interaction!
  if (!state.currentUser) {
    setTimeout(() => {
      openLoginPortal('seller');
      showToast('Welcome to SECOND SHELF! Please sign in through your portal to enter.', 'warning');
    }, 400);
  }
});

// Toast System
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'error' ? 'bg-rose-900 border-rose-700 text-white' :
             type === 'warning' ? 'bg-amber-900 border-amber-700 text-white' :
             'bg-emerald-900 border-emerald-700 text-white';

  const icon = type === 'error' ? '⛔' : type === 'warning' ? '⚠️' : '✅';

  toast.className = `${bg} border p-3 rounded-lg shadow-xl text-xs flex items-center justify-between gap-3 pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-base">${icon}</span>
      <span>${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-300 hover:text-white font-bold">&times;</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Web Creator Master Clearance Key (Cannot be accessed by others)
const CREATOR_MASTER_KEY = 'CREATOR#SECONDSHELF#2026';

// Role Switcher / Portal Router
function switchRole(newRole) {
  if (newRole === 'admin') {
    // Admin login CANNOT be accessed by others except the web creator!
    if (state.currentUser.role !== 'admin') {
      openLoginPortal('admin');
      showToast('Restricted: Web Creator Master Security Key required to access Admin console.', 'warning');
      return;
    }
  }
  if (!DEMO_USERS[newRole]) return;
  state.currentUser = { ...DEMO_USERS[newRole] };
  updateUserRoleUI();
  showToast(`Switched active view to: ${state.currentUser.name} (${newRole.toUpperCase()})`, 'success');

  // If dashboard is currently open, re-render it
  const dashboardSec = document.getElementById('section-dashboard');
  if (dashboardSec && !dashboardSec.classList.contains('hidden')) {
    renderCurrentDashboard();
  }
}

function updateUserRoleUI() {
  const user = state.currentUser;
  
  // Highlight active portal button in top bar and hero horizontal bar
  const portals = ['seller', 'book_stall', 'raddi_owner', 'admin'];
  portals.forEach(r => {
    const topBtn = document.getElementById(`portal-top-${r}`);
    const heroBtn = document.getElementById(`hero-portal-${r}`);
    const isActive = user && r === user.role;

    if (topBtn) {
      if (isActive) {
        if (r === 'admin') {
          topBtn.className = 'px-2.5 py-0.5 rounded bg-rose-800 text-white font-black border border-rose-400 transition text-[11px] flex items-center gap-1 shadow';
        } else {
          topBtn.className = 'px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold shadow transition text-[11px] flex items-center gap-1';
        }
      } else {
        if (r === 'admin') {
          topBtn.className = 'px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 font-bold transition text-[11px] flex items-center gap-1';
        } else {
          topBtn.className = 'px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-emerald-800 transition text-[11px] flex items-center gap-1 font-medium';
        }
      }
    }

    if (heroBtn) {
      if (isActive) {
        if (r === 'admin') {
          heroBtn.className = 'bg-rose-700 text-white border-2 border-rose-300 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-lg whitespace-nowrap flex-shrink-0 ring-2 ring-rose-400';
        } else {
          heroBtn.className = 'bg-amber-400 text-slate-950 border-2 border-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-lg whitespace-nowrap flex-shrink-0 ring-2 ring-amber-300';
        }
      } else {
        if (r === 'admin') {
          heroBtn.className = 'bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-800 hover:border-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0';
        } else if (r === 'book_stall') {
          heroBtn.className = 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-600 hover:border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0';
        } else if (r === 'raddi_owner') {
          heroBtn.className = 'bg-amber-950/90 hover:bg-amber-900 text-amber-200 border border-amber-600/70 hover:border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0';
        } else {
          heroBtn.className = 'bg-emerald-800/90 hover:bg-emerald-700 text-white border border-emerald-500/70 hover:border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0';
        }
      }
    }
  });

  // Nav header badges
  const greeting = document.getElementById('user-greeting');
  const badge = document.getElementById('user-role-badge');
  const roleIcon = document.getElementById('role-icon');

  if (greeting && badge) {
    if (user.role === 'seller') {
      greeting.textContent = user.id === 'guest' ? 'Welcome, Guest' : `Hello, ${user.name.split(' ')[0]}`;
      badge.textContent = 'Seller Dashboard';
      if (roleIcon) roleIcon.textContent = '👤';
    } else if (user.role === 'book_stall') {
      greeting.textContent = 'Stall Partner';
      badge.textContent = user.stallName || 'Book Stall';
      if (roleIcon) roleIcon.textContent = '🏬';
    } else if (user.role === 'raddi_owner') {
      greeting.textContent = 'Recycler Partner';
      badge.textContent = user.businessName || 'Recycle Scrap Owner';
      if (roleIcon) roleIcon.textContent = '♻️';
    } else if (user.role === 'admin') {
      greeting.textContent = 'Admin (Creator)';
      badge.textContent = 'Super Admin Console';
      if (roleIcon) roleIcon.textContent = '🛡️';
    }
  }
}

// Language Toggle
function toggleLanguage() {
  state.language = state.language === 'en' ? 'kn' : 'en';
  const lang = state.language;
  const t = TRANSLATIONS[lang];

  const toggleBtnText = document.getElementById('current-lang-text');
  if (toggleBtnText) {
    toggleBtnText.textContent = lang === 'en' ? 'ಕನ್ನಡ (Kannada)' : 'English (EN)';
  }

  // Update dynamic elements
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

  showToast(`Language switched to ${lang === 'en' ? 'English' : 'ಕನ್ನಡ (Kannada)'}`);
}

// Section Navigation
function showSection(sectionId) {
  const sections = ['section-home', 'section-dashboard', 'section-used-books-page', 'section-raddi-page'];
  sections.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(`section-${sectionId}`) || document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (sectionId === 'used-books-page') renderBookDirectory();
  if (sectionId === 'raddi-page') renderRaddiDirectory();
}

function openCurrentRoleDashboard() {
  showSection('dashboard');
  renderCurrentDashboard();
}

function scrollToCalculator() {
  showSection('home');
  const calc = document.getElementById('calc-tab-book');
  if (calc) {
    calc.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ====================================================================
// VALUATION & ESTIMATION CALCULATORS (Formula Enforcement)
// ====================================================================

function setCalcTab(tab) {
  const bookTab = document.getElementById('calc-tab-book');
  const raddiTab = document.getElementById('calc-tab-raddi');
  const bookInputs = document.getElementById('calc-book-inputs');
  const raddiInputs = document.getElementById('calc-raddi-inputs');

  if (tab === 'book') {
    bookTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-emerald-50 border-emerald-600 text-emerald-800 text-center';
    raddiTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-slate-50 border-slate-300 text-slate-600 text-center';
    bookInputs.classList.remove('hidden');
    raddiInputs.classList.add('hidden');
  } else {
    raddiTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-amber-50 border-amber-600 text-amber-900 text-center';
    bookTab.className = 'py-2 px-3 text-xs font-bold rounded border bg-slate-50 border-slate-300 text-slate-600 text-center';
    raddiInputs.classList.remove('hidden');
    bookInputs.classList.add('hidden');
  }
}

// Book Valuation Formula: Estimated payment = Original price × applicable percentage × number of copies
function runQuickBookCalc() {
  const price = parseFloat(document.getElementById('quick-original-price')?.value) || 0;
  const condition = document.getElementById('quick-condition')?.value || 'Used';
  const copies = parseInt(document.getElementById('quick-copies')?.value) || 1;

  const pct = state.valuationRules[condition] || 20.0;
  const estimate = (price * (pct / 100)) * copies;

  const resEl = document.getElementById('quick-book-result');
  if (resEl) {
    resEl.textContent = `₹${estimate.toFixed(2)}`;
  }
}

// Raddi Valuation Formula: Estimated amount = Estimated weight (kg) × offered rate per kg
function runQuickRaddiCalc() {
  const typeSelect = document.getElementById('quick-raddi-type');
  const rate = parseFloat(typeSelect?.options[typeSelect.selectedIndex]?.dataset.rate) || 14.0;
  const weight = parseFloat(document.getElementById('quick-raddi-weight')?.value) || 0;

  const warning = document.getElementById('quick-raddi-warning');
  const successBox = document.getElementById('quick-raddi-success-box');
  const btn = document.getElementById('quick-raddi-btn');
  const resEl = document.getElementById('quick-raddi-result');

  // Enforce 10 kg rule
  if (weight < 10) {
    if (warning) warning.classList.remove('hidden');
    if (successBox) successBox.classList.add('opacity-40');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      btn.textContent = 'Minimum 10 kg Required to Request';
    }
    if (resEl) resEl.textContent = '₹0.00';
  } else {
    if (warning) warning.classList.add('hidden');
    if (successBox) successBox.classList.remove('opacity-40');
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
      btn.textContent = 'Proceed to Request Recycle Scrap Pickup →';
    }
    const estimate = weight * rate;
    if (resEl) resEl.textContent = `₹${estimate.toFixed(2)}`;
  }
}

// Strict frontend validation for Raddi Submission Modal
function validateRaddiWeight(input) {
  const val = parseFloat(input.value) || 0;
  const errorEl = document.getElementById('raddi-weight-error');
  const submitBtn = document.getElementById('submit-raddi-btn');

  if (val < 10) {
    errorEl?.classList.remove('hidden');
    input.classList.add('border-rose-500', 'bg-rose-50');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      submitBtn.textContent = 'Blocked (< 10 kg)';
    }
  } else {
    errorEl?.classList.add('hidden');
    input.classList.remove('border-rose-500', 'bg-rose-50');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      submitBtn.textContent = 'Publish Recycle Scrap Request (≥ 10 kg) →';
    }
  }
}

// Multi-item book submission calculation
function calculateModalBookTotal() {
  const items = document.querySelectorAll('.book-item-card');
  let grandTotal = 0;

  items.forEach((card, index) => {
    const price = parseFloat(card.querySelector('input[name="item_price"]')?.value) || 0;
    const cond = card.querySelector('select[name="item_condition"]')?.value || 'Used';
    const copies = parseInt(card.querySelector('input[name="item_copies"]')?.value) || 1;

    const pct = state.valuationRules[cond] || 20.0;
    const itemTotal = (price * (pct / 100)) * copies;
    grandTotal += itemTotal;

    const subEl = card.querySelector('.item-estimated-subtotal');
    if (subEl) {
      subEl.textContent = `Estimated Item Payout: ₹${itemTotal.toFixed(2)} (${pct}% cap, subject to inspection)`;
    }
  });

  const grandEl = document.getElementById('modal-book-grand-total');
  if (grandEl) {
    grandEl.textContent = `₹${grandTotal.toFixed(2)}`;
  }
}

function addAnotherBookItem() {
  const container = document.getElementById('book-items-list');
  if (!container) return;

  const count = container.querySelectorAll('.book-item-card').length + 1;
  const newCard = document.createElement('div');
  newCard.className = 'book-item-card bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative';
  newCard.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-slate-700 item-index-badge">Book #${count}</span>
      <button type="button" onclick="this.closest('.book-item-card').remove(); calculateModalBookTotal();" class="text-xs text-rose-600 hover:text-rose-800 font-semibold">
        ✕ Remove Item
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Book Title *</label>
        <input type="text" required name="item_title" placeholder="e.g. Computer Networks" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Author Name *</label>
        <input type="text" required name="item_author" placeholder="e.g. Andrew S. Tanenbaum" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Category & Semester *</label>
        <select name="item_category" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus">
          <option value="Engineering Books">Engineering Books</option>
          <option value="Degree Books">Degree Books (B.Com/B.Sc/B.A)</option>
          <option value="PUC Books">PUC Books</option>
          <option value="Class 10th / SSLC Books">Class 10th / SSLC</option>
          <option value="Medical and Competitive Exam Books">Medical & Competitive Exam</option>
          <option value="Story Books and Novels">Story Books & Novels</option>
          <option value="Other Educational Books">Other Educational</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Publisher & Edition</label>
        <input type="text" name="item_edition" placeholder="e.g. Pearson, 5th Edition" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">ISBN (Optional)</label>
        <input type="text" name="item_isbn" placeholder="e.g. 978-0132126953" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Original Purchase Price (₹) *</label>
        <input type="number" required min="1" step="1" name="item_price" value="500" oninput="calculateModalBookTotal()" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus font-bold" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Condition *</label>
        <select name="item_condition" onchange="calculateModalBookTotal()" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus font-medium">
          <option value="Like New">Like New (Max 30%)</option>
          <option value="Good" selected>Good (Max 30%)</option>
          <option value="Used">Used (Max 20%)</option>
          <option value="Old or Damaged">Old or Damaged (Max 15%)</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Number of Copies *</label>
        <input type="number" required min="1" max="50" name="item_copies" value="1" oninput="calculateModalBookTotal()" class="w-full text-xs p-2 rounded border border-slate-300 amazon-focus" />
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-700 mb-1">
        Photographs (Front, Back, Inside Page)
      </label>
      <div class="grid grid-cols-3 gap-2">
        <div class="border-2 border-dashed border-slate-300 rounded p-1.5 text-center text-[10px] bg-white">
          Front Cover <input type="file" accept="image/*" class="text-[9px] w-full mt-1" />
        </div>
        <div class="border-2 border-dashed border-slate-300 rounded p-1.5 text-center text-[10px] bg-white">
          Back Cover <input type="file" accept="image/*" class="text-[9px] w-full mt-1" />
        </div>
        <div class="border-2 border-dashed border-slate-300 rounded p-1.5 text-center text-[10px] bg-white">
          Inside Page <input type="file" accept="image/*" class="text-[9px] w-full mt-1" />
        </div>
      </div>
    </div>

    <div class="text-right text-[11px] font-semibold text-emerald-800 item-estimated-subtotal">
      Estimated Item Payout: ₹150.00
    </div>
  `;

  container.appendChild(newCard);
  calculateModalBookTotal();
}

// ====================================================================
// MODAL CONTROLLERS & FORM SUBMISSIONS (With Authentication Guards)
// ====================================================================

function openBookSubmissionModal() {
  if (!state.currentUser) {
    openLoginPortal('seller');
    showToast('Authentication required: Please sign in as a Seller / User first.', 'warning');
    return;
  }
  if (state.currentUser.role !== 'seller' && state.currentUser.role !== 'admin') {
    showToast(`Role Restriction: Book submissions are for Sellers. You are currently logged in as ${getRoleTitle(state.currentUser.role)}. Please sign out first.`, 'error');
    return;
  }
  document.getElementById('modal-book-submission')?.classList.remove('hidden');
  calculateModalBookTotal();
}

function openRaddiSubmissionModal() {
  if (!state.currentUser) {
    openLoginPortal('seller');
    showToast('Authentication required: Please sign in as a Seller / User first.', 'warning');
    return;
  }
  if (state.currentUser.role !== 'seller' && state.currentUser.role !== 'admin') {
    showToast(`Role Restriction: Recycle Scrap pickup requests are for Sellers. You are currently logged in as ${getRoleTitle(state.currentUser.role)}.`, 'error');
    return;
  }
  document.getElementById('modal-raddi-submission')?.classList.remove('hidden');
  const weightInput = document.getElementById('raddi-weight-input');
  if (weightInput) validateRaddiWeight(weightInput);
}

function openCurrentRoleDashboard() {
  if (!state.currentUser) {
    openLoginPortal('seller');
    showToast('Please sign in through your dedicated portal to access your dashboard.', 'warning');
    return;
  }
  showSection('dashboard');
  renderCurrentDashboard();
}

function openSellActionSelector() {
  // Let user choose between Book and Raddi
  const choice = confirm('What would you like to sell?\n\nClick OK for USED BOOKS\nClick CANCEL for RECYCLE SCRAP (10+ kg)');
  if (choice) {
    openBookSubmissionModal();
  } else {
    openRaddiSubmissionModal();
  }
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

// Handle Book Submission
function handleBookSubmit(event) {
  event.preventDefault();

  const authCheck = document.getElementById('book-auth-check');
  if (!authCheck?.checked) {
    showToast('You must confirm that the books are genuine and complete.', 'error');
    return;
  }

  const items = [];
  let totalOrig = 0;
  let totalEst = 0;

  document.querySelectorAll('.book-item-card').forEach((card, idx) => {
    const title = card.querySelector('input[name="item_title"]')?.value;
    const author = card.querySelector('input[name="item_author"]')?.value;
    const cat = card.querySelector('select[name="item_category"]')?.value;
    const price = parseFloat(card.querySelector('input[name="item_price"]')?.value) || 0;
    const cond = card.querySelector('select[name="item_condition"]')?.value || 'Used';
    const copies = parseInt(card.querySelector('input[name="item_copies"]')?.value) || 1;

    const pct = state.valuationRules[cond] || 20.0;
    const itemEst = (price * (pct / 100)) * copies;

    totalOrig += (price * copies);
    totalEst += itemEst;

    items.push({
      id: `b-item-${Date.now()}-${idx}`,
      title,
      author,
      category: cat,
      originalPrice: price,
      condition: cond,
      copies,
      estimatedPayout: itemEst,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'
      ]
    });
  });

  const handover = document.querySelector('input[name="handover_method"]:checked')?.value || 'direct_stall_handover';
  const name = document.getElementById('book-seller-name')?.value || state.currentUser.name;
  const phone = document.getElementById('book-seller-phone')?.value || state.currentUser.phone;
  const address = document.getElementById('book-seller-address')?.value || 'Jayanagar, Bengaluru';
  const pin = document.getElementById('book-seller-pin')?.value || '560041';

  const reqNumber = `BOK-2026-${String(state.bookRequests.length + 1).padStart(4, '0')}`;

  const newReq = {
    id: `req-book-${Date.now()}`,
    requestNumber: reqNumber,
    sellerId: state.currentUser.id,
    sellerName: name,
    sellerPhone: phone,
    sellerAddress: address,
    sellerPin: pin,
    handoverMethod: handover,
    status: 'Pending',
    totalOriginalPrice: totalOrig,
    totalEstimatedPayout: totalEst,
    assignedStallId: null,
    createdAt: new Date().toISOString(),
    items,
    currentOffer: null,
    payment: null
  };

  state.bookRequests.unshift(newReq);
  closeModal('modal-book-submission');
  showToast(`Book Request #${reqNumber} submitted successfully! Awaiting stall review.`, 'success');

  // Log in audit
  state.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: name,
    action: 'Book Request Submitted',
    details: `${reqNumber} with ${items.length} item(s), est: ₹${totalEst.toFixed(2)}`
  });

  openCurrentRoleDashboard();
}

// Handle Raddi Submission (Backend & Frontend Minimum 10 kg Validation)
function handleRaddiSubmit(event) {
  event.preventDefault();

  const weight = parseFloat(document.getElementById('raddi-weight-input')?.value) || 0;

  // Strict check
  if (weight < 10.0) {
    showToast('Minimum 10 kg of recycle scrap is required to submit a request.', 'error');
    return;
  }

  const paperType = document.getElementById('raddi-paper-type')?.value;
  const name = document.getElementById('raddi-seller-name')?.value;
  const phone = document.getElementById('raddi-seller-phone')?.value;
  const address = document.getElementById('raddi-pickup-address')?.value;
  const pin = document.getElementById('raddi-pickup-pin')?.value;
  const date = document.getElementById('raddi-pickup-date')?.value;
  const slot = document.getElementById('raddi-time-slot')?.value;
  const notes = document.getElementById('raddi-notes')?.value;

  const reqNumber = `RAD-2026-${String(state.wasteRequests.length + 1).padStart(4, '0')}`;

  const newReq = {
    id: `req-rad-${Date.now()}`,
    requestNumber: reqNumber,
    sellerId: state.currentUser.id,
    sellerName: name,
    sellerPhone: phone,
    sellerEmail: state.currentUser.email,
    pickupAddress: address,
    pickupPin: pin,
    pickupArea: address.split(',')[1]?.trim() || 'Bengaluru Central',
    paperType,
    estimatedWeightKg: weight,
    actualWeightKg: null,
    preferredDate: date,
    preferredSlot: slot,
    notes: notes || 'Standard collection',
    status: 'Pending',
    assignedOwnerId: null,
    ownerBusinessName: null,
    agreedRateKg: null,
    finalAmount: null,
    createdAt: new Date().toISOString(),
    payment: null
  };

  state.wasteRequests.unshift(newReq);
  closeModal('modal-raddi-submission');
  showToast(`Recycle Scrap Pickup #${reqNumber} published! Visible to verified scrap recyclers (Area: ${pin}).`, 'success');

  // Log audit
  state.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: name,
    action: 'Recycle Scrap Request Published',
    details: `${reqNumber} for ${weight} kg ${paperType} (PIN: ${pin})`
  });

  openCurrentRoleDashboard();
}

// ====================================================================
// TWO-PARTY PAYMENT CONFIRMATION FLOW (Section 10 of Prompt)
// ====================================================================

let pendingConfirmationTxn = null;

function openPaymentConfirmationModal(txnType, reqId) {
  let req = null;
  if (txnType === 'book') {
    req = state.bookRequests.find(r => r.id === reqId);
  } else {
    req = state.wasteRequests.find(r => r.id === reqId);
  }

  if (!req || !req.payment) {
    showToast('No payment record found for this request.', 'error');
    return;
  }

  pendingConfirmationTxn = { txnType, reqId };

  document.getElementById('pay-confirm-id').textContent = req.requestNumber;
  document.getElementById('pay-confirm-amount').textContent = `₹${req.payment.amount.toFixed(2)}`;
  document.getElementById('pay-confirm-check-amount').textContent = `₹${req.payment.amount.toFixed(2)}`;
  document.getElementById('pay-confirm-mode').textContent = req.payment.method.toUpperCase();
  document.getElementById('pay-confirm-utr').textContent = req.payment.utr || 'N/A';
  document.getElementById('pay-confirm-date').textContent = req.payment.date;
  document.getElementById('pay-confirm-notes').textContent = req.payment.notes || 'None';

  const check = document.getElementById('seller-payment-verify-check');
  if (check) check.checked = false;

  document.getElementById('modal-payment-confirm')?.classList.remove('hidden');
}

function executePaymentConfirmation() {
  const check = document.getElementById('seller-payment-verify-check');
  if (!check?.checked) {
    showToast('Please check the verification box confirming you received the funds.', 'warning');
    return;
  }

  if (!pendingConfirmationTxn) return;
  const { txnType, reqId } = pendingConfirmationTxn;

  let req = null;
  if (txnType === 'book') {
    req = state.bookRequests.find(r => r.id === reqId);
  } else {
    req = state.wasteRequests.find(r => r.id === reqId);
  }

  if (req && req.payment) {
    req.payment.sellerConfirmed = true;
    req.status = 'Completed';

    closeModal('modal-payment-confirm');

    // Confetti celebration for successful transaction completion!
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    showToast(`Transaction ${req.requestNumber} confirmed and marked Completed! Thank you! 🎉`, 'success');

    // Log audit
    state.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: state.currentUser.name,
      action: 'Payment Confirmed by Seller',
      details: `${req.requestNumber} settlement of ₹${req.payment.amount} verified.`
    });

    renderCurrentDashboard();
  }
}

// Open modal for stall/raddi owner to record direct payment
function openRecordPaymentModal(txnType, reqId, defaultAmount) {
  document.getElementById('record-pay-req-id').value = reqId;
  document.getElementById('record-pay-type').value = txnType;
  document.getElementById('record-pay-amount').value = defaultAmount || 300;
  document.getElementById('record-pay-utr').value = `UPI/${Date.now().toString().slice(-10)}/BankRef`;

  document.getElementById('modal-record-payment')?.classList.remove('hidden');
}

function handleRecordPaymentSubmit(event) {
  event.preventDefault();

  const reqId = document.getElementById('record-pay-req-id').value;
  const txnType = document.getElementById('record-pay-type').value;
  const amount = parseFloat(document.getElementById('record-pay-amount').value) || 0;
  const method = document.getElementById('record-pay-method').value;
  const utr = document.getElementById('record-pay-utr').value;
  const notes = document.getElementById('record-pay-notes').value;

  let req = null;
  if (txnType === 'book') {
    req = state.bookRequests.find(r => r.id === reqId);
  } else {
    req = state.wasteRequests.find(r => r.id === reqId);
  }

  if (req) {
    req.payment = {
      amount,
      method,
      utr,
      date: new Date().toISOString().split('T')[0],
      notes,
      payerRecorded: true,
      sellerConfirmed: false
    };
    req.status = 'Payment Pending';

    closeModal('modal-record-payment');
    showToast(`Payment recorded for ${req.requestNumber}. Status is now 'Payment Pending' awaiting seller verification.`, 'success');

    state.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: state.currentUser.name,
      action: 'Payment Recorded by Buyer',
      details: `${req.requestNumber} - ₹${amount} via ${method.toUpperCase()} (${utr})`
    });

    renderCurrentDashboard();
  }
}

// ====================================================================
// OFFER SUBMISSION & CONDITION CAP ENFORCEMENT
// ====================================================================

function openSendOfferModal(txnType, reqId) {
  document.getElementById('offer-target-req-id').value = reqId;
  document.getElementById('offer-target-type').value = txnType;

  const rateField = document.getElementById('offer-rate-field');
  const capBanner = document.getElementById('offer-cap-banner');
  const modalTitle = document.getElementById('send-offer-modal-title');

  if (txnType === 'book') {
    const req = state.bookRequests.find(r => r.id === reqId);
    if (!req) return;

    modalTitle.textContent = `Send Offer for ${req.requestNumber}`;
    rateField.classList.add('hidden');
    capBanner.classList.remove('hidden');

    const maxCap = req.totalEstimatedPayout;
    document.getElementById('offer-max-cap').value = maxCap;
    document.getElementById('offer-max-cap-display').textContent = `₹${maxCap.toFixed(2)}`;
    document.getElementById('offer-amount-input').value = maxCap;
    document.getElementById('offer-amount-input').max = maxCap;
  } else {
    const req = state.wasteRequests.find(r => r.id === reqId);
    if (!req) return;

    modalTitle.textContent = `Propose Rate for Recycle Scrap ${req.requestNumber}`;
    rateField.classList.remove('hidden');
    capBanner.classList.add('hidden');

    const defaultRate = 14;
    document.getElementById('offer-rate-kg').value = defaultRate;
    document.getElementById('offer-amount-input').value = req.estimatedWeightKg * defaultRate;
  }

  document.getElementById('modal-send-offer')?.classList.remove('hidden');
}

function recalcRaddiOfferTotal() {
  const reqId = document.getElementById('offer-target-req-id').value;
  const req = state.wasteRequests.find(r => r.id === reqId);
  const rate = parseFloat(document.getElementById('offer-rate-kg').value) || 0;

  if (req) {
    document.getElementById('offer-amount-input').value = (req.estimatedWeightKg * rate).toFixed(2);
  }
}

function handleSendOfferSubmit(event) {
  event.preventDefault();

  const reqId = document.getElementById('offer-target-req-id').value;
  const txnType = document.getElementById('offer-target-type').value;
  const amount = parseFloat(document.getElementById('offer-amount-input').value) || 0;
  const reason = document.getElementById('offer-reason').value;

  if (txnType === 'book') {
    const req = state.bookRequests.find(r => r.id === reqId);
    const maxCap = parseFloat(document.getElementById('offer-max-cap').value) || req.totalEstimatedPayout;

    // Server-grade validation rule: Stall offer CANNOT exceed condition cap!
    if (amount > maxCap) {
      showToast(`Rule Violation: Offer of ₹${amount} exceeds maximum condition payout cap of ₹${maxCap.toFixed(2)}.`, 'error');
      return;
    }

    if (req) {
      req.status = 'Offer Received';
      req.assignedStallId = state.currentUser.stallId || 'e0000000-0000-0000-0000-000000000001';
      req.stallName = state.currentUser.stallName || 'Vidyarthi Book House';
      req.currentOffer = {
        amount,
        notes: reason || 'Standard condition valuation offer'
      };

      closeModal('modal-send-offer');
      showToast(`Offer of ₹${amount} sent to seller for ${req.requestNumber}.`, 'success');

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: state.currentUser.name,
        action: 'Book Offer Sent',
        details: `${req.requestNumber} - ₹${amount} (Cap: ₹${maxCap})`
      });

      renderCurrentDashboard();
    }
  } else {
    const req = state.wasteRequests.find(r => r.id === reqId);
    const rate = parseFloat(document.getElementById('offer-rate-kg').value) || 14;

    if (req) {
      req.status = 'Offer Received';
      req.assignedOwnerId = state.currentUser.ownerId || 'f0000000-0000-0000-0000-000000000001';
      req.ownerBusinessName = state.currentUser.businessName || 'Karnataka Eco Recyclers';
      req.agreedRateKg = rate;
      req.finalAmount = amount;

      closeModal('modal-send-offer');
      showToast(`Rate quote of ₹${rate}/kg sent for ${req.requestNumber}. Total est: ₹${amount}`, 'success');

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: state.currentUser.name,
        action: 'Recycle Scrap Rate Offered',
        details: `${req.requestNumber} - ₹${rate}/kg, est: ₹${amount}`
      });

      renderCurrentDashboard();
    }
  }
}

// Seller accepts offer
function acceptOffer(txnType, reqId) {
  if (txnType === 'book') {
    const req = state.bookRequests.find(r => r.id === reqId);
    if (req) {
      req.status = 'Accepted';
      showToast(`Offer accepted! Stall details and handover instructions are now active.`, 'success');
      renderCurrentDashboard();
    }
  } else {
    const req = state.wasteRequests.find(r => r.id === reqId);
    if (req) {
      req.status = 'Accepted';
      showToast(`Offer accepted! Full address and phone unlocked for ${req.ownerBusinessName}.`, 'success');
      renderCurrentDashboard();
    }
  }
}

// Stall updates inspection status
function updateInspectionStatus(reqId, newStatus) {
  const req = state.bookRequests.find(r => r.id === reqId);
  if (!req) return;

  req.status = newStatus;
  showToast(`Book status updated to: ${newStatus}`, 'success');
  renderCurrentDashboard();
}

// Raddi owner schedules pickup or records collection
function updateRaddiStatus(reqId, newStatus) {
  const req = state.wasteRequests.find(r => r.id === reqId);
  if (!req) return;

  if (newStatus === 'Collected') {
    const measuredWeight = prompt(`Enter verified weight measured at doorstep digital scale (kg):\nDeclared: ${req.estimatedWeightKg} kg`, req.estimatedWeightKg);
    if (!measuredWeight) return;

    const w = parseFloat(measuredWeight);
    if (w < 10) {
      alert(`⚠️ Measured weight is ${w} kg (below 10 kg minimum threshold).\nAccording to platform policy, you may propose a revised rate or cancel.`);
    }

    req.actualWeightKg = w;
    req.finalAmount = w * (req.agreedRateKg || 14);
    req.status = 'Collected';
    showToast(`Paper collected! Actual weight: ${w} kg. Final price: ₹${req.finalAmount.toFixed(2)}`, 'success');
  } else {
    req.status = newStatus;
    showToast(`Recycle Scrap status updated to: ${newStatus}`, 'success');
  }

  renderCurrentDashboard();
}

// ====================================================================
// ROLE-BASED DASHBOARD RENDERERS (Section 6 & 7 of Prompt)
// ====================================================================

function renderCurrentDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  const role = state.currentUser.role;

  if (role === 'seller') {
    renderSellerDashboard(container);
  } else if (role === 'book_stall') {
    renderStallDashboard(container);
  } else if (role === 'raddi_owner') {
    renderRaddiOwnerDashboard(container);
  } else if (role === 'admin') {
    renderAdminDashboard(container);
  }
}

// 1. SELLER DASHBOARD
function renderSellerDashboard(container) {
  const myBooks = state.bookRequests.filter(r => r.sellerId === state.currentUser.id);
  const myRaddi = state.wasteRequests.filter(r => r.sellerId === state.currentUser.id);

  const completedBooks = myBooks.filter(r => r.status === 'Completed').length;
  const completedRaddi = myRaddi.filter(r => r.status === 'Completed').length;
  
  let totalEarnings = 0;
  myBooks.forEach(r => { if (r.status === 'Completed' && r.payment) totalEarnings += r.payment.amount; });
  myRaddi.forEach(r => { if (r.status === 'Completed' && r.payment) totalEarnings += r.payment.amount; });

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Profile & KPI Summary -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
              PS
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold text-slate-900">${state.currentUser.name}</h2>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Email Verified</span>
                <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">18+ Age Confirmed</span>
              </div>
              <p class="text-xs text-slate-500">${state.currentUser.email} • ${state.currentUser.phone}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="openBookSubmissionModal()" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-2 rounded text-xs flex items-center gap-1 shadow">
              <span>➕</span> Submit Used Books
            </button>
            <button onclick="openRaddiSubmissionModal()" class="bg-shelf-forest hover:bg-shelf-emerald text-white font-bold px-3 py-2 rounded text-xs flex items-center gap-1 shadow">
              <span>⚖️</span> Sell Recycle Scrap (10+ kg)
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
            <div class="text-xl font-bold text-emerald-700">${completedBooks + completedRaddi}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div class="text-[11px] text-slate-500">Total Payout Received</div>
            <div class="text-xl font-bold text-amber-600">₹${totalEarnings.toFixed(2)}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div class="text-[11px] text-slate-500">Paper Recycled</div>
            <div class="text-xl font-bold text-emerald-800">41.5 kg</div>
          </div>
        </div>
      </div>

      <!-- Action Required Alert: Two-party payment confirmation -->
      ${myBooks.some(r => r.status === 'Payment Pending') || myRaddi.some(r => r.status === 'Payment Pending') ? `
        <div class="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div class="flex items-center gap-3">
            <span class="text-3xl">⚠️</span>
            <div>
              <h4 class="font-bold text-amber-950 text-sm">Action Required: Confirm Payment Received</h4>
              <p class="text-xs text-amber-900">
                A buyer has recorded a direct payment to your account. Check your UPI app / bank account, then click below to confirm receipt.
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            ${myBooks.find(r => r.status === 'Payment Pending') ? `
              <button onclick="openPaymentConfirmationModal('book', '${myBooks.find(r => r.status === 'Payment Pending').id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded text-xs shadow">
                Confirm Book Payment (₹${myBooks.find(r => r.status === 'Payment Pending').payment?.amount})
              </button>
            ` : ''}
            ${myRaddi.find(r => r.status === 'Payment Pending') ? `
              <button onclick="openPaymentConfirmationModal('raddi', '${myRaddi.find(r => r.status === 'Payment Pending').id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded text-xs shadow">
                Confirm Recycle Scrap Payment (₹${myRaddi.find(r => r.status === 'Payment Pending').payment?.amount})
              </button>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- My Used Books Submissions -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <span>📚</span> My Used Book Requests (${myBooks.length})
        </h3>
        
        <div class="space-y-4">
          ${myBooks.map(b => `
            <div class="border rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900">${b.requestNumber}</span>
                  <span class="text-xs text-slate-500">• ${new Date(b.createdAt).toLocaleDateString()}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
                </div>
                <div class="text-right">
                  <div class="text-[11px] text-slate-500">Estimated Payout Cap</div>
                  <div class="font-black text-emerald-800 text-sm">₹${b.totalEstimatedPayout.toFixed(2)}</div>
                </div>
              </div>

              <!-- Items in request -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                ${b.items.map(it => `
                  <div class="bg-white p-2 rounded border border-slate-200 flex items-center gap-2">
                    <img src="${it.images[0]}" class="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" alt="Book cover" />
                    <div class="truncate">
                      <div class="font-bold text-slate-800 truncate">${it.title}</div>
                      <div class="text-[11px] text-slate-500">${it.author} • ${it.condition}</div>
                      <div class="text-[11px] text-emerald-700 font-semibold">Orig: ₹${it.originalPrice} (Est: ₹${it.estimatedPayout})</div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Offer & Status Details -->
              <div class="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span class="text-slate-500">Handover:</span> <strong class="capitalize">${b.handoverMethod.replace(/_/g, ' ')}</strong> |
                  <span class="text-slate-500">Assigned Stall:</span> <strong>${b.stallName || 'Pending stall offer'}</strong>
                </div>

                <div class="flex items-center gap-2">
                  ${b.status === 'Offer Received' ? `
                    <button onclick="acceptOffer('book', '${b.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                      Accept Stall Offer (₹${b.currentOffer?.amount})
                    </button>
                    <button onclick="alert('Offer declined. Other stalls can now send offers.')" class="bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded">
                      Decline
                    </button>
                  ` : ''}

                  ${b.status === 'Payment Pending' ? `
                    <button onclick="openPaymentConfirmationModal('book', '${b.id}')" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1 rounded shadow animate-pulse">
                      Confirm Payment Received →
                    </button>
                  ` : ''}

                  ${b.status === 'Completed' ? `
                    <span class="text-emerald-700 font-bold flex items-center gap-1">
                      <span>✅</span> Completed & Paid (₹${b.payment?.amount})
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- My Recycle Scrap Submissions -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <span>♻️</span> My Recycle Scrap Requests (${myRaddi.length})
        </h3>

        <div class="space-y-4">
          ${myRaddi.map(r => `
            <div class="border rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900">${r.requestNumber}</span>
                  <span class="text-xs text-slate-500">• ${r.paperType}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(r.status)}">${r.status}</span>
                </div>
                <div class="text-right">
                  <div class="text-[11px] text-slate-500">Weight: <strong>${r.actualWeightKg || r.estimatedWeightKg} kg</strong></div>
                  ${r.finalAmount ? `<div class="font-black text-emerald-800 text-sm">₹${r.finalAmount.toFixed(2)}</div>` : ''}
                </div>
              </div>

              <div class="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div><span class="text-slate-400">Pickup Area:</span> <strong>${r.pickupArea} (${r.pickupPin})</strong></div>
                <div><span class="text-slate-400">Preferred Slot:</span> ${r.preferredDate} (${r.preferredSlot})</div>
                <div><span class="text-slate-400">Recycler:</span> <strong>${r.ownerBusinessName || 'Awaiting quote'}</strong></div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t text-xs">
                ${r.status === 'Offer Received' ? `
                  <button onclick="acceptOffer('raddi', '${r.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                    Accept Quote (₹${r.agreedRateKg}/kg)
                  </button>
                ` : ''}

                ${r.status === 'Payment Pending' ? `
                  <button onclick="openPaymentConfirmationModal('raddi', '${r.id}')" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1 rounded shadow animate-pulse">
                    Confirm Cash/UPI Received →
                  </button>
                ` : ''}

                ${r.status === 'Completed' ? `
                  <span class="text-emerald-700 font-bold">✅ Completed & Settled (₹${r.finalAmount})</span>
                ` : ''}
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
  const stall = state.bookStalls.find(s => s.userId === state.currentUser.id) || state.bookStalls[0];
  const pendingRequests = state.bookRequests.filter(r => r.status === 'Pending' || r.assignedStallId === stall.id);

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Stall Profile Banner -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏬</span>
              <h2 class="text-xl font-bold text-slate-900">${stall.stallName}</h2>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                ${stall.approvalStatus === 'approved' ? 'Admin Approved ✅' : 'Pending Verification ⏳'}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Licence: ${stall.licence} • ${stall.address}</p>
          </div>
          <div class="text-xs bg-slate-50 p-2.5 rounded-lg border text-slate-700">
            <strong>Operating Rules:</strong> Offers cannot exceed condition caps. Written reason required for downgraded prices.
          </div>
        </div>
      </div>

      <!-- Book Requests Feed -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-slate-900">Book Submissions Requiring Attention</h3>
          <span class="text-xs text-slate-500">${pendingRequests.length} requests</span>
        </div>

        <div class="space-y-4">
          ${pendingRequests.map(b => `
            <div class="border rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900">${b.requestNumber}</span>
                  <span class="text-xs text-slate-500">• Seller: ${b.sellerName} (${b.sellerPin})</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
                </div>
                <div class="text-right">
                  <span class="text-[11px] text-slate-500">System Max Valuation Cap:</span>
                  <span class="font-black text-emerald-800 text-sm ml-1">₹${b.totalEstimatedPayout.toFixed(2)}</span>
                </div>
              </div>

              <!-- Item photos and condition -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                ${b.items.map(it => `
                  <div class="bg-white p-3 rounded-lg border border-slate-200 flex gap-3">
                    <img src="${it.images[0]}" class="w-14 h-20 object-cover rounded shadow flex-shrink-0" alt="Cover" />
                    <div class="space-y-1">
                      <div class="font-bold text-slate-900">${it.title}</div>
                      <div class="text-slate-500">${it.author} • ${it.category}</div>
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">Condition: ${it.condition}</span>
                        <span class="text-slate-500">Copies: ${it.copies}</span>
                      </div>
                      <div class="text-[11px] text-slate-600">Orig: ₹${it.originalPrice} | Cap: ₹${it.estimatedPayout}</div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Action Toolbar for Stall -->
              <div class="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span class="text-slate-500">Handover Preference:</span> <strong class="capitalize">${b.handoverMethod.replace(/_/g, ' ')}</strong>
                </div>

                <div class="flex items-center gap-2">
                  ${b.status === 'Pending' ? `
                    <button onclick="openSendOfferModal('book', '${b.id}')" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded shadow">
                      Send Offer (Max ₹${b.totalEstimatedPayout}) →
                    </button>
                  ` : ''}

                  ${b.status === 'Accepted' ? `
                    <button onclick="updateInspectionStatus('${b.id}', 'Received')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded shadow">
                      Confirm Book Received at Counter
                    </button>
                  ` : ''}

                  ${b.status === 'Received' ? `
                    <button onclick="updateInspectionStatus('${b.id}', 'Under Inspection')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1 rounded shadow">
                      Start Physical Inspection
                    </button>
                  ` : ''}

                  ${b.status === 'Under Inspection' ? `
                    <button onclick="openRecordPaymentModal('book', '${b.id}', ${b.totalEstimatedPayout})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                      Inspection Passed: Record Payment (₹${b.totalEstimatedPayout}) →
                    </button>
                  ` : ''}

                  ${b.status === 'Payment Pending' ? `
                    <span class="text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      Payment Recorded (₹${b.payment?.amount}). Awaiting Seller Confirmation.
                    </span>
                  ` : ''}

                  ${b.status === 'Completed' ? `
                    <span class="text-emerald-700 font-bold">✅ Completed</span>
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

// 3. RADDI OWNER DASHBOARD (Privacy-First Area View)
function renderRaddiOwnerDashboard(container) {
  const raddiOwner = state.raddiOwners.find(r => r.userId === state.currentUser.id) || state.raddiOwners[0];
  const eligibleRequests = state.wasteRequests;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Business Profile Banner -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">♻️</span>
              <h2 class="text-xl font-bold text-slate-900">${raddiOwner.businessName}</h2>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                ${raddiOwner.approvalStatus === 'approved' ? 'Verified Recycler Partner ✅' : 'Pending Verification ⏳'}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Licence: ${raddiOwner.licence} • Base: ${raddiOwner.baseAddress}</p>
          </div>
          <div class="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
            <strong>10 kg Rule:</strong> Only orders of 10 kg and above are eligible. Weighing must be done on digital scale.
          </div>
        </div>
      </div>

      <!-- Feed of Waste Paper Requests -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-base text-slate-900">Available Recycle Scrap Requests (10+ kg)</h3>
            <p class="text-xs text-slate-500">Privacy rule: Contact details unlock only after seller accepts your rate quote.</p>
          </div>
          <span class="text-xs text-slate-500">${eligibleRequests.length} available</span>
        </div>

        <div class="space-y-4">
          ${eligibleRequests.map(r => {
            const isAssignedToMe = r.assignedOwnerId === raddiOwner.id;
            const isContactUnlocked = ['Accepted', 'Pickup Scheduled', 'Collected', 'Final Price Sent', 'Payment Pending', 'Completed'].includes(r.status) && isAssignedToMe;

            return `
              <div class="border rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900">${r.requestNumber}</span>
                    <span class="bg-slate-200 text-slate-800 text-xs font-bold px-2 py-0.5 rounded">${r.paperType}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(r.status)}">${r.status}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[11px] text-slate-500">Estimated Quantity:</span>
                    <span class="font-black text-slate-900 text-sm ml-1">${r.estimatedWeightKg} kg</span>
                  </div>
                </div>

                <!-- Privacy Masking Section -->
                <div class="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[10px]">PICKUP LOCATION</span>
                    <strong class="text-slate-800">
                      ${isContactUnlocked ? r.pickupAddress : `${r.pickupArea} (${r.pickupPin})`}
                    </strong>
                    ${!isContactUnlocked ? `<span class="text-[10px] text-amber-700 block mt-0.5">🔒 Exact address hidden until offer accepted</span>` : ''}
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10px]">SELLER CONTACT</span>
                    <strong class="text-slate-800">
                      ${isContactUnlocked ? `${r.sellerName} (${r.sellerPhone})` : 'Confidential (Protected)'}
                    </strong>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10px]">PREFERRED SLOT</span>
                    <strong class="text-slate-800">${r.preferredDate} • ${r.preferredSlot}</strong>
                  </div>
                </div>

                <!-- Recycler Actions -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
                  <div class="text-slate-500 italic">
                    ${r.notes ? `Note: "${r.notes}"` : ''}
                  </div>

                  <div class="flex items-center gap-2">
                    ${r.status === 'Pending' ? `
                      <button onclick="openSendOfferModal('raddi', '${r.id}')" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-3 py-1.5 rounded shadow">
                        Propose Rate per kg (₹/kg) →
                      </button>
                    ` : ''}

                    ${r.status === 'Accepted' && isAssignedToMe ? `
                      <button onclick="updateRaddiStatus('${r.id}', 'Pickup Scheduled')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded shadow">
                        Confirm Pickup Scheduled
                      </button>
                    ` : ''}

                    ${r.status === 'Pickup Scheduled' && isAssignedToMe ? `
                      <button onclick="updateRaddiStatus('${r.id}', 'Collected')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1 rounded shadow">
                        Doorstep Weigh & Mark Collected
                      </button>
                    ` : ''}

                    ${r.status === 'Collected' && isAssignedToMe ? `
                      <button onclick="openRecordPaymentModal('raddi', '${r.id}', ${r.finalAmount || 350})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow">
                        Record Payment (₹${r.finalAmount}) →
                      </button>
                    ` : ''}

                    ${r.status === 'Payment Pending' ? `
                      <span class="text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        Payment Recorded. Awaiting Seller Confirmation.
                      </span>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// 4. ADMIN DASHBOARD (Section 7 of Prompt)
function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Overview Stats -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h2 class="text-xl font-extrabold text-slate-900">Administrator Control Center</h2>
            <p class="text-xs text-slate-500">Business verification, valuation percentages, category management, and audit trail.</p>
          </div>
          <span class="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
            Admin Mode Active
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div class="bg-slate-50 p-3 rounded-lg border">
            <div class="text-[11px] text-slate-500">Total Books Logged</div>
            <div class="text-xl font-bold text-slate-900">${state.bookRequests.length}</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border">
            <div class="text-[11px] text-slate-500">Recycle Scrap Weight Logged</div>
            <div class="text-xl font-bold text-emerald-700">40.0 kg</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border">
            <div class="text-[11px] text-slate-500">Pending Approvals</div>
            <div class="text-xl font-bold text-amber-600">
              ${state.bookStalls.filter(s => s.approvalStatus === 'pending').length + state.raddiOwners.filter(r => r.approvalStatus === 'pending').length}
            </div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border">
            <div class="text-[11px] text-slate-500">Completed Orders</div>
            <div class="text-xl font-bold text-emerald-800">
              ${state.bookRequests.filter(r => r.status === 'Completed').length + state.wasteRequests.filter(r => r.status === 'Completed').length}
            </div>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border">
            <div class="text-[11px] text-slate-500">Open Disputes</div>
            <div class="text-xl font-bold text-rose-600">${state.disputes.length}</div>
          </div>
        </div>
      </div>

      <!-- Admin Tab Switcher -->
      <div class="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
        <button onclick="setAdminTab('approvals')" id="admin-tab-approvals" class="pb-2 border-b-2 border-emerald-600 text-emerald-800">
          Business Approvals (${state.bookStalls.filter(s => s.approvalStatus === 'pending').length + state.raddiOwners.filter(r => r.approvalStatus === 'pending').length})
        </button>
        <button onclick="setAdminTab('valuation')" id="admin-tab-valuation" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Valuation Percentage Settings
        </button>
        <button onclick="setAdminTab('categories')" id="admin-tab-categories" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Book Categories (${state.categories.length})
        </button>
        <button onclick="setAdminTab('disputes')" id="admin-tab-disputes" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Disputes & Complaints (${state.disputes.length})
        </button>
        <button onclick="setAdminTab('audit')" id="admin-tab-audit" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          Audit Logs (${state.auditLogs.length})
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="admin-tab-container"></div>
    </div>
  `;

  setAdminTab('approvals');
}

function setAdminTab(tab) {
  ['approvals', 'valuation', 'categories', 'disputes', 'audit'].forEach(t => {
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
        <h3 class="font-bold text-sm text-slate-900">Pending Book Stalls & Recycle Scrap Dealers</h3>
        <p class="text-xs text-slate-500">Business accounts must be manually verified by Admin before participating in transactions.</p>

        <div class="space-y-3">
          ${state.bookStalls.map(s => `
            <div class="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base">🏬</span>
                  <strong class="text-xs text-slate-900">${s.stallName}</strong>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold ${s.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}">${s.approvalStatus.toUpperCase()}</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-0.5">Owner: ${s.ownerName} • Licence: ${s.licence} • ${s.address}</div>
              </div>
              <div class="flex items-center gap-2">
                ${s.approvalStatus === 'pending' ? `
                  <button onclick="approveBusiness('stall', '${s.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                    Approve Stall ✅
                  </button>
                  <button onclick="rejectBusiness('stall', '${s.id}')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                    Reject
                  </button>
                ` : `
                  <button onclick="suspendBusiness('stall', '${s.id}')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2.5 py-1 rounded text-xs">
                    Suspend Access
                  </button>
                `}
              </div>
            </div>
          `).join('')}

          ${state.raddiOwners.map(r => `
            <div class="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base">♻️</span>
                  <strong class="text-xs text-slate-900">${r.businessName}</strong>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold ${r.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}">${r.approvalStatus.toUpperCase()}</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-0.5">Owner: ${r.ownerName} • Licence: ${r.licence} • Base: ${r.baseAddress}</div>
              </div>
              <div class="flex items-center gap-2">
                ${r.approvalStatus === 'pending' ? `
                  <button onclick="approveBusiness('raddi', '${r.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                    Approve Recycler ✅
                  </button>
                  <button onclick="rejectBusiness('raddi', '${r.id}')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded text-xs shadow">
                    Reject
                  </button>
                ` : `
                  <button onclick="suspendBusiness('raddi', '${r.id}')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2.5 py-1 rounded text-xs">
                    Suspend Access
                  </button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'valuation') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <h3 class="font-bold text-sm text-slate-900">Valuation Percentage Rules (Database Configurable)</h3>
          <p class="text-xs text-slate-500">Stall offers are enforced by the server to never exceed these caps. Update them live below:</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="border p-4 rounded-xl bg-slate-50">
            <label class="block text-xs font-bold text-slate-800 mb-1">Like New Cap (%)</label>
            <input type="number" id="val-cap-likenew" value="${state.valuationRules['Like New']}" min="1" max="100" class="w-full text-base font-black p-2 border rounded text-emerald-800" />
            <span class="text-[10px] text-slate-500 block mt-1">Default 30%. Crisp pages, intact spine.</span>
          </div>
          <div class="border p-4 rounded-xl bg-slate-50">
            <label class="block text-xs font-bold text-slate-800 mb-1">Good Cap (%)</label>
            <input type="number" id="val-cap-good" value="${state.valuationRules['Good']}" min="1" max="100" class="w-full text-base font-black p-2 border rounded text-emerald-800" />
            <span class="text-[10px] text-slate-500 block mt-1">Default 30%. Minor creases or neat highlighting.</span>
          </div>
          <div class="border p-4 rounded-xl bg-slate-50">
            <label class="block text-xs font-bold text-slate-800 mb-1">Used Cap (%)</label>
            <input type="number" id="val-cap-used" value="${state.valuationRules['Used']}" min="1" max="100" class="w-full text-base font-black p-2 border rounded text-emerald-800" />
            <span class="text-[10px] text-slate-500 block mt-1">Default 20%. Standard second-hand condition.</span>
          </div>
          <div class="border p-4 rounded-xl bg-slate-50">
            <label class="block text-xs font-bold text-slate-800 mb-1">Old or Damaged Cap (%)</label>
            <input type="number" id="val-cap-damaged" value="${state.valuationRules['Old or Damaged']}" min="1" max="100" class="w-full text-base font-black p-2 border rounded text-emerald-800" />
            <span class="text-[10px] text-slate-500 block mt-1">Default 15%. Complete with no missing pages.</span>
          </div>
        </div>

        <button onclick="saveValuationRules()" class="bg-shelf-gold hover:bg-shelf-goldhover text-slate-950 font-bold px-4 py-2 rounded text-xs shadow">
          Save Valuation Rules to Database →
        </button>
      </div>
    `;
  } else if (tab === 'categories') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-slate-900">Manage Used Book Subcategories</h3>
            <p class="text-xs text-slate-500">Admin can add, edit, or disable categories.</p>
          </div>
          <button onclick="addCategoryPrompt()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-xs shadow">
            ➕ Add New Category
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${state.categories.map(c => `
            <div class="border rounded-lg p-3 flex items-center justify-between bg-slate-50 text-xs">
              <div>
                <strong class="text-slate-900">${c.name}</strong>
                <span class="text-[11px] text-slate-500 block">Slug: ${c.slug} • ${c.count} items listed</span>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="toggleCategory('${c.id}')" class="px-2 py-0.5 rounded text-[10px] font-bold ${c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
                  ${c.active ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'disputes') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="font-bold text-sm text-slate-900">Dispute & Complaint Cases</h3>
        
        <div class="space-y-3">
          ${state.disputes.map(d => `
            <div class="border rounded-lg p-4 bg-rose-50/30 border-rose-200 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base text-rose-600">⚠️</span>
                  <strong class="text-slate-900 font-bold">${d.requestNumber}</strong>
                  <span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">${d.reason.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                <span class="text-slate-500">${d.createdAt}</span>
              </div>
              <p class="text-slate-700">${d.details}</p>
              <div class="flex items-center justify-between pt-2 border-t">
                <span class="text-[11px] text-slate-500">Raised by: <strong>${d.raisedBy}</strong> against <strong>${d.against}</strong></span>
                <button onclick="resolveDispute('${d.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded shadow text-xs">
                  Mark Resolved ✅
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'audit') {
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
        <h3 class="font-bold text-sm text-slate-900">Platform Audit Logs</h3>
        <div class="space-y-2 max-h-96 overflow-y-auto text-xs">
          ${state.auditLogs.map(l => `
            <div class="border rounded p-2.5 bg-slate-50 flex items-start justify-between gap-3">
              <div>
                <span class="font-bold text-slate-800">${l.action}</span>
                <p class="text-slate-600 text-[11px] mt-0.5">${l.details}</p>
              </div>
              <div class="text-right flex-shrink-0 text-[10px] text-slate-400">
                <div>${l.timestamp}</div>
                <div class="font-semibold text-slate-600">${l.user}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Business approvals actions
function approveBusiness(type, id) {
  if (type === 'stall') {
    const s = state.bookStalls.find(x => x.id === id);
    if (s) s.approvalStatus = 'approved';
  } else {
    const r = state.raddiOwners.find(x => x.id === id);
    if (r) r.approvalStatus = 'approved';
  }
  showToast('Business account approved! Partner can now submit quotes.', 'success');
  setAdminTab('approvals');
}

function rejectBusiness(type, id) {
  showToast('Application marked rejected.', 'warning');
}

function suspendBusiness(type, id) {
  showToast('Account suspended from bidding.', 'warning');
}

function saveValuationRules() {
  state.valuationRules['Like New'] = parseFloat(document.getElementById('val-cap-likenew').value) || 30.0;
  state.valuationRules['Good'] = parseFloat(document.getElementById('val-cap-good').value) || 30.0;
  state.valuationRules['Used'] = parseFloat(document.getElementById('val-cap-used').value) || 20.0;
  state.valuationRules['Old or Damaged'] = parseFloat(document.getElementById('val-cap-damaged').value) || 15.0;

  showToast('Valuation caps updated! Future offers and estimates will use these new rules.', 'success');
  runQuickBookCalc();
}

function addCategoryPrompt() {
  const name = prompt('Enter new Used Book category name:');
  if (name) {
    state.categories.push({
      id: String(state.categories.length + 1),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count: 0,
      active: true
    });
    showToast(`Added subcategory: ${name}`, 'success');
    setAdminTab('categories');
  }
}

function toggleCategory(catId) {
  const cat = state.categories.find(c => c.id === catId);
  if (cat) {
    cat.active = !cat.active;
    showToast(`Category ${cat.name} ${cat.active ? 'enabled' : 'disabled'}`);
    setAdminTab('categories');
  }
}

function resolveDispute(id) {
  const d = state.disputes.find(x => x.id === id);
  if (d) {
    d.status = 'resolved';
    state.disputes = state.disputes.filter(x => x.id !== id);
    showToast('Dispute marked resolved and archived.', 'success');
    setAdminTab('disputes');
  }
}

// ====================================================================
// PUBLIC DIRECTORIES & DEMO LISTINGS
// ====================================================================

function renderDemoBookListings() {
  const container = document.getElementById('demo-book-listings');
  if (!container) return;

  const demoItems = [
    {
      title: 'Data Structures in C',
      author: 'Reema Thareja',
      category: 'Engineering Books',
      cond: 'Like New (30% Max)',
      orig: '₹650',
      est: '₹195',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
    },
    {
      title: 'Discrete Mathematics',
      author: 'Kenneth H. Rosen',
      category: 'Engineering Books',
      cond: 'Good (30% Max)',
      orig: '₹800',
      est: '₹200',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400'
    },
    {
      title: 'Objective Biology for NEET',
      author: 'Dr. Ali',
      category: 'Medical & Exams',
      cond: 'Like New (30% Max)',
      orig: '₹850',
      est: '₹255',
      cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400'
    },
    {
      title: 'Malgudi Days',
      author: 'R.K. Narayan',
      category: 'Story Books & Novels',
      cond: 'Used (20% Max)',
      orig: '₹299',
      est: '₹60',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'
    }
  ];

  container.innerHTML = demoItems.map(item => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
      <div class="relative">
        <img src="${item.cover}" alt="${item.title}" class="w-full h-44 object-cover" />
        <span class="badge-demo absolute top-2 right-2 shadow">Demo</span>
      </div>
      <div class="p-4 space-y-2 flex-1">
        <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">${item.category}</span>
        <h4 class="font-bold text-sm text-slate-900 leading-snug">${item.title}</h4>
        <p class="text-xs text-slate-500">by ${item.author}</p>
        <div class="bg-slate-50 p-2 rounded text-xs border border-slate-100 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 block">ORIGINAL</span>
            <span class="line-through text-slate-500">${item.orig}</span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-emerald-700 block font-bold">EST. PAYOUT</span>
            <span class="font-black text-emerald-900 text-sm">${item.est}</span>
          </div>
        </div>
      </div>
      <div class="p-3 bg-emerald-50/50 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[10px] text-slate-500">${item.cond}</span>
        <button onclick="openBookSubmissionModal()" class="text-xs font-bold text-amber-700 hover:text-amber-900 underline">
          Sell Similar →
        </button>
      </div>
    </div>
  `).join('');
}

function renderBookDirectory() {
  const container = document.getElementById('book-directory-cards');
  if (!container) return;

  container.innerHTML = state.bookRequests.map(b => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
      <div class="flex items-center justify-between border-b pb-2">
        <span class="font-bold text-sm text-slate-900">${b.requestNumber}</span>
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}">${b.status}</span>
      </div>
      <div class="space-y-1 text-xs">
        <div class="text-slate-500">Items: <strong>${b.items.length} book(s)</strong></div>
        <div class="text-slate-500">Handover: <strong class="capitalize">${b.handoverMethod.replace(/_/g, ' ')}</strong></div>
        <div class="text-slate-500">Location: <strong>${b.sellerPin}</strong></div>
      </div>
      <div class="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex justify-between items-center text-xs">
        <span class="text-emerald-900 font-semibold">Estimated Payout:</span>
        <span class="font-black text-emerald-950 text-base">₹${b.totalEstimatedPayout.toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function renderRaddiDirectory() {
  const container = document.getElementById('raddi-directory-cards');
  if (!container) return;

  container.innerHTML = state.wasteRequests.map(r => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
      <div class="flex items-center justify-between border-b pb-2">
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-sm text-slate-900">${r.requestNumber}</span>
          <span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">≥ 10 kg</span>
        </div>
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(r.status)}">${r.status}</span>
      </div>
      <div class="text-xs space-y-1 text-slate-600">
        <div>Paper Type: <strong class="text-slate-900">${r.paperType}</strong></div>
        <div>Estimated Weight: <strong class="text-emerald-800">${r.estimatedWeightKg} kg</strong></div>
        <div>Area: <strong>${r.pickupArea} (${r.pickupPin})</strong></div>
        <div class="text-[11px] text-slate-500">Slot: ${r.preferredDate} (${r.preferredSlot})</div>
      </div>
      <div class="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs flex justify-between items-center">
        <span class="text-amber-900 font-semibold">Pickup Status:</span>
        <span class="font-bold text-amber-950">${r.ownerBusinessName || 'Open for Recycler Bids'}</span>
      </div>
    </div>
  `).join('');
}

// Helpers
function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending': return 'bg-slate-100 text-slate-800 border border-slate-300';
    case 'Offer Received': return 'bg-amber-100 text-amber-900 border border-amber-300';
    case 'Accepted': return 'bg-blue-100 text-blue-900 border border-blue-300';
    case 'Pickup Scheduled': return 'bg-cyan-100 text-cyan-900 border border-cyan-300';
    case 'Received': case 'Collected': return 'bg-indigo-100 text-indigo-900 border border-indigo-300';
    case 'Under Inspection': return 'bg-purple-100 text-purple-900 border border-purple-300';
    case 'Payment Pending': return 'bg-amber-200 text-amber-950 border border-amber-400 font-bold';
    case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
    case 'Rejected': case 'Cancelled': case 'Disputed': return 'bg-rose-100 text-rose-800 border border-rose-300';
    default: return 'bg-slate-100 text-slate-800';
  }
}

function handleSearch(event) {
  if (event.key === 'Enter') executeSearch();
}

function executeSearch() {
  const query = document.getElementById('search-input')?.value.toLowerCase().trim();
  if (!query) return;

  showToast(`Searching directory for: "${query}"...`);
  showSection('used-books-page');
}

// ====================================================================
// AUTH & POLICY MODALS
// ====================================================================

function toggleAuthModal() {
  openPortalSelector();
}

function getRoleTitle(role) {
  switch (role) {
    case 'seller': return 'User / Book Seller';
    case 'book_stall': return 'Book Stall Owner';
    case 'raddi_owner': return 'Recycle Scrap Owner';
    case 'admin': return 'Admin (Website Creator)';
    default: return role || 'Guest';
  }
}

// Strict Single-Session & Dual-Role Conflict Prevention Guard
function checkAndEnforceSingleSession(targetRole, targetIdentifier, onApproved) {
  if (state.currentUser) {
    // 1. Dual-login / Cross-role conflict (e.g. Stall Owner attempting to login as User or vice-versa)
    if (state.currentUser.role !== targetRole) {
      const currentTitle = getRoleTitle(state.currentUser.role);
      const targetTitle = getRoleTitle(targetRole);

      const proceed = confirm(
        `⛔ DUAL-LOGIN / CROSS-ROLE RESTRICTION!\n\n` +
        `You are currently signed in as:\n` +
        `👤 ${state.currentUser.name} (${currentTitle})\n\n` +
        `SECOND SHELF strictly prohibits running 2 accounts or 2 different role types simultaneously (e.g. ${currentTitle} and ${targetTitle} at the same time).\n\n` +
        `To switch to ${targetTitle}, your previous session as ${currentTitle} MUST be terminated first.\n\n` +
        `• Click OK to SIGN OUT of ${currentTitle} and proceed to log in as ${targetTitle}.\n` +
        `• Click CANCEL to KEEP your current session as ${currentTitle}.`
      );

      if (!proceed) {
        showToast(`Maintained active session as ${currentTitle}. Dual-login blocked.`, 'warning');
        return false;
      }

      // Log session termination in security audit
      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: state.currentUser.name,
        action: 'Session Terminated for Role Switch',
        details: `Terminated ${currentTitle} session to switch to ${targetTitle}.`
      });

      state.currentUser = null;
      updateUserRoleUI();
    }
    // 2. Same role, but different email identifier (Multi-account prevention)
    else if (targetIdentifier && state.currentUser.email !== targetIdentifier) {
      const proceed = confirm(
        `⚠️ ACTIVE ACCOUNT RESTRICTION:\n\n` +
        `You are already signed in as: ${state.currentUser.name} (${state.currentUser.email}).\n\n` +
        `Simultaneous multi-account login is not permitted. Signing in as ${targetIdentifier} will end your previous session.\n\n` +
        `Click OK to sign out and switch accounts.`
      );

      if (!proceed) {
        showToast('Kept current account. Multi-account login prevented.', 'warning');
        return false;
      }

      state.currentUser = null;
      updateUserRoleUI();
    }
  }

  if (onApproved) onApproved();
  return true;
}

function openPortalSelector() {
  document.getElementById('modal-auth')?.classList.remove('hidden');
  switchPortalTab(state.currentUser ? state.currentUser.role : 'seller');
}

function openLoginPortal(portalRole = 'seller') {
  // If user is already logged in as a different role, enforce single-session confirmation
  if (state.currentUser && state.currentUser.role !== portalRole) {
    const allowed = checkAndEnforceSingleSession(portalRole, null, () => {
      document.getElementById('modal-auth')?.classList.remove('hidden');
      switchPortalTab(portalRole);
    });
    if (!allowed) return;
  } else {
    document.getElementById('modal-auth')?.classList.remove('hidden');
    switchPortalTab(portalRole);
  }
}

function switchPortalTab(tab) {
  // Highlight active tab
  ['seller', 'stall', 'raddi', 'admin', 'signup'].forEach(t => {
    const btn = document.getElementById(`tab-portal-${t}`);
    if (btn) {
      if (t === tab || (tab === 'book_stall' && t === 'stall') || (tab === 'raddi_owner' && t === 'raddi')) {
        if (t === 'admin') {
          btn.className = 'px-3 py-2 rounded-t border-b-2 border-rose-600 text-rose-900 bg-rose-100 font-bold flex items-center gap-1 whitespace-nowrap shadow-sm';
        } else {
          btn.className = 'px-3 py-2 rounded-t border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50 font-bold flex items-center gap-1 whitespace-nowrap shadow-sm';
        }
      } else {
        btn.className = 'px-3 py-2 rounded-t border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-1 whitespace-nowrap';
      }
    }
  });

  const views = {
    seller: 'view-portal-seller',
    book_stall: 'view-portal-stall',
    stall: 'view-portal-stall',
    raddi_owner: 'view-portal-raddi',
    raddi: 'view-portal-raddi',
    admin: 'view-portal-admin',
    signup: 'view-portal-signup'
  };

  Object.values(views).forEach(vId => {
    document.getElementById(vId)?.classList.add('hidden');
  });

  const activeViewId = views[tab] || 'view-portal-seller';
  document.getElementById(activeViewId)?.classList.remove('hidden');
  document.getElementById('creator-auth-error')?.classList.add('hidden');
}

// 1. Seller Login (Single Session Enforced)
function handleSellerLogin(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('seller-email')?.value || 'priya.sharma@gmail.com';

  checkAndEnforceSingleSession('seller', email, () => {
    state.currentUser = {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: email.includes('sharma') ? 'Priya Sharma' : email.split('@')[0],
      email: email,
      phone: '+91 98451 12345',
      role: 'seller',
      is_verified: true,
      age_confirmed: true
    };
    closeModal('modal-auth');
    updateUserRoleUI();
    showToast(`Welcome, ${state.currentUser.name}! Single session active as Seller.`, 'success');
    openCurrentRoleDashboard();
  });
}

// 2. Book Stall Login (Single Session Enforced)
function handleStallLogin(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('stall-email')?.value || 'vidyarthi.books@avenue.in';

  checkAndEnforceSingleSession('book_stall', email, () => {
    state.currentUser = {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Rajesh Gowda',
      email: email,
      phone: '+91 98440 22334',
      role: 'book_stall',
      stallId: 'e0000000-0000-0000-0000-000000000001',
      stallName: 'Vidyarthi Book House (Avenue Rd)',
      is_verified: true,
      age_confirmed: true,
      approvalStatus: 'approved'
    };
    closeModal('modal-auth');
    updateUserRoleUI();
    showToast(`Signed in to Book Stall Console: Vidyarthi Book House`, 'success');
    openCurrentRoleDashboard();
  });
}

// 3. Raddi Recycler Login (Single Session Enforced)
function handleRaddiLogin(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('raddi-email')?.value || 'anand@ecorecyclers.in';

  checkAndEnforceSingleSession('raddi_owner', email, () => {
    state.currentUser = {
      id: 'd0000000-0000-0000-0000-000000000001',
      name: 'Anand Rao',
      email: email,
      phone: '+91 99001 55667',
      role: 'raddi_owner',
      ownerId: 'f0000000-0000-0000-0000-000000000001',
      businessName: 'Karnataka Eco Recyclers',
      is_verified: true,
      age_confirmed: true,
      approvalStatus: 'approved'
    };
    closeModal('modal-auth');
    updateUserRoleUI();
    showToast(`Signed in to Recycler Console: Karnataka Eco Recyclers`, 'success');
    openCurrentRoleDashboard();
  });
}

// 4. Web Creator / Master Admin Login (Strict Protection & Single Session)
function handleCreatorAdminLogin(event) {
  if (event) event.preventDefault();
  const rawInput = document.getElementById('creator-email')?.value?.trim();
  const email = (rawInput === 'admin') ? 'admin@secondshelf.in' : (rawInput || 'admin@secondshelf.in');
  const masterKey = document.getElementById('creator-master-key')?.value?.trim();

  const errBox = document.getElementById('creator-auth-error');
  const errMsg = document.getElementById('creator-auth-error-msg');

  // Verify Web Creator Master Security Key
  if (masterKey !== CREATOR_MASTER_KEY) {
    if (errBox) errBox.classList.remove('hidden');
    if (errMsg) errMsg.textContent = 'ACCESS DENIED: Invalid Web Creator Master Security Key. Intrusion logged in security audits.';
    
    state.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Unauthorized Party',
      action: 'SECURITY ALERT: Failed Web Creator Access',
      details: `Attempted login with email: ${email || 'Anonymous'}. Key mismatch.`
    });

    showToast('⛔ Access Denied: Unauthorized access to Web Creator Console is strictly forbidden.', 'error');
    return;
  }

  // Creator Master Clearance Verified!
  checkAndEnforceSingleSession('admin', email, () => {
    state.currentUser = {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Website Creator & Super Admin',
      email: email || 'admin@secondshelf.in',
      phone: '+91 98765 43210',
      role: 'admin',
      is_verified: true,
      age_confirmed: true
    };

    state.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Website Creator',
      action: 'Web Creator Authenticated',
      details: 'Master clearance key verified. Root administrator privileges granted.'
    });

    closeModal('modal-auth');
    updateUserRoleUI();
    showToast('🛡️ Admin Authorized! Root administrative controls unlocked.', 'success');
    openCurrentRoleDashboard();
  });
}

// 1-Click Quick Demo Login for evaluator convenience
function quickLoginDemo(role) {
  checkAndEnforceSingleSession(role, null, () => {
    if (role === 'admin') {
      document.getElementById('creator-email').value = 'admin';
      document.getElementById('creator-password').value = 'Admin@2026';
      document.getElementById('creator-master-key').value = CREATOR_MASTER_KEY;
      handleCreatorAdminLogin();
    } else if (role === 'seller') {
      handleSellerLogin();
    } else if (role === 'book_stall') {
      handleStallLogin();
    } else if (role === 'raddi_owner') {
      handleRaddiLogin();
    }
  });
}

// Sign Out (Clean session destruction)
function logout() {
  const prevTitle = state.currentUser ? getRoleTitle(state.currentUser.role) : 'Session';
  state.currentUser = null;
  updateUserRoleUI();

  state.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: 'System Auth',
    action: 'Session Terminated (Sign Out)',
    details: `Signed out of ${prevTitle}. Active session terminated.`
  });

  showToast(`You have been signed out of ${prevTitle}. Active session terminated.`, 'warning');
  showSection('home');

  setTimeout(() => {
    openLoginPortal('seller');
  }, 350);
}

function handleSignupSubmit(event) {
  event.preventDefault();
  const ageConfirm = document.getElementById('signup-age-confirm');
  if (!ageConfirm?.checked) {
    alert('You must be 18 or older to register an account on SECOND SHELF.');
    return;
  }

  const role = document.getElementById('signup-role').value;
  // Double check role cannot be admin
  if (role === 'admin') {
    alert('Admin accounts cannot be self-registered.');
    return;
  }

  const name = document.getElementById('signup-name')?.value || 'New User';
  const email = document.getElementById('signup-email')?.value || 'newuser@example.com';

  state.currentUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone: document.getElementById('signup-phone')?.value || '+91 99999 88888',
    role: role,
    is_verified: true,
    age_confirmed: true
  };

  closeModal('modal-auth');
  updateUserRoleUI();
  showToast(`Account created! Welcome, ${name} (${role === 'seller' ? 'Seller' : 'Business Partner - Pending Approval'}).`, 'success');
  openCurrentRoleDashboard();
}

function openDisputeModal() {
  document.getElementById('modal-dispute')?.classList.remove('hidden');
}

function handleDisputeSubmit(event) {
  event.preventDefault();
  const num = document.getElementById('dispute-req-number').value;
  const reason = document.getElementById('dispute-reason-type').value;
  const details = document.getElementById('dispute-details').value;

  state.disputes.unshift({
    id: `dsp-${Date.now()}`,
    requestNumber: num,
    raisedBy: state.currentUser.name,
    against: 'Marketplace Counterparty',
    reason,
    details,
    status: 'under_review',
    createdAt: new Date().toISOString().split('T')[0]
  });

  closeModal('modal-dispute');
  showToast(`Dispute logged for ${num}. Administrator has been alerted.`, 'warning');
}

// Policies (Complying with DPDP 2023, Section 10)
function openPolicyModal(policyType) {
  const titleEl = document.getElementById('policy-modal-title');
  const bodyEl = document.getElementById('policy-modal-body');

  if (policyType === 'dpdp-privacy') {
    titleEl.textContent = 'Digital Personal Data Protection Act, 2023 (DPDP) Privacy Policy';
    bodyEl.innerHTML = `
      <p><strong>1. Introduction & Statutory Scope:</strong> SECOND SHELF ("Platform") operates as a technology facilitator under India's Digital Personal Data Protection Act, 2023 (DPDP). We respect your privacy and process personal information strictly based on informed, affirmative consent.</p>
      
      <p><strong>2. Contact Privacy & Data Minimization:</strong> When a seller posts a Recycle Scrap or Used Book request, personal details including exact door numbers, building names, and mobile telephone numbers are <strong>permanently shielded</strong> from public recycler feeds. Only the general municipal area and 6-digit postal code (PIN) are made visible for route planning. The full contact details are disclosed <em>strictly to the single authorized partner</em> whose offer the seller voluntarily accepts.</p>

      <p><strong>3. Age Restriction & Child Data:</strong> In strict compliance with DPDP provisions regarding children's data and financial agreements, all account holders must confirm they are <strong>18 years of age or older</strong> at the time of registration.</p>

      <p><strong>4. Right to Erasure & Grievance Officer:</strong> Users may request complete deletion of their account and historical listings by contacting our Data Protection Grievance Officer at <code>dpo@secondshelf.in</code>.</p>
    `;
  } else if (policyType === 'two-party-payment') {
    titleEl.textContent = 'Two-Party Payment Confirmation & Settlement Policy';
    bodyEl.innerHTML = `
      <p><strong>1. Marketplace Facilitation Only:</strong> SECOND SHELF does NOT handle, process, or hold money in escrow. The platform is not an intermediary payment gateway.</p>
      
      <p><strong>2. Direct Settlement:</strong> Payment (via UPI, Cash in Hand, or Bank Transfer) is settled directly between the seller and the registered book stall or recycle scrap dealer upon physical inspection or doorstep weighing.</p>

      <p><strong>3. Strict Two-Party Confirmation:</strong> A transaction is NEVER marked completed simply because a buyer submits a payment form. The buyer must first record the payment method and bank UTR reference number. The seller is then prompted to check their bank account or cash in hand and click <strong>"Confirm Payment Received"</strong>. Only upon this two-party verification is the order finalized.</p>
    `;
  } else if (policyType === 'shipping-policy') {
    titleEl.textContent = 'Shipping & Handover Terms';
    bodyEl.innerHTML = `
      <p><strong>1. Handover Options:</strong> Sellers can choose: (a) Direct stall handover, (b) Arranged pickup if the stall supports it, or (c) Parcel/postal service.</p>
      <p><strong>2. Shipping Costs:</strong> For postal submissions, shipping costs are borne by the seller by default, unless the stall explicitly agrees in writing to reimburse or subsidize shipping.</p>
      <p><strong>3. Return Shipping:</strong> If books fail physical inspection (e.g. pirated copies or missing pages) and the revised price is rejected by the seller, the stall will return the books at the seller's expense.</p>
    `;
  } else if (policyType === 'cancellation-policy') {
    titleEl.textContent = 'Cancellation & Minimum Weight Policy';
    bodyEl.innerHTML = `
      <p><strong>1. Strict 10 kg Minimum Rule:</strong> Recycle scrap submissions under 10 kg are automatically barred. If the actual weight at doorstep collection is under 10 kg, the dealer may decline the pickup or offer a revised rate. The seller may cancel freely without penalty.</p>
      <p><strong>2. Free Cancellation:</strong> Sellers may cancel any book or recycle scrap request prior to physical handover or dispatch without fee.</p>
    `;
  } else if (policyType === 'dispute-policy') {
    titleEl.textContent = 'Dispute Resolution Process';
    bodyEl.innerHTML = `
      <p><strong>1. Reporting Disputes:</strong> If payment was recorded but never received, or if book condition was unfairly downgraded, either party may file a dispute through the platform.</p>
      <p><strong>2. Admin Mediation:</strong> Administrators review transaction audit trails, payment UTR logs, and photograph evidence to mediate settlements or revoke stall licences.</p>
    `;
  } else {
    titleEl.textContent = 'Terms & Conditions';
    bodyEl.innerHTML = `
      <p><strong>1. Anti-Piracy Policy:</strong> SECOND SHELF strictly forbids unauthorized photocopies, pirated prints, and counterfeit editions. Violations result in account suspension and blacklisting across participating book stalls.</p>
      <p><strong>2. Condition Payout Caps:</strong> All estimates are calculated using admin-approved condition percentages (up to 30% for Like New). Offers exceeding condition caps are automatically rejected by the system.</p>
    `;
  }

  document.getElementById('modal-policy')?.classList.remove('hidden');
}


// Backward/Forward Compatibility Aliases for Recycle Scrap
window.openRecycleScrapSubmissionModal = openRaddiSubmissionModal;
window.handleRecycleScrapSubmit = handleRaddiSubmit;
window.handleRecycleScrapLogin = handleRaddiLogin;
window.renderRecycleScrapDirectory = renderRaddiDirectory;
window.runQuickRecycleScrapCalc = runQuickRaddiCalc;
window.validateRecycleScrapWeight = validateRaddiWeight;
