import nodemailer from "nodemailer"

// Email templates
const EMAIL_TEMPLATES = {
  SIGNUP: {
    RESTAURANT: {
      subject: "New Restaurant Signup: {{businessName}}",
      text: `
A new restaurant has signed up for UnifyDining:

Business Name: {{businessName}}
Email: {{email}}
Phone: {{phone}}
Address: {{address}}
Restaurant Type: {{restaurantType}}

You can view their details in the Supabase dashboard.
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #10b981; margin: 0;">UnifyDining</h1>
    <p style="color: #666;">Connecting Halal Food Suppliers</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <h2 style="color: #10b981; margin-top: 0;">New Restaurant Signup</h2>
    <p>A new restaurant has signed up for UnifyDining:</p>
  </div>
  
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 40%;">Business Name:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{businessName}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{email}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Phone:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{phone}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Address:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{address}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Restaurant Type:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{restaurantType}}</td>
    </tr>
  </table>
  
  <div style="margin-top: 20px; text-align: center;">
    <a href="https://v0-halal-service-website-f5.vercel.app/admin" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a>
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} UnifyDining. All rights reserved.</p>
    <p>Contact: (408) 517-0489 | unifydining@gmail.com</p>
  </div>
</div>
      `,
    },
    SUPPLIER: {
      subject: "New Supplier Signup: {{businessName}}",
      text: `
A new supplier has signed up for UnifyDining:

Business Name: {{businessName}}
Email: {{email}}
Phone: {{phone}}
Address: {{address}}
Supplier Type: {{supplierType}}
Certification: {{certification}}

You can view their details in the Supabase dashboard.
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #10b981; margin: 0;">UnifyDining</h1>
    <p style="color: #666;">Connecting Halal Food Suppliers</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <h2 style="color: #10b981; margin-top: 0;">New Supplier Signup</h2>
    <p>A new supplier has signed up for UnifyDining:</p>
  </div>
  
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 40%;">Business Name:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{businessName}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{email}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Phone:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{phone}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Address:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{address}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Supplier Type:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{supplierType}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Certification:</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">{{certification}}</td>
    </tr>
  </table>
  
  <div style="margin-top: 20px; text-align: center;">
    <a href="https://v0-halal-service-website-f5.vercel.app/admin" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a>
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} UnifyDining. All rights reserved.</p>
    <p>Contact: (408) 517-0489 | unifydining@gmail.com</p>
  </div>
</div>
      `,
    },
  },
  WELCOME: {
    RESTAURANT: {
      subject: "Welcome to UnifyDining, {{businessName}}!",
      text: `
Welcome to UnifyDining!

Dear {{businessName}},

Thank you for joining UnifyDining as a restaurant partner. We're excited to help you connect with certified halal suppliers.

Your account has been created successfully. You can now log in to your dashboard to:
- Browse our directory of halal suppliers
- Connect with suppliers
- Manage your restaurant profile

If you have any questions, please don't hesitate to contact us at unifydining@gmail.com or call us at (408) 517-0489.

Best regards,
The UnifyDining Team
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #10b981; margin: 0;">UnifyDining</h1>
    <p style="color: #666;">Connecting Halal Food Suppliers</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <h2 style="color: #10b981; margin-top: 0;">Welcome to UnifyDining!</h2>
    <p>Dear {{businessName}},</p>
  </div>
  
  <p>Thank you for joining UnifyDining as a restaurant partner. We're excited to help you connect with certified halal suppliers.</p>
  
  <p>Your account has been created successfully. You can now log in to your dashboard to:</p>
  <ul>
    <li>Browse our directory of halal suppliers</li>
    <li>Connect with suppliers</li>
    <li>Manage your restaurant profile</li>
  </ul>
  
  <div style="margin-top: 20px; text-align: center;">
    <a href="https://v0-halal-service-website-f5.vercel.app/login" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In to Your Dashboard</a>
  </div>
  
  <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us at unifydining@gmail.com or call us at (408) 517-0489.</p>
  
  <p>Best regards,<br>The UnifyDining Team</p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} UnifyDining. All rights reserved.</p>
    <p>Contact: (408) 517-0489 | unifydining@gmail.com</p>
  </div>
</div>
      `,
    },
    SUPPLIER: {
      subject: "Welcome to UnifyDining, {{businessName}}!",
      text: `
Welcome to UnifyDining!

Dear {{businessName}},

Thank you for joining UnifyDining as a supplier partner. We're excited to help you connect with restaurants looking for halal products.

Your account has been created successfully. You can now log in to your dashboard to:
- Create product listings
- Connect with restaurants
- Manage your supplier profile

If you have any questions, please don't hesitate to contact us at unifydining@gmail.com or call us at (408) 517-0489.

Best regards,
The UnifyDining Team
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #10b981; margin: 0;">UnifyDining</h1>
    <p style="color: #666;">Connecting Halal Food Suppliers</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <h2 style="color: #10b981; margin-top: 0;">Welcome to UnifyDining!</h2>
    <p>Dear {{businessName}},</p>
  </div>
  
  <p>Thank you for joining UnifyDining as a supplier partner. We're excited to help you connect with restaurants looking for halal products.</p>
  
  <p>Your account has been created successfully. You can now log in to your dashboard to:</p>
  <ul>
    <li>Create product listings</li>
    <li>Connect with restaurants</li>
    <li>Manage your supplier profile</li>
  </ul>
  
  <div style="margin-top: 20px; text-align: center;">
    <a href="https://v0-halal-service-website-f5.vercel.app/login" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In to Your Dashboard</a>
  </div>
  
  <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us at unifydining@gmail.com or call us at (408) 517-0489.</p>
  
  <p>Best regards,<br>The UnifyDining Team</p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} UnifyDining. All rights reserved.</p>
    <p>Contact: (408) 517-0489 | unifydining@gmail.com</p>
  </div>
</div>
      `,
    },
  },
}

// Email service configuration
interface EmailConfig {
  to: string
  subject: string
  text: string
  html: string
}

// Template data interfaces
interface SignupTemplateData {
  businessName: string
  email: string
  phone: string
  address: string
  [key: string]: string
}

// Replace template placeholders with actual data
function replaceTemplatePlaceholders(template: string, data: Record<string, string>): string {
  return Object.entries(data).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, "g"), value || "Not provided")
  }, template)
}

// Create email transporter
function createTransporter() {
  // Check if SMTP environment variables are set
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
    console.error("SMTP configuration missing. Email notification skipped.")
    return null
  }

  // Create transporter
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

// Send email function
export async function sendEmail(
  config: EmailConfig,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter()

    if (!transporter) {
      return {
        success: false,
        error: "SMTP configuration missing",
      }
    }

    const info = await transporter.sendMail({
      from: `"UnifyDining" <${process.env.SMTP_USERNAME}>`,
      to: config.to,
      subject: config.subject,
      text: config.text,
      html: config.html,
    })

    console.log("Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}

// Send signup notification to admin
export async function sendSignupNotification(
  userType: "restaurant" | "supplier",
  data: SignupTemplateData,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = userType === "restaurant" ? EMAIL_TEMPLATES.SIGNUP.RESTAURANT : EMAIL_TEMPLATES.SIGNUP.SUPPLIER

  const subject = replaceTemplatePlaceholders(template.subject, data)
  const text = replaceTemplatePlaceholders(template.text, data)
  const html = replaceTemplatePlaceholders(template.html, data)

  return sendEmail({
    to: "unifydining@gmail.com", // Admin email
    subject,
    text,
    html,
  })
}

// Send welcome email to new user
export async function sendWelcomeEmail(
  userType: "restaurant" | "supplier",
  data: SignupTemplateData,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = userType === "restaurant" ? EMAIL_TEMPLATES.WELCOME.RESTAURANT : EMAIL_TEMPLATES.WELCOME.SUPPLIER

  const subject = replaceTemplatePlaceholders(template.subject, data)
  const text = replaceTemplatePlaceholders(template.text, data)
  const html = replaceTemplatePlaceholders(template.html, data)

  return sendEmail({
    to: data.email, // User's email
    subject,
    text,
    html,
  })
}
