'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import {
  createBusinessCategory,
  createBusinessItem,
  createCsrProgram,
  createInvestorContent,
  createNews,
  createStat,
  csrSlugExists,
  deleteBusinessCategoryById,
  deleteBusinessItemById,
  deleteCsrById,
  deleteInvestorById,
  deleteNewsById,
  deleteStatById,
  newsSlugExists,
  signInAdminUser,
  updateBusinessCategory,
  updateBusinessItem,
  updateCsrProgram,
  updateInvestorContent,
  updateNews,
  updateStat,
  upsertAdminAuthUser,
  upsertPageContent,
} from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { setAdminSession, clearAdminSession, requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

const STORAGE_BUCKET = 'public'

export async function uploadImageAction(formData) {
  const file = formData.get('file')
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName)

  return { url: publicUrl }
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || `item-${Date.now()}`
}

export async function loginAction(formData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) redirect('/admin/login?error=1')

  try {
    const user = await signInAdminUser(email, password)
    await setAdminSession(user)
    revalidatePath('/', 'layout')
    redirect('/admin')
  } catch {
    redirect('/admin/login?error=1')
  }
}

export async function seedDefaultAdminAction() {
  const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ctcorp.id'
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'
  try {
    await upsertAdminAuthUser(defaultEmail, defaultPass)
  } catch (error) {
    console.error('[Seed Admin Error]', error)
    redirect('/admin/login?serviceKey=1')
  }
  redirect('/admin/login?seeded=1')
}

export async function logoutAction() {
  await clearAdminSession()
  redirect('/admin/login')
}

export async function updatePageContent(formData) {
  await requireAuth()
  const data = {}
  for (const key of [
    'homeTitle', 'homeDesc', 'homeSubDesc', 'homeHeroImg',
    'siteLogo', 'statsBgImg',
    'whoWeAreText', 'whoWeAreImg',
    'privacyText', 'termsText',
    'businessText', 'investorText',
  ]) {
    const v = formData.get(key)
    if (v != null) data[key] = String(v)
  }

  // Handle Home Hero Image Upload
  const heroFile = formData.get('homeHeroImgFile')
  if (heroFile && heroFile.size > 0) {
    const ext = heroFile.name.split('.').pop()
    const fileName = `hero-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, heroFile, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      data.homeHeroImg = publicUrl
    }
  }

  const logoFile = formData.get('siteLogoFile')
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop()
    const fileName = `logo-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, logoFile, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      data.siteLogo = publicUrl
    }
  }

  const statsFile = formData.get('statsBgImgFile')
  if (statsFile && statsFile.size > 0) {
    const ext = statsFile.name.split('.').pop()
    const fileName = `stats-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, statsFile, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      data.statsBgImg = publicUrl
    }
  }

  // Handle Who We Are Image Upload
  const whoFile = formData.get('whoWeAreImgFile')
  if (whoFile && whoFile.size > 0) {
    const ext = whoFile.name.split('.').pop()
    const fileName = `who-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, whoFile, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      data.whoWeAreImg = publicUrl
    }
  }
  await upsertPageContent(data)
  revalidatePath('/', 'layout')
  redirect('/admin?tab=pages')
}

export async function upsertBusinessCategory(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const title = String(formData.get('title') || '').trim()
  if (!title) redirect('/admin?tab=business')

  // Handle category image upload
  let imageUrl = String(formData.get('existingImageUrl') || '')
  const file = formData.get('catImageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `category-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      imageUrl = publicUrl
    } else {
      console.error('[Upload Category Image Error]', error.message, error)
    }
  }

  const payload = {
    title,
    imageUrl: imageUrl || null,
    order: Number(formData.get('order') || 0),
  }
  if (id) {
    await updateBusinessCategory(id, payload)
  } else {
    await createBusinessCategory(payload)
  }
  revalidatePath('/', 'layout')
  redirect('/admin?tab=business')
}

export async function deleteBusinessCategory(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (id) {
    await deleteBusinessCategoryById(id)
  }
  revalidatePath('/', 'layout')
  redirect('/admin?tab=business')
}

export async function upsertBusinessItem(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const categoryId = Number(formData.get('categoryId'))
  const title = String(formData.get('title') || '').trim()
  if (!title || !categoryId) redirect('/admin?tab=business')

  let imageUrl = String(formData.get('existingImageUrl') || '')
  const file = formData.get('imageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `brand-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      imageUrl = publicUrl
    }
  }

  const payload = {
    categoryId,
    title,
    imageUrl,
    linkUrl: String(formData.get('linkUrl') || '').trim() || null,
    order: Number(formData.get('order') || 0),
  }

  if (id) {
    await updateBusinessItem(id, payload)
  } else {
    await createBusinessItem(payload)
  }

  revalidatePath('/', 'layout')
  redirect('/admin?tab=business')
}

export async function deleteBusinessItem(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (id) {
    await deleteBusinessItemById(id)
  }
  revalidatePath('/', 'layout')
  redirect('/admin?tab=business')
}

export async function upsertStat(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const value = String(formData.get('value') || '').trim()
  const label = String(formData.get('label') || '').trim()
  if (!value || !label) redirect('/admin?tab=stats')
  const payload = { value, label, order: Number(formData.get('order') || 0) }
  if (id) await updateStat(id, payload)
  else await createStat(payload)
  revalidatePath('/', 'layout')
  redirect('/admin?tab=stats')
}

export async function deleteStat(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await deleteStatById(id)
  revalidatePath('/', 'layout')
  redirect('/admin?tab=stats')
}

export async function upsertNews(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const title = String(formData.get('title') || '').trim()
  if (!title) redirect('/admin?tab=news')
  const slugBase = slugify(formData.get('slug') || title)
  
  let imageUrl = String(formData.get('existingImageUrl') || '')
  const file = formData.get('imageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `news-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      imageUrl = publicUrl
    }
  }

  const payload = {
    title,
    slug: slugBase,
    excerpt: String(formData.get('excerpt') || ''),
    content: String(formData.get('content') || ''),
    imageUrl,
    published: formData.get('published') === 'on',
    order: Number(formData.get('order') || 0),
  }
  if (id) {
    await updateNews(id, payload)
  } else {
    let slug = slugBase
    let i = 1
    while (await newsSlugExists(slug)) {
      slug = `${slugBase}-${i++}`
    }
    await createNews({ ...payload, slug })
  }
  revalidatePath('/news', 'layout')
  redirect('/admin?tab=news')
}

export async function deleteNews(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await deleteNewsById(id)
  revalidatePath('/news', 'layout')
  redirect('/admin?tab=news')
}

export async function upsertCSR(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const title = String(formData.get('title') || '').trim()
  if (!title) redirect('/admin?tab=csr')
  const slugBase = slugify(formData.get('slug') || title)
  
  let imageUrl = String(formData.get('existingImageUrl') || '')
  const file = formData.get('imageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `csr-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      imageUrl = publicUrl
    }
  }

  const payload = {
    title,
    slug: slugBase,
    excerpt: String(formData.get('excerpt') || ''),
    content: String(formData.get('content') || ''),
    imageUrl,
    category: String(formData.get('category') || ''),
    order: Number(formData.get('order') || 0),
  }
  if (id) {
    await updateCsrProgram(id, payload)
  } else {
    let slug = slugBase
    let i = 1
    while (await csrSlugExists(slug)) {
      slug = `${slugBase}-${i++}`
    }
    await createCsrProgram({ ...payload, slug })
  }
  revalidatePath('/csr', 'layout')
  redirect('/admin?tab=csr')
}

export async function deleteCSR(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await deleteCsrById(id)
  revalidatePath('/csr', 'layout')
  redirect('/admin?tab=csr')
}

export async function upsertInvestor(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const title = String(formData.get('title') || '').trim()
  if (!title) redirect('/admin?tab=investor')
  const payload = {
    title,
    type: String(formData.get('type') || 'report'),
    fileUrl: String(formData.get('fileUrl') || ''),
    content: String(formData.get('content') || ''),
    year: formData.get('year') ? Number(formData.get('year')) : null,
    quarter: formData.get('quarter') ? Number(formData.get('quarter')) : null,
    published: formData.get('published') === 'on',
    order: Number(formData.get('order') || 0),
  }
  if (id) await updateInvestorContent(id, payload)
  else await createInvestorContent(payload)
  revalidatePath('/investor', 'layout')
  redirect('/admin?tab=investor')
}

export async function deleteInvestor(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await deleteInvestorById(id)
  revalidatePath('/investor', 'layout')
  redirect('/admin?tab=investor')
}
