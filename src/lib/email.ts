import 'server-only'

export const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string
  subject: string
  body: string
}) => {
  console.log(`Sending email to ${to} with subject ${subject}`)
  console.log(body)

  // TODO: Send email without awaiting
}
