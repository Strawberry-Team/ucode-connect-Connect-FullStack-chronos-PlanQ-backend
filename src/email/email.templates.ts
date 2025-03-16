export const getConfirmationEmailTemplate = (
    confirmationLink: string,
    projectName: string
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Welcome to ${projectName}!</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>Thank you for registering. Please confirm your email by clicking the button below:</p>
      <div style="text-align:center; margin:20px;">
        <a href="${confirmationLink}" style="background-color:#007BFF; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">
          Confirm Email
        </a>
      </div>
      <p>If you did not register, please ignore this email.</p>
    </div>
  </div>
</div>
`;

export const getResetPasswordEmailTemplate = (
    resetLink: string,
    projectName: string
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Reset Password for ${projectName}</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>You have requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align:center; margin:20px;">
        <a href="${resetLink}" style="background-color:#28A745; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">
          Reset Password
        </a>
      </div>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  </div>
</div>
`;

export const getCalendarShareEmailTemplate = (
    calendarName: string,
    shareLink: string,
    inviter: string,
    projectName: string
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Access to Calendar on ${projectName}</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>You have been invited by <strong>${inviter}</strong> to access the calendar "<strong>${calendarName}</strong>". Please click the button below to accept the invitation:</p>
      <div style="text-align:center; margin:20px;">
        <a href="${shareLink}" style="background-color:#17A2B8; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">
          Accept Invitation
        </a>
      </div>
      <p>If you did not expect this invitation, please ignore this email.</p>
    </div>
  </div>
</div>
`;

export const getEventInvitationEmailTemplate = ( //TODO: add timezone and change UTC to local time
    inviter: string,
    eventTitle: string,
    eventDateTimeStartedAt: string,
    eventDateTimeEndedAt: string,
    shareLink: string,
    guestEmails: string[],
    projectName: string
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Event Invitation on ${projectName}</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>Hello,</p>
      <p><strong>${inviter}</strong> is inviting you to the event "<strong>${eventTitle}</strong>".</p>
      <div style="margin:20px 0;">
        <p><strong>When:</strong> ${eventDateTimeStartedAt} - ${eventDateTimeEndedAt} (UTC)</p>
        <p><strong>Guests:</strong> ${guestEmails.join(", ")}</p>
      </div>
      <p>Click the button below to accept the invitation:</p>
      <div style="text-align:center; margin:20px;">
        <a href="${shareLink}" style="background-color:#6F42C1; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">
          Accept Invitation
        </a>
      </div>
      <p>If you did not expect this event, please ignore this email.</p>
    </div>
  </div>
</div>
`;

export const getEventReminderEmailTemplate = (
    eventTitle: string,
    calendarName: string,
    eventTimeStartedAt: string,
    projectName: string
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Event Reminder from ${projectName}</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>This is a reminder that the event "<strong>${eventTitle}</strong>" in calendar "<strong>${calendarName}</strong>" is scheduled to start at <strong>${eventTimeStartedAt} (UTC)</strong>.</p>
      <p>You have 30 minutes remaining before the event begins.</p>
    </div>
  </div>
</div>
`;

export const getCalendarReminderEmailTemplate = (
    reminderName: string,
    description: string,
    calendarName: string,
    projectName: string
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Reminder from ${projectName}</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>You have a reminder: "<strong>${reminderName}</strong>" in the calendar "<strong>${calendarName}</strong>".</p>
      <p>Description: ${description}</p>
      <p>Please note that the scheduled time is in UTC.</p>
    </div>
  </div>
</div>
`;
