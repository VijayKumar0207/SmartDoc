import smtplib
from email.message import EmailMessage
import os
from app.config import settings
from app.utils.logger import logger

def send_email_with_attachment(to_email: str, subject: str, body: str, file_path: str):
    """
    Sends an email with a file attachment. If SMTP_USERNAME is empty,
    it simulates sending the email by logging to the console.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.info(f"--- SIMULATED EMAIL ---")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body: {body}")
        logger.info(f"Attachment: {file_path}")
        logger.info(f"-----------------------")
        return True

    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to_email
        msg.set_content(body)

        if os.path.exists(file_path):
            with open(file_path, 'rb') as f:
                pdf_data = f.read()
                file_name = os.path.basename(file_path)
            
            msg.add_attachment(
                pdf_data,
                maintype='application',
                subtype='pdf',
                filename=file_name
            )
        else:
            logger.error(f"Attachment file not found: {file_path}")
            raise Exception(f"Attachment file not found: {file_path}")

        # Try to connect and send with better timeout handling
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent successfully to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed: Invalid email or password")
        raise Exception(f"Email credentials are invalid. Check SMTP_USERNAME and SMTP_PASSWORD in .env file")
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error: {str(e)}")
        raise Exception(f"Email server error: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")
