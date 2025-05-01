import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET(request: Request, { params }: { params: { email: string } }) {
  try {
    const email = decodeURIComponent(params.email)
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Get the user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, user_type")
      .eq("email", email)
      .single()

    if (userError) {
      return NextResponse.json({ error: `User not found: ${userError.message}` }, { status: 404 })
    }

    if (user.user_type !== "supplier") {
      return NextResponse.json({ message: "User is not a supplier, no fix needed" })
    }

    // Get auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id)

    if (authError) {
      return NextResponse.json({ error: `Auth user not found: ${authError.message}` }, { status: 404 })
    }

    // Update user to be confirmed
    const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true })

    if (confirmError) {
      return NextResponse.json({ error: `Failed to confirm user: ${confirmError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been confirmed successfully`,
    })
  } catch (error: any) {
    console.error("Error fixing supplier auth:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
