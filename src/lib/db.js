import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin as supabase } from './supabase-admin.js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const TABLES = {
  siteSettings: 'site_settings',
  businessCategories: 'business_categories',
  businessItems: 'business_items',
  stats: 'stats',
  news: 'news',
  csrPrograms: 'csr_programs',
  investorContent: 'investor_content',
}

const DEFAULT_PAGE_CONTENT = {
  homeTitle: 'Untuk Indonesia\nyang lebih baik',
  homeDesc: 'Our Businesses',
  homeSubDesc: "CT Corp is Indonesia's leading consumer-centric diversified group & ecosystem employing more than 100,000 people regionally.",
  homeHeroImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  siteLogo: '',
  statsBgImg: '',
  whoWeAreText: 'Our Founder Prof. Dr. Chairul Tanjung grew CT Corp to be a massive business ecosystem.',
  whoWeAreImg: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
  privacyText: 'Protecting the security and privacy of your personal data is important to CT Corp.',
  termsText: 'This web site is provided by CT Corp and may be used for informational purposes only.',
  businessText: 'Our diversified business verticals.',
  investorText: 'Investor relations information.',
}

function dbError(error) {
  if (!error) return null
  const details = error.details ? ` (${error.details})` : ''
  return new Error(`${error.message}${details}`)
}

async function result(query) {
  const { data, error } = await query
  if (error) throw dbError(error)
  return data
}

function mapCategory(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    desc: row.description,
    content: row.content,
    linkUrl: row.link_url,
    order: row.order,
    createdAt: row.created_at,
  }
}

function categoryToDb(data) {
  return {
    title: data.title,
    image_url: data.imageUrl || null,
    description: data.desc || null,
    content: data.content || null,
    link_url: data.linkUrl || null,
    order: Number(data.order || 0),
  }
}

function mapBusinessItem(row) {
  if (!row) return null
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    order: row.order,
    createdAt: row.created_at,
  }
}

function businessItemToDb(data) {
  return {
    category_id: data.categoryId,
    title: data.title,
    image_url: data.imageUrl,
    link_url: data.linkUrl || null,
    order: Number(data.order || 0),
  }
}

function mapNews(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.image_url,
    published: row.published,
    date: row.date,
    order: row.order,
    createdAt: row.created_at,
  }
}

function newsToDb(data) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || '',
    content: data.content || '',
    image_url: data.imageUrl || '',
    published: Boolean(data.published),
    order: Number(data.order || 0),
  }
}

function mapCsr(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.image_url,
    category: row.category,
    date: row.date,
    order: row.order,
    createdAt: row.created_at,
  }
}

function csrToDb(data) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || '',
    content: data.content || '',
    image_url: data.imageUrl || '',
    category: data.category || '',
    order: Number(data.order || 0),
  }
}

function mapInvestor(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    fileUrl: row.file_url,
    content: row.content,
    year: row.year,
    quarter: row.quarter,
    published: row.published,
    order: row.order,
    createdAt: row.created_at,
  }
}

function investorToDb(data) {
  return {
    title: data.title,
    type: data.type || 'report',
    file_url: data.fileUrl || '',
    content: data.content || '',
    year: data.year || null,
    quarter: data.quarter || null,
    published: Boolean(data.published),
    order: Number(data.order || 0),
  }
}

export async function getPageContent() {
  const { data, error } = await supabase
    .from(TABLES.siteSettings)
    .select('data')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw dbError(error)
  return { ...DEFAULT_PAGE_CONTENT, ...(data?.data || {}) }
}

export async function upsertPageContent(partial) {
  const current = await getPageContent()
  const next = { ...current, ...partial }

  await result(
    supabase
      .from(TABLES.siteSettings)
      .upsert({ id: 1, data: next })
      .select()
      .single()
  )

  return next
}

export async function listBusinessCategories({ withItems = false } = {}) {
  const rows = await result(
    supabase
      .from(TABLES.businessCategories)
      .select('*')
      .order('order', { ascending: true })
  )
  const categories = rows.map(mapCategory)

  if (!withItems || categories.length === 0) return categories

  const itemRows = await result(
    supabase
      .from(TABLES.businessItems)
      .select('*')
      .in('category_id', categories.map((category) => category.id))
      .order('order', { ascending: true })
  )
  const items = itemRows.map(mapBusinessItem)

  return categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.categoryId === category.id),
  }))
}

export async function createBusinessCategory(data) {
  const row = await result(
    supabase
      .from(TABLES.businessCategories)
      .insert(categoryToDb(data))
      .select()
      .single()
  )
  return mapCategory(row)
}

export async function updateBusinessCategory(id, data) {
  const row = await result(
    supabase
      .from(TABLES.businessCategories)
      .update(categoryToDb(data))
      .eq('id', id)
      .select()
      .single()
  )
  return mapCategory(row)
}

export async function deleteBusinessCategoryById(id) {
  const { error } = await supabase.from(TABLES.businessCategories).delete().eq('id', id)
  if (error) throw dbError(error)
}

