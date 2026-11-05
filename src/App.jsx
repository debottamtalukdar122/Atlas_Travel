import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Check,
  ChevronDown, ChevronLeft, ChevronRight, Clock, Compass, Download, Eye,
  EyeOff, FileText, Globe2, Heart, Instagram, KeyRound, Lock, LogOut, Mail,
  MapPin, Menu, Phone, Receipt, Search, Send, ShieldCheck, Sparkles, Star,
  User, Users, X
} from 'lucide-react'
import { API, request, asset } from './api'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts'

const photos = {
  hero: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2100&q=88',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1100&q=85',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1100&q=85',
  alps: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1100&q=85',
  morocco: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1100&q=85',
  coast: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1100&q=85',
  safari: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1100&q=85',
}

const seedTours = [
  { id: 1, title: 'Coastal Amalfi & Hidden Bays', destination: 'Campania, Italy', duration: '7 days', price: 195000, type: 'Coastal', image: photos.coast, description: 'Private wooden gozzo sails, cliffside lemon orchards, and sunset dinners overlooking the Tyrrhenian Sea.', featured: true },
  { id: 2, title: 'Kyoto Mornings & Forest Sanctuaries', destination: 'Kyoto, Japan', duration: '9 days', price: 245000, type: 'Culture', image: photos.kyoto, description: 'Early dawn walks in bamboo groves, quiet wooden ryokan stays, and private zen garden meditations.', featured: true },
  { id: 3, title: 'Wild at Heart: Serengeti Expedition', destination: 'Serengeti, Tanzania', duration: '8 days', price: 320000, type: 'Wildlife', image: photos.safari, description: 'Unrushed dawn game drives, luxury canvas under the southern stars, and intimate encounters with the Great Migration.', featured: true },
  { id: 4, title: 'Dolomite High Trails & Alpine Refuges', destination: 'South Tyrol, Italy', duration: '6 days', price: 175000, type: 'Alpine', image: photos.alps, description: 'Trek beneath towering limestone pinnacles, wake to sunrise over pale peaks, and savor hearty mountain hospitality.', featured: true },
  { id: 5, title: 'The Quiet Side of Bali', destination: 'Bali, Indonesia', duration: '8 days', price: 189000, type: 'Beach & culture', image: photos.bali, description: 'A slower island rhythm, from jungle hideaways to the sea.', featured: true },
  { id: 6, title: 'Morocco, Between Worlds', destination: 'Marrakech, Morocco', duration: '9 days', price: 219000, type: 'Culture', image: photos.morocco, description: 'Medina mornings, Atlas foothills and a night beneath the stars.', featured: true },
]

const modules = [
  ['overview', 'Overview'], ['enquiries', 'Enquiries'], ['bookings', 'Bookings'], ['customers', 'Customers'],
  ['packages', 'Tour packages'], ['destinations', 'Destinations'], ['quotations', 'Quotations'],
  ['payments', 'Payments'], ['invoices', 'Invoices'], ['documents', 'Travel documents'],
  ['itineraries', 'Itineraries'], ['follow-ups', 'Follow-ups'], ['hotels', 'Hotels'],
  ['transport', 'Transport'], ['communications', 'Communications'], ['blogs', 'Travel stories'],
  ['offers', 'Offers'], ['gallery', 'Media gallery'], ['subscribers', 'Postcard subscribers'],
  ['notifications', 'Notifications'], ['pages', 'Website pages'], ['testimonials', 'Testimonials'],
  ['reports', 'Reports'], ['settings', 'Settings']
]

const fields = {
  enquiries: ['name', 'email', 'mobile', 'package', 'travel_date', 'travellers', 'message', 'status', 'notes'],
  bookings: ['customer_id', 'package_id', 'travel_date', 'return_date', 'adults', 'children', 'total_amount', 'discount', 'tax', 'paid_amount', 'status', 'payment_status', 'special_requests', 'notes'],
  customers: ['name', 'email', 'mobile', 'alternate_mobile', 'address', 'city', 'state', 'country', 'date_of_birth', 'passport_number', 'emergency_contact', 'preferences', 'notes'],
  packages: ['title', 'slug', 'destination_id', 'category', 'duration', 'price', 'max_travellers', 'image', 'description', 'highlights', 'itinerary', 'inclusions', 'exclusions', 'terms', 'cancellation_policy', 'status'],
  destinations: ['name', 'country', 'region', 'description', 'image', 'attractions', 'best_time', 'travel_info', 'status'],
  quotations: ['customer_id', 'package_id', 'travel_date', 'travellers', 'hotel_cost', 'transport_cost', 'activity_cost', 'meal_cost', 'other_charges', 'discount', 'tax', 'total_amount', 'valid_until', 'status', 'terms'],
  payments: ['booking_id', 'customer_id', 'amount', 'method', 'reference', 'paid_at', 'status', 'notes'],
  invoices: ['booking_id', 'customer_id', 'invoice_number', 'total_amount', 'paid_amount', 'due_amount', 'status', 'terms'],
  'follow-ups': ['customer_id', 'enquiry_id', 'booking_id', 'follow_up_at', 'subject', 'notes', 'status'],
  subscribers: ['email', 'status'],
  documents: ['type', 'customer_id', 'booking_id', 'notes'],
  itineraries: ['package_id', 'booking_id', 'day_number', 'date', 'location', 'activities', 'hotel', 'meals', 'transportation', 'notes'],
  communications: ['customer_id', 'channel', 'recipient', 'subject', 'message', 'status'],
  notifications: ['type', 'title', 'body', 'status'],
  pages: ['key', 'title', 'content', 'status'],
  testimonials: ['name', 'location', 'quote', 'rating', 'image', 'status'],
  hotels: ['name', 'destination_id', 'star_rating', 'address', 'contact', 'room_type', 'price', 'facilities', 'description', 'status'],
  transport: ['type', 'provider', 'route', 'travel_at', 'cost', 'reference', 'status'],
  blogs: ['title', 'slug', 'category', 'tags', 'image', 'excerpt', 'content', 'author', 'read_time', 'featured', 'status'],
  offers: ['name', 'code', 'discount_type', 'discount_value', 'minimum_amount', 'maximum_discount', 'starts_at', 'ends_at', 'usage_limit', 'status'],
  gallery: ['title', 'image', 'category', 'featured'],
  settings: ['company_name', 'email', 'phone', 'address', 'whatsapp', 'tax_rate', 'invoice_prefix', 'currency', 'currency_symbol']
}

function parseUrlPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/'
  const parts = clean.split('/').filter(Boolean)

  if (parts.length === 0) return { view: 'home', param: null }

  // Admin routing
  if (parts[0] === 'admin') {
    if (parts[1] === 'login') return { view: 'admin-login', param: null }
    return { view: 'admin', module: parts[1] || 'overview', param: parts[2] || null }
  }

  // Customer Portal routing
  if (parts[0] === 'portal' || parts[0] === 'my-account') {
    if (parts[1] === 'login') return { view: 'portal-login', param: null }
    if (parts[1] === 'bookings' && parts[2]) return { view: 'portal-booking-detail', param: parts[2] }
    if (parts[1] === 'bookings') return { view: 'portal-bookings', param: null }
    if (parts[1] === 'notifications') return { view: 'portal-notifications', param: null }
    return { view: 'portal-dashboard', param: null }
  }

  // Public routing
  if (parts[0] === 'journeys') {
    if (parts[1]) return { view: 'journey-detail', param: parts[1] }
    return { view: 'journeys', param: null }
  }

  if (parts[0] === 'journal') {
    if (parts[1]) return { view: 'journal-detail', param: parts[1] }
    return { view: 'journal', param: null }
  }

  if (parts[0] === 'story' || parts[0] === 'about') return { view: 'story', param: null }
  if (parts[0] === 'contact') return { view: 'contact', param: null }

  return { view: 'home', param: null }
}

