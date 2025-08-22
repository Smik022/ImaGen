from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests, os, re
from dotenv import load_dotenv
import google.generativeai as genai
from django.conf import settings

# Load .env
load_dotenv(os.path.join(settings.BASE_DIR, ".env"))

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise Exception("GEMINI_API_KEY not set in .env")
genai.configure(api_key=api_key)


@api_view(["POST"])
def generate_image(request):
    # Step 0: Validate input
    user_text = request.data.get("chatInput", "").strip()
    if not user_text:
        return Response({"error": "chatInput is required"}, status=400)

    # Step 1: Gemini generates vivid prompt safely
    model = genai.GenerativeModel("gemini-2.5-pro")
    try:
        response = model.generate_content(
            f"Transform the following text into a vivid, detailed prompt for an AI image generator. "
            f"Only give the direct prompt with no extra text.\n\nText: {user_text}"
        )

        # Check candidates exist
        if not response.candidates:
            return Response({"error": "Gemini did not return any text"}, status=500)

        # Safely access content
        candidate_content = response.candidates[0].content
        if isinstance(candidate_content, str):
            caption = candidate_content.strip()
        else:
            caption = str(candidate_content)

    except Exception as e:
        return Response({"error": f"Gemini API error: {str(e)}"}, status=500)

    # Step 2: Pollinations API call
    try:
        url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(caption)}"
        img_response = requests.get(url, timeout=60)
        if img_response.status_code != 200:
            return Response({"error": "Pollinations API failed"}, status=500)
    except Exception as e:
        return Response({"error": f"Pollinations API error: {str(e)}"}, status=500)

    # Step 3: Save image locally with safe filename
    try:
        safe_caption = re.sub(r'[^a-zA-Z0-9_-]', '_', caption[:50])
        filename = f"your-image-{safe_caption}.png"
        filepath = os.path.join(settings.MEDIA_ROOT, filename)
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(img_response.content)
    except Exception as e:
        return Response({"error": f"Saving image failed: {str(e)}"}, status=500)

    # Step 4: Return JSON response with absolute URL
    image_url = request.build_absolute_uri(f"/media/{filename}")
    return Response({
        "caption": caption,
        "image_url": image_url
    })
