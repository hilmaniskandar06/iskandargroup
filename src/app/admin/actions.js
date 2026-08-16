'use server'

import { supabase } from '@/lib/supabase'

export async function uploadImageAction(formData) {
  const file = formData.get('file')
  if (!file || file.size === 0) return { error: 'No file provided' }
  
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) return { error: error.message }
  
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)
    
  return { url: publicUrl }
}


import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { setAdminSession, clearAdminSession, requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

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

  const user = await prisma.adminUser.findUnique({ where: { email } })
  if (!user) {
    const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ctcorp.id'
    const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'
    if (email === defaultEmail && password === defaultPass) {
      const hash = await bcrypt.hash(defaultPass, 10)
      const created = await prisma.adminUser.upsert({
        where: { email: defaultEmail },
        create: { email: defaultEmail, password: hash, name: 'Default Admin' },
        update: { password: hash, name: 'Default Admin' },
      })
      await setAdminSession(created)
      revalidatePath('/', 'layout')
      redirect('/admin')
    }
    redirect('/admin/login?error=1')
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) redirect('/admin/login?error=1')

  await setAdminSession(user)
  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function seedDefaultAdminAction() {
  const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ctcorp.id'
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(defaultPass, 10)
  await prisma.adminUser.upsert({
    where: { email: defaultEmail },
    create: { email: defaultEmail, password: hash, name: 'Default Admin' },
    update: { password: hash, name: 'Default Admin' },
  })
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
    const { error } = await supabase.storage.from('images').upload(fileName, heroFile, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
      data.homeHeroImg = publicUrl
    }
  }

  // Handle Who We Are Image Upload
  const whoFile = formData.get('whoWeAreImgFile')
  if (whoFile && whoFile.size > 0) {
    const ext = whoFile.name.split('.').pop()
    const fileName = `who-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from('images').upload(fileName, whoFile, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
      data.whoWeAreImg = publicUrl
    }
  }
  await prisma.pageContent.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  })
  revalidatePath('/')
  revalidatePath('/who-we-are')
  revalidatePath('/privacy-policy')
  revalidatePath('/terms-and-conditions')
  revalidatePath('/business')
  revalidatePath('/investor')
  revalidatePath('/admin')
  redirect('/admin?tab=pages')
}

export async function upsertBusinessCategory(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const title = String(formData.get('title') || '').trim()
  if (!title) redirect('/admin?tab=business')

  // Handle category image upload
  let imageUrl = String(formData.get('catImageUrl') || '')
  const file = formData.get('catImageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `category-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from('images').upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
      imageUrl = publicUrl
    }
  }

  const payload = {
    title,
    imageUrl: imageUrl || null,
    order: Number(formData.get('order') || 0),
  }
  if (id) {
    await prisma.businessCategory.update({ where: { id }, data: payload })
  } else {
    await prisma.businessCategory.create({ data: payload })
  }
  revalidatePath('/')
  revalidatePath('/who-we-are')
  revalidatePath('/business')
  revalidatePath('/admin')
  redirect('/admin?tab=business')
}

export async function deleteBusinessCategory(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (id) {
    await prisma.businessCategory.delete({ where: { id } })
  }
  revalidatePath('/')
  revalidatePath('/who-we-are')
  revalidatePath('/business')
  revalidatePath('/admin')
  redirect('/admin?tab=business')
}

export async function upsertBusinessItem(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const categoryId = Number(formData.get('categoryId'))
  const title = String(formData.get('title') || '').trim()
  if (!title || !categoryId) redirect('/admin?tab=business')

  let imageUrl = String(formData.get('imageUrl') || '')
  const file = formData.get('imageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `brand-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from('images').upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
      imageUrl = publicUrl
    }
  }

  const payload = {
    categoryId,
    title,
    imageUrl: imageUrl || 'https://via.placeholder.com/200x100?text=' + encodeURIComponent(title),
    linkUrl: String(formData.get('linkUrl') || '').trim() || null,
    order: Number(formData.get('order') || 0),
  }

  if (id) {
    await prisma.businessItem.update({ where: { id }, data: payload })
  } else {
    await prisma.businessItem.create({ data: payload })
  }

  revalidatePath('/')
  revalidatePath('/who-we-are')
  revalidatePath('/business')
  revalidatePath('/admin')
  redirect('/admin?tab=business')
}

export async function deleteBusinessItem(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (id) {
    await prisma.businessItem.delete({ where: { id } })
  }
  revalidatePath('/')
  revalidatePath('/who-we-are')
  revalidatePath('/business')
  revalidatePath('/admin')
  redirect('/admin?tab=business')
}

export async function upsertStat(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const value = String(formData.get('value') || '').trim()
  const label = String(formData.get('label') || '').trim()
  if (!value || !label) redirect('/admin?tab=stats')
  const payload = { value, label, order: Number(formData.get('order') || 0) }
  if (id) await prisma.stat.update({ where: { id }, data: payload })
  else await prisma.stat.create({ data: payload })
  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin?tab=stats')
}

export async function deleteStat(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await prisma.stat.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin?tab=stats')
}

export async function upsertNews(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const title = String(formData.get('title') || '').trim()
  if (!title) redirect('/admin?tab=news')
  const slugBase = slugify(formData.get('slug') || title)
  
  let imageUrl = String(formData.get('imageUrl') || '')
  const file = formData.get('imageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `news-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from('images').upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
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
    await prisma.news.update({ where: { id }, data: payload })
  } else {
    let slug = slugBase
    let i = 1
    while (await prisma.news.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i++}`
    }
    await prisma.news.create({ data: { ...payload, slug } })
  }
  revalidatePath('/news')
  revalidatePath('/admin')
  redirect('/admin?tab=news')
}

export async function deleteNews(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await prisma.news.delete({ where: { id } })
  revalidatePath('/news')
  revalidatePath('/admin')
  redirect('/admin?tab=news')
}

export async function upsertCSR(formData) {
  await requireAuth()
  const id = formData.get('id') ? Number(formData.get('id')) : null
  const title = String(formData.get('title') || '').trim()
  if (!title) redirect('/admin?tab=csr')
  const slugBase = slugify(formData.get('slug') || title)
  
  let imageUrl = String(formData.get('imageUrl') || '')
  const file = formData.get('imageFile')
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const fileName = `csr-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`
    const { error } = await supabase.storage.from('images').upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
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
    await prisma.csrProgram.update({ where: { id }, data: payload })
  } else {
    let slug = slugBase
    let i = 1
    while (await prisma.csrProgram.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i++}`
    }
    await prisma.csrProgram.create({ data: { ...payload, slug } })
  }
  revalidatePath('/csr')
  revalidatePath('/admin')
  redirect('/admin?tab=csr')
}

export async function deleteCSR(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await prisma.csrProgram.delete({ where: { id } })
  revalidatePath('/csr')
  revalidatePath('/admin')
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
  if (id) await prisma.investorContent.update({ where: { id }, data: payload })
  else await prisma.investorContent.create({ data: payload })
  revalidatePath('/investor')
  revalidatePath('/admin')
  redirect('/admin?tab=investor')
}

export async function deleteInvestor(formData) {
  await requireAuth()
  const id = Number(formData.get('id'))
  await prisma.investorContent.delete({ where: { id } })
  revalidatePath('/investor')
  revalidatePath('/admin')
  redirect('/admin?tab=investor')
}
