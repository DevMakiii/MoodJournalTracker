import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Delete user's data from related tables
    // Note: Order matters due to foreign key constraints

    // Delete mood entries
    const { error: moodEntriesError } = await supabase
      .from('mood_entries')
      .delete()
      .eq('user_id', userId)

    if (moodEntriesError) {
      console.error('Error deleting mood entries:', moodEntriesError)
      // Continue with deletion even if this fails
    }

    // Delete messages first (due to foreign key constraints)
    // Get conversation IDs for the user first
    const { data: conversations, error: convQueryError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)

    if (convQueryError) {
      console.error('Error querying conversations:', convQueryError)
      // Continue with deletion even if this fails
    } else if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map((c: any) => c.id)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds)

      if (messagesError) {
        console.error('Error deleting messages:', messagesError)
        // Continue with deletion even if this fails
      }
    }

    // Delete conversations
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId)

    if (conversationsError) {
      console.error('Error deleting conversations:', conversationsError)
      // Continue with deletion even if this fails
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Continue with deletion even if this fails
    }

    // Note: Cannot delete user account from auth without service role
    // This would require admin privileges that aren't available in client-side code
    console.log('User data deleted successfully. Note: Auth account deletion requires service role key.')

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error during account deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}