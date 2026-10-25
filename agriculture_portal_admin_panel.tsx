import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithCustomToken, 
  signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Sun, Moon, Sprout, TrendingUp, Newspaper, Calculator, ShieldCheck, 
  LogIn, LogOut, Plus, Trash2, Edit3, Search, Menu, X, Check, Eye, Leaf, ChevronRight
} from 'lucide-react';

// --- Firebase Initialization ---
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'agri-myanmar-app';

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {
        apiKey: "demo-api-key",
        authDomain: "demo-app.firebaseapp.com",
        projectId: "demo-app",
        storageBucket: "demo-app.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:demo"
      };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization skipped or running with mock fallback:", e);
}

// Initial Mock Data for Fallback or First-time Load
const initialCropGuides = [
  {
    id: '1',
    title: 'စပါး အထွက်တိုး စိုက်ပျိုးနည်း',
    category: 'စပါး',
    season: 'မိုး/နွေ',
    fertilizer: 'ယူရီးယား ၊ တီစူပါ',
    description: 'စပါးအထွက်နှုန်း ကောင်းမွန်စေရန် မြေပြင်ပြင်ဆင်ခြင်းမှအစ ရိတ်သိမ်းချိန်အထိ စနစ်တကျ စိုက်ပျိုးနည်းများ။',
    image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '2',
    title: 'ခရမ်းချဉ်သီး စိုက်ပျိုးပြုစုနည်း',
    category: 'ဟင်းသီးဟင်းရွက်',
    season: 'ဆောင်းရာသီ',
    fertilizer: 'သဘာဝမြေဩဇာ ၊ ပိုတက်ရှ်',
    description: 'ပိုးမွှားကင်းစင်ပြီး သီးထွက်ကောင်းမွန်သော ခရမ်းချဉ်စိုက်ပျိုးစနစ်နှင့် ရောဂါကာကွယ်နည်းများ။',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '3',
    title: 'ဖရဲသီး တိုးချဲ့စိုက်ပျိုးခြင်း',
    category: 'သစ်သီးဝလံ',
    season: 'နွေရာသီ',
    fertilizer: 'ကွန်ပေါင်း မြေဩဇာ',
    description: 'စျေးကွက်ဝင် ဖရဲသီးအရည်အသွေး ရရှိရေးအတွက် ရေသွင်းရေထုတ်နှင့် အသီးအဆုပွင့် ပြုစုနည်း။',
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=600'
  }
];

const initialMarketPrices = [
  { id: '1', name: 'ဧည့်မထ စပါး (တင်း ၁၀၀)', price: '၂,၄၀၀,၀၀၀ ကျပ်', change: '+၂.၅%', trend: 'up', location: 'ရန်ကုန်' },
  { id: '2', name: 'မတ်ပဲ (တစ်တန်)', price: '၃,၁၅၀,၀၀၀ ကျပ်', change: '-၁.၀%', trend: 'down', location: 'ရန်ကုန်' },
  { id: '3', name: 'ကြက်သွန်နီ (တစ်ပိဿာ)', price: '၃,၅၀၀ ကျပ်', change: '၀.၀%', trend: 'neutral', location: 'မန္တလေး' },
  { id: '4', name: 'အာလူး (တစ်ပိဿာ)', price: '၄,၂၀၀ ကျပ်', change: '+၄.၁%', trend: 'up', location: 'အောင်ပန်း' },
];

