# backend/apps/ai_features/views.py
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
import google.generativeai as genai
import logging
import re # For cleaning history
from django.contrib.sites.models import Site # To get current site domain for full URLs (optional for production)

# Assuming your knowledge base is in the same app
# If it's in a different app, adjust the import path.
# from .knowledge_base import WEBSITE_LINKS, DOCUMENT_INFO # Make sure these are defined

# For demonstration, let's define some placeholder knowledge here.
# In a real app, knowledge_base.py would be more extensive.
# WEBSITE_LINKS = {{
#     "upload project": {
#         "keywords": ["upload", "submit", "new project", "share work", "create project"],
#         "url": "/projects/create",
#         "description": "To share your work, you can upload a new project via the 'Create Project' page."
#     },
#     "explore projects": {
#         "keywords": ["find", "search", "explore", "browse projects", "see projects"],
#         "url": "/projects",
#         "description": "Discover and browse through various academic and technical works on the 'Explore Projects' page."
#     },
#     "my profile": {
#         "keywords": ["profile", "my account", "edit details", "user settings"],
#         "url": "/profile/me",
#         "description": "You can view and manage your personal and academic information on your profile page."
#     },
# }}

DOCUMENT_INFO = {
    "collaboration guide": {
        "keywords": ["collaboration", "teamwork", "how to collaborate", "group project"],
        "filename": "guides/2024-2025-FALL-SPRING-SUMMER-ACADEMIC-CALENDAR.pdf", # Example path
        "title": "Academic Calendar 2024-2025",
        "description": "This guide provides important dates and deadlines for the 2024-2025 academic year."
    },
    "submission guidelines": {
        "keywords": ["submission", "guidelines", "how to submit", "project requirements"],
        "filename": "guides/SOFTWARE-ENGINEERING-PROGRAM-CURRICULUM.pdf", # Example path
        "title": "Software Engineering Program Curriculum",
        "description": "This document outlines the curriculum for the Software Engineering program, including course descriptions and requirements."
    }
}


logger = logging.getLogger(__name__)

# Configure the Gemini client
# This should ideally happen once when the Django app starts.
# For example, in your apps/ai_features/apps.py in the AppConfig's ready() method.
# For simplicity here, we check and configure if not already done.
SDK_CONFIGURED_SUCCESSFULLY = False
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        SDK_CONFIGURED_SUCCESSFULLY = True # Assume success if configure doesn't raise immediate error
        logger.info("Gemini SDK configured with API key.")
    except Exception as e:
        logger.error(f"Critical error during Gemini SDK configuration: {e}", exc_info=True)
        # SDK_CONFIGURED_SUCCESSFULLY remains False
else:
    logger.warning("GEMINI_API_KEY not found in settings. Chatbot functionality will be severely impaired or disabled.")


# Define generation config and safety settings
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

