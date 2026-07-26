import { redirect } from 'next/navigation';

// A raiz do site não tem conteúdo próprio: artista usa /admin,
// clientes recebem sempre um link direto /acompanhar/[token].
export default function Home() {
  redirect('/admin');
}
