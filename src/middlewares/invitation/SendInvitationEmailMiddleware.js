const { asyncHandler } = require('../Validate');
const transporter = require('../../config/Mail');
const logger = require('../../utils/Logger');

/**
 * Middleware to handle invitation email sending
 * Processes invitation results and sends emails
 */
const sendInvitationEmail = asyncHandler(async (req, res, next) => {
    const { workspace, processedResults } = req;
    
    // If no processed results to continue
    if (!processedResults || processedResults.length === 0) {
        return next();
    }

    const emailResults = [];

    for (const result of processedResults) {
        if (result.status === 'invited') {
            try {
                // Get the invitation details
                const Invitation = require('../../models/InvitationModel');
                const invitation = await Invitation.findById(result.invitationId);
                
                // Send invitation email
                const mailOptions = {
                    from: '"Workspace Team" <support@nodeapp.com>',
                    to: result.member,
                    subject: `You're invited to join "${workspace.name}" workspace`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #007bff;">Welcome!</h2>
                            <p>Hello,</p>
                            <p>You've been invited to join the <strong>${workspace.name}</strong> workspace by <strong>${req.user.name}</strong> (${req.user.email}).</p>
                            <p>Your email address is already assigned to an existing "${workspace.name}" with another authentication method.</p>
                            <p>To complete this invitation, please sign up with you Chat App account. </p>
                            <button onclick="window.location.href='${process.env.BASE_URL || ''}/api/auth/signup'" style="padding: 10px 20px; background-color: #2196F3; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;"> Click Me! </button>
                            <p><strong>Important:</strong> This invitation expires in 48 hours.</p>
                            <hr style="margin: 30px 0;">
                            <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                logger.info(`Invitation email sent to: ${result.member}`);

                emailResults.push({
                    member: result.member,
                    status: 'invitation_sent',
                    message: 'Invitation email sent successfully',
                    invitationId: result.invitationId
                });

            } catch (emailError) {
                logger.error(`Email sending failed for ${result.member} : ${emailError.message}`);
                
                emailResults.push({
                    member: result.member,
                    status: 'email_failed',
                    message: `Failed to send invitation email: ${emailError.message}`,
                    invitationId: result.invitationId
                });
            }
        }
    }

    // Attach email results to request for controller to use
    req.emailResults = emailResults;
    next();
});

module.exports = sendInvitationEmail;