# General System Instruction for CodeNest AI
CODENEST_SYSTEM_INSTRUCTION = """You are CodeNest AI, a friendly and helpful assistant for a university collaboration and publication platform named CodeNest.
CodeNest allows users (students, lecturers, advisors) to upload, share, and discover academic and technical projects, including code, AutoCAD files, research papers, and books.
Key features include project creation, project exploration, user profiles, commenting, and rating.
Your primary goal is to assist users with questions about using CodeNest, finding information, and general academic/technical queries related to the platform's purpose.
Be concise, polite, and informative.
If asked about specific user data, private project details, or anything beyond your scope, politely state that you cannot access that information.
here is the information about the academic calendar and curriculum for the 2024-2025 academic year:
RAUF DENKTAS UNIVERSITY
ACADEMIC CALENDAR

1 August - 20 September 2024

FALL SEMESTER
New student application process

2 - 6 September 2024

Period for entering courses to be offered in Fall 2024-2025

9 September - 11 October 2024

Orientation program for new students

11 September – 20 September 2024

Online course registration period for registered students

11 September - 4 October 2024

English Placement and Proficiency Test

15 September 2024

Mawlid (Mevlid Kandili)

16 - 20 September 2024

Course registration with the approval of the advisor

4 October 2024

Classes commence
First day for late registration
Last day to apply for change of program
Last day to apply for course exemptions
Last day for submission of grade change to the registrar

7 October 2024

Academic year Opening Ceremony

11 October 2024

Last day for late registration

11 October 2024

Last day for add and drop courses

29 October 2024

National holiday (Republic day of Turkey)

10 November 2024

Commemoration of Atatürk

15 November 2024

TRNC Republic Day (National Holiday)

8 -16 November 2024

Midterm Examinations

2 December - 20 December 2024

Period for entering courses to be offered in Spring 2024-2025

20 December 2024

Last day for course withdrawal

27 December 2024

Last day for applying to get leave of absence

25 December 2024

Christmas Day

30 December 2024

Last day of classes

1 January 2025

New Year

3 - 18 January 2025

Final examinations

23 January 2025

Last day for the submission of Fall 2024-2025 letter grades to the system

27 January 2025

Online course registration for Spring 2024-2025 starts

27 January 2025

Last day for submission of the graduation decisions to the registrar

24 - 31 January 2025

Resit Examinations

7 February 2025

Fall Term Graduation Ceremony

3 - 14 February 2025

English Proficiency Test

23 September 2024
23 September 2024

SPRING SEMESTER
3 February - 7 March 2025

Orientation program for new students

5 - 28 February 2025

English Placement and Proficiency Test

10 February 2025

Last day for submission of Fall Term Grade Changes, Resit examinations
grades change to the registrar

11 February 2025

Online course registration period for registered students ends

12 - 14 February 2025

Course registration with the approval of the advisor

14 February 2025

Last day to apply for change of program
Last day to apply for course exemptions

17 February 2025

Classes commence

14 March 2025

Last day for add and drop courses
Last day for late registration

29 March 2025

Ramadan Bairam Eve

30 March - 1 April 2025

Ramadan Bairam (Eid al-Fitr)

19 - 26 April 2025

Midterm examinations

23 April 2025

National Sovereignty and Children’s Day

1 May 2025

Workers’ and Spring Day

9 May 2025

Last day for course withdrawal

19 May 2025

National Holiday (Youth and Sports Day)

23 May 2025

Last day for applying to get leave of absence

4 June 2025

Last day of classes

5 June 2025

Kurban Bairam Eve

6 - 9 June 2025

Kurban Bairam

10 - 21 June 2025

Final examinations

25 June 2025

Last day for the submission of Spring 2024-2025 letter grades to the system

27 June 2025

Last day for submission of the graduation decisions to the registrar

4 July 2025

Spring Term Graduation Ceremony

SUMMER SEMESTER
7 - 11 July 2025

Course registration with the approval of the advisor

14 July 2025

Classes commence

20 July 2025

National Holiday (Peace and Freedom Day - TRNC)

25 July 2025

Last day for late registration

31 July 2025

Last day for add and drop courses

1 August 2025

National Holiday

8 August 2025

Last day for course withdrawal

29 August 2025

Last day of classes

30 August 2025

Victory Day

1 - 3 September 2025

Final examinations

5 September 2024

Last day for the submission of Summer Term 2024-2025 letter grades
Last day for submission of the graduation decisions to the registrar

12 September 2025

Fall Term Graduation Ceremony
"""

def get_full_media_url(request, filename):
    if not filename:
        return None
    # This helper needs to be robust for your production environment
    if hasattr(settings, 'AWS_STORAGE_BUCKET_NAME') and settings.AWS_STORAGE_BUCKET_NAME:
        # Example for S3 if using django-storages
        from django.core.files.storage import get_storage_class
        Storage = get_storage_class()
        storage = Storage()
        return storage.url(filename) # Assumes filename is the full path in S3 bucket
    elif settings.DEBUG:
        return request.build_absolute_uri(f"{settings.MEDIA_URL.rstrip('/')}/{filename.lstrip('/')}")
    else:
        # Fallback for generic production (adjust to your setup)
        # This might need settings.SITE_DOMAIN or similar
        try:
            current_site = Site.objects.get_current(request)
            domain = current_site.domain
            protocol = 'https' if request.is_secure() else 'http'
            return f"{protocol}://{domain}{settings.MEDIA_URL.rstrip('/')}/{filename.lstrip('/')}"
        except Exception: # Fallback if Sites framework is not configured
             logger.warning("Sites framework not configured for get_full_media_url. Falling back to relative URL.")
             return f"{settings.MEDIA_URL.rstrip('/')}/{filename.lstrip('/')}"