function App() {
  // Navigation State
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') return { view: 'home', param: null }
    return parseUrlPath(window.location.pathname)
  })

  function navigate(path, replace = false) {
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState({}, '', path)
      } else {
        window.history.pushState({}, '', path)
      }
      setRoute(parseUrlPath(path))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const onPop = () => setRoute(parseUrlPath(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Public Site Data State
  const [tours, setTours] = useState(seedTours)
  const [selectedTour, setSelectedTour] = useState(null)
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState('enquiry')
  const [toast, setToast] = useState('')
  const [lead, setLead] = useState({ name: '', email: '', mobile: '', travellers: '2', travel_date: '', message: '' })

  // Public Journal State
  const [blogsList, setBlogsList] = useState([])
  const [blogCategories, setBlogCategories] = useState([])
  const [selectedBlogCat, setSelectedBlogCat] = useState('All')
  const [blogSearchQuery, setBlogSearchQuery] = useState('')
  const [currentArticle, setCurrentArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [blogLoading, setBlogLoading] = useState(false)

  // Admin Authentication State
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('atlas_token') || localStorage.getItem('atlas_token') || ''
  })
  function persistAdminToken(t, remember) {
    if (!t) {
      sessionStorage.removeItem('atlas_token')
      localStorage.removeItem('atlas_token')
      setAdminToken('')
      return
    }
    if (remember) {
      localStorage.setItem('atlas_token', t)
      sessionStorage.removeItem('atlas_token')
    } else {
      sessionStorage.setItem('atlas_token', t)
      localStorage.removeItem('atlas_token')
    }
    setAdminToken(t)
  }

  const [adminAuthView, setAdminAuthView] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [adminPage, setAdminPage] = useState('overview')
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false })
  const [loginError, setLoginError] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [resetForm, setResetForm] = useState({ email: '', token: '', password: '', password_confirmation: '' })
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetError, setResetError] = useState('')

  // Admin CRM Data State
  const [adminData, setAdminData] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [recordForm, setRecordForm] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [meta, setMeta] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [reportFrom, setReportFrom] = useState('')
  const [reportTo, setReportTo] = useState('')
  const [documentFile, setDocumentFile] = useState(null)

  // Customer Portal State
  const [customerToken, setCustomerToken] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('atlas_customer_token') || sessionStorage.getItem('atlas_customer_token') || ''
  })
  const [customerUser, setCustomerUser] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      const u = localStorage.getItem('atlas_customer_user') || sessionStorage.getItem('atlas_customer_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })
  function persistCustomerToken(t, u) {
    if (!t) {
      localStorage.removeItem('atlas_customer_token')
      sessionStorage.removeItem('atlas_customer_token')
      localStorage.removeItem('atlas_customer_user')
      sessionStorage.removeItem('atlas_customer_user')
      setCustomerToken('')
      setCustomerUser(null)
      return
    }
    localStorage.setItem('atlas_customer_token', t)
    if (u) localStorage.setItem('atlas_customer_user', JSON.stringify(u))
    setCustomerToken(t)
    setCustomerUser(u || null)
  }

  const [customerLoginStep, setCustomerLoginStep] = useState('identifier') // 'identifier' or 'otp'
  const [customerIdentifier, setCustomerIdentifier] = useState('')
  const [customerOtp, setCustomerOtp] = useState('')
  const [customerDevOtp, setCustomerDevOtp] = useState('')
  const [customerAuthMsg, setCustomerAuthMsg] = useState('')
  const [customerAuthError, setCustomerAuthError] = useState('')
  const [customerAuthLoading, setCustomerAuthLoading] = useState(false)

  const [customerDashboardData, setCustomerDashboardData] = useState(null)
  const [customerBookingsList, setCustomerBookingsList] = useState([])
  const [customerActiveBooking, setCustomerActiveBooking] = useState(null)
  const [customerNotificationsList, setCustomerNotificationsList] = useState([])
  const [customerLoading, setCustomerLoading] = useState(false)

  function notify(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  // Load public packages
  useEffect(() => {
    request('/public/packages')
      .then(d => {
        if (d?.data?.length) {
          setTours(d.data.map(t => ({ ...t, image: asset(t.image) })))
        }
      })
      .catch(() => {})
  }, [])

  // Load public journal blogs
  useEffect(() => {
    if (route.view === 'journal') {
      setBlogLoading(true)
      const q = blogSearchQuery ? `&search=${encodeURIComponent(blogSearchQuery)}` : ''
      const cat = selectedBlogCat !== 'All' ? `&category=${encodeURIComponent(selectedBlogCat)}` : ''
      request(`/public/blogs?${q}${cat}`)
        .then(d => {
          setBlogsList(d?.data || [])
          if (d?.categories?.length) {
            setBlogCategories(['All', ...d.categories])
          }
        })
        .catch(() => {})
        .finally(() => setBlogLoading(false))
    }
  }, [route.view, selectedBlogCat, blogSearchQuery])

  // Load individual blog article
  useEffect(() => {
    if (route.view === 'journal-detail' && route.param) {
      setBlogLoading(true)
      request(`/public/blogs/${route.param}`)
        .then(d => {
          setCurrentArticle(d?.article || null)
          setRelatedArticles(d?.related || [])
        })
        .catch(() => {
          setCurrentArticle(null)
          notify('Article not found or not published.')
        })
        .finally(() => setBlogLoading(false))
    }
  }, [route.view, route.param])

  // Handle password reset token in URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    const emailParam = params.get('email')
    const actionParam = params.get('action')
    if (tokenParam || actionParam === 'reset-password') {
      navigate('/admin/login')
      setAdminAuthView('reset')
      setResetForm(f => ({ ...f, token: tokenParam || '', email: emailParam || f.email }))
      try {
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (_) {}
    }

    const onExpired = (e) => {
      persistAdminToken(null, false)
      setLoginError(e?.detail?.message || 'Your session has expired. Please sign in again.')
      navigate('/admin/login')
      setAdminAuthView('login')
    }
    window.addEventListener('atlas:auth-expired', onExpired)
    return () => window.removeEventListener('atlas:auth-expired', onExpired)
  }, [])

  // Load admin dashboard statistics and charts
  useEffect(() => {
    if (adminToken && route.view === 'admin') {
      request('/admin/dashboard', { token: adminToken })
        .then(setAdminData)
        .catch(() => {
          persistAdminToken(null, false)
          setLoginError('Your session has expired. Please sign in again.')
          navigate('/admin/login')
        })
    }
  }, [adminToken, route.view])

  // Sync route.module with adminPage
  useEffect(() => {
    if (route.view === 'admin') {
      setAdminPage(route.module || 'overview')
    }
  }, [route.view, route.module])

  // Load Admin CRM module records
  useEffect(() => {
    if (!adminToken || route.view !== 'admin' || adminPage === 'overview') return
    setLoading(true)
    if (adminPage === 'reports') {
      request(`/admin/reports/data?from=${reportFrom}&to=${reportTo}`, { token: adminToken })
        .then(d => setReportData(d.data))
        .catch(e => notify(e.message))
        .finally(() => setLoading(false))
      return
    }
    request(`/admin/${adminPage}?page=${pageIndex}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`, { token: adminToken })
      .then(d => {
        setRecords(d.data || [])
        setMeta(d.meta || null)
      })
      .catch(e => notify(e.message))
      .finally(() => setLoading(false))
  }, [adminToken, route.view, adminPage, search, statusFilter, pageIndex, reportFrom, reportTo])

  // Load Customer Portal Data
  useEffect(() => {
    if (!customerToken) return

    if (route.view === 'portal-dashboard') {
      setCustomerLoading(true)
      request('/customer/dashboard', { token: customerToken })
        .then(d => setCustomerDashboardData(d))
        .catch(err => {
          if (err.status === 401) persistCustomerToken(null)
        })
        .finally(() => setCustomerLoading(false))
    }

    if (route.view === 'portal-bookings') {
      setCustomerLoading(true)
      request('/customer/bookings', { token: customerToken })
        .then(d => setCustomerBookingsList(d?.data || []))
        .catch(err => {
          if (err.status === 401) persistCustomerToken(null)
        })
        .finally(() => setCustomerLoading(false))
    }

    if (route.view === 'portal-booking-detail' && route.param) {
      setCustomerLoading(true)
      request(`/customer/bookings/${route.param}`, { token: customerToken })
        .then(d => setCustomerActiveBooking(d))
        .catch(err => {
          notify(err.message || 'Could not load booking details.')
          navigate('/portal/bookings')
        })
        .finally(() => setCustomerLoading(false))
    }

    if (route.view === 'portal-notifications') {
      setCustomerLoading(true)
      request('/customer/notifications', { token: customerToken })
        .then(d => setCustomerNotificationsList(d?.data || []))
        .catch(() => {})
        .finally(() => setCustomerLoading(false))
    }
  }, [customerToken, route.view, route.param])

  // Filtered public tours
  const filteredTours = useMemo(() =>
    tours.filter(t => (`${t.title} ${t.destination} ${t.type}`).toLowerCase().includes(query.toLowerCase())),
    [tours, query]
  )

  function openTour(t) {
    setSelectedTour(t)
    navigate(`/journeys/${t.slug || t.id}`)
  }

  // Submit enquiry or booking from public site
  async function submitLead(e) {
    e.preventDefault()
    try {
      await request(`/public/${formType === 'booking' ? 'bookings' : 'enquiries'}`, {
        method: 'POST',
        body: { ...lead, package_id: selectedTour?.id || null },
      })
      notify(formType === 'booking' ? 'Your booking request is with our travel team. We will be in touch soon.' : 'Your enquiry is with our travel team. We will be in touch soon.')
      setFormOpen(false)
      setLead({ name: '', email: '', mobile: '', travellers: '2', travel_date: '', message: '' })
    } catch (err) {
      notify(err.message)
    }
  }

  // Admin Authentication Actions
  async function doAdminLogin(e) {
    e.preventDefault()
    if (!loginForm.email.trim()) {
      setLoginError('Please enter your email or mobile number.')
      return
    }
    if (!loginForm.password) {
      setLoginError('Please enter your password.')
      return
    }
    setAuthLoading(true)
    setLoginError('')
    try {
      const d = await request('/admin/login', {
        method: 'POST',
        body: {
          email: loginForm.email.trim(),
          password: loginForm.password,
          remember: loginForm.remember,
        },
      })
      persistAdminToken(d.token, loginForm.remember)
      setLoginError('')
      setLoginForm({ email: '', password: '', remember: false })
      navigate('/admin/dashboard')
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function doAdminLogout() {
    try {
      if (adminToken) await request('/admin/logout', { method: 'POST', token: adminToken })
    } catch (_) {}
    persistAdminToken(null, false)
    setAdminData(null)
    setAdminAuthView('login')
    navigate('/admin/login')
    notify('You have been signed out.')
  }

  async function doAdminForgotPassword(e) {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.')
      return
    }
    setAuthLoading(true)
    setForgotError('')
    setForgotSuccess('')
    try {
      const d = await request('/admin/forgot-password', {
        method: 'POST',
        body: { email: forgotEmail.trim() },
      })
      setForgotSuccess(d.message || 'If that email address is registered, a password reset link has been sent.')
    } catch (err) {
      setForgotError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function doAdminResetPassword(e) {
    e.preventDefault()
    if (!resetForm.token.trim()) {
      setResetError('Reset token is required.')
      return
    }
    if (!resetForm.email.trim()) {
      setResetError('Email is required.')
      return
    }
    if (resetForm.password.length < 8) {
      setResetError('Password must be at least 8 characters long.')
      return
    }
    if (resetForm.password !== resetForm.password_confirmation) {
      setResetError('Passwords do not match.')
      return
    }
    setAuthLoading(true)
    setResetError('')
    setResetSuccess('')
    try {
      const d = await request('/admin/reset-password', { method: 'POST', body: resetForm })
      setResetSuccess(d.message || 'Your password has been reset successfully. You can now sign in with your new password.')
      setTimeout(() => {
        setAdminAuthView('login')
        setResetSuccess('')
        setResetForm({ email: '', token: '', password: '', password_confirmation: '' })
      }, 2500)
    } catch (err) {
      setResetError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  // Admin CRUD Actions
  async function saveRecord(e) {
    e.preventDefault()
    try {
      const current = adminPage
      let body = recordForm
      let path = `/admin/${current}`
      if (current === 'documents' && !recordForm.id) {
        if (!documentFile) throw new Error('Choose a document file first.')
        body = new FormData()
        body.append('file', documentFile)
        Object.entries(recordForm).forEach(([k, v]) => {
          if (v !== '' && v != null) body.append(k, v)
        })
        path = '/admin/documents'
      }
      await request(`${path}${recordForm.id ? `/${recordForm.id}` : ''}`, {
        method: recordForm.id ? 'PUT' : 'POST',
        token: adminToken,
        body,
      })
      setRecordForm(null)
      setDocumentFile(null)
      notify('Changes saved')
      reloadRecords()
    } catch (e) {
      notify(e.message)
    }
  }

  async function reloadRecords() {
    try {
      const d = await request(`/admin/${adminPage}?page=${pageIndex}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`, { token: adminToken })
      setRecords(d.data || [])
      setMeta(d.meta || null)
    } catch (e) {
      notify(e.message)
    }
  }

  async function recordAction(path, body = {}) {
    try {
      await request(path, { method: 'POST', token: adminToken, body })
      notify('Workflow updated')
      reloadRecords()
      request('/admin/dashboard', { token: adminToken }).then(setAdminData)
    } catch (e) {
      notify(e.message)
    }
  }

  async function downloadDocument(id, isCustomer = false) {
    try {
      const endpoint = isCustomer ? `/customer/documents/${id}/download` : `/admin/documents/${id}/download`
      const activeToken = isCustomer ? customerToken : adminToken
      const response = await fetch(`${API}${endpoint}`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (!response.ok) throw new Error('Could not download this document.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'travel-document.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      notify(e.message)
    }
  }

  async function removeRecord(id) {
    if (!confirm('Delete this record? This cannot be undone.')) return
    try {
      await request(`/admin/${adminPage}/${id}`, { method: 'DELETE', token: adminToken })
      setRecords(records.filter(x => x.id !== id))
      notify('Record deleted')
    } catch (e) {
      notify(e.message)
    }
  }

  // Customer Portal Authentication Actions
  async function doCustomerRequestOtp(e) {
    e.preventDefault()
    if (!customerIdentifier.trim()) {
      setCustomerAuthError('Please enter your email or mobile number.')
      return
    }
    setCustomerAuthLoading(true)
    setCustomerAuthError('')
    setCustomerAuthMsg('')
    try {
      const d = await request('/customer/auth/request-otp', {
        method: 'POST',
        body: { identifier: customerIdentifier.trim() },
      })
      setCustomerAuthMsg(d.message || 'Verification code sent.')
      if (d.dev_otp) setCustomerDevOtp(d.dev_otp)
      setCustomerLoginStep('otp')
    } catch (err) {
      setCustomerAuthError(err.message || 'Could not verify customer details.')
    } finally {
      setCustomerAuthLoading(false)
    }
  }

  async function doCustomerVerifyOtp(e) {
    e.preventDefault()
    if (!customerOtp.trim()) {
      setCustomerAuthError('Please enter the 6-digit code.')
      return
    }
    setCustomerAuthLoading(true)
    setCustomerAuthError('')
    try {
      const d = await request('/customer/auth/verify-otp', {
        method: 'POST',
        body: { identifier: customerIdentifier.trim(), otp: customerOtp.trim() },
      })
      persistCustomerToken(d.token, d.customer)
      setCustomerLoginStep('identifier')
      setCustomerIdentifier('')
      setCustomerOtp('')
      setCustomerDevOtp('')
      navigate('/portal')
      notify('Welcome back to your traveller portal.')
    } catch (err) {
      setCustomerAuthError(err.message || 'Invalid verification code.')
    } finally {
      setCustomerAuthLoading(false)
    }
  }

  async function doCustomerLogout() {
    try {
      if (customerToken) await request('/customer/auth/logout', { method: 'POST', token: customerToken })
    } catch (_) {}
    persistCustomerToken(null)
    navigate('/portal/login')
    notify('You have been signed out.')
  }

  // =========================================================================
  // ROUTE RENDERING
  // =========================================================================

  // 1. ADMIN AUTHENTICATION (Centered login card)
  if (route.view === 'admin-login' || (route.view === 'admin' && !adminToken)) {
    return (
      <div className="login-screen-wrap">
        <a className="brand dark" href="#" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          <span className="brand-icon"><Compass size={19} /></span> atlas<span className="brand-amp">&</span>isle
        </a>
        <div className="login-card">
          {adminAuthView === 'forgot' ? (
            <>
              <div className="eyebrow">ACCOUNT RECOVERY</div>
              <h1>Reset password.</h1>
              <p>Enter your registered administrator email to receive a password recovery link.</p>
              <form onSubmit={doAdminForgotPassword}>
                {forgotSuccess && <div className="success-msg"><Check size={15} /><span>{forgotSuccess}</span></div>}
                {forgotError && <div className="error-msg">{forgotError}</div>}
                <label>Registered email address</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="admin@atlas-isle.local"
                />
                <button className="btn btn-dark full" style={{ marginTop: 16 }} disabled={authLoading}>
                  {authLoading ? 'Sending link…' : <>Send recovery link <Send size={15} /></>}
                </button>
                <div className="auth-switch-link">
                  <button type="button" className="text-btn" onClick={() => { setAdminAuthView('login'); setForgotError(''); setForgotSuccess('') }}>
                    <ChevronLeft size={13} /> Back to sign in
                  </button>
                </div>
              </form>
            </>
          ) : adminAuthView === 'reset' ? (
            <>
              <div className="eyebrow">SECURITY CREDENTIALS</div>
              <h1>Set new password.</h1>
              <p>Choose a strong password to secure your admin workspace.</p>
              <form onSubmit={doAdminResetPassword}>
                {resetSuccess && <div className="success-msg"><Check size={15} /><span>{resetSuccess}</span></div>}
                {resetError && <div className="error-msg">{resetError}</div>}
                <label>Email address</label>
                <input
                  type="email"
                  required
                  value={resetForm.email}
                  onChange={e => setResetForm({ ...resetForm, email: e.target.value })}
                  placeholder="admin@atlas-isle.local"
                />
                <label>Reset token</label>
                <input
                  type="text"
                  required
                  value={resetForm.token}
                  onChange={e => setResetForm({ ...resetForm, token: e.target.value })}
                  placeholder="Paste token from email"
                />
                <label>New password</label>
                <div className="input-with-action">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={resetForm.password}
                    onChange={e => setResetForm({ ...resetForm, password: e.target.value })}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    title={showResetPassword ? 'Hide password' : 'Show password'}
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <label>Confirm new password</label>
                <div className="input-with-action">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={resetForm.password_confirmation}
                    onChange={e => setResetForm({ ...resetForm, password_confirmation: e.target.value })}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="password-requirements">
                  Password requirements:
                  <ul>
                    <li className={resetForm.password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
                    <li className={/[a-z]/.test(resetForm.password) && /[A-Z]/.test(resetForm.password) ? 'valid' : ''}>Uppercase & lowercase letters</li>
                    <li className={/[0-9]/.test(resetForm.password) ? 'valid' : ''}>At least one number</li>
                    <li className={resetForm.password && resetForm.password === resetForm.password_confirmation ? 'valid' : ''}>Passwords match</li>
                  </ul>
                </div>
                <button className="btn btn-dark full" disabled={authLoading}>
                  {authLoading ? 'Saving…' : <>Save new password <ArrowRight size={15} /></>}
                </button>
                <div className="auth-switch-link">
                  <button type="button" className="text-btn" onClick={() => { setAdminAuthView('login'); setResetError(''); setResetSuccess('') }}>
                    <ChevronLeft size={13} /> Back to sign in
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="eyebrow">THE BACK OFFICE</div>
              <h1>Welcome back.</h1>
              <p>Sign in to your private travel workspace.</p>
              <form onSubmit={doAdminLogin}>
                <label>Email address or mobile</label>
                <input
                  type="text"
                  required
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@atlas-isle.local or phone"
                />
                <label>Password</label>
                <div className="input-with-action">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="login-opts">
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={loginForm.remember}
                      onChange={e => setLoginForm({ ...loginForm, remember: e.target.checked })}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => { setAdminAuthView('forgot'); setForgotError(''); setForgotSuccess(''); setLoginError('') }}
                  >
                    Forgot password?
                  </button>
                </div>
                {loginError && <div className="error-msg">{loginError}</div>}
                <button className="btn btn-dark full" disabled={authLoading}>
                  {authLoading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}
                </button>
              </form>
              <small><ShieldCheck size={13} /> Protected by rate limiting and secure sessions</small>
            </>
          )}
        </div>
        <span className="login-foot">Atlas & Isle · Single Administrator CRM</span>
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </div>
    )
  }

  // 2. ADMIN CRM DASHBOARD & MODULES
  if (route.view === 'admin' && adminToken) {
    return (
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <a className="brand dark" href="#" onClick={(e) => { e.preventDefault(); navigate('/') }}>
            <span className="brand-icon"><Compass size={19} /></span> atlas<span className="brand-amp">&</span>isle
          </a>
          <div className="admin-label">WORKSPACE</div>
          <nav>
            {modules.map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setAdminPage(key)
                  setPageIndex(1)
                  navigate(`/admin/${key}`)
                }}
                className={adminPage === key ? 'active' : ''}
              >
                <ModuleIcon name={key} />
                {label}
                {key === 'enquiries' && adminData?.new_enquiries > 0 && <i>{adminData.new_enquiries}</i>}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="avatar">AI</div>
            <div><b>Administrator</b><small>Company owner</small></div>
            <button className="icon-btn" onClick={doAdminLogout} title="Sign out"><ArrowUpRight size={16} /></button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-top">
            <div>
              <div className="eyebrow">ATLAS & ISLE / {adminPage.replace('-', ' ').toUpperCase()}</div>
              <h1>{modules.find(m => m[0] === adminPage)?.[1] || 'Dashboard'}</h1>
            </div>
            <div className="top-actions">
              <GlobalSearch
                token={adminToken}
                onSelect={(moduleName, record) => {
                  setAdminPage(moduleName)
                  navigate(`/admin/${moduleName}`)
                  setRecordForm(record)
                }}
              />
              <button className="avatar" title="Administrator">AI</button>
            </div>
          </header>

          {adminPage === 'reports' ? (
            <ReportsPanel
              data={reportData}
              loading={loading}
              from={reportFrom}
              to={reportTo}
              setFrom={setReportFrom}
              setTo={setReportTo}
            />
          ) : adminPage === 'overview' ? (
            <Dashboard
              data={adminData}
              setAdminPage={(p) => {
                setAdminPage(p)
                navigate(`/admin/${p}`)
              }}
            />
          ) : (
            <section className="records-panel">
              <div className="records-tools">
                <div className="admin-search">
                  <Search size={16} />
                  <input
                    placeholder={`Search ${adminPage}…`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPageIndex(1) }}>
                  <option value="">All statuses</option>
                  {['new', 'pending', 'confirmed', 'contacted', 'completed', 'cancelled', 'published', 'draft', 'sent'].map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <button className="btn btn-dark" onClick={() => setRecordForm({})}>
                  + Add {modules.find(m => m[0] === adminPage)?.[1].replace(/s$/, '')}
                </button>
              </div>

              {loading ? (
                <p className="empty">Loading records…</p>
              ) : records.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>RECORD</th>
                        <th>DETAILS</th>
                        <th>STATUS</th>
                        <th>UPDATED</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r => (
                        <tr key={r.id}>
                          <td>
                            <b>{r.name || r.title || r.invoice_number || r.code || `#${r.id}`}</b>
                            <small>#{r.id}</small>
                          </td>
                          <td>
                            {r.email || r.mobile || r.destination?.name || r.package?.title || r.subject || (r.amount != null ? `₹${Number(r.amount).toLocaleString()}` : null) || (r.total_amount != null ? `₹${Number(r.total_amount).toLocaleString()}` : null) || '—'}
                          </td>
                          <td>
                            <span className={`status status-${r.status || 'new'}`}>{r.status || 'active'}</span>
                          </td>
                          <td>
                            {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="row-actions">
                            {adminPage === 'enquiries' && (
                              <>
                                <button onClick={() => recordAction(`/admin/enquiries/${r.id}/convert`, { target: 'customer' })}>Customer</button>
                                <button onClick={() => recordAction(`/admin/enquiries/${r.id}/convert`, { target: 'booking' })}>Booking</button>
                              </>
                            )}
                            {adminPage === 'bookings' && (
                              <button onClick={() => recordAction(`/admin/bookings/${r.id}/invoice`)}>Invoice</button>
                            )}
                            {adminPage === 'quotations' && r.status === 'accepted' && (
                              <button onClick={() => recordAction(`/admin/quotations/${r.id}/convert`)}>Convert</button>
                            )}
                            {adminPage === 'documents' && (
                              <button onClick={() => downloadDocument(r.id, false)}>Download</button>
                            )}
                            <button onClick={() => setRecordForm({ ...r })}>Edit</button>
                            <button onClick={() => removeRecord(r.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    Showing {records.length} of {meta?.total ?? records.length} records
                    <span className="pager">
                      <button
                        disabled={(meta?.current_page || 1) <= 1}
                        onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      Page {meta?.current_page || 1} of {meta?.last_page || 1}
                      <button
                        disabled={(meta?.current_page || 1) >= (meta?.last_page || 1)}
                        onClick={() => setPageIndex(p => Math.min(meta?.last_page || 1, p + 1))}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="empty">
                  <div className="empty-icon"><Sparkles size={21} /></div>
                  <h3>No {adminPage} yet</h3>
                  <p>Records created on your website or here will show up in this list.</p>
                  <button className="btn btn-outline" onClick={() => setRecordForm({})}>Create first record</button>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Record Create/Edit Modal */}
        {recordForm && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setRecordForm(null)}>
            <form className="record-modal" onSubmit={saveRecord}>
              <div className="modal-head">
                <div>
                  <div className="eyebrow">{recordForm.id ? 'UPDATE' : 'NEW'} RECORD</div>
                  <h2>{recordForm.id ? 'Edit' : 'Create'} {adminPage.replace('-', ' ')}</h2>
                </div>
                <button type="button" className="icon-btn" onClick={() => setRecordForm(null)}><X /></button>
              </div>
              <div className="form-grid">
                {adminPage === 'documents' && !recordForm.id && (
                  <label className="wide">
                    File
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                      onChange={e => setDocumentFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                {(fields[adminPage] || ['name', 'description', 'status']).map(key => (
                  <label
                    className={['description', 'message', 'notes', 'content', 'itinerary', 'highlights', 'inclusions', 'exclusions', 'terms', 'preferences'].includes(key) ? 'wide' : ''}
                    key={key}
                  >
                    {key.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    {key === 'status' ? (
                      <select
                        value={recordForm[key] || 'new'}
                        onChange={e => setRecordForm({ ...recordForm, [key]: e.target.value })}
                      >
                        {['new', 'pending', 'contacted', 'confirmed', 'completed', 'cancelled', 'draft', 'published', 'sent', 'accepted', 'rejected', 'active', 'inactive'].map(x => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    ) : ['description', 'message', 'notes', 'content', 'itinerary', 'highlights', 'inclusions', 'exclusions', 'terms', 'preferences', 'cancellation_policy', 'special_requests', 'attractions', 'travel_info'].includes(key) ? (
                      <textarea
                        rows="3"
                        value={recordForm[key] || ''}
                        onChange={e => setRecordForm({ ...recordForm, [key]: e.target.value })}
                      />
                    ) : key === 'file' ? (
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        onChange={e => setDocumentFile(e.target.files?.[0] || null)}
                      />
                    ) : (
                      <input
                        type={key.includes('date') || key.endsWith('_at') ? 'date' : key.includes('amount') || key.includes('cost') || key === 'price' || key.includes('traveller') || key === 'adults' || key === 'children' || key.includes('rating') || key === 'tax' || key === 'day_number' ? 'number' : 'text'}
                        value={recordForm[key] ?? ''}
                        onChange={e => setRecordForm({ ...recordForm, [key]: e.target.value })}
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-quiet" onClick={() => setRecordForm(null)}>Cancel</button>
                <button className="btn btn-dark">Save changes <ArrowRight size={15} /></button>
              </div>
            </form>
          </div>
        )}
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </div>
    )
  }

  // 3. CUSTOMER PORTAL
  if (route.view.startsWith('portal')) {
    if (!customerToken) {
      return (
        <div className="login-screen-wrap">
          <a className="brand dark" href="#" onClick={(e) => { e.preventDefault(); navigate('/') }}>
            <span className="brand-icon"><Compass size={19} /></span> atlas<span className="brand-amp">&</span>isle
          </a>
          <div className="login-card">
            <div className="eyebrow">TRAVELLER ACCESS</div>
            <h1>Your journey portal.</h1>
            <p>Access your curated itineraries, invoices, and travel documents securely.</p>

            {customerLoginStep === 'identifier' ? (
              <form onSubmit={doCustomerRequestOtp}>
                <label>Registered email or mobile number</label>
                <input
                  type="text"
                  required
                  value={customerIdentifier}
                  onChange={e => setCustomerIdentifier(e.target.value)}
                  placeholder="e.g. your@email.com or phone"
                />
                {customerAuthError && <div className="error-msg" style={{ marginTop: 12 }}>{customerAuthError}</div>}
                <button className="btn btn-dark full" style={{ marginTop: 18 }} disabled={customerAuthLoading}>
                  {customerAuthLoading ? 'Checking records…' : <>Continue with OTP <ArrowRight size={16} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={doCustomerVerifyOtp}>
                {customerAuthMsg && (
                  <div className="success-msg">
                    <Check size={15} />
                    <span>{customerAuthMsg}</span>
                  </div>
                )}
                {customerDevOtp && (
                  <div style={{ background: '#f5f7f2', padding: '8px 12px', border: '1px solid #d4dfd2', fontSize: '11px', color: '#2d4737', marginBottom: 14, borderRadius: 2 }}>
                    <strong>Dev Code:</strong> <span style={{ fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 'bold' }}>{customerDevOtp}</span>
                  </div>
                )}
                <label>Enter 6-digit verification code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={customerOtp}
                  onChange={e => setCustomerOtp(e.target.value)}
                  placeholder="123456"
                  style={{ letterSpacing: '3px', fontSize: '16px', textAlign: 'center' }}
                />
                {customerAuthError && <div className="error-msg" style={{ marginTop: 12 }}>{customerAuthError}</div>}
                <button className="btn btn-dark full" style={{ marginTop: 18 }} disabled={customerAuthLoading}>
                  {customerAuthLoading ? 'Verifying code…' : <>Verify & Open Portal <ArrowRight size={16} /></>}
                </button>
                <div className="auth-switch-link">
                  <button type="button" className="text-btn" onClick={() => { setCustomerLoginStep('identifier'); setCustomerAuthError('') }}>
                    <ChevronLeft size={13} /> Change email or phone
                  </button>
                </div>
              </form>
            )}
            <small style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, color: '#7e8b82', fontSize: '9px' }}>
              <ShieldCheck size={14} /> Passwordless verification protects your booking information
            </small>
          </div>
          <span className="login-foot">Atlas & Isle · Guest Self-Service Portal</span>
          {toast && <div className="toast"><Check size={16} />{toast}</div>}
        </div>
      )
    }

    // Authenticated Customer Portal
    return (
      <div className="portal-container">
        <header className="portal-topbar">
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); navigate('/') }}>
            <span className="brand-icon"><Compass size={19} /></span> atlas<span className="brand-amp">&</span>isle
          </a>
          <div className="portal-top-right">
            <div className="portal-user-tag">
              <div className="portal-avatar">
                {(customerUser?.name || 'T').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <b>{customerUser?.name || 'Traveller'}</b>
                <div style={{ fontSize: '9px', color: '#7d8a80' }}>{customerUser?.email}</div>
              </div>
            </div>
            <button className="btn btn-quiet" onClick={doCustomerLogout} style={{ fontSize: '10px', padding: '8px 12px' }}>
              Sign out <LogOut size={13} />
            </button>
          </div>
        </header>

        <div className="portal-body">
          <nav className="portal-nav-tabs">
            <button
              className={`portal-tab-btn ${route.view === 'portal-dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/portal')}
            >
              <Compass size={15} /> Overview
            </button>
            <button
              className={`portal-tab-btn ${route.view === 'portal-bookings' || route.view === 'portal-booking-detail' ? 'active' : ''}`}
              onClick={() => navigate('/portal/bookings')}
            >
              <CalendarDays size={15} /> My Bookings
            </button>
            <button
              className={`portal-tab-btn ${route.view === 'portal-notifications' ? 'active' : ''}`}
              onClick={() => navigate('/portal/notifications')}
            >
              <Send size={15} /> Travel Alerts
            </button>
          </nav>

          {customerLoading && <p className="empty">Loading your journey details…</p>}

          {!customerLoading && route.view === 'portal-dashboard' && (
            <div>
              <div className="welcome-card" style={{ marginBottom: 28 }}>
                <div>
                  <div className="eyebrow">YOUR TRAVELLER WORKSPACE</div>
                  <h2>Welcome, <em>{customerDashboardData?.customer_name || 'Adventurer'}.</em></h2>
                  <p>Here are your confirmed bookings, vouchers, and itinerary updates.</p>
                </div>
                <div className="welcome-orbit">
                  <Compass size={28} />
                  <span>JOURNEYS</span>
                </div>
              </div>

              <div className="portal-stats-grid">
                <div className="portal-stat-card">
                  <span>UPCOMING DEPARTURES</span>
                  <b>{customerDashboardData?.stats?.upcoming_trips ?? 0}</b>
                </div>
                <div className="portal-stat-card">
                  <span>TOTAL BOOKINGS</span>
                  <b>{customerDashboardData?.stats?.total_bookings ?? 0}</b>
                </div>
                <div className="portal-stat-card">
                  <span>CONFIRMED TOURS</span>
                  <b>{customerDashboardData?.stats?.confirmed_bookings ?? 0}</b>
                </div>
                <div className="portal-stat-card">
                  <span>COMPLETED JOURNEYS</span>
                  <b>{customerDashboardData?.stats?.completed_trips ?? 0}</b>
                </div>
              </div>

              <div className="section-head" style={{ marginTop: 24, marginBottom: 16 }}>
                <div>
                  <div className="eyebrow">UPCOMING EXPEDITIONS</div>
                  <h3 style={{ font: '400 24px "Playfair Display", serif', margin: '4px 0 0' }}>Your recent bookings</h3>
                </div>
                <button className="text-link" onClick={() => navigate('/portal/bookings')}>
                  View all bookings <ArrowRight size={14} />
                </button>
              </div>

              {(customerDashboardData?.recent_bookings || []).length ? (
                customerDashboardData.recent_bookings.map(b => (
                  <CustomerBookingCard
                    key={b.id}
                    booking={b}
                    onOpen={() => navigate(`/portal/bookings/${b.id}`)}
                  />
                ))
              ) : (
                <div className="empty">
                  <div className="empty-icon"><CalendarDays size={20} /></div>
                  <h3>No bookings found yet</h3>
                  <p>When you book a journey with Atlas & Isle, your details will appear here.</p>
                  <button className="btn btn-outline" onClick={() => navigate('/journeys')}>
                    Explore our journeys
                  </button>
                </div>
              )}
            </div>
          )}

          {!customerLoading && route.view === 'portal-bookings' && (
            <div>
              <div className="section-head" style={{ marginBottom: 20 }}>
                <div>
                  <div className="eyebrow">ALL BOOKINGS</div>
                  <h2>My Journeys & Expeditions</h2>
                </div>
              </div>

              {customerBookingsList.length ? (
                customerBookingsList.map(b => (
                  <CustomerBookingCard
                    key={b.id}
                    booking={b}
                    onOpen={() => navigate(`/portal/bookings/${b.id}`)}
                  />
                ))
              ) : (
                <div className="empty">
                  <div className="empty-icon"><CalendarDays size={20} /></div>
                  <h3>No bookings found</h3>
                  <p>You currently do not have any registered bookings with us.</p>
                </div>
              )}
            </div>
          )}

          {!customerLoading && route.view === 'portal-booking-detail' && customerActiveBooking && (
            <div>
              <button
                className="text-link"
                onClick={() => navigate('/portal/bookings')}
                style={{ marginBottom: 20 }}
              >
                <ChevronLeft size={16} /> Back to all bookings
              </button>

              <div className="portal-booking-card" style={{ padding: 32 }}>
                <div className="portal-booking-header">
                  <div>
                    <span className="eyebrow">{customerActiveBooking.booking.booking_id}</span>
                    <h2 style={{ font: '400 32px "Playfair Display", serif', margin: '6px 0 4px', color: '#27382d' }}>
                      {customerActiveBooking.booking.package_title}
                    </h2>
                    <p style={{ margin: 0, color: '#68776d', fontSize: '12px' }}>
                      <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                      {customerActiveBooking.booking.destination}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status status-${customerActiveBooking.booking.status}`}>
                      {customerActiveBooking.booking.status}
                    </span>
                    <div style={{ marginTop: 6, fontSize: '11px', color: '#6d7b71' }}>
                      Payment: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{customerActiveBooking.booking.payment_status}</span>
                    </div>
                  </div>
                </div>

                <div className="portal-booking-grid" style={{ padding: '16px 0', borderBottom: '1px solid #f0f3ee' }}>
                  <div>
                    <small>TRAVEL DATE</small>
                    <b>{customerActiveBooking.booking.travel_date || 'To be confirmed'}</b>
                  </div>
                  <div>
                    <small>TRAVELLERS</small>
                    <b>{customerActiveBooking.booking.travellers} guest(s)</b>
                  </div>
                  <div>
                    <small>TOTAL JOURNEY COST</small>
                    <b>₹{Number(customerActiveBooking.booking.total_amount).toLocaleString()}</b>
                  </div>
                  <div>
                    <small>BALANCE OUTSTANDING</small>
                    <b style={{ color: customerActiveBooking.booking.due_amount > 0 ? '#b5583b' : '#315c47' }}>
                      ₹{Number(customerActiveBooking.booking.due_amount).toLocaleString()}
                    </b>
                  </div>
                </div>

                {/* Journey Updates Timeline */}
                <h3 style={{ font: '400 21px "Playfair Display", serif', margin: '24px 0 12px' }}>Journey Milestones</h3>
                <div className="timeline-wrap">
                  {(customerActiveBooking.updates || []).map((step, idx) => (
                    <div className="timeline-step" key={idx}>
                      <div className={`timeline-dot ${step.completed ? 'done' : 'pending'}`}>
                        {step.completed ? <Check size={12} /> : idx + 1}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <b style={{ fontSize: '13px', color: step.completed ? '#24342a' : '#7f8d83' }}>{step.title}</b>
                          <span style={{ font: '9px "DM Mono", monospace', color: '#909d94' }}>{step.date}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#65736a' }}>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day-by-day Itinerary */}
                {(customerActiveBooking.itineraries || []).length > 0 && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f3ee' }}>
                    <h3 style={{ font: '400 21px "Playfair Display", serif', margin: '0 0 16px' }}>Curated Itinerary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {customerActiveBooking.itineraries.map((day, idx) => (
                        <div key={idx} style={{ background: '#fbfcf9', border: '1px solid #ecf0ea', padding: '16px 18px', borderRadius: 3 }}>
                          <div style={{ font: '9px "DM Mono", monospace', color: '#446853', letterSpacing: '1px' }}>
                            DAY {day.day_number || idx + 1} · {day.location || 'Excursion'}
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#38463c', lineHeight: 1.6 }}>
                            {day.activities || day.notes || 'Full day itinerary guided by your local host.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Travel Documents */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f3ee' }}>
                  <h3 style={{ font: '400 21px "Playfair Display", serif', margin: '0 0 12px' }}>Travel Documents & Vouchers</h3>
                  {(customerActiveBooking.documents || []).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {customerActiveBooking.documents.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbf9', padding: '12px 16px', border: '1px solid #e7ebe3', borderRadius: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FileText size={16} color="#345847" />
                            <div>
                              <b style={{ fontSize: '12px', color: '#27382d' }}>{doc.type}</b>
                              <small style={{ display: 'block', fontSize: '9px', color: '#7c897f' }}>{doc.original_name}</small>
                            </div>
                          </div>
                          <button
                            className="btn btn-outline"
                            onClick={() => downloadDocument(doc.id, true)}
                            style={{ fontSize: '10px', padding: '6px 12px' }}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: '#7d8a80' }}>
                      No documents available yet. Your vouchers and tickets will be uploaded prior to travel.
                    </p>
                  )}
                </div>

                {/* Payment History & Invoices */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f3ee' }}>
                  <h3 style={{ font: '400 21px "Playfair Display", serif', margin: '0 0 12px' }}>Invoices & Payment Receipts</h3>
                  {(customerActiveBooking.payments || []).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {customerActiveBooking.payments.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fafbf9', border: '1px solid #e9ece4', borderRadius: 3, fontSize: '11px' }}>
                          <div>
                            <b>Payment Ref: {p.reference || `#PAY-${p.id}`}</b>
                            <small style={{ display: 'block', color: '#768378' }}>Method: {p.method} · {new Date(p.created_at).toLocaleDateString()}</small>
                          </div>
                          <span style={{ fontWeight: 600, color: '#315c47' }}>+ ₹{Number(p.amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: '#7d8a80' }}>No payments recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!customerLoading && route.view === 'portal-notifications' && (
            <div>
              <div className="section-head" style={{ marginBottom: 20 }}>
                <div>
                  <div className="eyebrow">YOUR NOTIFICATIONS</div>
                  <h2>Travel Reminders & Updates</h2>
                </div>
              </div>

              {customerNotificationsList.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {customerNotificationsList.map((n) => (
                    <div key={n.id} style={{ background: '#ffffff', padding: '18px 22px', border: '1px solid #e5eae1', borderRadius: 3, display: 'flex', gap: 14 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eaf1ea', color: '#345847', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Send size={15} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <b style={{ fontSize: '13px', color: '#27382d' }}>{n.title}</b>
                          <span style={{ font: '9px "DM Mono", monospace', color: '#88958c' }}>{n.date}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#5f6f64', lineHeight: 1.6 }}>{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <div className="empty-icon"><Send size={20} /></div>
                  <h3>No notifications at this moment</h3>
                  <p>When there are flight updates, booking confirmations, or itinerary notices, they will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </div>
    )
  }

  // 4. PUBLIC JOURNAL LISTING PAGE
  if (route.view === 'journal') {
    return (
      <div className="site">
        <PublicHeader
          active="journal"
          onNavigate={navigate}
          onOpenEnquiry={() => { setFormType('enquiry'); setFormOpen(true) }}
        />

        <section className="journal-hero-section">
          <div className="eyebrow">THE FIELD JOURNAL</div>
          <h1 style={{ font: '400 clamp(42px, 6vw, 76px)/1.05 "Playfair Display", serif', margin: '14px 0 16px', color: '#24342a' }}>
            Stories from the road,<br /><em>unrushed & true.</em>
          </h1>
          <p style={{ maxWidth: '580px', fontSize: '14px', lineHeight: 1.8, color: '#5f6f64' }}>
            Reflections on remote archipelagos, dawn temple bells, mountain hospices, and the quiet beauty of taking the longer way.
          </p>

          <div className="journal-nav-bar">
            <div className="journal-filter-pills">
              {blogCategories.map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedBlogCat === cat ? 'active' : ''}`}
                  onClick={() => setSelectedBlogCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="tour-search" style={{ margin: 0, minWidth: '240px', height: 42 }}>
              <Search size={15} />
              <input
                placeholder="Search articles…"
                value={blogSearchQuery}
                onChange={e => setBlogSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {blogLoading ? (
          <p className="empty">Loading field stories…</p>
        ) : blogsList.length ? (
          <div className="journal-articles-grid">
            {blogsList.map(article => (
              <article
                className="journal-card"
                key={article.id}
                onClick={() => navigate(`/journal/${article.slug || article.id}`)}
              >
                <div
                  className="journal-card-cover"
                  style={{ backgroundImage: `url(${asset(article.image) || photos.coast})` }}
                >
                  <span className="journal-card-tag">{article.category || 'FIELD NOTES'}</span>
                </div>
                <div className="journal-card-body">
                  <div style={{ font: '9px "DM Mono", monospace', color: '#7a887e', letterSpacing: '1px' }}>
                    {article.read_time || '5 MIN READ'}
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt || article.content?.slice(0, 140) + '…'}</p>
                  <div className="journal-card-meta">
                    <span>By {article.author || 'Atlas Isle'}</span>
                    <span>{article.created_at || 'Recent'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon"><Compass size={21} /></div>
            <h3>No articles matching that criteria</h3>
            <p>Try clearing your search filters or browse all categories.</p>
            <button className="btn btn-outline" onClick={() => { setSelectedBlogCat('All'); setBlogSearchQuery('') }}>
              Reset filters
            </button>
          </div>
        )}

        <PublicFooter onNavigate={navigate} />
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </div>
    )
  }

  // 5. PUBLIC JOURNAL DETAIL PAGE
  if (route.view === 'journal-detail') {
    return (
      <div className="site">
        <PublicHeader
          active="journal"
          onNavigate={navigate}
          onOpenEnquiry={() => { setFormType('enquiry'); setFormOpen(true) }}
        />

        <main className="article-detail-wrap">
          <button
            className="text-link"
            onClick={() => navigate('/journal')}
            style={{ marginBottom: 28 }}
          >
            <ChevronLeft size={16} /> Back to Field Journal
          </button>

          {blogLoading ? (
            <p className="empty">Loading article…</p>
          ) : currentArticle ? (
            <article>
              <div className="article-header">
                <span className="eyebrow">{currentArticle.category?.toUpperCase() || 'FIELD NOTES'}</span>
                <h1>{currentArticle.title}</h1>
                <div className="article-meta-bar">
                  <span>By {currentArticle.author || 'Atlas & Isle'}</span>
                  <span>·</span>
                  <span>{currentArticle.created_at || 'Published recently'}</span>
                  <span>·</span>
                  <span>{currentArticle.read_time || '6 min read'}</span>
                </div>
              </div>

              <div
                className="article-cover-img"
                style={{ backgroundImage: `url(${asset(currentArticle.image) || photos.alps})` }}
              />

              <div className="article-prose">
                {currentArticle.content}
              </div>

              {currentArticle.tags && (
                <div className="article-tags-wrap">
                  {currentArticle.tags.split(',').map(tag => (
                    <span className="article-tag-badge" key={tag.trim()}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="related-articles-section">
                  <div className="eyebrow">CONTINUE READING</div>
                  <h3 style={{ font: '400 28px "Playfair Display", serif', margin: '8px 0 20px', color: '#27382d' }}>
                    Related field stories
                  </h3>
                  <div className="related-grid">
                    {relatedArticles.map(rel => (
                      <div
                        key={rel.id}
                        className="journal-card"
                        onClick={() => navigate(`/journal/${rel.slug || rel.id}`)}
                      >
                        <div
                          className="journal-card-cover"
                          style={{ height: 160, backgroundImage: `url(${asset(rel.image) || photos.morocco})` }}
                        />
                        <div className="journal-card-body" style={{ padding: 16 }}>
                          <span style={{ font: '8px "DM Mono", monospace', color: '#7a887e' }}>{rel.category}</span>
                          <h4 style={{ font: '400 17px "Playfair Display", serif', margin: '4px 0 8px', color: '#26342b' }}>
                            {rel.title}
                          </h4>
                          <span className="text-link" style={{ fontSize: '10px' }}>
                            Read story <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ) : (
            <div className="empty">
              <h3>Story not found</h3>
              <p>The requested journal piece is not published or has moved.</p>
              <button className="btn btn-outline" onClick={() => navigate('/journal')}>
                Return to Journal
              </button>
            </div>
          )}
        </main>

        <PublicFooter onNavigate={navigate} />
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </div>
    )
  }

  // 6. PUBLIC JOURNEYS / TOUR DETAIL PAGE
  if (route.view === 'journey-detail') {
    const tourMatch = tours.find(t => (t.slug && t.slug === route.param) || String(t.id) === String(route.param)) || selectedTour || tours[0]
    return (
      <div className="site">
        <PublicHeader
          active="journeys"
          onNavigate={navigate}
          onOpenEnquiry={() => { setFormType('enquiry'); setFormOpen(true) }}
        />
        <TourDetail
          tour={tourMatch}
          onBack={() => navigate('/journeys')}
          onEnquire={() => { setSelectedTour(tourMatch); setFormType('enquiry'); setFormOpen(true) }}
          onBook={() => { setSelectedTour(tourMatch); setFormType('booking'); setFormOpen(true) }}
        />
        <PublicFooter onNavigate={navigate} />
        {formOpen && (
          <LeadModal
            formType={formType}
            lead={lead}
            setLead={setLead}
            selectedTour={selectedTour}
            onSubmit={submitLead}
            onClose={() => setFormOpen(false)}
          />
        )}
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </div>
    )
  }

  // 7. PUBLIC JOURNEYS LIST PAGE
  if (route.view === 'journeys') {
    return (
      <div className="site">
        <PublicHeader
          active="journeys"
          onNavigate={navigate}
          onOpenEnquiry={() => { setFormType('enquiry'); setFormOpen(true) }}
        />
        <section className="section journeys" style={{ paddingTop: 40 }}>
          <div className="section-head">
            <div>
              <div className="eyebrow">OUR CURATED JOURNEYS</div>
              <h2>Where to <em>next?</em></h2>
            </div>
            <div className="tour-search" style={{ minWidth: 280, margin: 0 }}>
              <Search size={16} />
              <input
                placeholder="Search by destination or style…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="tour-grid">
            {filteredTours.map((t, i) => (
              <TourCard key={t.id} tour={t} index={i} open={() => openTour(t)} />
            ))}
          </div>
        </section>
        <PublicFooter onNavigate={navigate} />
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </div>
    )
  }

  // 8. PUBLIC HOME PAGE
  return (
    <div className="site">
      <PublicHeader
        active="home"
        onNavigate={navigate}
        onOpenEnquiry={() => { setFormType('enquiry'); setFormOpen(true) }}
      />

      <section className="hero" style={{ '--hero': `url(${photos.hero})` }}>
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="hero-kicker"><span /> FOR THE LOVE OF GOING</div>
          <h1>Find your<br /><em>elsewhere.</em></h1>
          <p>Journeys for the curious. Thoughtfully made,<br />beautifully unhurried, entirely your own.</p>
          <button className="btn btn-light" onClick={() => navigate('/journeys')}>
            Explore our journeys <ArrowDown size={15} />
          </button>
        </div>
        <div className="hero-note"><span>01 — 06</span><i /><span>PLACES THAT STAY WITH YOU</span></div>
        <div className="hero-coord">20° 13' 12.0" N&nbsp; · &nbsp;73° 25' 08.2" E</div>
      </section>

      <section className="intro-band">
        <span>IN GOOD COMPANY, ELSEWHERE</span>
        <p>Small groups. Local souls. <i>A little more wonder.</i></p>
        <span>EST. 2012&nbsp; · &nbsp;MADE FOR YOU</span>
      </section>

      {/* Journeys Grid Preview */}
      <section className="section journeys" id="journeys">
        <div className="section-head">
          <div>
            <div className="eyebrow">A FEW PLACES TO BEGIN</div>
            <h2>Where to <em>next?</em></h2>
          </div>
          <button className="text-link" onClick={() => navigate('/journeys')}>
            See all journeys <ArrowRight size={16} />
          </button>
        </div>
        <div className="tour-search">
          <Search size={17} />
          <input
            placeholder="Try `the sea', `slow mornings', or a place."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span>{filteredTours.length} journeys <ChevronDown size={14} /></span>
        </div>
        <div className="tour-grid">
          {filteredTours.slice(0, 6).map((t, i) => (
            <TourCard key={t.id} tour={t} index={i} open={() => openTour(t)} />
          ))}
        </div>
        <div className="center-action">
          <button className="btn btn-outline" onClick={() => navigate('/journeys')}>
            A little more inspiration <ArrowDown size={15} />
          </button>
        </div>
      </section>

      {/* Brand Manifesto */}
      <section className="manifesto" id="story">
        <div className="manifesto-image" style={{ backgroundImage: `url(${photos.kyoto})` }} />
        <div className="manifesto-copy">
          <div className="eyebrow">HOW WE TRAVEL</div>
          <h2>Not a vacation.<br />A <em>way of seeing.</em></h2>
          <p>We built Atlas & Isle on a simple belief: the world does not need more travel companies hurrying people through check-lists. It needs quieter ones that give you time to notice the light on the stones, the taste of morning bread, and the names of the people who made it.</p>
          <button className="btn btn-dark" onClick={() => { setFormType('enquiry'); setFormOpen(true) }}>
            Plan a journey with us <ArrowRight size={15} />
          </button>
          <div className="manifesto-sign">
            <span>THE FOUNDERS</span>
            <i>Atlas & Isle Travel Co.</i>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values">
        <div className="eyebrow">WHAT WE CARE ABOUT</div>
        <div className="values-grid">
          <div><span>01</span><h4>Small by design</h4><p>Never more than ten travellers. We fit around a single table and leave no heavy footprint.</p></div>
          <div><span>02</span><h4>Hosts, not guides</h4><p>We work with winemakers, historians, and storytellers who live where we go.</p></div>
          <div><span>03</span><h4>Unrushed mornings</h4><p>Time to wake, read, wander without an itinerary breathing down your neck.</p></div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="quote-section">
        <blockquote>
          “The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.”
        </blockquote>
        <cite>Marcel Proust</cite>
      </section>

      {/* Journal Preview Section (WITH PROPER ARTICLE LINKS) */}
      <section className="journal" id="journal">
        <div className="section-head">
          <div>
            <div className="eyebrow">FIELD NOTES</div>
            <h2>From the <em>journal.</em></h2>
          </div>
          <button className="text-link" onClick={() => navigate('/journal')}>
            Read all stories <ArrowRight size={15} />
          </button>
        </div>
        <div className="journal-grid">
          <article className="journal-feature" onClick={() => navigate('/journal/in-praise-of-taking-the-slow-ferry')}>
            <div className="journal-photo" style={{ backgroundImage: `url(${photos.coast})` }}>
              <span>ESSAY · 6 MIN READ</span>
            </div>
            <div className="journal-copy">
              <div className="eyebrow">COASTAL NOTES</div>
              <h3>In praise of taking<br />the slow ferry</h3>
              <p>Why the thirty-minute hydrofoil misses everything the old morning wooden boat was built to show you.</p>
              <span className="text-link">Read the story <ArrowRight size={15} /></span>
            </div>
          </article>
          <article className="journal-mini" onClick={() => navigate('/journal/architecture-of-silence-kyoto-dry-gardens')}>
            <div className="journal-photo" style={{ backgroundImage: `url(${photos.kyoto})` }}>
              <span>CULTURE · 8 MIN READ</span>
            </div>
            <div className="journal-copy">
              <div className="eyebrow">KYOTO DIARIES</div>
              <h3>The architecture of silence</h3>
              <span className="text-link">Take a look <ArrowRight size={15} /></span>
            </div>
          </article>
          <article className="journal-mini" onClick={() => navigate('/journal/finding-your-feet-in-high-dolomites')}>
            <div className="journal-photo" style={{ backgroundImage: `url(${photos.alps})` }}>
              <span>GOOD TO KNOW · 7 MIN READ</span>
            </div>
            <div className="journal-copy">
              <div className="eyebrow">A WALKING KIND OF HOLIDAY</div>
              <h3>Finding your feet<br />in the Dolomites</h3>
              <span className="text-link">Take a look <ArrowRight size={15} /></span>
            </div>
          </article>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta" id="contact">
        <div className="cta-text">
          <div className="eyebrow">YOUR NEXT CHAPTER, PERHAPS?</div>
          <h2>Somewhere is<br />calling <em>your name.</em></h2>
          <p>Tell us what you're dreaming about. We'll take it from there.</p>
          <button className="btn btn-light" onClick={() => { setFormType('enquiry'); setFormOpen(true) }}>
            Let's make a plan <ArrowRight size={15} />
          </button>
        </div>
        <div className="cta-image" style={{ backgroundImage: `url(${photos.morocco})` }} />
        <div className="cta-seal"><Compass size={25} /><span>GO<br />WELL</span></div>
      </section>

      <PublicFooter onNavigate={navigate} />

      {formOpen && (
        <LeadModal
          formType={formType}
          lead={lead}
          setLead={setLead}
          selectedTour={selectedTour}
          onSubmit={submitLead}
          onClose={() => setFormOpen(false)}
        />
      )}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}

// =========================================================================
// SUBCOMPONENTS
// =========================================================================

function PublicHeader({ active, onNavigate, onOpenEnquiry }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <header className="site-header">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('/') }}>
        <span className="brand-icon"><Compass size={19} /></span> atlas<span className="brand-amp">&</span>isle
      </a>
      <nav className={mobileOpen ? 'nav-open' : ''}>
        <a className={active === 'home' ? 'selected' : ''} href="#" onClick={(e) => { e.preventDefault(); onNavigate('/') }}>Home</a>
        <a className={active === 'journeys' ? 'selected' : ''} href="#" onClick={(e) => { e.preventDefault(); onNavigate('/journeys') }}>Journeys</a>
        <a className={active === 'story' ? 'selected' : ''} href="#" onClick={(e) => { e.preventDefault(); onNavigate('/#story') }}>Our story</a>
        <a className={active === 'journal' ? 'selected' : ''} href="#" onClick={(e) => { e.preventDefault(); onNavigate('/journal') }}>Journal</a>
        <a className={active === 'contact' ? 'selected' : ''} href="#" onClick={(e) => { e.preventDefault(); onNavigate('/#contact') }}>Contact</a>
        <button className="mobile-admin" onClick={() => onNavigate('/portal')}>
          My Bookings <CalendarDays size={15} />
        </button>
      </nav>
      <div className="header-right">
        <button className="admin-link" onClick={() => onNavigate('/portal')} style={{ marginRight: 8 }}>
          My Bookings <CalendarDays size={14} />
        </button>
        <button className="admin-link" onClick={() => onNavigate('/admin/dashboard')}>
          Admin <ArrowUpRight size={14} />
        </button>
        <button className="menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}

function PublicFooter({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('/') }}>
            <span className="brand-icon"><Compass size={19} /></span> atlas<span className="brand-amp">&</span>isle
          </a>
          <p>Journeys for the curious.<br />Made with care, wherever you are.</p>
          <div className="socials">
            <a href="https://instagram.com" aria-label="Instagram"><Instagram size={16} /></a>
            <a href="https://www.google.com/maps" aria-label="Find us"><MapPin size={16} /></a>
          </div>
        </div>
        <div>
          <span className="footer-label">THE GOOD STUFF</span>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/journeys') }}>Our journeys</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/#story') }}>Our story</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/journal') }}>Field notes</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/portal') }}>Traveller Portal</a>
        </div>
        <div>
          <span className="footer-label">HERE FOR YOU</span>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/#contact') }}>Get in touch</a>
          <a href="mailto:hello@atlasandisle.com">hello@atlasandisle.com</a>
          <a href="tel:+919641243721">+91 96412 43721</a>
        </div>
        <div className="newsletter">
          <span className="footer-label">THE OCCASIONAL POSTCARD</span>
          <p>Good ideas for getting out there. No noise.</p>
          <form onSubmit={async e => {
            e.preventDefault()
            const form = e.currentTarget
            try {
              await request('/public/subscribers', { method: 'POST', body: { email: form.elements[0].value } })
              alert('You are on the postcard list.')
              form.reset()
            } catch (err) {
              alert(err.message)
            }
          }}>
            <input type="email" required placeholder="Your email address" />
            <button aria-label="Subscribe"><ArrowRight size={16} /></button>
          </form>
          <small>By subscribing, you agree to our occasional notes.</small>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ATLAS & ISLE TRAVEL CO.</span>
        <span>GO A LITTLE FURTHER, A LITTLE LIGHTER.</span>
        <span><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/portal') }}>Traveller Login</a> &nbsp;·&nbsp; <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/admin/login') }}>Admin Login</a></span>
      </div>
    </footer>
  )
}

function LeadModal({ formType, lead, setLead, selectedTour, onSubmit, onClose }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="lead-modal" onSubmit={onSubmit}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">LET'S GET YOU THERE</div>
            <h2>{formType === 'booking' ? 'Request your place.' : 'Tell us what you are dreaming about.'}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}><X /></button>
        </div>
        <p className="modal-intro">A little about you and the journey on your mind. A real person from our team will reply within one working day.</p>
        <div className="form-grid">
          <label>Your name<input required value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} /></label>
          <label>Email address<input type="email" required value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} /></label>
          <label>Phone number<input required value={lead.mobile} onChange={e => setLead({ ...lead, mobile: e.target.value })} /></label>
          <label>Travellers<input type="number" min="1" value={lead.travellers} onChange={e => setLead({ ...lead, travellers: e.target.value })} /></label>
          <label>Preferred travel date<input type="date" required={formType === 'booking'} value={lead.travel_date} onChange={e => setLead({ ...lead, travel_date: e.target.value })} /></label>
          <label className="wide">
            What's on your mind?
            <textarea
              rows="3"
              value={lead.message}
              onChange={e => setLead({ ...lead, message: e.target.value })}
              placeholder={selectedTour ? `I'd love to know more about ${selectedTour.title}.` : 'Tell us a little about the kind of trip you have in mind.'}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-quiet" onClick={onClose}>Maybe later</button>
          <button className="btn btn-dark">
            {formType === 'booking' ? 'Send booking request' : 'Send your enquiry'} <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  )
}

function TourCard({ tour, index, open }) {
  return (
    <article className={`tour-card card-${index % 3}`} onClick={open}>
      <div className="tour-photo" style={{ backgroundImage: `url(${asset(tour.image) || photos.bali})` }}>
        <span className="tour-badge">{tour.type || 'CURATED JOURNEY'}</span>
        <div className="tour-meta">
          <span><CalendarDays size={13} /> {tour.duration}</span>
          <span>From ₹{Number(tour.price).toLocaleString()}</span>
        </div>
      </div>
      <div className="tour-info">
        <span className="tour-place"><MapPin size={12} /> {tour.destination}</span>
        <h3>{tour.title}</h3>
        <p>{tour.description}</p>
        <div className="tour-action">
          <span>Explore itinerary</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </article>
  )
}

function TourDetail({ tour, onBack, onEnquire, onBook }) {
  return (
    <main className="detail-page">
      <button className="text-link back-link" onClick={onBack}><ChevronLeft size={16} /> All journeys</button>
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(0deg,rgba(21,30,29,.58),transparent 60%),url(${asset(tour.image) || photos.bali})` }}>
        <span>{tour.type || 'CURATED JOURNEY'} · {tour.duration}</span>
        <h1>{tour.title}</h1>
        <p><MapPin size={14} /> {tour.destination}</p>
      </div>
      <div className="detail-layout">
        <div className="detail-copy">
          <div className="eyebrow">THE JOURNEY</div>
          <h2>A place to slow down<br />and <em>look closer.</em></h2>
          <p>{tour.description || 'A thoughtful journey with local hosts, considered stays, and room for the unexpected.'}</p>
          <h3>What you'll remember</h3>
          <ul>
            <li>Stays chosen for their warmth and sense of place</li>
            <li>Small group of curious, like-minded travellers</li>
            <li>Local hosts who welcome you like an old friend</li>
            <li>Time to take the longer, lovelier way</li>
          </ul>
          <h3>A note on the details</h3>
          <p>Every journey is shaped around the season and the people who bring it to life. Tell us what matters to you and we will make sure it feels like yours.</p>
        </div>
        <aside className="detail-book">
          <div className="eyebrow">YOUR JOURNEY, YOUR WAY</div>
          <h3>From ₹{Number(tour.price).toLocaleString()} <small>/ person</small></h3>
          <p>{tour.duration} · Small group journey</p>
          <button className="btn btn-dark full" onClick={onBook}>Request a booking <ArrowRight size={15} /></button>
          <button className="text-link" onClick={onEnquire}>I have a question</button>
          <span><ShieldCheck size={14} /> No commitment, just a conversation</span>
        </aside>
      </div>
    </main>
  )
}

function CustomerBookingCard({ booking, onOpen }) {
  return (
    <div className="portal-booking-card">
      <div className="portal-booking-header">
        <div className="portal-booking-title">
          <span className="eyebrow">{booking.booking_id}</span>
          <h3>{booking.package_title}</h3>
          <span style={{ fontSize: '12px', color: '#68776d' }}>
            <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {booking.destination}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`status status-${booking.status}`}>{booking.status}</span>
        </div>
      </div>
      <div className="portal-booking-grid">
        <div><small>TRAVEL DATE</small><b>{booking.travel_date || 'TBD'}</b></div>
        <div><small>GUESTS</small><b>{booking.travellers} guest(s)</b></div>
        <div><small>TOTAL</small><b>₹{Number(booking.total_amount).toLocaleString()}</b></div>
        <div><small>PAYMENT</small><b style={{ textTransform: 'capitalize' }}>{booking.payment_status}</b></div>
      </div>
      <div className="portal-booking-footer">
        <span style={{ fontSize: '10px', color: '#88958c' }}>Booked on {booking.created_at}</span>
        <button className="btn btn-outline" onClick={onOpen} style={{ fontSize: '11px', padding: '8px 16px' }}>
          View Details & Itinerary <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

function ModuleIcon({ name }) {
  const icons = {
    overview: Compass, enquiries: Send, bookings: CalendarDays, customers: Users,
    packages: Globe2, destinations: MapPin, quotations: BadgeCheck, payments: Receipt,
    invoices: FileText, documents: FileText, 'follow-ups': Clock, hotels: Star,
    transport: ArrowRight, blogs: Compass, offers: Sparkles, gallery: Heart,
    reports: ArrowUpRight, settings: ShieldCheck
  }
  const I = icons[name] || Compass
  return <I size={16} />
}

// Global Search Component (Section 25 of Documentation)
function GlobalSearch({ token, onSelect }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    const timer = setTimeout(() => {
      setLoading(true)
      request(`/admin/search?q=${encodeURIComponent(q.trim())}`, { token })
        .then(d => setResults(d))
        .catch(() => setResults(null))
        .finally(() => setLoading(false))
    }, 280)
    return () => clearTimeout(timer)
  }, [q, token])

  return (
    <div className="global-search-box">
      <div className="admin-search" style={{ margin: 0, width: '100%' }}>
        <Search size={16} />
        <input
          placeholder="Search everything (name, email, booking #, invoice)…"
          value={q}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setQ(e.target.value)
            setOpen(true)
          }}
        />
        {q && <button type="button" onClick={() => { setQ(''); setResults(null) }} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 2, color: '#849187' }}><X size={14} /></button>}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="global-search-dropdown">
          {loading && <div className="search-loading-state">Searching across records…</div>}
          {!loading && results && results.total === 0 && (
            <div className="search-empty-state">No matching records found for "{q}"</div>
          )}
          {!loading && results && results.total > 0 && (
            <div>
              {Object.entries(results.categories || {}).map(([catKey, items]) => (
                <div key={catKey}>
                  <div className="search-cat-head">
                    <span>{catKey.toUpperCase()}</span>
                    <span>{items.length}</span>
                  </div>
                  {items.map(item => (
                    <div
                      key={`${item.module}-${item.id}`}
                      className="search-res-item"
                      onClick={() => {
                        setOpen(false)
                        setQ('')
                        onSelect(item.module, item.record)
                      }}
                    >
                      <div className="search-res-left">
                        <span className="search-res-title">{item.title}</span>
                        <span className="search-res-sub">{item.subtitle}</span>
                      </div>
                      <span className="search-res-badge">{item.badge || item.module}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Complete Section 5 Compliant Admin Dashboard
function Dashboard({ data, setAdminPage }) {
  const symbol = data?.currency_symbol || '₹'

  return (
    <div className="dashboard">
      <div className="welcome-card">
        <div>
          <div className="eyebrow">EXECUTIVE WORKSPACE</div>
          <h2>Good things are <em>happening.</em></h2>
          <p>Here is your operational pulse across enquiries, tours, and revenue.</p>
        </div>
        <div className="welcome-orbit">
          <Compass size={31} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 14 KPI Statistics Grid (Section 5 of PDF) */}
      <div className="section-stats-wrap">
        <div className="stat-pill-card" onClick={() => setAdminPage('enquiries')}>
          <span>TOTAL ENQUIRIES</span>
          <b>{data?.total_enquiries ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('enquiries')}>
          <span>NEW ENQUIRIES</span>
          <b style={{ color: '#2b5c43' }}>{data?.new_enquiries ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('customers')}>
          <span>TOTAL CUSTOMERS</span>
          <b>{data?.total_customers ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('customers')}>
          <span>ACTIVE CUSTOMERS</span>
          <b>{data?.active_customers ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('bookings')}>
          <span>TOTAL BOOKINGS</span>
          <b>{data?.total_bookings ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('bookings')}>
          <span>PENDING BOOKINGS</span>
          <b style={{ color: '#c46949' }}>{data?.pending_bookings ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('bookings')}>
          <span>CONFIRMED BOOKINGS</span>
          <b>{data?.confirmed_bookings ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('bookings')}>
          <span>CANCELLED BOOKINGS</span>
          <b>{data?.cancelled_bookings ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('bookings')}>
          <span>COMPLETED TOURS</span>
          <b>{data?.completed_tours ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('bookings')}>
          <span>UPCOMING DEPARTURES</span>
          <b style={{ color: '#315c47' }}>{data?.upcoming_departures ?? 0}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('payments')}>
          <span>TOTAL REVENUE</span>
          <b>{symbol}{Number(data?.total_revenue ?? 0).toLocaleString()}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('payments')}>
          <span>PAID AMOUNT</span>
          <b>{symbol}{Number(data?.paid_amount ?? 0).toLocaleString()}</b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('bookings')}>
          <span>OUTSTANDING DUE</span>
          <b style={{ color: (data?.outstanding_amount ?? 0) > 0 ? '#b5583b' : '#315c47' }}>
            {symbol}{Number(data?.outstanding_amount ?? 0).toLocaleString()}
          </b>
        </div>
        <div className="stat-pill-card" onClick={() => setAdminPage('payments')}>
          <span>PENDING PAYMENTS</span>
          <b>{data?.pending_payments ?? 0}</b>
        </div>
      </div>

      {/* Multi-Dimensional Charts Grid */}
      <div className="activity-charts">
        <div className="chart-card">
          <div className="eyebrow">DEMAND, AT A GLANCE</div>
          <h3>Monthly Enquiries & Bookings</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.chart || []} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="enq-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64866c" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#64866c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0eb" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#89948a' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#89948a' }} />
              <Tooltip />
              <Area type="monotone" dataKey="enquiries" stroke="#64866c" fill="url(#enq-fill)" strokeWidth={2} name="Enquiries" />
              <Area type="monotone" dataKey="bookings" stroke="#d89370" fill="transparent" strokeWidth={2} name="Bookings" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="eyebrow">FINANCIAL PERFORMANCE</div>
          <h3>Revenue Trends ({symbol})</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.chart || []} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0eb" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#89948a' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#89948a' }} />
              <Tooltip formatter={val => `${symbol}${Number(val).toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#7d9883" radius={[3, 3, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Destinations & Package Performance */}
      <div className="activity-charts">
        <div className="chart-card">
          <div className="eyebrow">DESTINATIONS</div>
          <h3>Popular Destinations</h3>
          {(data?.popular_destinations || []).length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.popular_destinations} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf0eb" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#89948a' }} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#627065' }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8ba28b" radius={[0, 3, 3, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty" style={{ padding: 30 }}>No destination booking data recorded yet.</p>
          )}
        </div>

        <div className="chart-card">
          <div className="eyebrow">PACKAGE PERFORMANCE</div>
          <h3>Top Booked Journeys</h3>
          {(data?.package_performance || []).length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {data.package_performance.map((pkg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fafbf9', border: '1px solid #edf1eb', borderRadius: 2 }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#27382d' }}>{pkg.title}</span>
                  <div style={{ fontSize: '10px', color: '#68776d' }}>
                    <b>{pkg.bookings}</b> bookings · {symbol}{Number(pkg.revenue).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty" style={{ padding: 30 }}>No package booking history yet.</p>
          )}
        </div>
      </div>

      {/* Recent Activity Quad Feeds */}
      <div className="activity-quad-grid">
        {/* Recent Enquiries */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div>
              <div className="eyebrow">INBOX</div>
              <h3>Recent Enquiries</h3>
            </div>
            <button onClick={() => setAdminPage('enquiries')}>See all <ArrowRight size={14} /></button>
          </div>
          {(data?.recent_enquiries || []).length ? (
            data.recent_enquiries.map((x, i) => (
              <div className="activity-row" key={x.id}>
                <div className={`activity-dot dot-${i % 3}`}>{(x.name || '?').slice(0, 1)}</div>
                <div>
                  <b>{x.name}</b>
                  <small>{x.package?.title || x.email || 'Website enquiry'}</small>
                </div>
                <span>{x.created_at}</span>
              </div>
            ))
          ) : (
            <div className="empty small-empty"><Send size={18} /><p>No enquiries yet.</p></div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div>
              <div className="eyebrow">BOOKINGS</div>
              <h3>Recent Bookings</h3>
            </div>
            <button onClick={() => setAdminPage('bookings')}>See all <ArrowRight size={14} /></button>
          </div>
          {(data?.recent_bookings || []).length ? (
            data.recent_bookings.map((b) => (
              <div className="activity-row" key={b.id}>
                <div className="activity-dot dot-1"><CalendarDays size={13} /></div>
                <div>
                  <b>#{b.id} — {b.customer_name || b.email || 'Guest'}</b>
                  <small>{b.destination || b.package_name || 'Curated journey'} · Status: {b.status}</small>
                </div>
                <span>{b.created_at}</span>
              </div>
            ))
          ) : (
            <div className="empty small-empty"><CalendarDays size={18} /><p>No bookings yet.</p></div>
          )}
        </div>

        {/* Pending Actions */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div>
              <div className="eyebrow">ACTION REQUIRED</div>
              <h3>Pending Tasks</h3>
            </div>
          </div>
          {(data?.pending_actions || []).length ? (
            data.pending_actions.map((act, i) => (
              <div className="activity-row" key={i}>
                <div className="activity-dot dot-2"><Clock size={13} /></div>
                <div>
                  <b>{act.title}</b>
                  <small>{act.subtitle}</small>
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => setAdminPage(act.target_module)}
                  style={{ fontSize: '9px', padding: '4px 8px' }}
                >
                  {act.action_label}
                </button>
              </div>
            ))
          ) : (
            <div className="empty small-empty"><Check size={18} /><p>All inbox items are up to date!</p></div>
          )}
        </div>

        {/* Upcoming Departures */}
        <div className="dash-card departures">
          <div className="eyebrow">UP NEXT</div>
          <h3>Departures Horizon</h3>
          <div className="departure-number">
            {data?.upcoming_departures ?? 0}
            <span>upcoming journeys</span>
          </div>
          <p>Carefully planned small groups departing soon.</p>
          <button className="text-link" onClick={() => setAdminPage('bookings')}>
            View upcoming schedule <ArrowRight size={14} />
          </button>
          <div className="departure-compass"><Compass size={48} /></div>
        </div>
      </div>

      <div className="dash-footer-note">
        <Sparkles size={15} /> Atlas & Isle Private Administration · Single Admin Workspace
      </div>
    </div>
  )
}

function ReportsPanel({ data, loading, from, to, setFrom, setTo }) {
  const exportCsv = () => {
    if (!data) return
    const rows = [
      ['Metric', 'Value'],
      ['Customers', data.customers],
      ['Enquiries', data.enquiries],
      ['Converted enquiries', data.converted_enquiries],
      ['Conversion rate', `${data.conversion_rate}%`],
      ['Bookings', data.bookings],
      ['Confirmed bookings', data.confirmed_bookings],
      ['Cancelled bookings', data.cancelled_bookings],
      ['Completed bookings', data.completed_bookings],
      ['Revenue', data.revenue],
      [],
      ['Month', 'Enquiries', 'Bookings', 'Revenue'],
      ...(data.timeline || []).map(x => [x.month, x.enquiries, x.bookings, x.revenue])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'atlas-crm-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="empty">Preparing your report…</div>

  return (
    <div className="reports-panel">
      <div className="reports-toolbar">
        <div>
          <div className="eyebrow">MEASURE WHAT MATTERS</div>
          <p>Choose a date range; the report updates from CRM records.</p>
        </div>
        <label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        <button className="btn btn-outline" onClick={() => window.print()}>Print report</button>
        <button className="btn btn-dark" onClick={exportCsv}>Export CSV</button>
      </div>

      {data && (
        <>
          <div className="report-stats">
            {[
              ['Customers', data.customers],
              ['Enquiries', data.enquiries],
              ['Conversion', `${data.conversion_rate}%`],
              ['Bookings', data.bookings],
              ['Collected', `₹${Number(data.revenue || 0).toLocaleString()}`]
            ].map(([k, v]) => (
              <div key={k}><span>{k}</span><b>{v}</b></div>
            ))}
          </div>

          <div className="chart-card report-chart">
            <div className="eyebrow">MONTHLY PERFORMANCE</div>
            <h3>Enquiries, Bookings & Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.timeline || []} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0eb" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#89948a' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#89948a' }} />
                <Tooltip formatter={val => typeof val === 'number' && val > 100 ? `₹${Number(val).toLocaleString()}` : val} />
                <Bar dataKey="enquiries" fill="#8ba28b" name="Enquiries" />
                <Bar dataKey="bookings" fill="#d89370" name="Bookings" />
                <Bar dataKey="revenue" fill="#9ca8c0" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

export default App
