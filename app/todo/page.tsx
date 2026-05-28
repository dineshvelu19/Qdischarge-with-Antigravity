export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="min-h-screen bg-ink text-foreground p-8 flex flex-col items-center">
      <div className="w-full max-w-md bg-ink2 border border-white/5 p-6 rounded-2xl">
        <h1 className="font-serif text-lg text-white mb-4">Supabase Todos List</h1>
        {todos && todos.length > 0 ? (
          <ul className="space-y-2 text-xs font-sans text-left">
            {todos.map((todo) => (
              <li key={todo.id} className="p-3 bg-white/2 rounded-lg border border-white/5 text-white flex items-center justify-between">
                <span>{todo.name}</span>
                <span className="text-[10px] text-ink3 font-mono">ID: {todo.id}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink3 leading-relaxed">
            No items found in your <code>todos</code> table yet. Run a insert in your Supabase SQL editor to seed data!
          </p>
        )}
      </div>
    </div>
  )
}