class GeminiChatView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Users must be logged in to use the chatbot

    def post(self, request, *args, **kwargs):
        if not SDK_CONFIGURED_SUCCESSFULLY:
            logger.error("GeminiChatView: Attempted to use chat but SDK is not configured.")
            return Response(
                {"error": "Chatbot feature is currently unavailable due to a configuration issue."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        # if not settings.GEMINI_API_KEY or not genai.API_KEY: # Check if SDK was configured
        #     logger.error("Gemini API key not configured or SDK initialization failed.")
        #     return Response(
        #         {"error": "Chatbot feature is currently unavailable due to configuration issues."},
        #         status=status.HTTP_503_SERVICE_UNAVAILABLE
        #     )

        user_message_text = request.data.get("message")
        conversation_history_raw = request.data.get("history", []) # Expecting [{role: 'user'/'model', text: '...'}]

        if not user_message_text:
            return Response(
                {"error": "Message content is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- RAG: Retrieval Step ---
        retrieved_info_for_prompt = ""
        identified_resources_for_prompt = [] # For the LLM to know what it can link to

        user_message_lower = user_message_text.lower()

        # # 1. Check for website link keywords
        # for key, info in WEBSITE_LINKS.items():
        #     if any(keyword in user_message_lower for keyword in info["keywords"]):
        #         retrieved_info_for_prompt += f"\n- Information about '{key}': {info['description']}"
        #         identified_resources_for_prompt.append(f"Page: '{info['description'][:30]}...' (for queries about {key}, link path: {info['url']})")
        #         # break # Optional: stop after first match or collect multiple

        # 2. Check for document keywords
        for key, info in DOCUMENT_INFO.items():
            if any(keyword in user_message_lower for keyword in info["keywords"]):
                pdf_public_url = get_full_media_url(request, info["filename"])
                if pdf_public_url:
                    retrieved_info_for_prompt += f"\n- Document: '{info['title']}'. {info['description']}"
                    identified_resources_for_prompt.append(f"Document: '{info['title']}' (for queries about {key}, link URL: {pdf_public_url})")
                    # break # Optional

        # --- Augmentation Step ---
        # Construct a dynamic part of the system instruction based on retrieved context
        rag_context_instruction = ""
        if retrieved_info_for_prompt:
            rag_context_instruction += "Based on the user's query, here is some potentially relevant information from the CodeNest platform:\n"
            rag_context_instruction += retrieved_info_for_prompt
            rag_context_instruction += "\n\nIf you use this information or if it's directly relevant to the user's query, please incorporate it naturally into your response. "
            if identified_resources_for_prompt:
                rag_context_instruction += "You can also suggest relevant resources. When suggesting a resource, please use the following special format: @@LINK[display text for link](actual_url_or_path)@@. The 'display text for link' should be user-friendly (e.g., the page name or document title). The 'actual_url_or_path' should be the corresponding path or URL.\n"
                rag_context_instruction += "Available resources identified for this query:\n"
                for res_info in identified_resources_for_prompt:
                    rag_context_instruction += f"  - {res_info}\n"
            rag_context_instruction += "\nFor example: 'You can @@LINK[upload your new project](/projects/create)@@ on the platform.' or 'For more details on teamwork, please refer to the @@LINK[CodeNest Collaboration Guide](" + (get_full_media_url(request, DOCUMENT_INFO["collaboration guide"]["filename"]) if "collaboration guide" in DOCUMENT_INFO else "PDF_URL") + ")@@.'\n"
        
        # Prepare chat history for Gemini API
        # Gemini 1.5 API expects {'role': 'user'/'model', 'parts': [{'text': message}]}
        formatted_history_for_api = []
        for entry in conversation_history_raw:
            role = entry.get("role")
            text_content = entry.get("text")
            if role and text_content:
                # Clean out our special @@LINK markers from history to avoid confusing the LLM on re-reads
                cleaned_text = re.sub(r'@@LINK\[.*?\]\((.*?)\)@@', r'\1', text_content) # Replace with just the URL/path
                formatted_history_for_api.append({'role': role, 'parts': [{'text': cleaned_text}]})

        # Construct the content for the current turn, including RAG context if available
        current_turn_user_parts = []
        if rag_context_instruction: # Prepend RAG context and instructions for this turn
            # This context helps the model understand what resources are available for linking
            current_turn_user_parts.append({'text': rag_context_instruction})
        
        current_turn_user_parts.append({'text': f"User's current question: {user_message_text}"})

        contents_for_api = formatted_history_for_api + [{'role': 'user', 'parts': current_turn_user_parts}]

        try:
            model_name = "gemini-1.5-flash-latest" # Or "gemini-1.5-pro-latest"
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=CODENEST_SYSTEM_INSTRUCTION, # Global system instruction
                generation_config=GENERATION_CONFIG,
                safety_settings=SAFETY_SETTINGS
            )

            gemini_response = model.generate_content(contents_for_api)

            if not gemini_response.candidates or not gemini_response.candidates[0].content.parts:
                logger.error(f"Gemini API returned no valid candidates. Raw response: {gemini_response}. Feedback: {gemini_response.prompt_feedback}")
                error_message = "The AI assistant could not generate a response at this time."
                if gemini_response.prompt_feedback and gemini_response.prompt_feedback.block_reason:
                    error_message += f" Reason: Content was blocked ({gemini_response.prompt_feedback.block_reason.name})."
                # You could inspect gemini_response.prompt_feedback.safety_ratings for more details
                return Response({"error": error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            bot_response_text = gemini_response.candidates[0].content.parts[0].text

            # The LLM should have formatted links as @@LINK[...](...)@@ based on rag_context_instruction
            # No further post-processing of URLs needed here if LLM follows instructions.

            return Response({"reply": bot_response_text}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error during Gemini API call: {e}", exc_info=True)
            # Avoid exposing detailed internal errors or API specific errors to the client
            return Response(
                {"error": "An unexpected error occurred while communicating with the AI assistant."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )