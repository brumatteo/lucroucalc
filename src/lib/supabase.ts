import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vuaogfyrxezhchszmwjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YW9nZnlyeGV6aGNoc3ptd2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODgzMzksImV4cCI6MjA3NjU2NDMzOX0.4HRS9G4RlEjhr1IZ4qJ0sr1-o7t5_jdihu47sDGLb18'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
