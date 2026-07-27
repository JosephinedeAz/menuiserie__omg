import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  // Limite de taille
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > 10000) {
    return NextResponse.json({ error: 'Requête trop volumineuse.' }, { status: 413 })
  }

  const body = await req.json()

  // Sanitisation
  const nom = (body.nom ?? '').trim()
  const email = (body.email ?? '').trim()
  const telephone = (body.telephone ?? '').trim()
  const message = (body.message ?? '').trim()

  // Champs requis
  if (!nom) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 })
  if (!email) return NextResponse.json({ error: "L'email est requis." }, { status: 400 })
  if (!message) return NextResponse.json({ error: 'Le message est requis.' }, { status: 400 })

  // Format email
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Format d'email invalide." }, { status: 400 })
  }

  // Longueurs maximales
  if (nom.length > 100) return NextResponse.json({ error: 'Le nom ne doit pas dépasser 100 caractères.' }, { status: 400 })
  if (email.length > 254) return NextResponse.json({ error: "L'email ne doit pas dépasser 254 caractères." }, { status: 400 })
  if (telephone.length > 20) return NextResponse.json({ error: 'Le téléphone ne doit pas dépasser 20 caractères.' }, { status: 400 })
  if (message.length > 5000) return NextResponse.json({ error: 'Le message ne doit pas dépasser 5000 caractères.' }, { status: 400 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'OMG Contact <contact@menuiserie-omg.fr>',
    to: 'romain@menuiserie-omg.fr',
    subject: `Nouveau message de ${nom}`,
    text: `Nom: ${nom}\nEmail: ${email}\nTéléphone: ${telephone}\n\n${message}`,
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