export async function createBusinessItem(data) {
  const row = await result(
    supabase
      .from(TABLES.businessItems)
      .insert(businessItemToDb(data))
      .select()
      .single()
  )
  return mapBusinessItem(row)
}

export async function updateBusinessItem(id, data) {
  const row = await result(
    supabase
      .from(TABLES.businessItems)
      .update(businessItemToDb(data))
      .eq('id', id)
      .select()
      .single()
  )
  return mapBusinessItem(row)
}

export async function deleteBusinessItemById(id) {
  const { error } = await supabase.from(TABLES.businessItems).delete().eq('id', id)
  if (error) throw dbError(error)
}

export async function listStats() {
  return result(supabase.from(TABLES.stats).select('*').order('order', { ascending: true }))
}

export async function createStat(data) {
  return result(supabase.from(TABLES.stats).insert(data).select().single())
}

export async function updateStat(id, data) {
  return result(supabase.from(TABLES.stats).update(data).eq('id', id).select().single())
}

export async function deleteStatById(id) {
  const { error } = await supabase.from(TABLES.stats).delete().eq('id', id)
  if (error) throw dbError(error)
}

export async function listNews({ published } = {}) {
  let query = supabase.from(TABLES.news).select('*')
  if (published !== undefined) query = query.eq('published', published)
  const rows = await result(query.order('order', { ascending: true }).order('date', { ascending: false }))
  return rows.map(mapNews)
}

export async function listNewsSlugs() {
  return result(supabase.from(TABLES.news).select('slug').eq('published', true))
}

export async function getNewsBySlug(slug) {
  const { data, error } = await supabase
    .from(TABLES.news)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw dbError(error)
  return mapNews(data)
}

export async function newsSlugExists(slug) {
  const { data, error } = await supabase
    .from(TABLES.news)
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw dbError(error)
  return Boolean(data)
}

export async function createNews(data) {
  const row = await result(supabase.from(TABLES.news).insert(newsToDb(data)).select().single())
  return mapNews(row)
}

export async function updateNews(id, data) {
  const row = await result(supabase.from(TABLES.news).update(newsToDb(data)).eq('id', id).select().single())
  return mapNews(row)
}

export async function deleteNewsById(id) {
  const { error } = await supabase.from(TABLES.news).delete().eq('id', id)
  if (error) throw dbError(error)
}

export async function listCsrPrograms() {
  const rows = await result(
    supabase
      .from(TABLES.csrPrograms)
      .select('*')
      .order('order', { ascending: true })
      .order('date', { ascending: false })
  )
  return rows.map(mapCsr)
}

export async function listCsrSlugs() {
  return result(supabase.from(TABLES.csrPrograms).select('slug'))
}

export async function getCsrBySlug(slug) {
  const { data, error } = await supabase
    .from(TABLES.csrPrograms)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw dbError(error)
  return mapCsr(data)
}

export async function csrSlugExists(slug) {
  const { data, error } = await supabase
    .from(TABLES.csrPrograms)
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw dbError(error)
  return Boolean(data)
}

export async function createCsrProgram(data) {
  const row = await result(supabase.from(TABLES.csrPrograms).insert(csrToDb(data)).select().single())
  return mapCsr(row)
}

export async function updateCsrProgram(id, data) {
  const row = await result(supabase.from(TABLES.csrPrograms).update(csrToDb(data)).eq('id', id).select().single())
  return mapCsr(row)
}

export async function deleteCsrById(id) {
  const { error } = await supabase.from(TABLES.csrPrograms).delete().eq('id', id)
  if (error) throw dbError(error)
}

export async function listInvestorContent({ published } = {}) {
  let query = supabase.from(TABLES.investorContent).select('*')
  if (published !== undefined) query = query.eq('published', published)
  const rows = await result(query.order('order', { ascending: true }).order('created_at', { ascending: false }))
  return rows.map(mapInvestor)
}

export async function createInvestorContent(data) {
  const row = await result(supabase.from(TABLES.investorContent).insert(investorToDb(data)).select().single())
  return mapInvestor(row)
}

export async function updateInvestorContent(id, data) {
  const row = await result(supabase.from(TABLES.investorContent).update(investorToDb(data)).eq('id', id).select().single())
  return mapInvestor(row)
}

export async function deleteInvestorById(id) {
  const { error } = await supabase.from(TABLES.investorContent).delete().eq('id', id)
  if (error) throw dbError(error)
}

export async function signInAdminUser(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
  if (error || !data?.user) throw dbError(error || { message: 'Login failed' })

  return {
    id: data.user.id,
    email: data.user.email,
    role: 'admin',
    name: data.user.user_metadata?.name || data.user.email,
  }
}

export async function upsertAdminAuthUser(email, password) {
  const name = 'Default Admin'
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw dbError(listError)

  const existing = listData.users.find((user) => user.email === email)
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name },
    })
    if (error) throw dbError(error)
    return {
      id: data.user.id,
      email: data.user.email,
      role: 'admin',
      name,
    }
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (error) throw dbError(error)

  return {
    id: data.user.id,
    email: data.user.email,
    role: 'admin',
    name,
  }
}