const initialNews = [
  {
    id: '1',
    title: 'ယခုနှစ် မိုးစပါးစိုက်ပျိုးချိန် ရာသီဥတု ခန့်မှန်းချက်နှင့် အကြံပြုချက်',
    date: '၂၀၂၄၊ အောက်တိုဘာ ၂၀',
    summary: 'မိုးလေဝသဌာန၏ ခန့်မှန်းချက်အရ ယခုနှစ် မိုးရွာသွန်းမှု အခြေအနေနှင့် တောင်သူများ ပြင်ဆင်ရန် အချက်များ။',
    category: 'သတင်း'
  },
  {
    id: '2',
    title: 'သဘာဝမြေဩဇာ အလွယ်တကူ ပြုလုပ်သုံးစွဲနည်း',
    date: '၂၀၂၄၊ အောက်တိုဘာ ၁၈',
    summary: 'စိုက်ပျိုးစရိတ် လျှော့ချနိုင်ရန် အိမ်တွင်းစွန့်ပစ်ပစ္စည်းများနှင့် သစ်ရွက်ခြောက်များ အသုံးပြု၍ မြေဩဇာပြုလုပ်နည်း။',
    category: 'နည်းပညာ'
  }
];

export default function App() {
  // Theme & App State
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'guides', 'prices', 'news', 'calc', 'admin'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User & Auth State
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Dynamic Data States
  const [cropGuides, setCropGuides] = useState(initialCropGuides);
  const [marketPrices, setMarketPrices] = useState(initialMarketPrices);
  const [newsList, setNewsList] = useState(initialNews);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('အားလုံး');

  // Fertilizer Calculator State
  const [calcAcre, setCalcAcre] = useState(1);
  const [calcCrop, setCalcCrop] = useState('paddy'); // paddy, tomato, corn

  // Admin Form States
  const [newGuide, setNewGuide] = useState({ title: '', category: 'စပါး', season: '', fertilizer: '', description: '', image: '' });
  const [newPrice, setNewPrice] = useState({ name: '', price: '', change: '+0.0%', trend: 'up', location: '' });
  const [newNews, setNewNews] = useState({ title: '', summary: '', category: 'သတင်း' });

  // 1. Firebase Auth Setup
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (e) {
          console.error("Custom token auth error:", e);
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firestore Realtime Sync (with Fallback to Initial Data)
  useEffect(() => {
    if (!db || !user) return;

    // Sync Crop Guides
    const guidesRef = collection(db, 'artifacts', appId, 'public', 'data', 'crop_guides');
    const unsubGuides = onSnapshot(guidesRef, (snapshot) => {
      if (!snapshot.empty) {
        const guides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCropGuides(guides);
      }
    }, (err) => console.log("Firestore guides error:", err));

    // Sync Market Prices
    const pricesRef = collection(db, 'artifacts', appId, 'public', 'data', 'market_prices');
    const unsubPrices = onSnapshot(pricesRef, (snapshot) => {
      if (!snapshot.empty) {
        const prices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMarketPrices(prices);
      }
    }, (err) => console.log("Firestore prices error:", err));

    // Sync News
    const newsRef = collection(db, 'artifacts', appId, 'public', 'data', 'agri_news');
    const unsubNews = onSnapshot(newsRef, (snapshot) => {
      if (!snapshot.empty) {
        const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNewsList(news);
      }
    }, (err) => console.log("Firestore news error:", err));

    return () => {
      unsubGuides();
      unsubPrices();
      unsubNews();
    };
  }, [user]);

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!auth) {
      // Demo Mode login bypass if Firebase is offline
      setUser({ email, uid: 'demo-admin-uid' });
      setIsLoginModalOpen(false);
      setActiveTab('admin');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoginModalOpen(false);
      setActiveTab('admin');
    } catch (err) {
      setAuthError('အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။');
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setActiveTab('home');
  };

  // Admin Data Actions
  const handleAddGuide = async (e) => {
    e.preventDefault();
    if (!newGuide.title) return;
    const item = { ...newGuide, id: Date.now().toString() };
    if (db && user) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'crop_guides'), item);
    } else {
      setCropGuides([item, ...cropGuides]);
    }
    setNewGuide({ title: '', category: 'စပါး', season: '', fertilizer: '', description: '', image: '' });
  };

  const handleDeleteGuide = async (id) => {
    if (db && user) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crop_guides', id));
    } else {
      setCropGuides(cropGuides.filter(g => g.id !== id));
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();
    if (!newPrice.name || !newPrice.price) return;
    const item = { ...newPrice, id: Date.now().toString() };
    if (db && user) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'market_prices'), item);
    } else {
      setMarketPrices([item, ...marketPrices]);
    }
    setNewPrice({ name: '', price: '', change: '+0.0%', trend: 'up', location: '' });
  };

  const handleDeletePrice = async (id) => {
    if (db && user) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'market_prices', id));
    } else {
      setMarketPrices(marketPrices.filter(p => p.id !== id));
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (!newNews.title) return;
    const item = { ...newNews, id: Date.now().toString(), date: new Date().toLocaleDateString('my-MM') };
    if (db && user) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'agri_news'), item);
    } else {
      setNewsList([item, ...newsList]);
    }
    setNewNews({ title: '', summary: '', category: 'သတင်း' });
  };

  const handleDeleteNews = async (id) => {
    if (db && user) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'agri_news', id));
    } else {
      setNewsList(newsList.filter(n => n.id !== id));
    }
  };

  // Filtered Crop Guides
  const filteredGuides = cropGuides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'အားလုံး' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-emerald-50/30 text-slate-800'}`}>
      
      {/* --- NAVBAR --- */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm transition-colors ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  စိုက်ပျိုးရေး ပေါ်တယ်
                </span>
                <span className="block text-xs text-emerald-600 dark:text-emerald-400 font-medium">Agri-Myanmar</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: 'home', label: 'ပင်မစာမျက်နှာ' },
                { id: 'guides', label: 'စိုက်ပျိုးနည်းများ' },
                { id: 'prices', label: 'စျေးနှုန်းများ' },
                { id: 'news', label: 'သတင်းနှင့် အသိပညာ' },
                { id: 'calc', label: 'တွက်ချက်စက်' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-emerald-100/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {user && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    activeTab === 'admin' 
                      ? 'bg-amber-600 text-white' 
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  အက်ဒမင် Panel
                </button>
              )}
            </div>

            {/* Actions: Theme Toggle & Admin Auth */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                title="Theme Toggle"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ထွက်ရန်</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>အက်ဒမင်ဝင်ရန်</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-200 bg-white text-slate-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-4 pt-2 pb-4 space-y-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            {[
              { id: 'home', label: 'ပင်မစာမျက်နှာ' },
              { id: 'guides', label: 'စိုက်ပျိုးနည်းများ' },
              { id: 'prices', label: 'စျေးနှုန်းများ' },
              { id: 'news', label: 'သတင်းနှင့် အသိပညာ' },
              { id: 'calc', label: 'တွက်ချက်စက်' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === tab.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-amber-600 dark:text-amber-400"
                >
                  အက်ဒမင် Panel
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600"
                >
                  ထွက်ရန်
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsLoginModalOpen(true); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-emerald-600"
              >
                အက်ဒမင်ဝင်ရန်
              </button>
            )}
          </div>
        )}
      </nav>

      {/* --- HERO SECTION / HOME PAGE --- */}
      {activeTab === 'home' && (
        <main className="space-y-12 pb-12">
          {/* Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white py-20 px-6 sm:px-12 rounded-b-3xl shadow-lg">
            <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <Leaf className="w-3.5 h-3.5" /> ခေတ်မီ စိုက်ပျိုးရေး နည်းပညာများ
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                တောင်သူလယ်သမားများအတွက် စိုက်ပျိုးရေး လမ်းညွှန်နှင့် သတင်းအချက်အလက် ပေါ်တယ်
              </h1>
              <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                သီးနှံစိုက်ပျိုးနည်းများ၊ နေ့စဉ် သီးနှံပေါက်စျေးများ၊ မြေဩဇာတွက်ချက်စက်နှင့် စိုက်ပျိုးရေးဆိုင်ရာ သတင်းအချက်အလက်များကို တစ်နေရာတည်းတွင် လေ့လာနိုင်ပါသည်။
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('guides')}
                  className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  စိုက်ပျိုးနည်းများ ကြည့်မည် <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('prices')}
                  className="px-6 py-3 bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-semibold rounded-xl border border-emerald-500/30 backdrop-blur-sm transition-all"
                >
                  စျေးနှုန်းများ စစ်ဆေးမည်
                </button>
              </div>
            </div>
            {/* Background Decorative Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>

          {/* Quick Info Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-emerald-100 shadow-sm'}`}>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-4">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">စိုက်ပျိုးနည်းစနစ်များ</h3>
                <p className="text-sm opacity-80 mb-4">စပါး၊ ဟင်းသီးဟင်းရွက် နှင့် သစ်သီးဝလံ စိုက်ပျိုးနည်း လမ်းညွှန်များ။</p>
                <button onClick={() => setActiveTab('guides')} className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  ဆက်လက်ဖတ်ရှုရန် <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-emerald-100 shadow-sm'}`}>
                <div className="p-3 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl w-fit mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">နေ့စဉ် သီးနှံစျေးနှုန်းများ</h3>
                <p className="text-sm opacity-80 mb-4">ပင်မကုန်စည်ဒိုင်များမှ ရရှိသော နောက်ဆုံးပေါ် ပေါက်စျေးများ။</p>
                <button onClick={() => setActiveTab('prices')} className="text-sm font-semibold text-teal-600 hover:underline flex items-center gap-1">
                  စျေးနှုန်းများ ကြည့်ရန် <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-emerald-100 shadow-sm'}`}>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-4">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">မြေဩဇာ တွက်ချက်စက်</h3>
                <p className="text-sm opacity-80 mb-4">စိုက်ပျိုးမြေ ဧရိယာအလိုက် လိုအပ်သော မြေဩဇာပမာဏ တွက်ချက်ပါ။</p>
                <button onClick={() => setActiveTab('calc')} className="text-sm font-semibold text-amber-600 hover:underline flex items-center gap-1">
                  တွက်ချက်ရန် <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Crops Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold">လူကြိုက်များသော စိုက်ပျိုးနည်းများ</h2>
                <p className="text-sm opacity-75">တောင်သူများ အသုံးများသော စိုက်ပျိုးရေး လမ်းညွှန်များ</p>
              </div>
              <button onClick={() => setActiveTab('guides')} className="text-sm font-medium text-emerald-600 hover:underline">
                အားလုံးကြည့်မည်
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cropGuides.slice(0, 3).map(guide => (
                <div key={guide.id} className={`rounded-2xl overflow-hidden border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <img src={guide.image} alt={guide.title} className="w-full h-48 object-cover" />
                  <div className="p-5 space-y-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {guide.category}
                    </span>
                    <h3 className="font-bold text-lg">{guide.title}</h3>
                    <p className="text-sm opacity-80 line-clamp-2">{guide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* --- CROP GUIDES PAGE --- */}
      {activeTab === 'guides' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">သီးနှံစိုက်ပျိုးနည်း လမ်းညွှန်များ</h1>
            <p className="text-sm opacity-75">စိုက်ပျိုးရေးဆိုင်ရာ နည်းလမ်းများနှင့် ပြုစုထိန်းသိမ်းနည်းများ</p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="သီးနှံအမည်ဖြင့် ရှာဖွေပါ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {['အားလုံး', 'စပါး', 'ဟင်းသီးဟင်းရွက်', 'သစ်သီးဝလံ'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Guides Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredGuides.map(guide => (
              <div key={guide.id} className={`rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <img src={guide.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600'} alt={guide.title} className="w-full h-48 object-cover" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {guide.category}
                    </span>
                    <span className="text-xs opacity-75">ရာသီ - {guide.season}</span>
                  </div>
                  <h3 className="font-bold text-xl">{guide.title}</h3>
                  <p className="text-sm opacity-80 leading-relaxed">{guide.description}</p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs opacity-75">
                    <strong>အဓိက မြေဩဇာ:</strong> {guide.fertilizer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* --- MARKET PRICES PAGE --- */}
      {activeTab === 'prices' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">နေ့စဉ် သီးနှံစျေးနှုန်းများ</h1>
            <p className="text-sm opacity-75">စျေးကွက်အတွင်း ပေါက်စျေးများနှင့် စျေးနှုန်း အပြောင်းအလဲများ</p>
          </div>

          <div className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`border-b text-xs uppercase font-semibold ${darkMode ? 'bg-slate-700/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                  <tr>
                    <th className="p-4">သီးနှံ/ကုန်ပစ္စည်း အမည်</th>
                    <th className="p-4">ဒေသ/ကုန်စည်ဒိုင်</th>
                    <th className="p-4">ပေါက်စျေး</th>
                    <th className="p-4">ပြောင်းလဲမှု</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {marketPrices.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-semibold">{item.name}</td>
                      <td className="p-4 opacity-80">{item.location}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{item.price}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.trend === 'up' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' 
                            : item.trend === 'down' 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' 
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {item.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* --- NEWS & TIPS PAGE --- */}
      {activeTab === 'news' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">စိုက်ပျိုးရေး သတင်းနှင့် နည်းပညာ</h1>
            <p className="text-sm opacity-75">နောက်ဆုံးပေါ် သတင်းများနှင့် တောင်သူများအတွက် အသုံးဝင်သော ဗဟုသုတများ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsList.map(item => (
              <div key={item.id} className={`p-6 rounded-2xl border space-y-3 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-center text-xs opacity-75">
                  <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 font-semibold">{item.category}</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="font-bold text-xl">{item.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* --- FERTILIZER CALCULATOR PAGE --- */}
      {activeTab === 'calc' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">မြေဩဇာနှင့် မျိုးစေ့ တွက်ချက်စက်</h1>
            <p className="text-sm opacity-75">စိုက်ပျိုးမည့် ဧရိယာအလိုက် လိုအပ်သော ပမာဏများကို အလွယ်တကူ တွက်ချက်ပါ</p>
          </div>

          <div className={`p-8 rounded-2xl border shadow-sm space-y-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-semibold mb-2">သီးနှံအမျိုးအစား ရွေးချယ်ပါ</label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="paddy">စပါး (Paddy)</option>
                  <option value="tomato">ခရမ်းချဉ် (Tomato)</option>
                  <option value="corn">ပြောင်းဖူး (Corn)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">စိုက်ပျိုးမည့် ဧရိယာ (ဧက)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={calcAcre}
                  onChange={(e) => setCalcAcre(parseFloat(e.target.value) || 0)}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

            </div>

            {/* Calculated Output Summary */}
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 space-y-4">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-lg">ခန့်မှန်း လိုအပ်ချက် ရလဒ်များ ({calcAcre} ဧက အတွက်)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  <span className="block text-xs opacity-75">ယူရီးယား (Urea)</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {(calcAcre * (calcCrop === 'paddy' ? 50 : calcCrop === 'corn' ? 60 : 40)).toFixed(0)} ကီလိုဂရမ်
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  <span className="block text-xs opacity-75">တီစူပါ (T-Super)</span>
                  <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
                    {(calcAcre * (calcCrop === 'paddy' ? 25 : calcCrop === 'corn' ? 30 : 35)).toFixed(0)} ကီလိုဂရမ်
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  <span className="block text-xs opacity-75">မျိုးစေ့ လိုအပ်ချက်</span>
                  <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                    {(calcAcre * (calcCrop === 'paddy' ? 2 : calcCrop === 'corn' ? 1.5 : 0.5)).toFixed(1)} တင်း / အိတ်
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* --- PROTECTED ADMIN PANEL --- */}
      {activeTab === 'admin' && user && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-700">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-emerald-600" /> အက်ဒမင် ထိန်းချုပ်ခန်း
              </h1>
              <p className="text-sm opacity-75">အကောင့်: {user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              ထွက်ရန်
            </button>
          </div>

          {/* Admin Management Tabs / Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Manage Crop Guides */}
            <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> စိုက်ပျိုးနည်း အသစ်ထည့်ရန်
              </h2>
              <form onSubmit={handleAddGuide} className="space-y-3">
                <input
                  type="text"
                  placeholder="ခေါင်းစဉ်"
                  value={newGuide.title}
                  onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newGuide.category}
                    onChange={(e) => setNewGuide({ ...newGuide, category: e.target.value })}
                    className={`p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="စပါး">စပါး</option>
                    <option value="ဟင်းသီးဟင်းရွက်">ဟင်းသီးဟင်းရွက်</option>
                    <option value="သစ်သီးဝလံ">သစ်သီးဝလံ</option>
                  </select>
                  <input
                    type="text"
                    placeholder="စိုက်ပျိုးရာသီ"
                    value={newGuide.season}
                    onChange={(e) => setNewGuide({ ...newGuide, season: e.target.value })}
                    className={`p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="ဓာတ်မြေဩဇာ လမ်းညွှန်"
                  value={newGuide.fertilizer}
                  onChange={(e) => setNewGuide({ ...newGuide, fertilizer: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                />
                <textarea
                  placeholder="အသေးစိတ် ဖော်ပြချက်"
                  rows="3"
                  value={newGuide.description}
                  onChange={(e) => setNewGuide({ ...newGuide, description: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                />
                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all">
                  ထည့်သွင်းမည်
                </button>
              </form>

              {/* Existing Guides List */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-sm font-bold opacity-75">လက်ရှိ စိုက်ပျိုးနည်းများ</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {cropGuides.map(g => (
                    <div key={g.id} className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-700 text-xs">
                      <span className="font-semibold truncate max-w-[200px]">{g.title}</span>
                      <button onClick={() => handleDeleteGuide(g.id)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manage Market Prices */}
            <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" /> စျေးနှုန်း အသစ်ပြင်ဆင်ရန်
              </h2>
              <form onSubmit={handleAddPrice} className="space-y-3">
                <input
                  type="text"
                  placeholder="သီးနှံအမည် (ဥပမာ - စပါး)"
                  value={newPrice.name}
                  onChange={(e) => setNewPrice({ ...newPrice, name: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="စျေးနှုန်း"
                    value={newPrice.price}
                    onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                    className={`p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                    required
                  />
                  <input
                    type="text"
                    placeholder="ကုန်စည်ဒိုင်/မြို့"
                    value={newPrice.location}
                    onChange={(e) => setNewPrice({ ...newPrice, location: e.target.value })}
                    className={`p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all">
                  စျေးနှုန်း အသစ်တင်မည်
                </button>
              </form>

              {/* Existing Prices List */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-sm font-bold opacity-75">လက်ရှိ စျေးနှုန်းများ</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {marketPrices.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-700 text-xs">
                      <span className="font-semibold">{p.name} - {p.price}</span>
                      <button onClick={() => handleDeletePrice(p.id)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* --- FIREBASE AUTH MODAL --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl space-y-6 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" /> အက်ဒမင် ဝင်ရောက်ရန်
              </h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="opacity-50 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-100 text-rose-700 text-sm font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">အီးမေးလ် (Email)</label>
                <input
                  type="email"
                  placeholder="admin@agri.mm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">လျှို့ဝှက်နံပါတ် (Password)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
              >
                ဝင်ရောက်မည်
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className={`border-t py-8 text-center text-xs opacity-75 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© ၂၀၂၆ စိုက်ပျိုးရေး ပေါ်တယ် (Agriculture Portal Myanmar) - ခေတ်မီ တောင်သူများအတွက်</p>
        </div>
      </footer>

    </div>
  );
}