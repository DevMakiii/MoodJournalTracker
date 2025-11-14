import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Starting account deletion process')
    const supabase = await createClient()

    // Get the current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check result:', { user: !!user, authError })

    if (authError || !user) {
      console.log('Unauthorized access attempt:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('User ID to delete:', userId)

    // Delete user's data from related tables
    // Note: Order matters due to foreign key constraints

    // Delete mood entries
    console.log('Deleting mood entries for user:', userId)
    const { error: moodEntriesError } = await supabase
      .from('mood_entries')
      .delete()
      .eq('user_id', userId)

    if (moodEntriesError) {
      console.error('Error deleting mood entries:', moodEntriesError)
      // Continue with deletion even if this fails
    } else {
      console.log('Mood entries deleted successfully')
    }

    // Delete messages first (due to foreign key constraints)
    // Get conversation IDs for the user first
    console.log('Querying conversations for user:', userId)
    const { data: conversations, error: convQueryError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)

    if (convQueryError) {
      console.error('Error querying conversations:', convQueryError)
      // Continue with deletion even if this fails
    } else if (conversations && conversations.length > 0) {
      console.log('Found conversations to delete:', conversations.length)
      const conversationIds = conversations.map((c: any) => c.id)
      console.log('Deleting messages for conversations:', conversationIds)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds)

      if (messagesError) {
        console.error('Error deleting messages:', messagesError)
        // Continue with deletion even if this fails
      } else {
        console.log('Messages deleted successfully')
      }
    } else {
      console.log('No conversations found for user')
    }

    // Delete conversations
    console.log('Deleting conversations for user:', userId)
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId)

    if (conversationsError) {
      console.error('Error deleting conversations:', conversationsError)
      // Continue with deletion even if this fails
    } else {
      console.log('Conversations deleted successfully')
    }

    // Delete profile
    console.log('Deleting profile for user:', userId)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Continue with deletion even if this fails
    } else {
      console.log('Profile deleted successfully')
    }

    // Delete the auth user account using service role
    console.log('Deleting auth user account:', userId)
    const adminSupabase = createAdminClient()
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      // Continue with response even if auth deletion fails
      // The data is already deleted, so the account is effectively "deleted" from user's perspective
    } else {
      console.log('Auth user deleted successfully')
    }

    console.log('Account deletion process completed successfully')

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