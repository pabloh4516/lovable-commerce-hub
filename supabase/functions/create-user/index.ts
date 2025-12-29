import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with the user's JWT to verify they're authenticated
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify the calling user is authenticated
    const { data: { user: callingUser }, error: authError } = await userClient.auth.getUser()
    
    if (authError || !callingUser) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Calling user:', callingUser.id)

    // Create admin client to check roles and create user
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Check if calling user is admin or supervisor
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .single()

    if (roleError) {
      console.error('Role check error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!roleData || !['admin', 'supervisor'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores e supervisores podem criar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User role verified:', roleData.role)

    // Parse request body
    const { email, password, name, code, role } = await req.json()

    // Validate required fields
    if (!email || !password || !name || !code || !role) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter pelo menos 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    if (!['operator', 'supervisor', 'admin'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Função inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supervisors cannot create admins
    if (roleData.role === 'supervisor' && role === 'admin') {
      return new Response(
        JSON.stringify({ error: 'Supervisores não podem criar administradores' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating user with email:', email)

    // Create the user using admin API (doesn't affect calling user's session)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        code,
        role,
      },
    })

    if (createError) {
      console.error('Create user error:', createError)
      if (createError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: 'Este email já está cadastrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created successfully:', newUser.user?.id)

    // Get the calling user's store (if any) to link the new user
    const { data: storeUserData } = await adminClient
      .from('store_users')
      .select('store_id')
      .eq('user_id', callingUser.id)
      .eq('is_primary', true)
      .single()

    // Link new user to the same store
    if (storeUserData && newUser.user) {
      const { error: linkError } = await adminClient
        .from('store_users')
        .insert({
          user_id: newUser.user.id,
          store_id: storeUserData.store_id,
          is_primary: true,
        })

      if (linkError) {
        console.error('Store link error:', linkError)
        // Don't fail the whole operation if store linking fails
      } else {
        console.log('User linked to store:', storeUserData.store_id)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUser.user?.id,
          email: newUser.user?.email,
          name,
        } 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
