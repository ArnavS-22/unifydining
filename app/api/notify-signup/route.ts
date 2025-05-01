import { NextResponse } from "next/server"
import { sendSignupNotification, sendWelcomeEmail } from "@/lib/email-service"

interface NotifySignupRequest {
  userEmail: string
  businessName: string
  userType: string
  phone?: string
  address?: string
  restaurantType?: string
  supplierType?: string
  certification?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NotifySignupRequest
    const {
      userEmail,
      businessName,
      userType,
      phone = "Not provided",
      address = "Not provided",
      restaurantType = "Not provided",
      supplierType = "Not provided",
      certification = "Not provided",
    } = body

    console.log("Processing signup notification:", {
      email: userEmail,
      business: businessName,
      type: userType,
    })

    // Prepare template data
    const templateData = {
      businessName,
      email: userEmail,
      phone,
      address,
      restaurantType,
      supplierType,
      certification,
    }

    // Send notification to admin
    const notificationResult = await sendSignupNotification(userType as "restaurant" | "supplier", templateData)

    if (!notificationResult.success) {
      console.warn("Admin notification email failed:", notificationResult.error)
      // Continue anyway to try sending welcome email
    }

    // Send welcome email to user
    const welcomeResult = await sendWelcomeEmail(userType as "restaurant" | "supplier", templateData)

    if (!welcomeResult.success) {
      console.warn("Welcome email failed:", welcomeResult.error)
    }

    // Return success if either email was sent successfully
    if (notificationResult.success || welcomeResult.success) {
      return NextResponse.json({
        success: true,
        adminEmailSent: notificationResult.success,
        welcomeEmailSent: welcomeResult.success,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send emails",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error processing signup notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
