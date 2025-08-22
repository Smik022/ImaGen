from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import os
import re
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
    model = genai.GenerativeModel("gemini-2.5-flash") # It's good practice to use a specific version
    try:
        # Construct the prompt for Gemini
        prompt = (
            "Transform the following text into a vivid, detailed prompt for an AI image generator. "
            "Only give the direct prompt with no extra text.\n\n"
            f"Text: {user_text}"
        )

        response = model.generate_content(prompt)

        # A more robust way to get the caption
        caption = response.text

    except Exception as e:
        # Check for specific block reasons if available in the exception
        # This part might need adjustment based on the exact exceptions thrown by the library
        try:
            # Attempt to check for a block reason in the response if it exists
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                return Response({"error": f"Request blocked due to: {response.prompt_feedback.block_reason}"}, status=400)
        except:
            # Fallback for other errors
            return Response({"error": f"Gemini API error: {str(e)}"}, status=500)
        
        # If no specific block reason is found, return a generic error
        return Response({"error": "Gemini did not return any content. It might have been blocked for safety reasons."}, status=500)


    # Step 2: Pollinations API call
    try:
        # URL encode the caption to handle special characters
        url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(caption)}"
        img_response = requests.get(url, timeout=60)
        img_response.raise_for_status()  # Raise an exception for bad status codes
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Pollinations API error: {str(e)}"}, status=500)

    # Step 3: Save image locally with safe filename
    try:
        # Sanitize the caption to create a safe filename
        safe_caption = re.sub(r'[^\w-]', '_', caption[:50])
        filename = f"your-image-{safe_caption}.png"
        filepath = os.path.join(settings.MEDIA_ROOT, filename)
        
        # Ensure the media directory exists
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        
        with open(filepath, "wb") as f:
            f.write(img_response.content)
    except Exception as e:
        return Response({"error": f"Saving image failed: {str(e)}"}, status=500)

    # Step 4: Return JSON response with absolute URL
    image_url = request.build_absolute_uri(os.path.join(settings.MEDIA_URL, filename))
    return Response({
        "caption": caption,
        "image_url": image_url
    })