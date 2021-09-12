import sgMail, { MailDataRequired } from '@sendgrid/mail'

class Mail {
    private static from: { email: string, name: string }
    private static clientAppBaseURL: string
    static acceptInvitationDeadline = 1 * 86400 // 1 day in seconds

    static configureMail() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        Mail.from = { email: process.env.SENDGRID_SENDER_EMAIL, name: 'Renters' }
        Mail.clientAppBaseURL = process.env.NODE_ENV === 'development' ? process.env.FRONTEND_LOCAL_LINK : process.env.FRONTEND_LIVE_LINK
    }

    static async sendWelcomeEmail(
        { 
            name,
            to
        }: { 
            name: string,
            to: string
        }
    ) {

        const msg: MailDataRequired = {
            from: Mail.from,
            to,
            templateId: 'd-d5e2e54ad3c5437e8d40b30d7f0f26c7',
            dynamicTemplateData: {
                getStartedUrl: `${Mail.clientAppBaseURL}/auth/login`,
                name
            }
        }

        await sgMail.send(msg)
    }

    static async sendRenterInvitationToCreateAccount({
        renterFirstName,
        renterEmail,
        propertyAdmin,
        propertyType,
        propertyTitle,
        inviteId
    }: {
        renterFirstName: string,
        renterEmail: string,
        propertyAdmin: string,
        propertyType: string,
        propertyTitle: string,
        inviteId: string
    }) {
        const msg: MailDataRequired = {
            from: Mail.from,
            to: renterEmail,
            templateId: 'd-de2873c63e0e41108dc200660e857b6d',
            dynamicTemplateData: {
                renterFirstName,
                propertyAdmin,
                propertyType,
                propertyTitle,
                confirmUrl: `${Mail.clientAppBaseURL}/auth/accept-renter-invite?invite_id=${inviteId}` // invite_id = renter email + renter first name + property_id + deadline
            }
        }

        await sgMail.send(msg)
    }
}

export default Mail