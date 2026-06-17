// public/js/supabase-init.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// SUBSTITUA PELAS SUAS CHAVES DO SUPABASE:
const supabaseUrl = 'https://cfjqbeuexekvjiyuhvwf.supabase.co'
const supabaseKey = 'sb_publishable_O8xMHyTkOvGjReYn1qtHGg_ULuzzgkM'

export const supabase = createClient(supabaseUrl, supabaseKey)
