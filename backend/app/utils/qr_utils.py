import qrcode
import json
import io
from PIL import Image

def generate_qr_code(data) -> io.BytesIO:
    """Generates a QR code image from data (dict or string)."""
    qr_data = json.dumps(data) if isinstance(data, dict) else str(data)
    
    qr = qrcode.QRCode(
        version=None, # Auto-detect version
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr
